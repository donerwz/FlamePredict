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
import {
  ExperimentsFileSchema,
  ConditionsFileSchema,
  PagesFileSchema,
  LearnedVisualsSchema,
} from "../lib/schema.ts";
import {
  DEFAULT_WEIGHTS,
  computeScore,
  roundScore,
  starsForScore,
} from "../lib/score.ts";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "data");

const raw: unknown = JSON.parse(
  readFileSync(join(dataDir, "experiments.json"), "utf8"),
);

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

// conditions.json: valid schema, and exactly one entry per experiment.
const condRaw: unknown = JSON.parse(
  readFileSync(join(dataDir, "conditions.json"), "utf8"),
);
const condResult = ConditionsFileSchema.safeParse(condRaw);
if (!condResult.success) {
  console.error("✗ conditions.json failed zod validation:\n");
  console.error(JSON.stringify(condResult.error.issues, null, 2));
  process.exit(1);
}
const condAccs = new Set(condResult.data.conditions.map((c) => c.acc));
const expAccs = new Set(file.experiments.map((e) => e.acc));
const missing = [...expAccs].filter((a) => !condAccs.has(a));
const extra = [...condAccs].filter((a) => !expAccs.has(a));
if (missing.length || extra.length || condAccs.size !== condResult.data.conditions.length) {
  console.error("✗ conditions.json does not match experiments 1:1");
  if (missing.length) console.error("  missing:", missing.join(", "));
  if (extra.length) console.error("  extra:", extra.join(", "));
  process.exit(1);
}

// pages.json: valid schema, every claim has a source, every cited PSI ID exists.
const pagesResult = PagesFileSchema.safeParse(
  JSON.parse(readFileSync(join(dataDir, "pages.json"), "utf8")),
);
if (!pagesResult.success) {
  console.error("✗ pages.json failed zod validation:\n");
  console.error(JSON.stringify(pagesResult.error.issues, null, 2));
  process.exit(1);
}
const pg = pagesResult.data;
let claims = 0;
const badClaims: string[] = [];
for (const page of [pg.moon, pg.learned, pg.next]) {
  for (const section of page.sections) {
    for (const item of section.items) {
      claims++;
      if (item.cites.length === 0 && !item.brief) {
        badClaims.push(`"${item.title}" cites no source`);
      }
      for (const acc of item.cites) {
        if (!expAccs.has(acc)) badClaims.push(`"${item.title}" cites unknown ${acc}`);
      }
    }
  }
}
if (badClaims.length) {
  console.error("✗ pages.json has unsourced or mis-cited claims:");
  for (const b of badClaims) console.error("  " + b);
  process.exit(1);
}
console.log(`✓ zod: ${claims} page claims validated, each with a PSI or brief source.`);

// learned-visuals.json: valid schema; every matrix entry names a real
// investigation and quotes a phrase found in that investigation's record.
const lvResult = LearnedVisualsSchema.safeParse(
  JSON.parse(readFileSync(join(dataDir, "learned-visuals.json"), "utf8")),
);
if (!lvResult.success) {
  console.error("✗ learned-visuals.json failed zod validation:\n");
  console.error(JSON.stringify(lvResult.error.issues, null, 2));
  process.exit(1);
}
const lv = lvResult.data;
const expByAcc = new Map(result.data.experiments.map((e) => [e.acc, e]));
const lvAgents = new Set(lv.suppressants.agents.map((a) => a.id));
const lvFuels = new Set(lv.suppressants.fuels.map((f) => f.id));
const badEntries: string[] = [];
for (const en of lv.suppressants.entries) {
  const tag = `${en.acc} ${en.agent}/${en.fuel}`;
  const e = expByAcc.get(en.acc);
  if (!e) badEntries.push(`${tag}: unknown investigation`);
  else if (![e.fuel, e.variables, e.oxygen].join(" ").includes(en.source)) {
    badEntries.push(`${tag}: source phrase not found in the record`);
  }
  if (!lvAgents.has(en.agent)) badEntries.push(`${tag}: unknown agent`);
  if (!lvFuels.has(en.fuel)) badEntries.push(`${tag}: unknown fuel`);
}
for (const acc of lv.coolFlame.cites) {
  if (!expByAcc.has(acc)) badEntries.push(`coolFlame cites unknown ${acc}`);
}
if (badEntries.length) {
  console.error("✗ learned-visuals.json has unsupported entries:");
  for (const b of badEntries) console.error("  " + b);
  process.exit(1);
}
console.log(
  `✓ zod: ${lv.suppressants.entries.length} agent/fuel entries validated against their source phrases.`,
);
console.log(
  `✓ zod: ${condResult.data.conditions.length} condition rows validated, one per experiment.`,
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
