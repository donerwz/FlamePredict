"use client";

import Stars from "./Stars";
import type { ScoredExperiment } from "./types";

interface CompareTableProps {
  items: ScoredExperiment[];
  onRemove: (acc: string) => void;
  onClear: () => void;
}

/** Side-by-side comparison of 2–3 selected experiments, values verbatim. */
export default function CompareTable({
  items,
  onRemove,
  onClear,
}: CompareTableProps) {
  const rows: { label: React.ReactNode; render: (e: ScoredExperiment) => React.ReactNode }[] = [
    { label: "Score", render: (e) => e.liveScore.toFixed(2) },
    { label: "Stars", render: (e) => <Stars value={e.liveStars} /> },
    {
      label: "PSI ID / DOI",
      render: (e) => (
        <span className="font-data text-[0.68rem] tracking-[0.1em]">
          {e.acc} ·{" "}
          <a
            href={`https://doi.org/${e.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame hover:underline"
          >
            DOI
          </a>
        </span>
      ),
    },
    {
      label: "Type / platform",
      render: (e) => `${e.type} · ${e.platform || "—"}`,
    },
    { label: "Hardware", render: (e) => e.hardware || "—" },
    {
      label: (
        <>
          O<sub>2</sub>
        </>
      ),
      render: (e) => e.oxygen || "—",
    },
    { label: "Airflow", render: (e) => e.flow || "—" },
    { label: "Pressure", render: (e) => e.pressure || "—" },
    { label: "Fuel", render: (e) => e.fuel || "—" },
    { label: "Variables", render: (e) => e.variables || "—" },
    { label: "Sensors", render: (e) => e.sensors || "—" },
    { label: "Moon relevance", render: (e) => e.moon || "—" },
  ];

  return (
    <section aria-label="Comparison" className="border-t border-flame/20 pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold text-icewhite">
          Comparing {items.length} experiments
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-flame hover:underline"
        >
          Clear selection
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr>
              <th scope="col" className="w-28 pb-3 align-bottom" />
              {items.map((e) => (
                <th
                  key={e.acc}
                  scope="col"
                  className="pb-3 pr-6 align-bottom font-semibold text-icewhite"
                >
                  {e.acronym}
                  <button
                    type="button"
                    onClick={() => onRemove(e.acc)}
                    className="ml-3 font-normal text-slate hover:text-fog hover:underline"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-flame/10 align-top">
                <th
                  scope="row"
                  className="py-2.5 pr-4 font-semibold text-slate"
                >
                  {row.label}
                </th>
                {items.map((e) => (
                  <td
                    key={e.acc}
                    className="py-2.5 pr-6 leading-relaxed text-fog"
                  >
                    {row.render(e)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
