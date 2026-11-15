/**
 * Fact-check pass (PLAN.md Phase 8): diff what the built site shows against
 * data/experiments.json. Run after a build:  npm run build && npm run factcheck
 *
 * Checks, over the static export in out/ and the component source:
 *  1. Every PSI ID shown anywhere exists in the dataset.
 *  2. Every doi.org link points at a DOI that is in the dataset.
 *  3. Every DOI link that names a PSI ID links to that investigation's DOI.
 *  4. Every investigation reaches /explore with its PSI ID, DOI, acronym,
 *     name, score, goal and findings, verbatim.
 *  5. Findings that are hypotheses still say so where they are shown.
 *  6. The headline numbers (count, TB, flight/ground) match the dataset.
 *  7. PSI IDs and DOIs hard-coded in component source match the dataset.
 *  8. The Moon-base reference atmospheres match the challenge brief.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { ExperimentsFileSchema } from "../lib/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");

const file = ExperimentsFileSchema.parse(
  JSON.parse(readFileSync(join(root, "data", "experiments.json"), "utf8")),
);
const exps = file.experiments;
const byAcc = new Map(exps.map((e) => [e.acc, e]));
const dois = new Set(exps.map((e) => e.doi.toLowerCase()));

const problems: string[] = [];
const fail = (msg: string) => problems.push(msg);
let checks = 0;

// ---------- helpers ----------

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

function decode(s: string): string {
  return s
    .replace(/&(?:amp|lt|gt|quot|nbsp|#x27|#39);/g, (m) => ENTITIES[m])
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

/** Visible text of an HTML fragment: no scripts, comments or tags. */
function textOf(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<sub>(.*?)<\/sub>/g, "$1")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

function htmlPages(): { route: string; html: string }[] {
  return readdirSync(outDir)
    .filter((f) => f.endsWith(".html") && f !== "404.html" && !f.startsWith("_"))
    .map((f) => ({
      route: f === "index.html" ? "/" : "/" + f.replace(/\.html$/, ""),
      html: readFileSync(join(outDir, f), "utf8"),
    }));
}

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) sourceFiles(p, acc);
    else if (/\.(tsx?|mts)$/.test(name)) acc.push(p);
  }
  return acc;
}

// ---------- 1–3: IDs and DOI links on every page ----------

let pages: { route: string; html: string }[];
try {
  pages = htmlPages();
} catch {
  console.error("✗ out/ not found. Run `npm run build` first.");
  process.exit(1);
}
if (pages.length === 0) {
  console.error("✗ no HTML pages in out/. Run `npm run build` first.");
  process.exit(1);
}

let idMentions = 0;
let doiLinks = 0;
for (const { route, html } of pages) {
  // Only the rendered document, not the embedded RSC payload.
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");

  for (const m of body.matchAll(/PSI-\d+/g)) {
    idMentions++;
    if (!byAcc.has(m[0])) fail(`${route}: shows ${m[0]}, which is not in the dataset`);
  }

  for (const m of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attrs = decode(m[1]);
    const href = /href="([^"]*)"/.exec(attrs)?.[1];
    const doi = href && /^https:\/\/doi\.org\/(.+)$/.exec(href)?.[1];
    if (!doi) continue;
    doiLinks++;
    if (!dois.has(doi.toLowerCase())) {
      fail(`${route}: links doi.org/${doi}, which is not in the dataset`);
      continue;
    }
    // If the link names PSI IDs (in its text or aria-label), exactly one of
    // them must own this DOI.
    const label = `${/aria-label="([^"]*)"/.exec(attrs)?.[1] ?? ""} ${textOf(m[2])}`;
    const named = [...new Set(label.match(/PSI-\d+/g) ?? [])];
    if (named.length && !named.some((a) => byAcc.get(a)?.doi.toLowerCase() === doi.toLowerCase())) {
      fail(`${route}: link labelled ${named.join(", ")} points at doi.org/${doi}`);
    }
  }
}
checks += 3;

// ---------- 4–5: every investigation, verbatim, on /explore ----------

