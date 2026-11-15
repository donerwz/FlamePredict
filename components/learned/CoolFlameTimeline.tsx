"use client";

import { motion, useReducedMotion } from "motion/react";
import ChartFrame from "@/components/charts/ChartFrame";
import type { LearnedVisuals } from "@/lib/schema";
import type { Citation } from "@/lib/pages";

interface Props {
  copy: LearnedVisuals["coolFlame"];
  cites: Citation[];
}

// Sketch geometry (viewBox units). No scale: the shape is the message.
// Wide aspect so the sketch spans the full content width without growing tall.
const W = 1200;
const H = 320;
const X0 = 64; // y-axis
const BASE = 262; // x-axis
const HOT = 78;
const COOL = 206;
const X_OUT = 470; // visible flame goes out
const X_COOL = 506; // settled as a cool flame
const X_FORK = 900;
const X_END = 1176;

const FLAME = "#5c9dff";
const ICE = "#d6e6ff";
const SLATE = "#8495b2";

/**
 * Interpretive sketch for "Out is not always out": the hot flame ends, a cool
 * flame carries on through the period when the fire looks extinguished, then
 * either persists or quenches. Segments fade in left to right, once.
 */
export default function CoolFlameTimeline({ copy, cites }: Props) {
  const reduced = useReducedMotion();
  const { labels } = copy;

  return (
    <ChartFrame title={copy.title} blurb={copy.blurb} caption={copy.caption}>
      {(inView) => {
        const step = (i: number) => ({
          initial: { opacity: reduced ? 1 : 0 },
          animate: { opacity: reduced || inView ? 1 : 0 },
          transition: { duration: 0.5, delay: reduced ? 0 : i * 0.35, ease: "easeOut" as const },
        });
        return (
          <>
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={copy.alt}
                className="h-auto w-full min-w-[820px]"
              >
                {/* Axes */}
                <line x1={X0} y1={30} x2={X0} y2={BASE} stroke={SLATE} strokeOpacity={0.5} />
                <line x1={X0} y1={BASE} x2={X_END} y2={BASE} stroke={SLATE} strokeOpacity={0.5} />
                <text
                  transform={`translate(${X0 - 18} ${BASE}) rotate(-90)`}
                  className="font-data"
                  fontSize={10}
                  letterSpacing="0.12em"
                  fill={SLATE}
                >
                  {labels.yAxis}
                </text>
                <text
                  x={X_END}
                  y={BASE + 22}
                  textAnchor="end"
                  className="font-data"
                  fontSize={10}
                  letterSpacing="0.12em"
                  fill={SLATE}
                >
                  {labels.xAxis} →
                </text>

                {/* 1. Hot, visible flame */}
                <motion.g {...step(0)}>
                  <path
                    d={`M${X0} ${HOT} H${X_OUT - 26} Q${X_OUT} ${HOT} ${X_OUT} ${HOT + 30}`}
                    fill="none"
                    stroke={ICE}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <text x={X0 + 14} y={HOT - 14} fontSize={14} fontWeight={600} fill={ICE}>
                    {labels.hot}
                  </text>
                </motion.g>

                {/* 2. The visible flame goes out */}
                <motion.g {...step(1)}>
                  <path
                    d={`M${X_OUT} ${HOT + 30} V${COOL - 26} Q${X_OUT} ${COOL} ${X_COOL} ${COOL}`}
                    fill="none"
                    stroke={ICE}
                    strokeWidth={3}
                    strokeOpacity={0.55}
                    strokeLinecap="round"
                  />
                  <line
                    x1={X_OUT}
                    y1={34}
                    x2={X_OUT}
                    y2={BASE}
                    stroke={SLATE}
                    strokeDasharray="3 5"
                    strokeOpacity={0.7}
                  />
                  <text x={X_OUT + 10} y={44} fontSize={13} fill={ICE}>
                    {labels.event}
                  </text>
                </motion.g>

                {/* 3. Looks extinguished — but a cool flame burns on */}
                <motion.g {...step(2)}>
                  <rect
                    x={X_OUT}
                    y={BASE - 22}
                    width={X_END - X_OUT}
                    height={22}
                    fill={FLAME}
                    fillOpacity={0.1}
                  />
                  <text
                    x={X_OUT + 10}
                    y={BASE - 7}
                    className="font-data"
                    fontSize={10}
                    letterSpacing="0.14em"
                    fill={FLAME}
                  >
                    {labels.looksOut}
                  </text>
                  <path
                    d={`M${X_COOL} ${COOL} H${X_FORK}`}
                    fill="none"
                    stroke={FLAME}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <text x={X_COOL + 12} y={COOL - 14} fontSize={14} fontWeight={600} fill={FLAME}>
                    {labels.cool}
                  </text>
                </motion.g>

                {/* 4. Persists or quenches */}
                <motion.g {...step(3)}>
                  <circle cx={X_FORK} cy={COOL} r={4} fill={FLAME} />
                  <path
                    d={`M${X_FORK} ${COOL} H${X_END}`}
                    fill="none"
                    stroke={FLAME}
                    strokeWidth={2.5}
                    strokeDasharray="7 6"
                  />
                  <path
                    d={`M${X_FORK} ${COOL} Q${X_FORK + 30} ${COOL} ${X_FORK + 44} ${BASE - 24}`}
                    fill="none"
                    stroke={SLATE}
                    strokeWidth={2.5}
                    strokeDasharray="7 6"
                  />
                  <text x={X_END} y={COOL - 10} textAnchor="end" fontSize={13} fill={FLAME}>
                    {labels.persists}
                  </text>
                  <text x={X_FORK + 52} y={BASE - 30} fontSize={13} fill={SLATE}>
                    {labels.quenches}
                  </text>
                  <text x={X_FORK} y={COOL - 34} textAnchor="middle" fontSize={12} fill={SLATE}>
                    {labels.decider}
                  </text>
                </motion.g>
              </svg>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-data text-[0.68rem] tracking-[0.1em] text-slate">
              <span>SOURCES:</span>
              {cites.map((c) => (
                <a
                  key={c.acc}
                  href={`https://doi.org/${c.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-flame hover:underline"
                  aria-label={`${c.acronym}, ${c.acc}, DOI ${c.doi}`}
                >
                  {c.acronym} {c.acc}
                </a>
              ))}
            </p>
          </>
        );
      }}
    </ChartFrame>
  );
}
