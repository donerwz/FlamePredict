import data from "@/data/learned-visuals.json";
import { experiments } from "./experiments";
import { LearnedVisualsSchema, type LearnedVisuals, type Role } from "./schema";

/**
 * data/learned-visuals.json parsed through zod at build time, then checked
 * against the dataset: every entry must name a real investigation, a declared
 * agent and fuel, and quote a phrase that actually appears in that
 * investigation's record — so the matrix cannot drift from experiments.json.
 */
export const learnedVisuals: LearnedVisuals = LearnedVisualsSchema.parse(data);

const byAcc = new Map(experiments.map((e) => [e.acc, e]));

{
  const { agents, fuels, entries } = learnedVisuals.suppressants;
  const agentIds = new Set(agents.map((a) => a.id));
  const fuelIds = new Set(fuels.map((f) => f.id));
  for (const en of entries) {
    const where = `learned-visuals.json: ${en.acc} ${en.agent}/${en.fuel}`;
    const e = byAcc.get(en.acc);
    if (!e) throw new Error(`${where}: unknown investigation`);
    if (!agentIds.has(en.agent)) throw new Error(`${where}: unknown agent`);
    if (!fuelIds.has(en.fuel)) throw new Error(`${where}: unknown fuel`);
    const record = [e.fuel, e.variables, e.oxygen].join(" ");
    if (!record.includes(en.source)) {
      throw new Error(`${where}: source phrase not found in the record`);
    }
  }
  for (const acc of learnedVisuals.coolFlame.cites) {
    if (!byAcc.has(acc)) {
      throw new Error(`learned-visuals.json: coolFlame cites unknown ${acc}`);
    }
  }
}

export interface RoleMember {
  acc: string;
  acronym: string;
  doi: string;
}

/** Investigations tagged with a fire-safety role, in rank order. */
export function membersOfRole(role: Role): RoleMember[] {
  return experiments
    .filter((e) => e.role.includes(role))
    .sort((a, b) => a.rank - b.rank)
    .map((e) => ({ acc: e.acc, acronym: e.acronym, doi: e.doi }));
}

/** Investigations with none of the given roles. */
export function countWithoutRoles(roles: Role[]): number {
  return experiments.filter((e) => !roles.some((r) => e.role.includes(r)))
    .length;
}

export const experimentCount = experiments.length;
