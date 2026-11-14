import type { Experiment } from "./schema";

/**
 * Ranking math — the ONLY place the score formula and star thresholds live
 * (CLAUDE.md). Weights are exposed to the UI so users can re-rank live.
 *
 *   score = wF*F + wM*M + wP*P + wD*D
 *   stars: >=4.0 -> 5, >=3.5 -> 4, >=3.0 -> 3, >=2.4 -> 2, else 1
 */

export interface Weights {
  F: number;
  M: number;
  P: number;
  D: number;
}

export const DEFAULT_WEIGHTS: Weights = { F: 0.4, M: 0.25, P: 0.25, D: 0.1 };

type SubScores = Pick<Experiment, "F" | "M" | "P" | "D">;

export function computeScore(
  e: SubScores,
  w: Weights = DEFAULT_WEIGHTS,
): number {
  return w.F * e.F + w.M * e.M + w.P * e.P + w.D * e.D;
}

export function starsForScore(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 4.0) return 5;
  if (score >= 3.5) return 4;
  if (score >= 3.0) return 3;
  if (score >= 2.4) return 2;
  return 1;
}

/** Round to 2 decimals for display and for stable equality comparisons. */
export function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}
