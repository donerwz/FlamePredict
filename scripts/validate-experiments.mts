/**
 * Standalone build-time validation for data/experiments.json.
 * Run with:  npm run validate
 *
 * Parses the data through the zod schema (lib/schema.ts) and cross-checks that
 * every stored score/stars value matches the formula in lib/score.ts. Exits
 * non-zero on any schema error so it can gate CI / the build.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ExperimentsFileSchema } from "../lib/schema.ts";
import {
  DEFAULT_WEIGHTS,
  computeScore,
  roundScore,
  starsForScore,
} from "../lib/score.ts";

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, "..", "data", "experiments.json");

const raw: unknown = JSON.parse(readFileSync(jsonPath, "utf8"));

const result = ExperimentsFileSchema.safeParse(raw);
if (!result.success) {
  console.error("✗ experiments.json failed zod validation:\n");
  console.error(JSON.stringify(result.error.issues, null, 2));
  process.exit(1);
}

const file = result.data;
console.log(
  `✓ zod: ${file.experiments.length} experiments validated ` +
    `(declared count ${file.count}, total ${file.total_size_tb} TB).`,
);

// Sanity check: stored score/stars should match lib/score.ts at default weights.
let mismatches = 0;
for (const e of file.experiments) {
  const score = roundScore(computeScore(e, DEFAULT_WEIGHTS));
  if (score !== roundScore(e.score)) {
    mismatches++;
    console.warn(
      `  ⚠ ${e.acc} score: stored ${e.score}, computed ${score}`,
    );
  }
  const stars = starsForScore(e.score);
  if (stars !== e.stars) {
    mismatches++;
    console.warn(`  ⚠ ${e.acc} stars: stored ${e.stars}, computed ${stars}`);
  }
}

// Rank should be a contiguous 1..N permutation.
const ranks = file.experiments.map((e) => e.rank).sort((a, b) => a - b);
const ranksOk = ranks.every((r, i) => r === i + 1);
if (!ranksOk) {
  mismatches++;
  console.warn(`  ⚠ ranks are not a contiguous 1..${file.count} sequence`);
}

console.log(
  mismatches === 0
    ? "✓ score, stars and ranks are consistent with lib/score.ts."
    : `⚠ ${mismatches} consistency warning(s) above.`,
);
