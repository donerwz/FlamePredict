"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { BLUR_SOFT, SETTLED } from "@/lib/motion";
import OverviewPanel from "./OverviewPanel";
import ExperimentsPanel from "@/components/experiments/ExperimentsPanel";
import VisualizationPanel from "./VisualizationPanel";
import SimulationPanel from "./SimulationPanel";
import type { ExperimentWithFamily, OverviewStats } from "@/lib/stats";
import type { VizExperiment } from "@/lib/conditions";
import type { Experiment } from "@/lib/schema";

const TABS = [
  { key: "overview", label: "Data overview" },
  { key: "experiments", label: "Experiments" },
  { key: "visualization", label: "Visualization" },
  { key: "simulation", label: "Flames in Freefall" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface ExploreHubProps {
  stats: OverviewStats;
  top: Experiment[];
  all: ExperimentWithFamily[];
  viz: VizExperiment[];
}

export default function ExploreHub({ stats, top, all, viz }: ExploreHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const param = searchParams.get("tab");
  const active: TabKey = TABS.some((t) => t.key === param)
    ? (param as TabKey)
    : "overview";

  const select = (key: TabKey) => {
    router.replace(key === "overview" ? "/explore" : `/explore?tab=${key}`, {
      scroll: false,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.key === active);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mx-auto min-h-svh w-full px-[clamp(1rem,3vw,3rem)]">
      <header className="flex items-baseline justify-between gap-6 py-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-icewhite"
        >
          FlamePredict
        </Link>
        <p className="readout readout--dim hidden md:flex">
          DATA SOURCE: NASA PSI · {stats.totalTb} TB · {stats.count}{" "}
          INVESTIGATIONS ({stats.flight} FLIGHT, {stats.ground} GROUND)
        </p>
        <p className="readout readout--dim md:hidden">
          NASA PSI · {stats.totalTb} TB
        </p>
      </header>

      <nav
        className="sticky top-0 z-20 -mx-[clamp(1rem,3vw,3rem)] border-b border-flame/20 bg-void/85 px-[clamp(1rem,3vw,3rem)] backdrop-blur"
        aria-label="Explore sections"
      >
        <div
          role="tablist"
          aria-label="Explore sections"
          className="flex gap-1 overflow-x-auto md:gap-6"
          onKeyDown={onKeyDown}
        >
          {TABS.map((t, i) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${t.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(t.key)}
                className={`relative shrink-0 px-3 py-4 text-sm font-semibold transition-colors duration-300 md:text-[0.95rem] ${
                  isActive ? "text-icewhite" : "text-slate hover:text-fog"
                }`}
              >
                {t.label}
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-x-1 bottom-0 h-0.5 bg-ember"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.3, ease: "easeOut" }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main>
        <motion.div
          key={active}
          role="tabpanel"
          id={`panel-${active}`}
          aria-labelledby={`tab-${active}`}
          tabIndex={0}
          className="pt-10"
          initial={reduced ? false : { opacity: 0, y: 10, filter: BLUR_SOFT }}
          animate={SETTLED}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {active === "overview" && <OverviewPanel stats={stats} top={top} />}
          {active === "experiments" && <ExperimentsPanel all={all} viz={viz} />}
          {active === "visualization" && (
            <VisualizationPanel viz={viz} totalTb={stats.totalTb} />
          )}
          {active === "simulation" && <SimulationPanel viz={viz} />}
        </motion.div>
      </main>
    </div>
  );
}
