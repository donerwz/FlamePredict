"use client";

import { useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { BLUR_SOFT, SETTLED } from "@/lib/motion";
import OverviewPanel from "./OverviewPanel";
import ExperimentsPanel from "@/components/experiments/ExperimentsPanel";
import type { ExperimentWithFamily, OverviewStats } from "@/lib/stats";
import type { VizExperiment } from "@/lib/conditions";
import type { Experiment } from "@/lib/schema";

const PanelLoading = () => (
  <p
    role="status"
    className="py-16 font-data text-xs tracking-[0.14em] text-slate"
  >
    LOADING…
  </p>
);

// The chart library and the simulation only download when their tab opens;
// the overview and the experiments list are in the page's first load.
const VisualizationPanel = dynamic(() => import("./VisualizationPanel"), {
  loading: PanelLoading,
});
const SimulationPanel = dynamic(() => import("./SimulationPanel"), {
  loading: PanelLoading,
});

const TABS = [
  { key: "overview", label: "Data overview" },
  { key: "experiments", label: "Experiments" },
  { key: "visualization", label: "Visualization" },
  { key: "simulation", label: "Flames in Freefall" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const isTab = (v: string | null): v is TabKey =>
  TABS.some((t) => t.key === v);

// The active tab lives in the URL (?tab=) so tabs can be deep-linked. It is
// read through useSyncExternalStore rather than useSearchParams: that hook
// would opt the whole page out of prerendering, leaving /explore empty until
// JavaScript loads. Here the server (and no-JS) render is the overview tab,
// and the client switches to the linked tab on hydration.
const TAB_EVENT = "flamepredict:tab";

function subscribeTab(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(TAB_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(TAB_EVENT, onChange);
  };
}

function readTab(): TabKey {
  const param = new URLSearchParams(window.location.search).get("tab");
  return isTab(param) ? param : "overview";
}

const serverTab = (): TabKey => "overview";

interface ExploreHubProps {
  stats: OverviewStats;
  top: Experiment[];
  all: ExperimentWithFamily[];
  viz: VizExperiment[];
}

export default function ExploreHub({ stats, top, all, viz }: ExploreHubProps) {
  const reduced = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = useSyncExternalStore(subscribeTab, readTab, serverTab);

  const select = (key: TabKey) => {
    window.history.replaceState(
      null,
      "",
      key === "overview" ? "/explore" : `/explore?tab=${key}`,
    );
    window.dispatchEvent(new Event(TAB_EVENT));
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
      <h1 className="sr-only">Explore the experiments</h1>
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
