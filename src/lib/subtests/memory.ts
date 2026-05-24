import type { BatteryItem } from '../battery';

// Digit span reverso: mostra N dígitos um a um, usuário digita na ordem inversa.
// N cresce de 4 a 8.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function genMemory(seed: number, count: number): BatteryItem[] {
  const r = rng(seed);
  const items: BatteryItem[] = [];
  for (let i = 0; i < count; i++) {
    const len = 4 + i; // 4..8
    const digits = Array.from({ length: len }, () => Math.floor(r() * 10).toString());
    const reverse = [...digits].reverse().join('');
    items.push({
      id: `mem-${seed}-${i}`,
      kind: 'memory',
      difficulty: -1 + i * 0.7, // 4 dig fácil → 8 dig difícil
      data: { digits },
      correctAnswer: reverse,
    });
  }
  return items;
}
