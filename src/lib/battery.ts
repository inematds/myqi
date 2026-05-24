// Unified battery model. V1 = só matrizes. V2 = bateria múltipla.
import type { Item as MatrixData } from './items';
import { generateTest as genMatrices } from './items';
import { genVerbal } from './subtests/verbal';
import { genNumeric } from './subtests/numeric';
import { genRotation } from './subtests/rotation';
import { genMemory } from './subtests/memory';

export type SubtestKind = 'matrix' | 'verbal' | 'numeric' | 'rotation' | 'memory';
export type Version = 'v1' | 'v2';

export interface BatteryItem {
  id: string;
  kind: SubtestKind;
  difficulty: number;     // -3..+3 like
  data: any;              // shape depends on kind
  correctAnswer: any;     // index or string
}

export interface BatteryAnswer {
  itemId: string;
  kind: SubtestKind;
  selected: any;
  correct: boolean;
  timeMs: number;
  timedOut: boolean;
  difficulty: number;
}

export const SUBTEST_LABEL: Record<SubtestKind, string> = {
  matrix: 'Raciocínio Fluido (matrizes)',
  verbal: 'Raciocínio Verbal',
  numeric: 'Raciocínio Numérico',
  rotation: 'Rotação Mental',
  memory: 'Memória de Trabalho',
};

export function buildBattery(version: Version, seed: number): BatteryItem[] {
  if (version === 'v1') {
    return genMatrices(seed, 16).map(matrixToBattery);
  }
  // V2: bateria múltipla balanceada
  const matrix = genMatrices(seed, 8).map(matrixToBattery);
  const verbal = genVerbal(seed + 101, 8);
  const numeric = genNumeric(seed + 202, 8);
  const rotation = genRotation(seed + 303, 6);
  const memory = genMemory(seed + 404, 5);
  // Intercalar ordem: blocos sequenciais (mais previsível pro usuário)
  return [...matrix, ...verbal, ...numeric, ...rotation, ...memory];
}

function matrixToBattery(m: MatrixData): BatteryItem {
  return {
    id: m.id,
    kind: 'matrix',
    difficulty: m.difficulty,
    data: { matrix: m.matrix, options: m.options },
    correctAnswer: m.correctIndex,
  };
}

export function totalBudgetMs(version: Version, profile: string): number {
  const base = version === 'v1' ? 12 : 25; // V2 é mais longa
  let minutes = base;
  if (profile === 'kids' || profile === 'senior') minutes += 5;
  if (profile === 'teen') minutes += 2;
  return minutes * 60 * 1000;
}
