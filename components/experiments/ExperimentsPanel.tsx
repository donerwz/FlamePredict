"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import {
  DEFAULT_WEIGHTS,
  computeScore,
  roundScore,
  starsForScore,
  type Weights,
} from "@/lib/score";
import type { ExperimentWithFamily } from "@/lib/stats";
import ExperimentRow from "./ExperimentRow";
import FiltersBar, { DEFAULT_FILTERS, type Filters } from "./FiltersBar";
import WeightSliders from "./WeightSliders";
import CompareTable from "./CompareTable";
import type { ScoredExperiment } from "./types";
import type { VizExperiment } from "@/lib/conditions";

const MAX_COMPARE = 3;

export default function ExperimentsPanel({
  all,
  viz,
}: {
  all: ExperimentWithFamily[];
  viz: VizExperiment[];
}) {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const reduced = useReducedMotion() ?? false;
  const chartItems = useMemo(
    () => new Map(viz.map((item) => [item.acc, item])),
    [viz],
  );

  // Live ranking across ALL experiments (filters narrow the view, not the
  // rank numbers). Rounded scores keep float noise from reordering ties;
  // ties fall back to the published rank, so defaults reproduce it exactly.
  const ranked: ScoredExperiment[] = useMemo(() => {
    const scored = all.map((e) => {
      const liveScore = roundScore(computeScore(e, weights));
      return {
        ...e,
        liveScore,
        liveStars: starsForScore(liveScore),
        liveRank: 0,
      };
    });
    scored.sort((a, b) => b.liveScore - a.liveScore || a.rank - b.rank);
    scored.forEach((e, i) => {
      e.liveRank = i + 1;
    });
    return scored;
  }, [all, weights]);

  const visible = useMemo(
    () =>
      ranked.filter((e) => {
        if (filters.role && !e.role.includes(filters.role)) return false;
        if (filters.family && e.family !== filters.family) return false;
        if (filters.type === "flight" && e.type !== "Flight") return false;
        if (filters.type === "ground" && e.type === "Flight") return false;
        if (filters.moon && e.M < 4) return false;
        if (filters.q) {
          const q = filters.q.toLowerCase();
          const hay =
            `${e.acc} ${e.acronym} ${e.name} ${e.pis} ${e.goal}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [ranked, filters],
  );

  const compareItems = ranked.filter((e) => compare.includes(e.acc));

  const toggleExpand = (acc: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(acc)) next.delete(acc);
      else next.add(acc);
      return next;
    });
  };

  const toggleCompare = (acc: string) => {
    setCompare((prev) =>
      prev.includes(acc)
        ? prev.filter((a) => a !== acc)
        : prev.length < MAX_COMPARE
          ? [...prev, acc]
          : prev,
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <WeightSliders weights={weights} onChange={setWeights} />
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        shown={visible.length}
        total={all.length}
      />

      {compareItems.length >= 2 && (
        <CompareTable
          items={compareItems}
          onRemove={toggleCompare}
          onClear={() => setCompare([])}
        />
      )}

      <ul aria-label="Ranked experiments">
        <AnimatePresence initial={false}>
          {visible.map((e) => (
            <ExperimentRow
              key={e.acc}
              e={e}
              weights={weights}
              expanded={expanded.has(e.acc)}
              onToggleExpand={() => toggleExpand(e.acc)}
              compared={compare.includes(e.acc)}
              compareDisabled={compare.length >= MAX_COMPARE}
              onToggleCompare={() => toggleCompare(e.acc)}
              reduced={reduced}
              chartItem={chartItems.get(e.acc)!}
            />
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <li className="border-t border-flame/20 py-12 text-sm text-slate">
            No experiments match these filters.{" "}
            <button
              type="button"
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              className="font-semibold text-flame hover:underline"
            >
              Clear filters
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
