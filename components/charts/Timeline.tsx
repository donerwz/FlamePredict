"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { FAMILY_COLORS, linScale } from "./chartTheme";
import type { VizExperiment } from "@/lib/conditions";

interface Props {
  items: VizExperiment[];
  inView: boolean;
  reduced: boolean;
}

const VB = { w: 640, h: 230 };
const AXIS_Y = 180;
const PAD = { left: 24, right: 24 };

interface Tip {
  item: VizExperiment;
  left: number;
  top: number;
}

export default function Timeline({ items, inView, reduced }: Props) {
  const [tip, setTip] = useState<Tip | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const dated = useMemo(
    () => items.filter((e) => e.startYear !== null),
    [items],
  );
  const years = dated.map((e) => e.startYear as number);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const sx = linScale(minY, maxY, PAD.left + 10, VB.w - PAD.right - 10);

  // Stack experiments that share a start year.
  const stacks = useMemo(() => {
    const byYear = new Map<number, VizExperiment[]>();
    for (const e of [...dated].sort((a, b) => a.acronym.localeCompare(b.acronym))) {
      const y = e.startYear as number;
      byYear.set(y, [...(byYear.get(y) ?? []), e]);
    }
    return byYear;
  }, [dated]);

  const ticks = [1999, 2005, 2010, 2015, 2020, 2025].filter(
    (t) => t >= minY && t <= maxY,
  );

  const showTip = (e: VizExperiment, ev: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ item: e, left: ev.clientX - r.left, top: ev.clientY - r.top });
  };

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full"
        role="img"
        aria-label="Timeline of investigation start years"
      >
        {/* Axis line draws left to right */}
        <motion.line
          x1={PAD.left}
          y1={AXIS_Y}
          x2={VB.w - PAD.right}
          y2={AXIS_Y}
          stroke="rgba(132,149,178,0.5)"
          strokeWidth={1.5}
          initial={reduced ? false : { pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={AXIS_Y} x2={sx(t)} y2={AXIS_Y + 5} stroke="rgba(132,149,178,0.5)" />
            <text x={sx(t)} y={AXIS_Y + 18} textAnchor="middle" className="fill-slate" style={{ fontSize: 10 }} fontFamily="var(--font-data), monospace">
              {t}
            </text>
          </g>
        ))}

        {[...stacks.entries()].map(([year, list]) =>
          list.map((e, i) => {
            const cx = sx(year);
            const cy = AXIS_Y - 14 - i * 15;
            const delay = reduced ? 0 : 0.3 + ((year - minY) / (maxY - minY || 1)) * 0.8;
            return (
              <motion.a
                key={e.acc}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseMove={(ev) => showTip(e, ev)}
                onMouseLeave={() => setTip(null)}
                initial={reduced ? false : { scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
                className="cursor-pointer"
              >
                <title>{`${e.acronym} (${e.acc}) — ${e.dates}`}</title>
                <line x1={cx} y1={cy + 6} x2={cx} y2={AXIS_Y} stroke="rgba(132,149,178,0.25)" />
                <circle cx={cx} cy={cy} r={5} fill={FAMILY_COLORS[e.family]} stroke="#050a14" strokeWidth={1} />
              </motion.a>
            );
          }),
        )}
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[14rem] border border-flame/30 bg-void/95 px-3 py-2 text-xs backdrop-blur"
          style={{ left: Math.min(tip.left + 12, 460), top: tip.top + 12 }}
        >
          <p className="font-semibold text-icewhite">{tip.item.acronym}</p>
          <p className="font-data text-[0.62rem] tracking-[0.1em] text-flame">
            {tip.item.acc} · {tip.item.dates}
          </p>
        </div>
      )}
    </div>
  );
}
