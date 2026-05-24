// Procedural 3x3 matrix generator + ICAR-inspired items.
// Each item has 8 alternatives. Difficulty is calibrated by rule complexity.

export type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'hex';
export type Color = '#5b7cfa' | '#ff7a59' | '#2ecc71' | '#f1c40f' | '#9b59b6';

export interface Cell {
  shape: Shape;
  color: Color;
  count: number; // 1..3
  rotation: number; // 0, 45, 90 degrees
  filled: boolean;
}

export interface Item {
  id: string;
  /** 3x3 matrix; last cell (index 8) is the missing one (null) */
  matrix: (Cell | null)[];
  /** 8 alternatives — exactly one is correct */
  options: Cell[];
  correctIndex: number;
  /** difficulty in logits-like scale: -3..+3 */
  difficulty: number;
  /** rule applied (for explanation/debug) */
  rule: string;
}

const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'diamond', 'hex'];
const COLORS: Color[] = ['#5b7cfa', '#ff7a59', '#2ecc71', '#f1c40f', '#9b59b6'];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length)];

/** Rule families. Each produces a 3x3 + the correct ninth cell. */
type RuleFn = (r: () => number) => { matrix: Cell[]; rule: string; difficulty: number };

const ruleConstantRow: RuleFn = (r) => {
  // Each row has the same shape & color, count varies by column 1..3
  const matrix: Cell[] = [];
  for (let row = 0; row < 3; row++) {
    const shape = pick(SHAPES, r);
    const color = pick(COLORS, r);
    for (let col = 0; col < 3; col++) {
      matrix.push({ shape, color, count: col + 1, rotation: 0, filled: true });
    }
  }
  return { matrix, rule: 'Forma/cor constantes na linha; quantidade cresce por coluna.', difficulty: -1.5 };
};

const ruleProgression: RuleFn = (r) => {
  // Count grows row-wise; color shifts column-wise
  const matrix: Cell[] = [];
  const shape = pick(SHAPES, r);
  const baseColorIdx = Math.floor(r() * COLORS.length);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      matrix.push({
        shape,
        color: COLORS[(baseColorIdx + col) % COLORS.length],
        count: row + 1,
        rotation: 0,
        filled: true,
      });
    }
  }
  return { matrix, rule: 'Forma constante. Cor varia por coluna; quantidade cresce por linha.', difficulty: -0.5 };
};

const ruleXor: RuleFn = (r) => {
  // Distribution-of-three: in each row, three distinct shapes appear once
  const shapesOrder = [...SHAPES].sort(() => r() - 0.5).slice(0, 3);
  const colorsOrder = [...COLORS].sort(() => r() - 0.5).slice(0, 3);
  const matrix: Cell[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const s = shapesOrder[(row + col) % 3];
      const c = colorsOrder[(row * 2 + col) % 3];
      matrix.push({ shape: s, color: c, count: 1, rotation: 0, filled: true });
    }
  }
  return { matrix, rule: 'Distribuição-de-três: 3 formas e 3 cores, cada uma aparece uma vez por linha.', difficulty: 0.5 };
};

const ruleRotation: RuleFn = (r) => {
  const shape = pick(SHAPES, r);
  const color = pick(COLORS, r);
  const matrix: Cell[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      matrix.push({
        shape,
        color,
        count: 1,
        rotation: ((row * 3 + col) * 45) % 360,
        filled: true,
      });
    }
  }
  return { matrix, rule: 'Rotação progressiva de 45° célula a célula.', difficulty: 0.0 };
};

const ruleFilledCount: RuleFn = (r) => {
  const shape = pick(SHAPES, r);
  const color = pick(COLORS, r);
  const matrix: Cell[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      matrix.push({
        shape,
        color,
        count: ((row + col) % 3) + 1,
        rotation: 0,
        filled: (row + col) % 2 === 0,
      });
    }
  }
  return { matrix, rule: 'Quantidade segue padrão diagonal; preenchimento alterna par/ímpar.', difficulty: 1.2 };
};

const ruleAndCombined: RuleFn = (r) => {
  // Shape progresses row-wise; color progresses col-wise; count = row+col+1
  const sBase = Math.floor(r() * SHAPES.length);
  const cBase = Math.floor(r() * COLORS.length);
  const matrix: Cell[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      matrix.push({
        shape: SHAPES[(sBase + row) % SHAPES.length],
        color: COLORS[(cBase + col) % COLORS.length],
        count: ((row + col) % 3) + 1,
        rotation: 0,
        filled: true,
      });
    }
  }
  return { matrix, rule: 'Forma varia por linha; cor por coluna; quantidade combina ambas.', difficulty: 1.8 };
};

const RULES: RuleFn[] = [
  ruleConstantRow,
  ruleProgression,
  ruleRotation,
  ruleXor,
  ruleFilledCount,
  ruleAndCombined,
];

function distractor(correct: Cell, r: () => number): Cell {
  const mode = Math.floor(r() * 4);
  const d: Cell = { ...correct };
  if (mode === 0) d.shape = pick(SHAPES.filter((s) => s !== correct.shape), r);
  else if (mode === 1) d.color = pick(COLORS.filter((c) => c !== correct.color), r);
  else if (mode === 2) d.count = ((correct.count + 1) % 3) + 1;
  else d.rotation = (correct.rotation + 45) % 360;
  return d;
}

function buildItem(seed: number, ruleIdx: number): Item {
  const r = rng(seed);
  const { matrix, rule, difficulty } = RULES[ruleIdx](r);
  const correct = matrix[8];
  const opts: Cell[] = [correct];
  const seen = new Set<string>([JSON.stringify(correct)]);
  let safety = 0;
  while (opts.length < 8 && safety < 80) {
    safety++;
    const d = distractor(correct, r);
    const key = JSON.stringify(d);
    if (!seen.has(key)) {
      seen.add(key);
      opts.push(d);
    }
  }
  // shuffle
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  const correctIndex = opts.findIndex((o) => JSON.stringify(o) === JSON.stringify(correct));
  const matrixWithBlank: (Cell | null)[] = [...matrix];
  matrixWithBlank[8] = null;
  return {
    id: `proc-${seed}-${ruleIdx}`,
    matrix: matrixWithBlank,
    options: opts,
    correctIndex,
    difficulty,
    rule,
  };
}

/** Generate a balanced 16-item test using a seed (so it's reproducible per session). */
export function generateTest(seed: number, count = 16): Item[] {
  const items: Item[] = [];
  // distribution: 4 easy, 6 medium, 6 hard
  const easyRules = [0, 1];
  const medRules = [2, 3];
  const hardRules = [4, 5];
  const order = [
    ...Array(4).fill(easyRules),
    ...Array(6).fill(medRules),
    ...Array(6).fill(hardRules),
  ];
  for (let i = 0; i < count; i++) {
    const pool = order[i] as number[];
    const ruleIdx = pool[i % pool.length];
    items.push(buildItem(seed + i * 7919, ruleIdx));
  }
  return items;
}
