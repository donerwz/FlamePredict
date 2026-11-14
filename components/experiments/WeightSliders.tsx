"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BLUR_SOFT, SETTLED } from "@/lib/motion";
import { DEFAULT_WEIGHTS, type Weights } from "@/lib/score";

interface WeightSlidersProps {
  weights: Weights;
  onChange: (w: Weights) => void;
}

const DIMENSIONS = ["F", "M", "P", "D"] as const;

// The scoring methodology — what each axis means and the question it answers.
// Default weights come from DEFAULT_WEIGHTS so they can never drift from the math.
const AXES: { dim: (typeof DIMENSIONS)[number]; name: string; question: React.ReactNode }[] = [
  {
    dim: "F",
    name: "Fire-safety directness",
    question: (
      <>
        Does it inform prevention (materials, flammability limits), detection
        (smoke), or suppression for crew habitats?
      </>
    ),
  },
  {
    dim: "M",
    name: "Moon / Mars transfer",
    question: (
      <>
        Does it test elevated O<sub>2</sub> / reduced pressure, still air, or
        mimic partial gravity?
      </>
    ),
  },
  {
    dim: "P",
    name: "Predictive-modelling value",
    question: (
      <>
        Are O<sub>2</sub>, airflow, pressure, etc. controlled so the data can
        feed flammability or fire-scenario models?
      </>
    ),
  },
  {
    dim: "D",
    name: "Data richness",
    question: <>Volume, experimental tables, imagery.</>,
  },
];

/**
 * The four ranking weights, live. Labels stay as the methodology's F/M/P/D
 * letters — the dataset defines the dimensions, so we don't invent names.
 * A disclosure explains what each axis means (see AXES).
 */
export default function WeightSliders({ weights, onChange }: WeightSlidersProps) {
  const reduced = useReducedMotion();
  const [showAxes, setShowAxes] = useState(false);
  const isDefault = DIMENSIONS.every((d) => weights[d] === DEFAULT_WEIGHTS[d]);

  return (
    <section aria-labelledby="weights-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          id="weights-heading"
          className="text-sm font-semibold text-icewhite"
        >
          Re-rank the list
        </h3>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_WEIGHTS })}
          disabled={isDefault}
          className="text-xs font-semibold text-flame transition-colors duration-300 hover:underline disabled:cursor-default disabled:text-slate/50 disabled:no-underline"
        >
          Reset weights
        </button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate">
        score = wF·F + wM·M + wP·P + wD·D — the four scoring dimensions from
        the ranking methodology. Defaults 0.40 / 0.25 / 0.25 / 0.10.{" "}
        <button
          type="button"
          onClick={() => setShowAxes((v) => !v)}
          aria-expanded={showAxes}
          aria-controls="axis-legend"
          className="font-semibold text-flame hover:underline"
        >
          {showAxes ? "Hide what the axes mean" : "What do F / M / P / D mean?"}
        </button>
      </p>

      {showAxes && (
        <motion.dl
          id="axis-legend"
          initial={reduced ? false : { opacity: 0, y: 6, filter: BLUR_SOFT }}
          animate={SETTLED}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-4 border-b border-flame/15"
        >
          {AXES.map((a) => (
            <div
              key={a.dim}
              className="grid grid-cols-[4.5rem_1fr] gap-x-5 border-t border-flame/15 py-3.5"
            >
              <dt>
                <span className="font-data text-sm text-flame">{a.dim}</span>
                <span className="mt-1 block font-data text-[0.6rem] tracking-[0.12em] text-slate">
                  {Math.round(DEFAULT_WEIGHTS[a.dim] * 100)}% DEFAULT
                </span>
              </dt>
              <dd>
                <p className="text-sm font-semibold text-icewhite">{a.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate">
                  {a.question}
                </p>
              </dd>
            </div>
          ))}
        </motion.dl>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
        {DIMENSIONS.map((d) => (
          <div key={d} className="flex items-center gap-3">
            <label
              htmlFor={`weight-${d}`}
              className="w-4 font-data text-xs text-fog"
            >
              {d}
            </label>
            <input
              id={`weight-${d}`}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={weights[d]}
              onChange={(ev) =>
                onChange({ ...weights, [d]: Number(ev.target.value) })
              }
              className="w-full accent-flame"
            />
            <output
              htmlFor={`weight-${d}`}
              className="w-10 text-right font-data text-xs tabular-nums text-flame"
            >
              {weights[d].toFixed(2)}
            </output>
          </div>
        ))}
      </div>
    </section>
  );
}
