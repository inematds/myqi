import type { BatteryItem } from '../battery';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

type SeriesGen = (r: () => number) => { series: number[]; answer: number; rule: string; difficulty: number };

const arithmetic: SeriesGen = (r) => {
  const start = Math.floor(r() * 10) + 1;
  const step = Math.floor(r() * 6) + 2;
  const series = Array.from({ length: 5 }, (_, i) => start + i * step);
  return { series, answer: start + 5 * step, rule: 'progressão aritmética', difficulty: -1.5 };
};

const geometric: SeriesGen = (r) => {
  const start = Math.floor(r() * 3) + 2;
  const ratio = Math.floor(r() * 2) + 2;
  const series = Array.from({ length: 5 }, (_, i) => start * Math.pow(ratio, i));
  return { series, answer: start * Math.pow(ratio, 5), rule: 'progressão geométrica', difficulty: 0 };
};

const fibonacciLike: SeriesGen = (r) => {
  const a = Math.floor(r() * 4) + 1;
  const b = Math.floor(r() * 4) + 2;
  const series = [a, b];
  for (let i = 2; i < 5; i++) series.push(series[i - 1] + series[i - 2]);
  const ans = series[3] + series[4];
  return { series, answer: ans, rule: 'soma dos dois anteriores', difficulty: 1 };
};

const alternating: SeriesGen = (r) => {
  const a = Math.floor(r() * 8) + 2;
  const inc1 = Math.floor(r() * 4) + 2;
  const inc2 = Math.floor(r() * 4) + 3;
  // series: a, a+inc1, a+inc1+inc2 wait — pattern: alternating differences
  const series = [a];
  for (let i = 1; i < 5; i++) series.push(series[i - 1] + (i % 2 === 1 ? inc1 : inc2));
  const ans = series[4] + (5 % 2 === 1 ? inc1 : inc2);
  return { series, answer: ans, rule: 'diferenças alternadas', difficulty: 1.5 };
};

const squares: SeriesGen = (r) => {
  const start = Math.floor(r() * 3) + 1;
  const series = Array.from({ length: 5 }, (_, i) => Math.pow(start + i, 2));
  return { series, answer: Math.pow(start + 5, 2), rule: 'quadrados perfeitos', difficulty: 2 };
};

const GENS: SeriesGen[] = [arithmetic, arithmetic, geometric, fibonacciLike, alternating, squares];

export function genNumeric(seed: number, count: number): BatteryItem[] {
  const r = rng(seed);
  const items: BatteryItem[] = [];
  for (let i = 0; i < count; i++) {
    const gen = GENS[i % GENS.length];
    const { series, answer, rule, difficulty } = gen(r);
    // 4 alternativas: a correta + 3 distratores plausíveis
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const noise = [answer - 1, answer + 1, answer + series[1] - series[0], answer * 2 - series[4], answer - 2];
      const pick = noise[Math.floor(r() * noise.length)];
      if (pick !== answer && pick > 0) distractors.add(pick);
    }
    const options = [answer, ...distractors];
    // shuffle
    for (let k = options.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1));
      [options[k], options[j]] = [options[j], options[k]];
    }
    items.push({
      id: `num-${seed}-${i}`,
      kind: 'numeric',
      difficulty,
      data: { series, options, rule },
      correctAnswer: options.indexOf(answer),
    });
  }
  return items;
}
