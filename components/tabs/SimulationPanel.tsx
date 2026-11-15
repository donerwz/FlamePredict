"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import SimControls from "@/components/flame/SimControls";
import WhatTheDataSays from "@/components/flame/WhatTheDataSays";
import { DEFAULT_PARAMS, isSustained, type SimParams } from "@/components/flame/simTypes";
import type { VizExperiment } from "@/lib/conditions";

// three.js only loads when this tab is opened.
const FlameCanvas = dynamic(() => import("@/components/flame/FlameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-data text-xs tracking-[0.14em] text-slate">
      LOADING 3D…
    </div>
  ),
});

interface Props {
  viz: VizExperiment[];
}

export default function SimulationPanel({ viz }: Props) {
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const reduced = useReducedMotion() ?? false;
  const fpsRef = useRef<HTMLSpanElement | null>(null);
  const sustained = isSustained(params);

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Always-visible disclaimer (CLAUDE.md rule). */}
      <p className="border-l-2 border-ember/60 pl-3 text-xs leading-relaxed text-slate">
        <span className="font-semibold text-ember">
          Qualitative illustration, not a prediction.
        </span>{" "}
        Shapes, colours and extinction behaviour follow trends reported in the
        cited PSI investigations; nothing here is a measured flame.
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="relative h-[380px] border border-flame/15 md:h-[460px]">
            <FlameCanvas params={params} reduced={reduced} fpsRef={fpsRef} />
            <p className="pointer-events-none absolute left-3 top-3 font-data text-[0.64rem] tracking-[0.12em] text-slate">
              {sustained ? (
                <span className="text-flame">FLAME SUSTAINED</span>
              ) : (
                <span className="text-ember">SELF-EXTINGUISHING</span>
              )}
            </p>
            <span
              ref={fpsRef}
              className="pointer-events-none absolute right-3 top-3 font-data text-[0.64rem] tabular-nums tracking-[0.12em] text-slate"
            />
            <p className="pointer-events-none absolute bottom-3 left-3 font-data text-[0.58rem] tracking-[0.1em] text-slate">
              DRAG TO ORBIT
            </p>
          </div>
          <div className="mt-6">
            <SimControls params={params} onChange={setParams} />
          </div>
        </div>

        <aside className="min-w-0 border-t border-flame/20 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <WhatTheDataSays viz={viz} params={params} />
        </aside>
      </div>
    </div>
  );
}
