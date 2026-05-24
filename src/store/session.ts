import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BatteryItem, BatteryAnswer, Version } from '../lib/battery';

export type Profile = 'kids' | 'teen' | 'adult' | 'senior';

export interface UserInfo {
  age: number;
  gender?: 'm' | 'f' | 'o' | '';
  education?: string;
  consent: boolean;
}

interface SessionState {
  user: UserInfo | null;
  profile: Profile | null;
  version: Version;
  items: BatteryItem[];
  answers: BatteryAnswer[];
  currentIndex: number;
  startedAt: number | null;
  finishedAt: number | null;
  tabBlurs: number;

  setUser: (u: UserInfo) => void;
  setProfile: (p: Profile) => void;
  setVersion: (v: Version) => void;
  setItems: (items: BatteryItem[]) => void;
  recordAnswer: (a: BatteryAnswer) => void;
  next: () => void;
  start: () => void;
  finish: () => void;
  bumpBlur: () => void;
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
      version: 'v1',
      items: [],
      answers: [],
      currentIndex: 0,
      startedAt: null,
      finishedAt: null,
      tabBlurs: 0,
      setUser: (u) => set({ user: u, profile: profileFromAge(u.age) }),
      setProfile: (p) => set({ profile: p }),
      setVersion: (v) => set({ version: v }),
      setItems: (items) => set({ items, answers: [], currentIndex: 0 }),
      recordAnswer: (a) => set((s) => ({ answers: [...s.answers, a] })),
      next: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
      start: () => set({ startedAt: Date.now(), finishedAt: null, tabBlurs: 0 }),
      finish: () => set({ finishedAt: Date.now() }),
      bumpBlur: () => set((s) => ({ tabBlurs: s.tabBlurs + 1 })),
      reset: () =>
        set({
          user: null,
          profile: null,
          version: 'v1',
          items: [],
          answers: [],
          currentIndex: 0,
          startedAt: null,
          finishedAt: null,
          tabBlurs: 0,
        }),
    }),
    { name: 'myqi-session' }
  )
);
