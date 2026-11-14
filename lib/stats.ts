import { experiments, experimentsFile } from "./experiments";
import { ROLES, type Experiment, type Role } from "./schema";

/**
 * Derived overview numbers, computed from the validated dataset so the UI can
 * never drift from data/experiments.json.
 */

export const FLIGHT_HARDWARE_FAMILIES = [
  "ACME / CIR",
  "MDCA / CIR",
  "MSG",
  "Saffire / Cygnus",
] as const;

export type HardwareFamily = (typeof FLIGHT_HARDWARE_FAMILIES)[number];

/** Flight hardware family, or null for ground/modelling/instrument entries. */
export function hardwareFamily(e: Experiment): HardwareFamily | null {
  const h = e.hardware;
  if (h.includes("ACME")) return "ACME / CIR";
  if (h.includes("MDCA")) return "MDCA / CIR";
  if (h.includes("MSG") || h.includes("Microgravity Science Glovebox"))
    return "MSG";
  if (h.includes("Saffire")) return "Saffire / Cygnus";
  return null;
}

/** Experiment enriched server-side with its hardware family for client filters. */
export type ExperimentWithFamily = Experiment & {
  family: HardwareFamily | "Other";
};

export interface RoleCount {
  role: Role;
  count: number;
}

export interface FamilyCount {
  family: HardwareFamily;
  count: number;
}

export interface OverviewStats {
  count: number;
  totalTb: number;
  flight: number;
  ground: number;
  /** One count per role; multi-role experiments count toward each. */
  roleCounts: RoleCount[];
  familyCounts: FamilyCount[];
  familyCount: number;
}

export function overviewStats(): OverviewStats {
  const flight = experiments.filter((e) => e.type === "Flight").length;

  const roleCounts = ROLES.map((role) => ({
    role,
    count: experiments.filter((e) => e.role.includes(role)).length,
  }));

  const familyCounts = FLIGHT_HARDWARE_FAMILIES.map((family) => ({
    family,
    count: experiments.filter((e) => hardwareFamily(e) === family).length,
  }));

  return {
    count: experimentsFile.count,
    totalTb: experimentsFile.total_size_tb,
    flight,
    ground: experimentsFile.count - flight,
    roleCounts,
    familyCounts,
    familyCount: familyCounts.filter((f) => f.count > 0).length,
  };
}