const explore = pages.find((p) => p.route === "/explore");
if (!explore) {
  fail("/explore was not built");
} else {
  // /explore prerenders the overview tab. The experiments list is handed to
  // the client as props, so it lives in the page's embedded data (escaped
  // JSON): DOIs are stored bare and scores as numbers. Compare with all
  // escaping removed from both sides.
  const visible = textOf(explore.html);
  const bare = (t: string) => squash(t.replace(/\\/g, ""));
  const payload = bare(
    decode(explore.html).replace(/\\u([0-9a-f]{4})/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    ),
  );
  const has = (t: string) => visible.includes(squash(t)) || payload.includes(bare(t));

  for (const e of exps) {
    const miss: string[] = [];
    if (!has(e.acc)) miss.push("PSI ID");
    if (!has(`"doi":"${e.doi}"`) && !explore.html.includes(`https://doi.org/${e.doi}`)) {
      miss.push("DOI");
    }
    if (!has(e.acronym)) miss.push("acronym");
    if (!has(e.name)) miss.push("name");
    if (!has(`"score":${e.score}`) && !has(e.score.toFixed(2))) {
      miss.push(`score ${e.score.toFixed(2)}`);
    }
    if (!has(e.goal)) miss.push("goal text");
    if (!has(e.findings)) miss.push("findings text");
    if (miss.length) fail(`/explore: ${e.acc} is missing ${miss.join(", ")}`);

    if (/^hypothesis:/i.test(e.findings.trim()) && !has(e.findings)) {
      fail(`/explore: ${e.acc} findings are a hypothesis but are not shown verbatim`);
    }
  }
}
checks += 2;

// ---------- 6: headline numbers ----------

const flight = exps.filter((e) => e.type === "Flight").length;
const ground = exps.length - flight;
if (exps.length !== file.count) fail(`dataset: count ${file.count} ≠ ${exps.length} rows`);

const home = pages.find((p) => p.route === "/");
if (!home) fail("/ was not built");
else {
  const t = textOf(home.html);
  for (const s of [
    `${file.count} INVESTIGATIONS`,
    `${file.total_size_tb} TB`,
    `${flight} FLIGHT / ${ground} GROUND`,
    `All ${file.count} investigations`,
  ]) {
    if (!t.includes(s)) fail(`/: expected "${s}" (from the dataset)`);
  }
}
if (explore) {
  const t = textOf(explore.html);
  for (const s of [`${file.total_size_tb} TB`, `${file.count} INVESTIGATIONS`]) {
    if (!t.toUpperCase().includes(s)) fail(`/explore: expected "${s}" (from the dataset)`);
  }
}
checks += 1;

// ---------- 7: literals hard-coded in source ----------

let literals = 0;
for (const dir of ["app", "components", "lib"]) {
  for (const path of sourceFiles(join(root, dir))) {
    const src = readFileSync(path, "utf8");
    const rel = relative(root, path);
    for (const m of src.matchAll(/PSI-\d+/g)) {
      literals++;
      if (!byAcc.has(m[0])) fail(`${rel}: hard-codes ${m[0]}, not in the dataset`);
    }
    for (const m of src.matchAll(/doi\.org\/(10\.[\w./-]+)/g)) {
      literals++;
      if (!dois.has(m[1].toLowerCase())) fail(`${rel}: hard-codes DOI ${m[1]}, not in the dataset`);
    }
    // A hard-coded DOI link followed closely by a PSI ID must agree with it.
    for (const m of src.matchAll(/doi\.org\/(10\.[\w./-]+)[\s\S]{0,400}?(PSI-\d+)/g)) {
      const owner = byAcc.get(m[2]);
      if (owner && owner.doi.toLowerCase() !== m[1].toLowerCase()) {
        fail(`${rel}: ${m[2]} is paired with DOI ${m[1]} (dataset: ${owner.doi})`);
      }
    }
  }
}
checks += 1;

// ---------- 8: Moon-base reference atmospheres (challenge brief) ----------

const moon = pages.find((p) => p.route === "/moon");
if (!moon) fail("/moon was not built");
else {
  const t = textOf(moon.html);
  for (const [label, re] of [
    ["Moon base ≥30% O2", /30\s?%/],
    ["Moon base ≤10.2 psi", /10\.2\s?psi/],
    ["spacesuit 100% O2", /100\s?%/],
    ["spacesuit 4.3 psi", /4\.3\s?psi/],
    ["Earth 21% O2", /21\s?%/],
    ["Earth 14.7 psi", /14\.7\s?psi/],
  ] as const) {
    if (!re.test(t)) fail(`/moon: brief value not found: ${label}`);
  }
}
checks += 1;

// ---------- report ----------

if (problems.length) {
  console.error(`✗ fact-check found ${problems.length} problem(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(
  `✓ fact-check: ${checks} checks passed over ${pages.length} pages ` +
    `(${idMentions} PSI mentions, ${doiLinks} DOI links, ${literals} source literals, ` +
    `${exps.length} investigations verbatim on /explore).`,
);
