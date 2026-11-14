import type { ExperimentWithFamily } from "@/lib/stats";

/** Experiment with live score/stars/rank computed from the current weights. */
export interface ScoredExperiment extends ExperimentWithFamily {
  liveScore: number;
  liveStars: 1 | 2 | 3 | 4 | 5;
  liveRank: number;
}
