import type { Answer } from '../store/session';
import { getNorm } from './norms';

export interface ScoreResult {
  rawCorrect: number;
  totalItems: number;
  difficultyAdjusted: number; // weighted score
  iq: number;                 // 100 ± 15 scale
  iqCI: [number, number];
  percentile: number;         // 0..100
  band: string;               // qualitative band
  byDifficulty: { easy: { correct: number; total: number }; medium: { correct: number; total: number }; hard: { correct: number; total: number } };
  avgTimeMs: number;
  timeouts: number;
  slowItems: number[]; // indices flagged as "perdeu tempo"
}

function phi(z: number): number {
  // Cumulative normal approx (Abramowitz & Stegun 26.2.17)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - p : p;
}

function band(iq: number): string {
  if (iq < 70) return 'Abaixo da média (atenção: avaliação clínica recomendada)';
  if (iq < 85) return 'Faixa abaixo da média';
  if (iq < 115) return 'Faixa média (típica da população)';
  if (iq < 130) return 'Acima da média';
  if (iq < 145) return 'Superior';
  return 'Muito superior';
}

export function score(answers: Answer[], age: number): ScoreResult {
  const total = answers.length;
  const rawCorrect = answers.filter((a) => a.correct).length;

  // difficulty-weighted: each correct contributes (1 + difficulty/3), capped 0.5..2
  const diffAdj = answers.reduce((sum, a) => {
    if (!a.correct) return sum;
    const w = Math.max(0.5, Math.min(2, 1 + a.difficulty / 3));
    return sum + w;
  }, 0);

  const norm = getNorm(age);
  // z-score using raw correct vs norm (stable), adjusted slightly by diff-weighted bonus
  const adjustedRaw = rawCorrect + (diffAdj - rawCorrect) * 0.4;
  const z = (adjustedRaw - norm.mean) / norm.sd;
  const iq = Math.max(55, Math.min(160, Math.round(100 + 15 * z)));

  const sem = 15 * Math.sqrt(1 - norm.reliability);
  const ci: [number, number] = [Math.round(iq - 1.96 * sem), Math.round(iq + 1.96 * sem)];
  const percentile = Math.round(phi(z) * 100);

  const byDifficulty = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };
  answers.forEach((a) => {
    const bucket = a.difficulty <= -0.5 ? 'easy' : a.difficulty <= 1 ? 'medium' : 'hard';
    byDifficulty[bucket].total++;
    if (a.correct) byDifficulty[bucket].correct++;
  });

  const times = answers.map((a) => a.timeMs).filter((t) => t > 0);
  const avgTimeMs = times.length ? times.reduce((s, t) => s + t, 0) / times.length : 0;
  const timeouts = answers.filter((a) => a.timedOut).length;

  // slow items: time > 1.75 * avg OR timed out
  const slowItems: number[] = [];
  answers.forEach((a, i) => {
    if (a.timedOut || (avgTimeMs > 0 && a.timeMs > avgTimeMs * 1.75)) slowItems.push(i);
  });

  return {
    rawCorrect,
    totalItems: total,
    difficultyAdjusted: Math.round(diffAdj * 10) / 10,
    iq,
    iqCI: ci,
    percentile: Math.max(1, Math.min(99, percentile)),
    band: band(iq),
    byDifficulty,
    avgTimeMs,
    timeouts,
    slowItems,
  };
}

/** Total test time budget in ms based on profile */
export function totalTimeBudget(profile: 'kids' | 'teen' | 'adult' | 'senior'): number {
  switch (profile) {
    case 'kids': return 18 * 60 * 1000;
    case 'teen': return 15 * 60 * 1000;
    case 'senior': return 18 * 60 * 1000;
    default: return 12 * 60 * 1000;
  }
}

/** Per-item soft time (ms) — past this, item is flagged slow */
export function softItemTime(profile: 'kids' | 'teen' | 'adult' | 'senior'): number {
  switch (profile) {
    case 'kids': return 60_000;
    case 'teen': return 50_000;
    case 'senior': return 60_000;
    default: return 45_000;
  }
}
