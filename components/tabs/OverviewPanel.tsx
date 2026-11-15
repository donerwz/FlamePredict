"use client";

import { motion, useReducedMotion } from "motion/react";
import { BLUR_SOFT, SETTLED } from "@/lib/motion";
import CountUp from "./CountUp";
import Stars from "@/components/experiments/Stars";
import type { OverviewStats } from "@/lib/stats";
import type { Experiment } from "@/lib/schema";

const ROLE_COLORS: Record<string, string> = {
  Prevention: "#ffa552",
  Detection: "#5fd4d0",
  Suppression: "#b59cff",
  Fundamental: "#f2c7a0",
  Modeling: "#ec70a5",
};

const ROLE_RING_RADIUS = 66;
const ROLE_RING_CIRCUMFERENCE = 2 * Math.PI * ROLE_RING_RADIUS;

interface OverviewPanelProps {
  stats: OverviewStats;
  top: Experiment[];
}

export default function OverviewPanel({ stats, top }: OverviewPanelProps) {
  const reduced = useReducedMotion();
  const maxRole = Math.max(...stats.roleCounts.map((r) => r.count));
  const roleAssignmentTotal = stats.roleCounts.reduce(
    (total, role) => total + role.count,
    0,
  );
  let ringOffset = 0;
  const roleSlices = stats.roleCounts.map((role) => {
    const length = roleAssignmentTotal
      ? (role.count / roleAssignmentTotal) * ROLE_RING_CIRCUMFERENCE
      : 0;
    const slice = { ...role, length, offset: ringOffset };
    ringOffset += length;
    return slice;
  });

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Stat tiles */}
      <section aria-label="Dataset at a glance">
        <div className="grid grid-cols-2 border-y border-flame/20 lg:grid-cols-4 lg:divide-x lg:divide-flame/15">
          <div className="px-2 py-7 md:px-6">
            <p className="font-data text-3xl tabular-nums text-icewhite md:text-4xl">
              <CountUp value={stats.totalTb} decimals={2} />{" "}
              <span className="text-base text-flame">TB</span>
            </p>
            <p className="mt-2 text-sm text-slate">of open experiment data</p>
          </div>
          <div className="px-2 py-7 md:px-6">
            <p className="font-data text-3xl tabular-nums text-icewhite md:text-4xl">
              <CountUp value={stats.count} />
            </p>
            <p className="mt-2 text-sm text-slate">investigations, all ranked</p>
          </div>
          <div className="px-2 py-7 md:px-6">
            <p className="font-data text-3xl tabular-nums text-icewhite md:text-4xl">
              <CountUp value={stats.flight} />{" "}
              <span className="text-base text-flame">/</span>{" "}
              <CountUp value={stats.ground} />
            </p>
            <p className="mt-2 text-sm text-slate">flight / ground studies</p>
          </div>
          <div className="px-2 py-7 md:px-6">
            <p className="font-data text-3xl tabular-nums text-icewhite md:text-4xl">
              <CountUp value={stats.familyCount} />
            </p>
            <p className="mt-2 text-sm text-slate">flight hardware families</p>
            <p className="mt-1 font-data text-[0.65rem] tracking-[0.12em] text-slate/80">
              {stats.familyCounts.map((f) => f.family.split(" / ")[0]).join(" · ")}
            </p>
          </div>
        </div>
      </section>

      {/* Role breakdown */}
      <section aria-labelledby="roles-heading">
        <h2
          id="roles-heading"
          className="text-xl font-semibold tracking-tight text-icewhite"
        >
          What each investigation works on
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Fire safety splits into roles — stopping fires before they start,
          noticing them, putting them out, and the science underneath. One
          investigation can serve several, so the counts overlap.
        </p>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ul className="space-y-5">
            {stats.roleCounts.map((r, i) => (
              <li
                key={r.role}
                className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-4 md:grid-cols-[9rem_1fr_3rem]"
              >
                <span className="text-sm text-fog">{r.role}</span>
                <span className="h-1.5 bg-flame/10">
                  <motion.span
                    className="block h-full origin-left"
                    style={{
                      width: `${(r.count / maxRole) * 100}%`,
                      backgroundColor: ROLE_COLORS[r.role],
                    }}
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                  />
                </span>
                <span className="text-right font-data text-xs tabular-nums text-slate">
                  {r.count}
                </span>
              </li>
            ))}
          </ul>

          <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <svg
              viewBox="0 0 220 220"
              role="img"
              aria-labelledby="role-chart-title role-chart-description"
              className="mx-auto w-full max-w-[14rem]"
            >
              <title id="role-chart-title">Investigation roles circle graph</title>
              <desc id="role-chart-description">
                {stats.roleCounts
                  .map((role) => `${role.role}: ${role.count}`)
                  .join("; ")}. Slices show role assignments; one investigation can have multiple roles.
              </desc>
              <g transform="rotate(-90 110 110)">
                <circle
                  cx="110"
                  cy="110"
                  r={ROLE_RING_RADIUS}
                  fill="none"
                  stroke="rgba(132,149,178,0.16)"
                  strokeWidth="24"
                />
                {roleSlices.map((slice) => (
                  <circle
                    key={slice.role}
                    cx="110"
                    cy="110"
                    r={ROLE_RING_RADIUS}
                    fill="none"
                    stroke={ROLE_COLORS[slice.role]}
                    strokeWidth="24"
                    strokeDasharray={`${Math.max(0, slice.length - 1.5)} ${ROLE_RING_CIRCUMFERENCE}`}
                    strokeDashoffset={-slice.offset}
                  />
                ))}
              </g>
              <text
                x="110"
                y="106"
                textAnchor="middle"
                className="fill-icewhite font-data text-3xl"
              >
                {roleAssignmentTotal}
              </text>
              <text
                x="110"
                y="126"
                textAnchor="middle"
                className="fill-slate font-data text-[8px] tracking-[0.1em]"
              >
                ROLE ASSIGNMENTS
              </text>
            </svg>

            <ul className="space-y-2.5 text-sm">
              {stats.roleCounts.map((role) => (
                <li key={role.role} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-fog">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: ROLE_COLORS[role.role] }}
                    />
                    {role.role}
                  </span>
                  <span className="font-data text-xs tabular-nums text-slate">
                    {role.count} · {roleAssignmentTotal
                      ? Math.round((role.count / roleAssignmentTotal) * 100)
                      : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-5 text-xs text-slate">
          Circle graph shows shares of role assignments, not unique investigations; roles overlap.
        </p>
      </section>

      {/* Top 5 strip */}
      <section aria-labelledby="top5-heading">
        <h2
          id="top5-heading"
          className="text-xl font-semibold tracking-tight text-icewhite"
        >
          Top of the ranking
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
          Ranked for Moon-base fire-safety relevance. The full list, filters
          and re-weighting live in the Experiments tab.
        </p>
        <ul className="mt-8 flex gap-8 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible">
          {top.map((e, i) => (
            <motion.li
              key={e.acc}
              className="min-w-[230px] flex-1 border-t border-flame/20 pt-4 lg:min-w-0"
              initial={reduced ? false : { opacity: 0, x: 28, filter: BLUR_SOFT }}
              whileInView={SETTLED}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-data text-xs tracking-[0.12em] text-ember">
                  RANK {e.rank}
                </span>
                <span className="font-data text-xs tabular-nums text-slate">
                  {e.score.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 font-semibold text-icewhite">{e.acronym}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate">
                {e.name}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <Stars value={e.stars} />
                <span className="font-data text-[0.68rem] tracking-[0.1em] text-slate">
                  {e.acc} ·{" "}
                  <a
                    href={`https://doi.org/${e.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-flame hover:underline"
                    aria-label={`DOI for ${e.acronym}`}
                  >
                    DOI
                  </a>
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
