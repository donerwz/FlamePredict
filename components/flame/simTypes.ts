/** Simulation parameters and the qualitative visual mappings, in one place. */

export type FuelKey = "droplet" | "jet" | "sheet" | "porous";

export interface SimParams {
  g: number; // 0..1 Earth gravities
  o2: number; // % oxygen, 10..85 (CFI-G reached 85% from the burner)
  psi: number; // psia, 3..15
  flow: number; // cm/s, 0..65 (SPICE reached 65)
  fuel: FuelKey;
}

export const DEFAULT_PARAMS: SimParams = {
  g: 0,
  o2: 21,
  psi: 14.7,
  flow: 0,
  fuel: "droplet",
};

export const GRAVITY_PRESETS = [
  { label: "ISS", g: 0 },
  { label: "Moon", g: 0.16 },
  { label: "Mars", g: 0.38 },
  { label: "Earth", g: 1 },
] as const;

export interface FuelConfig {
  key: FuelKey;
  label: string;
  /** Vertical elongation / width of the flame envelope. */
  aspect: number;
  spread: number;
  /** Base sootiness before gravity/flow/O₂ adjustments. */
  soot: number;
  /** Which PSI hardware this geometry echoes (shown in the UI). */
  echoes: string;
}

export const FUELS: FuelConfig[] = [
  { key: "droplet", label: "Droplet (liquid sphere)", aspect: 1.0, spread: 1.0, soot: 0.35, echoes: "FLEX / FLEX-2 / CFI (MDCA)" },
  { key: "jet", label: "Gas jet", aspect: 1.5, spread: 0.72, soot: 0.55, echoes: "CLD / SLICE / SPICE burners" },
  { key: "sheet", label: "Solid sheet", aspect: 0.72, spread: 1.35, soot: 0.5, echoes: "BASS / Saffire samples" },
  { key: "porous", label: "Porous sphere", aspect: 1.05, spread: 1.1, soot: 0.2, echoes: "BRE / Flame Design / s-Flame burners" },
];

/**
 * BRE heuristic (PSI-20): quiescent microgravity flames at 21% O₂
 * self-extinguished; at ≥26.5% they kept burning. Any real airflow or
 * gravity-driven convection also sustains the flame.
 */
export function isSustained(p: SimParams): boolean {
  return p.g > 0.05 || p.flow >= 2 || p.o2 >= 26.5;
}

/** Shader uniform targets for a parameter set (all qualitative). */
export function visualTargets(p: SimParams) {
  const fuel = FUELS.find((f) => f.key === p.fuel) ?? FUELS[0];
  const flowN = Math.min(p.flow / 65, 1);
  const o2N = Math.min(Math.max((p.o2 - 10) / 75, 0), 1);

  // Blue when soot-free (low O₂ / 0g / quiescent); yellow-orange when sooty.
  const soot = Math.min(
    Math.max(fuel.soot + p.g * 0.35 + flowN * 0.15 + (p.o2 - 21) * 0.004, 0),
    1,
  );

  // Higher O₂: brighter and a touch smaller; pressure nudges size similarly.
  const scale = (1 - o2N * 0.18) * (1 + (p.psi - 14.7) * 0.006);

  return {
    uG: p.g,
    uFlow: flowN,
    uAspect: fuel.aspect,
    uSpread: fuel.spread,
    uSoot: soot,
    uBright: o2N,
    uIntensity: isSustained(p) ? 1 : 0.06,
    scale,
  };
}
