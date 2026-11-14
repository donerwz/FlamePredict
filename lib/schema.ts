import { z } from "zod";

/**
 * Zod schema for data/experiments.json — the single source of truth for every
 * experiment fact in FlamePredict. Parsed at build time (see lib/experiments.ts)
 * so invalid or drifted data fails the build instead of reaching the UI.
 */

// The five safety/role categories used across the dashboard (PLAN §3).
// Note: the data file uses the American spelling "Modeling".
export const ROLES = [
  "Prevention",
  "Detection",
  "Suppression",
  "Fundamental",
  "Modeling",
] as const;

export const RoleSchema = z.enum(ROLES);

// F / M / P / D sub-scores are integers on a 0–5 scale.
const subScore = z.number().int().min(0).max(5);

export const ExperimentSchema = z.object({
  // Identity & citation
  acc: z.string().min(1), // PSI ID, e.g. "PSI-20"
  acronym: z.string().min(1),
  name: z.string().min(1),
  doi: z.string().min(1), // cited as https://doi.org/<doi>
  url: z.string().regex(/^https?:\/\//, "must be an http(s) URL"),

  // Classification
  type: z.string().min(1), // "Flight", "Ground", "Ground (modelling)"
  platform: z.string(), // may be "—"
  hardware: z.string(),
  role: z.array(RoleSchema).min(1),
  sub: z.string(),
  size: z.string(), // human-readable data volume, e.g. "1.85 TB"
  dates: z.string(),
  pis: z.string(),

  // Prewritten narrative fields (CLAUDE.md: never generated at runtime)
  goal: z.string(),
  flame_3d: z.string(),
  oxygen: z.string(),
  flow: z.string(),
  pressure: z.string(),
  fuel: z.string(),
  variables: z.string(),
  sensors: z.string(),
  findings: z.string(),
  moon: z.string(),
  related: z.string(),

  // Ranking inputs & outputs (math lives in lib/score.ts)
  F: subScore,
  M: subScore,
  P: subScore,
  D: subScore,
  score: z.number(),
  stars: z.number().int().min(1).max(5),
  rank: z.number().int().min(1),
});

export const ExperimentsFileSchema = z
  .object({
    source: z.string(),
    retrieved: z.string(),
    total_size_tb: z.number().positive(),
    count: z.number().int().positive(),
    experiments: z.array(ExperimentSchema).min(1),
  })
  .refine((d) => d.experiments.length === d.count, {
    message: "`count` must equal the number of experiments",
    path: ["count"],
  });

export type Role = z.infer<typeof RoleSchema>;
export type Experiment = z.infer<typeof ExperimentSchema>;
export type ExperimentsFile = z.infer<typeof ExperimentsFileSchema>;
