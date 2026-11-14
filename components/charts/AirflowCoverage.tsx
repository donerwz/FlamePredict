"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { FAMILY_COLORS } from "./chartTheme";
import type { VizExperiment } from "@/lib/conditions";

interface Props {
  items: VizExperiment[];
  inView: boolean;
  reduced: boolean;
}

const MAX = 70; // cm/s axis headroom (SPICE reaches 65)
const TICKS = [0, 20, 40, 60];

export default function AirflowCoverage({ items, inView, reduced }: Props) {
  const rows = useMemo(
    () =>
      items
        .filter((e) => e.flowMin !== null && e.flowMax !== null)
        .sort((a, b) => (b.flowMax ?? 0) - (a.flowMax ?? 0) || (a.flowMin ?? 0) - (b.flowMin ?? 0)),
    [items],
  );

  return (
    <div>
      {/* Axis ticks */}
      <div className="relative ml-[9.5rem] mb-2 hidden h-4 sm:block">
        {TICKS.map((t) => (
          <span
            key={t}
            className="absolute font-data text-[0.6rem] tracking-[0.1em] text-slate"
            style={{ left: `${(t / MAX) * 100}%`, transform: "translateX(-50%)" }}
          >
            {t}
          </span>
        ))}
      </div>

      <ul className="flex flex-col gap-2.5">
        {rows.map((e, i) => {
          const min = e.flowMin ?? 0;
          const max = e.flowMax ?? 0;
          const quiescent = min === 0 && max === 0;
          const leftPct = (min / MAX) * 100;
          const widthPct = Math.max(((max - min) / MAX) * 100, quiescent ? 0 : 1.5);
          const color = FAMILY_COLORS[e.family];
          const delay = reduced ? 0 : i * 0.06;

          return (
            <li key={e.acc} className="flex items-center gap-3">
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[8.5rem] shrink-0 truncate text-right text-xs text-fog hover:text-flame"
                title={`${e.acronym} (${e.acc})`}
              >
                {e.acronym}
              </a>
              <div className="relative h-5 flex-1 bg-flame/5">
                {quiescent ? (
                  <motion.span
                    className="absolute top-1/2 flex items-center gap-1.5"
                    style={{ left: 0, translateY: "-50%" }}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.4, delay }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <span className="font-data text-[0.58rem] tracking-[0.1em] text-slate">
                      QUIESCENT
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    className="absolute top-0 block h-full origin-left"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: `${color}cc` }}
                    initial={reduced ? false : { scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay }}
                  >
                    <span className="sr-only">
                      {min}–{max} cm/s
                    </span>
                  </motion.span>
                )}
              </div>
              <span className="w-20 shrink-0 font-data text-[0.64rem] tabular-nums text-slate">
                {quiescent ? "0 cm/s" : `${min}–${max}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
