"use client";

import { motion } from "motion/react";
import type { Weights } from "@/lib/score";
import type { Experiment } from "@/lib/schema";

interface RankBarProps {
  e: Pick<Experiment, "F" | "M" | "P" | "D">;
  weights: Weights;
  reduced: boolean;
}

const SEGMENTS = [
  { dim: "F", cls: "bg-flame" },
  { dim: "M", cls: "bg-flame/70" },
  { dim: "P", cls: "bg-flame/40" },
  { dim: "D", cls: "bg-flame/20" },
] as const;

/**
 * Score breakdown as a stacked bar: each segment's share is weight × value.
 * Segments re-balance with a layout animation (transform) when weights move.
 */
export default function RankBar({ e, weights, reduced }: RankBarProps) {
  const contributions = SEGMENTS.map((s) => ({
    ...s,
    value: weights[s.dim] * e[s.dim],
  }));

  return (
    <div>
      <p className="text-xs font-semibold text-slate">
        Why this rank — weight × value per dimension
      </p>
      <div className="mt-2 flex h-2 w-full max-w-md gap-px bg-flame/10">
        {contributions.map((c) => (
          <motion.span
            key={c.dim}
            layout={reduced ? false : "size"}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`block h-full ${c.cls}`}
            style={{ flexGrow: c.value, flexBasis: 0 }}
          />
        ))}
      </div>
      <p className="mt-2 flex gap-4 font-data text-[0.65rem] tracking-[0.1em] text-slate">
        {contributions.map((c) => (
          <span key={c.dim} className="tabular-nums">
            {c.dim} {c.value.toFixed(2)}
          </span>
        ))}
      </p>
    </div>
  );
}
