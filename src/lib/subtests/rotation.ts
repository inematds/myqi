import type { BatteryItem } from '../battery';

// Cada item: uma forma assimétrica (sequência de pontos). 4 candidatos: alguns são
// rotações puras, outros são espelhos (mirror). Tarefa: escolher a rotação verdadeira.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randomPolygon(r: () => number): [number, number][] {
  // L-shape ou F-shape com leve variação — base 100x100
  const variants: [number, number][][] = [
    [[10, 10], [60, 10], [60, 35], [35, 35], [35, 85], [10, 85]], // L
    [[10, 10], [70, 10], [70, 30], [35, 30], [35, 50], [60, 50], [60, 70], [35, 70], [35, 90], [10, 90]], // F-like
    [[20, 10], [80, 10], [80, 30], [55, 30], [55, 90], [35, 90], [35, 30], [20, 30]], // T
    [[10, 20], [40, 20], [40, 10], [70, 10], [70, 50], [55, 50], [55, 80], [25, 80], [25, 50], [10, 50]], // Z complex
  ];
  return variants[Math.floor(r() * variants.length)];
}

function rotate(pts: [number, number][], deg: number): [number, number][] {
  const rad = (deg * Math.PI) / 180;
  const cx = 50, cy = 50;
  return pts.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    return [cx + dx * Math.cos(rad) - dy * Math.sin(rad), cy + dx * Math.sin(rad) + dy * Math.cos(rad)];
  });
}

function mirror(pts: [number, number][]): [number, number][] {
  return pts.map(([x, y]) => [100 - x, y]);
}

export function genRotation(seed: number, count: number): BatteryItem[] {
  const r = rng(seed);
  const items: BatteryItem[] = [];
  const angles = [45, 90, 135, 180, 225, 270, 315];
  for (let i = 0; i < count; i++) {
    const base = randomPolygon(r);
    const correctAngle = angles[Math.floor(r() * angles.length)];
    const correct = rotate(base, correctAngle);
    // 3 distratores: rotação + espelho com ângulos diferentes
    const otherAngles = angles.filter((a) => a !== correctAngle).sort(() => r() - 0.5);
    const distractors = [
      mirror(rotate(base, otherAngles[0])),
      mirror(rotate(base, otherAngles[1])),
      rotate(mirror(base), otherAngles[2]),
    ];
    const options = [correct, ...distractors];
    for (let k = options.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1));
      [options[k], options[j]] = [options[j], options[k]];
    }
    const correctIdx = options.indexOf(correct);
    items.push({
      id: `rot-${seed}-${i}`,
      kind: 'rotation',
      difficulty: -0.5 + i * 0.4,
      data: { base, options },
      correctAnswer: correctIdx,
    });
  }
  return items;
}
