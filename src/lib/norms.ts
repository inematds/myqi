// Approximate norms — based on Raven SPM / ICAR matrix reasoning literature.
// Conservative defaults; values are illustrative and refined by calibration over time.

interface Norm { mean: number; sd: number; reliability: number; }

/** Expected mean correct (out of 16) per age band, and SD. Reliability used for SEM. */
const NORMS: { range: [number, number]; norm: Norm }[] = [
  { range: [6, 8], norm: { mean: 5.0, sd: 2.4, reliability: 0.82 } },
  { range: [9, 11], norm: { mean: 7.0, sd: 2.6, reliability: 0.85 } },
  { range: [12, 14], norm: { mean: 9.0, sd: 2.7, reliability: 0.87 } },
  { range: [15, 17], norm: { mean: 10.5, sd: 2.8, reliability: 0.88 } },
  { range: [18, 29], norm: { mean: 11.0, sd: 2.9, reliability: 0.89 } },
  { range: [30, 44], norm: { mean: 10.5, sd: 2.9, reliability: 0.88 } },
  { range: [45, 59], norm: { mean: 9.5, sd: 3.0, reliability: 0.87 } },
  { range: [60, 74], norm: { mean: 8.0, sd: 3.1, reliability: 0.85 } },
  { range: [75, 110], norm: { mean: 6.5, sd: 3.0, reliability: 0.83 } },
];

export function getNorm(age: number): Norm {
  for (const n of NORMS) {
    if (age >= n.range[0] && age <= n.range[1]) return n.norm;
  }
  return NORMS[4].norm;
}
