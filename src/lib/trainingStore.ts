import type { SubtestKind } from './battery';

const KEY = 'myqi-training-log';

export interface TrainEntry {
  date: string; // yyyy-mm-dd
  kind: SubtestKind;
  correct: number;
  total: number;
}

export function logTraining(kind: SubtestKind, correct: number, total: number) {
  if (total === 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const log: TrainEntry[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  const existing = log.find((e) => e.date === today && e.kind === kind);
  if (existing) {
    existing.correct += correct;
    existing.total += total;
  } else {
    log.push({ date: today, kind, correct, total });
  }
  localStorage.setItem(KEY, JSON.stringify(log.slice(-365)));
}

export function getTrainingLog(): TrainEntry[] {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function getStats(kind?: SubtestKind) {
  const log = getTrainingLog();
  const filtered = kind ? log.filter((e) => e.kind === kind) : log;
  const totals = filtered.reduce(
    (acc, e) => ({ correct: acc.correct + e.correct, total: acc.total + e.total }),
    { correct: 0, total: 0 }
  );
  const days = new Set(filtered.map((e) => e.date)).size;
  return { ...totals, days, accuracy: totals.total ? totals.correct / totals.total : 0 };
}
