"use client";

import { motion } from "motion/react";
import { BLUR_SHARP, BLUR_SOFT } from "@/lib/motion";
import Stars from "./Stars";
import RowDetail from "./RowDetail";
import type { Weights } from "@/lib/score";
import type { ScoredExperiment } from "./types";
import type { VizExperiment } from "@/lib/conditions";

interface ExperimentRowProps {
  e: ScoredExperiment;
  weights: Weights;
  expanded: boolean;
  onToggleExpand: () => void;
  compared: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
  reduced: boolean;
  chartItem: VizExperiment;
}

export default function ExperimentRow({
  e,
  weights,
  expanded,
  onToggleExpand,
  compared,
  compareDisabled,
  onToggleCompare,
  reduced,
  chartItem,
}: ExperimentRowProps) {
  const detailId = `detail-${e.acc}`;

  return (
    <motion.li
      layout={reduced ? false : "position"}
      transition={{
        duration: 0.35,
        ease: "easeOut",
        layout: { duration: 0.5, ease: "easeOut" },
      }}
      initial={reduced ? false : { opacity: 0, filter: BLUR_SOFT }}
      animate={{ opacity: 1, filter: BLUR_SHARP, transitionEnd: { filter: "none" } }}
      exit={
        reduced
          ? undefined
          : { opacity: 0, filter: BLUR_SOFT, transition: { duration: 0.3, ease: "easeOut" } }
      }
      className="border-t border-flame/20"
    >
      <div className="grid gap-x-5 gap-y-2 py-5 md:grid-cols-[3rem_1fr_auto]">
        <p className="font-data text-sm tabular-nums text-ember">
          {String(e.liveRank).padStart(2, "0")}
        </p>

        <div className="min-w-0">
          <h3 className="font-semibold text-icewhite">
            {e.acronym}{" "}
            <span className="font-normal text-slate">— {e.name}</span>
          </h3>
          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-data text-[0.68rem] tracking-[0.1em] text-slate">
            <span>{e.acc}</span>
            <a
              href={`https://doi.org/${e.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame hover:underline"
              aria-label={`DOI for ${e.acronym}`}
            >
              DOI
            </a>
            <span>{e.platform || "—"}</span>
            <span>{e.type}</span>
          </p>
          <p className="mt-2 text-xs text-slate">PIs: {e.pis || "—"}</p>
          <p
            className={`mt-2 text-sm leading-relaxed text-fog ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            {e.goal}
          </p>
          {!expanded && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate">
              <span className="font-semibold">Findings:</span> {e.findings}
            </p>
          )}
          {expanded && (
            <p className="mt-2 text-xs leading-relaxed text-slate">
              <span className="font-semibold">Findings:</span> {e.findings}
            </p>
          )}
        </div>

        <div className="flex items-start gap-5 md:flex-col md:items-end md:gap-2">
          <p className="font-data text-lg tabular-nums text-icewhite">
            {e.liveScore.toFixed(2)}
          </p>
          <Stars value={e.liveStars} />
          <div className="flex items-center gap-4 md:mt-2">
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              aria-controls={detailId}
              className="text-xs font-semibold text-flame hover:underline"
            >
              {expanded ? "Hide details" : "Details"}
            </button>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate">
              <input
                type="checkbox"
                checked={compared}
                disabled={compareDisabled && !compared}
                onChange={onToggleCompare}
                className="accent-flame"
              />
              Compare
            </label>
          </div>
        </div>
      </div>

      {expanded && (
        <RowDetail
          e={e}
          weights={weights}
          reduced={reduced}
          id={detailId}
          chartItem={chartItem}
        />
      )}
    </motion.li>
  );
}
