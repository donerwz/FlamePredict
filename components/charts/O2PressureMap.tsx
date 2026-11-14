"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { FAMILY_COLORS, FAMILY_ORDER, linScale } from "./chartTheme";
import type { VizExperiment } from "@/lib/conditions";

interface Props {
  items: VizExperiment[];
  inView: boolean;
  reduced: boolean;
}

const VB = { w: 640, h: 460 };
const M = { top: 20, right: 20, bottom: 46, left: 56 };
const PLOT = {
  left: M.left,
  right: VB.w - M.right,
  top: M.top,
  bottom: VB.h - M.bottom,
};

const DOMAINS = {
  full: { x: [0, 100] as const, y: [0, 16] as const, xTicks: [0, 20, 40, 60, 80, 100], yTicks: [0, 4, 8, 12, 16] },
  moon: { x: [30, 90] as const, y: [0, 10.2] as const, xTicks: [30, 50, 70, 90], yTicks: [0, 2, 4, 6, 8, 10] },
};

interface Tip {
  item: VizExperiment;
  left: number;
  top: number;
}

export default function O2PressureMap({ items, inView, reduced }: Props) {
  const [zoom, setZoom] = useState<"full" | "moon">("full");
  const [families, setFamilies] = useState<ReadonlySet<string>>(new Set());
  const [tip, setTip] = useState<Tip | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Plot only combustion experiments (a flame) with both an O2 and a pressure value.
  const plotted = useMemo(
    () =>
      items.filter(
        (e) =>
          e.hasFlame &&
          (e.o2Min !== null || e.o2Max !== null) &&
          (e.psiaMin !== null || e.psiaMax !== null),
      ),
    [items],
  );

  const activeFamilies = FAMILY_ORDER.filter((f) =>
    plotted.some((e) => e.family === f),
  );

  const shown = families.size
    ? plotted.filter((e) => families.has(e.family))
    : plotted;

  const d = DOMAINS[zoom];
  const sx = linScale(d.x[0], d.x[1], PLOT.left, PLOT.right);
  const sy = linScale(d.y[0], d.y[1], PLOT.bottom, PLOT.top);

  const toggleFamily = (f: string) =>
    setFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });

  const showTip = (e: VizExperiment, ev: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ item: e, left: ev.clientX - r.left, top: ev.clientY - r.top });
  };

  // Moon-base zone rect: O2 >= 30, pressure <= 10.2.
  const moonRect = {
    x: sx(Math.max(30, d.x[0])),
    y: sy(Math.min(10.2, d.y[1])),
    w: sx(d.x[1]) - sx(Math.max(30, d.x[0])),
    h: sy(d.y[0]) - sy(Math.min(10.2, d.y[1])),
  };

  const refs = [
    { label: "Earth / ISS", o2: 21, psia: 14.7, color: "#ffa552" },
    { label: "Spacesuit", o2: 100, psia: 4.3, color: "#8495b2" },
  ].filter((r) => r.o2 >= d.x[0] && r.o2 <= d.x[1] && r.psia >= d.y[0] && r.psia <= d.y[1]);

  return (
    <div ref={wrapRef} className="relative">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={() => setZoom(zoom === "moon" ? "full" : "moon")}
          aria-pressed={zoom === "moon"}
          className={`border px-3 py-1 text-xs font-semibold transition-colors duration-300 ${
            zoom === "moon"
              ? "border-flame/50 bg-flame/15 text-icewhite"
              : "border-flame/25 text-flame hover:bg-flame/5"
          }`}
        >
          {zoom === "moon" ? "Reset view" : "Zoom to Moon-base zone"}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {activeFamilies.map((f) => {
            const on = families.size === 0 || families.has(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFamily(f)}
                aria-pressed={families.has(f)}
                className={`flex items-center gap-1.5 text-xs transition-opacity ${
                  on ? "opacity-100" : "opacity-40"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: FAMILY_COLORS[f] }}
                />
                <span className="text-slate">{f}</span>
              </button>
            );
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full"
        role="img"
        aria-label="Scatter map of tested oxygen concentration versus pressure, with Earth, spacesuit and Moon-base reference regions"
      >
        <defs>
          <clipPath id="plot-clip">
            <rect
              x={PLOT.left}
              y={PLOT.top}
              width={PLOT.right - PLOT.left}
              height={PLOT.bottom - PLOT.top}
            />
          </clipPath>
        </defs>

        {/* Moon-base zone */}
        <motion.rect
          x={moonRect.x}
          y={moonRect.y}
          width={Math.max(0, moonRect.w)}
          height={Math.max(0, moonRect.h)}
          fill="rgba(92,157,255,0.10)"
          stroke="rgba(92,157,255,0.5)"
          strokeDasharray="4 4"
          initial={reduced ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <text
          x={moonRect.x + 8}
          y={moonRect.y + 16}
          className="fill-flame"
          style={{ fontSize: 11, letterSpacing: "0.1em" }}
          fontFamily="var(--font-data), monospace"
        >
          MOON BASE ≥30% O2, ≤10.2 psi
        </text>

        {/* Axes */}
        <line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke="rgba(132,149,178,0.4)" />
        <line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke="rgba(132,149,178,0.4)" />
        {d.xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} y1={PLOT.bottom} x2={sx(t)} y2={PLOT.bottom + 5} stroke="rgba(132,149,178,0.5)" />
            <text x={sx(t)} y={PLOT.bottom + 18} textAnchor="middle" className="fill-slate" style={{ fontSize: 10 }} fontFamily="var(--font-data), monospace">
              {t}
            </text>
          </g>
        ))}
        {d.yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={PLOT.left - 5} y1={sy(t)} x2={PLOT.left} y2={sy(t)} stroke="rgba(132,149,178,0.5)" />
            <text x={PLOT.left - 9} y={sy(t) + 3} textAnchor="end" className="fill-slate" style={{ fontSize: 10 }} fontFamily="var(--font-data), monospace">
              {t}
            </text>
          </g>
        ))}
        <text x={(PLOT.left + PLOT.right) / 2} y={VB.h - 6} textAnchor="middle" className="fill-slate" style={{ fontSize: 11 }}>
          Oxygen concentration (% O₂)
        </text>
        <text transform={`translate(14, ${(PLOT.top + PLOT.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="fill-slate" style={{ fontSize: 11 }}>
          Pressure (psia)
        </text>

        {/* Reference points */}
        {refs.map((r) => (
          <g key={r.label}>
            <circle cx={sx(r.o2)} cy={sy(r.psia)} r={4} fill={r.color} />
            <text x={sx(r.o2) + (r.o2 > 80 ? -8 : 8)} y={sy(r.psia) + 3} textAnchor={r.o2 > 80 ? "end" : "start"} style={{ fontSize: 10 }} className="fill-fog" fontFamily="var(--font-data), monospace">
              {r.label}
            </text>
          </g>
        ))}

        {/* Experiment marks — re-mount (re-animate) on zoom/filter change.
            Coincident points (many experiments ran at exactly cabin air,
            21% O₂ @ 14.7 psia) fan out in a ring around the shared condition
            so each stays visible and hoverable. */}
        <g clipPath="url(#plot-clip)" key={`${zoom}-${[...families].sort().join(",")}`}>
          {(() => {
            const marks = shown.map((e) => {
              const ox0 = (e.o2Min ?? e.o2Max) as number;
              const ox1 = (e.o2Max ?? e.o2Min) as number;
              const py0 = (e.psiaMin ?? e.psiaMax) as number;
              const py1 = (e.psiaMax ?? e.psiaMin) as number;
              return {
                e,
                ox0,
                ox1,
                py0,
                py1,
                isBox: ox0 !== ox1 || py0 !== py1,
                cx: sx((ox0 + ox1) / 2),
                cy: sy((py0 + py1) / 2),
                anchorX: 0,
                anchorY: 0,
                fanned: false,
              };
            });
            // Fan out point marks that share a coordinate.
            const groups = new Map<string, number[]>();
            marks.forEach((m, i) => {
              if (m.isBox) return;
              const k = `${Math.round(m.cx)},${Math.round(m.cy)}`;
              groups.set(k, [...(groups.get(k) ?? []), i]);
            });
            for (const idxs of groups.values()) {
              if (idxs.length < 2) continue;
              idxs.forEach((mi, j) => {
                const m = marks[mi];
                const angle = (j / idxs.length) * Math.PI * 2 - Math.PI / 2;
                m.anchorX = m.cx;
                m.anchorY = m.cy;
                m.cx += Math.cos(angle) * 14;
                m.cy += Math.sin(angle) * 14;
                m.fanned = true;
              });
            }

            return marks.map((m, idx) => {
              const { e } = m;
              const color = FAMILY_COLORS[e.family];
              const famIdx = FAMILY_ORDER.indexOf(e.family);
              // Deterministic stagger: grouped by family, nudged by order within.
              const delay = reduced ? 0 : 0.3 + famIdx * 0.12 + (idx % 5) * 0.03;
              const dotVisible =
                m.cx >= PLOT.left &&
                m.cx <= PLOT.right &&
                m.cy >= PLOT.top &&
                m.cy <= PLOT.bottom;

              return (
                <motion.a
                  key={e.acc}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={reduced ? false : { opacity: 0, y: -16 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay }}
                  onMouseMove={(ev) => showTip(e, ev)}
                  onMouseLeave={() => setTip(null)}
                  className="cursor-pointer"
                >
                  <title>{`${e.acronym} (${e.acc}) — O₂ ${e.oxygen}; pressure ${e.pressure}`}</title>
                  {m.isBox && (
                    <rect
                      x={Math.min(sx(m.ox0), sx(m.ox1))}
                      y={Math.min(sy(m.py0), sy(m.py1))}
                      width={Math.abs(sx(m.ox1) - sx(m.ox0)) || 2}
                      height={Math.abs(sy(m.py1) - sy(m.py0)) || 2}
                      fill={`${color}22`}
                      stroke={color}
                      strokeWidth={1.25}
                    />
                  )}
                  {m.fanned && (
                    <line
                      x1={m.anchorX}
                      y1={m.anchorY}
                      x2={m.cx}
                      y2={m.cy}
                      stroke={`${color}55`}
                      strokeWidth={1}
                    />
                  )}
                  {/* A box whose midpoint lies off-axis keeps its box only. */}
                  {dotVisible && (
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r={m.isBox ? 3 : 5}
                      fill={color}
                      stroke="#050a14"
                      strokeWidth={1}
                    />
                  )}
                </motion.a>
              );
            });
          })()}
        </g>
      </svg>

      {tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[15rem] border border-flame/30 bg-void/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
          style={{ left: Math.min(tip.left + 12, 480), top: tip.top + 12 }}
        >
          <p className="font-semibold text-icewhite">{tip.item.acronym}</p>
          <p className="font-data text-[0.62rem] tracking-[0.1em] text-flame">
            {tip.item.acc}
          </p>
          <p className="mt-1 text-slate">
            <span className="text-fog">O₂:</span> {tip.item.oxygen}
          </p>
          <p className="text-slate">
            <span className="text-fog">Pressure:</span> {tip.item.pressure}
          </p>
        </div>
      )}
    </div>
  );
}
