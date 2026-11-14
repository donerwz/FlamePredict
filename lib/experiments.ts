import experimentsData from "@/data/experiments.json";
import {
  ExperimentsFileSchema,
  type Experiment,
  type ExperimentsFile,
} from "./schema";

/**
 * The single source of truth, parsed through zod at module load. Because this
 * runs during the build (SSG / static export), malformed data fails the build
 * rather than reaching the UI. Never edit experiments.json from the app.
 */
export const experimentsFile: ExperimentsFile =
  ExperimentsFileSchema.parse(experimentsData);

export const experiments: Experiment[] = experimentsFile.experiments;

/** Experiments in the canonical ranked order (ascending rank). */
export const experimentsByRank: Experiment[] = [...experiments].sort(
  (a, b) => a.rank - b.rank,
);
