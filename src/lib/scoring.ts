import type { BatteryAnswer, SubtestKind, Version } from './battery';
import { getNorm } from './norms';

export interface SubtestScore {
  kind: SubtestKind;
  correct: number;
  total: number;
  z: number;
  iq: number;
  avgTimeMs: number;
}

export interface ScoreResult {
  rawCorrect: number;
  totalItems: number;
  iq: number;             // composite IQ on 100±15
  iqCI: [number, number];
  percentile: number;
  band: string;
  perSubtest: SubtestScore[];
  byDifficulty: { easy: { correct: number; total: number }; medium: { correct: number; total: number }; hard: { correct: number; total: number } };
  avgTimeMs: number;
  timeouts: number;
  slowItems: number[];
}

function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? 1 - p : p;
}

function band(iq: number): string {
  if (iq < 70) return 'Abaixo da média (avaliação clínica recomendada)';
  if (iq < 85) return 'Faixa abaixo da média';
  if (iq < 115) return 'Faixa média (típica da população)';
  if (iq < 130) return 'Acima da média';
  if (iq < 145) return 'Superior';
  return 'Muito superior';
}

// Expected proportion correct per subtest (centered around average performance).
// Used as a normalization anchor when norms by subtest are not yet calibrated.
const EXPECTED_PROP: Record<SubtestKind, { mean: number; sd: number }> = {
  matrix:   { mean: 0.65, sd: 0.18 },
  verbal:   { mean: 0.55, sd: 0.20 },
  numeric:  { mean: 0.55, sd: 0.20 },
  rotation: { mean: 0.50, sd: 0.22 },
  memory:   { mean: 0.50, sd: 0.22 },
};

function difficultyWeighted(answers: BatteryAnswer[]): number {
  return answers.reduce((sum, a) => {
    if (!a.correct) return sum;
    const w = Math.max(0.5, Math.min(2, 1 + a.difficulty / 3));
    return sum + w;
  }, 0);
}

export function score(answers: BatteryAnswer[], age: number, version: Version): ScoreResult {
  const total = answers.length;
  const rawCorrect = answers.filter((a) => a.correct).length;
  const norm = getNorm(age);

  // Per-subtest grouping
  const grouped = new Map<SubtestKind, BatteryAnswer[]>();
  for (const a of answers) {
    if (!grouped.has(a.kind)) grouped.set(a.kind, []);
    grouped.get(a.kind)!.push(a);
  }

  const perSubtest: SubtestScore[] = [];
  for (const [kind, arr] of grouped) {
    const c = arr.filter((a) => a.correct).length;
    const prop = arr.length ? c / arr.length : 0;
    const exp = EXPECTED_PROP[kind];
    const z = (prop - exp.mean) / exp.sd;
    const iqSub = Math.round(100 + 15 * z);
    const t = arr.map((a) => a.timeMs).filter((x) => x > 0);
    const avg = t.length ? t.reduce((s, x) => s + x, 0) / t.length : 0;
    perSubtest.push({ kind, correct: c, total: arr.length, z, iq: Math.max(55, Math.min(160, iqSub)), avgTimeMs: avg });
  }

  let iq: number;
  let sem: number;
  if (version === 'v1') {
    // mantém scoring V1 baseado em normas Raven-like
    const diffAdj = difficultyWeighted(answers);
    const adjustedRaw = rawCorrect + (diffAdj - rawCorrect) * 0.4;
    const z = (adjustedRaw - norm.mean) / norm.sd;
    iq = Math.round(100 + 15 * z);
    sem = 15 * Math.sqrt(1 - norm.reliability);
  } else {
    // V2 composto: média dos z dos subtestes (igual peso)
    const zs = perSubtest.map((p) => p.z);
    const zMean = zs.length ? zs.reduce((s, x) => s + x, 0) / zs.length : 0;
    iq = Math.round(100 + 15 * zMean);
    // SEM da bateria é menor (mais subtestes → maior confiabilidade composta)
    const compositeReliability = Math.min(0.95, 0.78 + 0.03 * Math.max(0, perSubtest.length - 1));
    sem = 15 * Math.sqrt(1 - compositeReliability);
  }
  iq = Math.max(55, Math.min(160, iq));
  const ci: [number, number] = [Math.round(iq - 1.96 * sem), Math.round(iq + 1.96 * sem)];
  const zCenter = (iq - 100) / 15;
  const percentile = Math.max(1, Math.min(99, Math.round(phi(zCenter) * 100)));

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
  const slowItems: number[] = [];
  answers.forEach((a, i) => {
    if (a.timedOut || (avgTimeMs > 0 && a.timeMs > avgTimeMs * 1.75)) slowItems.push(i);
  });

  return {
    rawCorrect,
    totalItems: total,
    iq,
    iqCI: ci,
    percentile,
    band: band(iq),
    perSubtest,
    byDifficulty,
    avgTimeMs,
    timeouts,
    slowItems,
  };
}

export function softItemTime(profile: 'kids' | 'teen' | 'adult' | 'senior', kind?: SubtestKind): number {
  const base = profile === 'kids' || profile === 'senior' ? 60_000 : profile === 'teen' ? 50_000 : 45_000;
  if (kind === 'memory') return 30_000;
  if (kind === 'numeric') return base * 0.9;
  return base;
}
