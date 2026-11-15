"use client";

import type { Role } from "@/lib/schema";
import type { HardwareFamily } from "@/lib/stats";

export interface Filters {
  role: Role | null;
  family: HardwareFamily | "Other" | null;
  type: "all" | "flight" | "ground";
  moon: boolean;
  q: string;
}

export const DEFAULT_FILTERS: Filters = {
  role: null,
  family: null,
  type: "all",
  moon: false,
  q: "",
};

// Local option lists typed against the schema so a data change breaks the build
// here instead of silently desyncing (client components import types only).
const ROLE_OPTIONS: Role[] = [
  "Prevention",
  "Detection",
  "Suppression",
  "Fundamental",
  "Modeling",
];
const FAMILY_OPTIONS: (HardwareFamily | "Other")[] = [
  "ACME / CIR",
  "MDCA / CIR",
  "MSG",
  "Saffire / Cygnus",
  "Other",
];

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  shown: number;
  total: number;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`border px-2.5 py-1 text-xs transition-colors duration-300 ${
        active
          ? "border-ember/60 bg-ember/15 text-icewhite"
          : "border-flame/15 text-slate hover:text-fog"
      }`}
    >
      {children}
    </button>
  );
}

export default function FiltersBar({
  filters,
  onChange,
  shown,
  total,
}: FiltersBarProps) {
  const anyActive =
    filters.role !== null ||
    filters.family !== null ||
    filters.type !== "all" ||
    filters.moon ||
    filters.q !== "";

  return (
    <section aria-label="Filters" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <input
          type="search"
          value={filters.q}
          onChange={(ev) => onChange({ ...filters, q: ev.target.value })}
          placeholder="Search name, PI, goal…"
          aria-label="Search experiments"
          className="w-full max-w-xs border-b border-flame/20 bg-transparent pb-1 text-sm text-fog placeholder:text-slate focus:border-flame focus:outline-none"
        />
        <p className="font-data text-[0.68rem] tracking-[0.12em] text-slate">
          {shown} OF {total} SHOWN
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate">Role</span>
          {ROLE_OPTIONS.map((r) => (
            <Chip
              key={r}
              active={filters.role === r}
              onClick={() =>
                onChange({ ...filters, role: filters.role === r ? null : r })
              }
            >
              {r}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate">Hardware</span>
          {FAMILY_OPTIONS.map((f) => (
            <Chip
              key={f}
              active={filters.family === f}
              onClick={() =>
                onChange({ ...filters, family: filters.family === f ? null : f })
              }
            >
              {f}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate">Type</span>
          {(["all", "flight", "ground"] as const).map((t) => (
            <Chip
              key={t}
              active={filters.type === t}
              onClick={() => onChange({ ...filters, type: t })}
            >
              {t === "all" ? "All" : t === "flight" ? "Flight" : "Ground"}
            </Chip>
          ))}
        </div>

        <Chip
          active={filters.moon}
          onClick={() => onChange({ ...filters, moon: !filters.moon })}
        >
          High Moon relevance (M ≥ 4)
        </Chip>

        {anyActive && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="text-xs font-semibold text-flame hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
