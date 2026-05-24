import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Item } from '../lib/items';

export type Profile = 'kids' | 'teen' | 'adult' | 'senior';

export interface UserInfo {
  age: number;
  gender?: 'm' | 'f' | 'o' | '';
  education?: string;
  consent: boolean;
}

export interface Answer {
  itemId: string;
  selected: number | null;
  correct: boolean;
  timeMs: number;
  timedOut: boolean;
  difficulty: number;
}

interface SessionState {
  user: UserInfo | null;
  profile: Profile | null;
  items: Item[];
  answers: Answer[];
  currentIndex: number;
  startedAt: number | null;
  finishedAt: number | null;

  setUser: (u: UserInfo) => void;
  setProfile: (p: Profile) => void;
  setItems: (items: Item[]) => void;
  recordAnswer: (a: Answer) => void;
  next: () => void;
  start: () => void;
  finish: () => void;
  reset: () => void;
}

export const profileFromAge = (age: number): Profile => {
  if (age <= 12) return 'kids';
  if (age <= 17) return 'teen';
  if (age >= 60) return 'senior';
  return 'adult';
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      items: [],
      answers: [],
      currentIndex: 0,
      startedAt: null,
      finishedAt: null,
      setUser: (u) => set({ user: u, profile: profileFromAge(u.age) }),
      setProfile: (p) => set({ profile: p }),
      setItems: (items) => set({ items, answers: [], currentIndex: 0 }),
      recordAnswer: (a) => set((s) => ({ answers: [...s.answers, a] })),
      next: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
      start: () => set({ startedAt: Date.now(), finishedAt: null }),
      finish: () => set({ finishedAt: Date.now() }),
      reset: () =>
        set({
          user: null,
          profile: null,
          items: [],
          answers: [],
          currentIndex: 0,
          startedAt: null,
          finishedAt: null,
        }),
    }),
    { name: 'myqi-session' }
  )
);
