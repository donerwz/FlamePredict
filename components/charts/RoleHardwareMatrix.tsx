"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ROLES, type Role } from "@/lib/schema";
import type { HardwareFamily } from "@/lib/stats";
import type { VizExperiment } from "@/lib/conditions";

interface Props {
  items: VizExperiment[];
  inView: boolean;
  reduced: boolean;
}

const COLS: (HardwareFamily | "Other")[] = [
  "ACME / CIR",
  "MDCA / CIR",
  "MSG",
  "Saffire / Cygnus",
  "Other",
];

export default function RoleHardwareMatrix({ items, inView, reduced }: Props) {
  const [hover, setHover] = useState<{ role: Role; col: string } | null>(null);

  const { cell, max } = useMemo(() => {
    const cell = new Map<string, VizExperiment[]>();
    let max = 0;
    for (const role of ROLES) {
      for (const col of COLS) {
        const list = items.filter(
          (e) => e.role.includes(role) && e.family === col,
        );
        cell.set(`${role}|${col}`, list);
        max = Math.max(max, list.length);
      }
    }
    return { cell, max };
  }, [items]);

  const hovered = hover ? cell.get(`${hover.role}|${hover.col}`) ?? [] : [];

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Header */}
          <div className="grid grid-cols-[7.5rem_repeat(5,1fr)] gap-1.5 pb-1.5">
            <span />
            {COLS.map((c) => (
              <span
                key={c}
                className="px-1 text-center font-data text-[0.58rem] leading-tight tracking-[0.08em] text-slate"
              >
                {c}
              </span>
            ))}
          </div>

          {/* Rows */}
          {ROLES.map((role, r) => (
            <div
              key={role}
              className="mb-1.5 grid grid-cols-[7.5rem_repeat(5,1fr)] items-stretch gap-1.5"
            >
              <span className="flex items-center text-xs text-fog">{role}</span>
              {COLS.map((col) => {
                const list = cell.get(`${role}|${col}`) ?? [];
                const n = list.length;
                const intensity = max ? n / max : 0;
                const isHover = hover?.role === role && hover?.col === col;
                return (
                  <motion.button
                    key={col}
                    type="button"
                    disabled={n === 0}
                    onMouseEnter={() => n && setHover({ role, col })}
                    onFocus={() => n && setHover({ role, col })}
                    onMouseLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    aria-label={`${role} × ${col}: ${n} experiment${n === 1 ? "" : "s"}`}
                    initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: reduced ? 0 : r * 0.08 }}
                    className="flex h-10 items-center justify-center font-data text-sm tabular-nums transition-[outline] disabled:cursor-default"
                    style={{
                      background: n ? `rgba(92,157,255,${0.12 + intensity * 0.55})` : "rgba(132,149,178,0.05)",
                      color: n ? "#d6e6ff" : "rgba(132,149,178,0.5)",
                      outline: isHover ? "1.5px solid #5c9dff" : "1.5px solid transparent",
                      outlineOffset: -1,
                    }}
                  >
                    {n || "·"}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hover detail */}
      <div className="mt-4 min-h-[2.5rem] border-t border-flame/10 pt-3">
        {hover ? (
          <p className="text-xs leading-relaxed text-slate">
            <span className="font-semibold text-icewhite">
              {hover.role} · {hover.col}
            </span>{" "}
            —{" "}
            {hovered.map((e, i) => (
              <span key={e.acc}>
                {i > 0 && ", "}
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-flame hover:underline"
                >
                  {e.acronym}
                </a>{" "}
                <span className="font-data text-[0.62rem] tracking-[0.08em]">
                  ({e.acc})
                </span>
              </span>
            ))}
          </p>
        ) : (
          <p className="text-xs text-slate/70">
            Hover or focus a cell to see which investigations answer that
            safety question with that hardware.
          </p>
        )}
      </div>
    </div>
  );
}
