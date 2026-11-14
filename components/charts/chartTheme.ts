import type { HardwareFamily } from "@/lib/stats";

/**
 * Categorical colours for the four flight hardware families. Cool-toned and
 * distinct for accessibility; ember is deliberately absent (reserved for
 * Earth-gravity semantics per design-direction.md).
 */
export const FAMILY_COLORS: Record<HardwareFamily | "Other", string> = {
  "ACME / CIR": "#5c9dff", // flame
  "MDCA / CIR": "#5fd4d0", // cyan
  MSG: "#b59cff", // periwinkle
  "Saffire / Cygnus": "#f2c7a0", // warm sand (distinct, not the pure ember accent)
  Other: "#8495b2", // slate
};

export const FAMILY_ORDER: (HardwareFamily | "Other")[] = [
  "ACME / CIR",
  "MDCA / CIR",
  "MSG",
  "Saffire / Cygnus",
  "Other",
];

/** Linear interpolator between a data domain and a pixel range. */
export function linScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (v: number) => number {
  const d = domainMax - domainMin || 1;
  return (v) => rangeMin + ((v - domainMin) / d) * (rangeMax - rangeMin);
}
