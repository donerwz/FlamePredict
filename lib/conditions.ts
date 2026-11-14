import conditionsData from "@/data/conditions.json";
import { experiments } from "./experiments";
import { hardwareFamily, type HardwareFamily } from "./stats";
import {
  ConditionsFileSchema,
  type Experiment,
  type GravityTag,
  type Role,
} from "./schema";

/**
 * data/conditions.json — numeric envelopes hand-extracted from the prose fields
 * of experiments.json for charting. Parsed through zod at build time and merged
 * with the validated experiments into a chart-ready `VizExperiment`.
 */

const conditionsFile = ConditionsFileSchema.parse(conditionsData);

const byAcc = new Map(conditionsFile.conditions.map((c) => [c.acc, c]));

// Every experiment must have exactly one condition row, and vice versa.
for (const e of experiments) {
  if (!byAcc.has(e.acc)) {
    throw new Error(`conditions.json is missing an entry for ${e.acc}`);
  }
}
if (byAcc.size !== experiments.length) {
  throw new Error(
    `conditions.json has ${byAcc.size} entries but there are ${experiments.length} experiments`,
  );
}

/** Parse a human size string ("1.85 TB", "627.14 MB") to gigabytes. */
export function parseSizeGb(size: string): number {
  const m = size.match(/([\d.]+)\s*(TB|GB|MB|KB)/i);
  if (!m) return 0;
  const n = Number(m[1]);
  switch (m[2].toUpperCase()) {
    case "TB":
      return n * 1024;
    case "GB":
      return n;
    case "MB":
      return n / 1024;
    case "KB":
      return n / (1024 * 1024);
    default:
      return 0;
  }
}

/** First 4-digit year in a dates string, or null ("—", "Range of pressures"). */
export function startYear(dates: string): number | null {
  const m = dates.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

export interface VizExperiment {
  acc: string;
  acronym: string;
  name: string;
  type: string;
  platform: string;
  hardware: string;
  role: Role[];
  family: HardwareFamily | "Other";
  doi: string;
  url: string;
  size: string;
  dates: string;
  // Narrative values kept for tooltips (verbatim).
  oxygen: string;
  flow: string;
  pressure: string;
  // Extracted numerics (null = not stated in the source).
  o2Min: number | null;
  o2Max: number | null;
  psiaMin: number | null;
  psiaMax: number | null;
  flowMin: number | null;
  flowMax: number | null;
  gravity: GravityTag;
  // Derived.
  sizeGb: number;
  startYear: number | null;
  hasFlame: boolean;
}

function toViz(e: Experiment): VizExperiment {
  const c = byAcc.get(e.acc)!;
  return {
    acc: e.acc,
    acronym: e.acronym,
    name: e.name,
    type: e.type,
    platform: e.platform,
    hardware: e.hardware,
    role: e.role,
    family: hardwareFamily(e) ?? "Other",
    doi: e.doi,
    url: e.url,
    size: e.size,
    dates: e.dates,
    oxygen: e.oxygen,
    flow: e.flow,
    pressure: e.pressure,
    o2Min: c.o2_min,
    o2Max: c.o2_max,
    psiaMin: c.psia_min,
    psiaMax: c.psia_max,
    flowMin: c.flow_min,
    flowMax: c.flow_max,
    gravity: c.gravity,
    sizeGb: parseSizeGb(e.size),
    startYear: startYear(e.dates),
    // "No flame" entries (smoke/dust/aerosol) are excluded from the combustion map.
    hasFlame: !/^No flame/i.test(e.flame_3d),
  };
}

export function vizExperiments(): VizExperiment[] {
  return experiments.map(toViz);
}
