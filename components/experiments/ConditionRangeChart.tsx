import type { VizExperiment } from "@/lib/conditions";

interface Props {
  item: VizExperiment;
}

const MEASURES = [
  {
    label: "Oxygen",
    unit: "%",
    min: "o2Min",
    max: "o2Max",
    domain: 100,
    color: "#ffa552",
  },
  {
    label: "Pressure",
    unit: "psia",
    min: "psiaMin",
    max: "psiaMax",
    domain: 80,
    color: "#bd8cff",
  },
  {
    label: "Airflow",
    unit: "cm/s",
    min: "flowMin",
    max: "flowMax",
    domain: 100,
    color: "#68d6a5",
  },
] as const;

const PLOT = { left: 26, right: 180, top: 12, bottom: 110 };

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function RangeBar({
  label,
  unit,
  low,
  high,
  domain,
  color,
}: {
  label: string;
  unit: string;
  low: number | null;
  high: number | null;
  domain: number;
  color: string;
}) {
  const hasData = low !== null || high !== null;
  const start = low ?? 0;
  const end = high ?? domain;
  const yStart = PLOT.bottom - (start / domain) * (PLOT.bottom - PLOT.top);
  const yEnd = PLOT.bottom - (end / domain) * (PLOT.bottom - PLOT.top);
  const height = Math.max(yStart - yEnd, 3);
  const rangeLabel =
    low !== null && high !== null
      ? low === high
        ? `${formatValue(low)} ${unit}`
        : `${formatValue(low)}–${formatValue(high)} ${unit}`
      : low !== null
        ? `≥ ${formatValue(low)} ${unit}`
        : high !== null
          ? `≤ ${formatValue(high)} ${unit}`
          : "Not stated";

  return (
    <div className="min-w-0 border-t border-flame/10 pt-3">
      <h4 className="text-xs font-semibold text-icewhite">{label}</h4>
      <svg
        viewBox="0 0 200 132"
        role="img"
        aria-label={`${label} bar graph: ${rangeLabel}`}
        className="mt-2 h-32 w-full overflow-visible"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = PLOT.bottom - fraction * (PLOT.bottom - PLOT.top);
          return (
            <line
              key={fraction}
              x1={PLOT.left}
              x2={PLOT.right}
              y1={y}
              y2={y}
              stroke="rgba(132,149,178,0.2)"
              strokeDasharray={fraction === 0 ? undefined : "2 4"}
            />
          );
        })}
        <line
          x1={PLOT.left}
          x2={PLOT.left}
          y1={PLOT.top}
          y2={PLOT.bottom}
          stroke="rgba(132,149,178,0.5)"
        />
        {hasData && (
          <rect
            x="82"
            y={yEnd}
            width="42"
            height={height}
            rx="3"
            fill={color}
            fillOpacity="0.82"
          />
        )}
        <text x={PLOT.left - 4} y={PLOT.top + 3} textAnchor="end" className="fill-slate" fontSize="8">
          {domain}
        </text>
        <text x={PLOT.left - 4} y={PLOT.bottom + 3} textAnchor="end" className="fill-slate" fontSize="8">
          0
        </text>
      </svg>
      <p className="-mt-1 min-h-8 text-center font-data text-[0.65rem] leading-relaxed text-fog">
        {rangeLabel}
      </p>
      <p className="text-center font-data text-[0.55rem] text-slate">{unit}</p>
    </div>
  );
}

function DataVolumeBar({ item }: Props) {
  // The summary’s archive-size values span KB through TB, so use a log axis.
  const sizeLog = Math.log10(Math.max(item.sizeGb, 0.000001));
  const height = Math.max(((sizeLog + 6) / 10) * 92, 3);

  return (
    <div className="mt-4 max-w-xs border-t border-flame/10 pt-3">
      <h4 className="text-xs font-semibold text-icewhite">Archived data volume</h4>
      <svg
        viewBox="0 0 200 132"
        role="img"
        aria-label={`Archived data volume bar graph: ${item.size}`}
        className="mt-2 h-32 w-full"
      >
        <line x1="26" x2="180" y1="110" y2="110" stroke="rgba(132,149,178,0.5)" />
        <line x1="26" x2="26" y1="12" y2="110" stroke="rgba(132,149,178,0.5)" />
        {[0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = 110 - fraction * 98;
          return (
            <line
              key={fraction}
              x1="26"
              x2="180"
              y1={y}
              y2={y}
              stroke="rgba(132,149,178,0.2)"
              strokeDasharray="2 4"
            />
          );
        })}
        <rect
          x="82"
          y={110 - height}
          width="42"
          height={height}
          rx="3"
          fill="#ffa552"
          fillOpacity="0.82"
        />
        <text x="26" y="124" className="fill-slate" fontSize="8">1 KB</text>
        <text x="180" y="124" textAnchor="end" className="fill-slate" fontSize="8">10 TB</text>
      </svg>
      <p className="-mt-1 font-data text-[0.65rem] text-fog">{item.size}</p>
      <p className="mt-1 text-[0.6rem] text-slate">Logarithmic scale</p>
    </div>
  );
}

/** Uses bar graphs for the numeric ranges available in the local PSI summaries. */
export default function ConditionRangeChart({ item }: Props) {
  const measuresWithData = MEASURES.filter(
    ({ min, max }) => item[min] !== null || item[max] !== null,
  );

  return (
    <figure className="mt-7 border-y border-flame/15 py-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-icewhite">
          {measuresWithData.length > 0
            ? "PSI data · bar graphs"
            : "PSI data · archive volume bar graph"}
        </span>
        <span className="font-data text-[0.62rem] tracking-[0.1em] text-slate">
          {item.acc} · REPORTED SUMMARY
        </span>
      </figcaption>

      {measuresWithData.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-3">
            {measuresWithData.map(({ label, unit, min, max, domain, color }) => (
              <RangeBar
                key={label}
                label={label}
                unit={unit}
                low={item[min]}
                high={item[max]}
                domain={domain}
                color={color}
              />
            ))}
          </div>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-slate">
            Each bar shows a reported operating range on its own scale. These
            summaries do not provide sample-by-sample data for a line graph or
            category shares for a circle graph.
          </p>
        </>
      ) : (
        <>
          <DataVolumeBar item={item} />
          <p className="mt-3 text-[0.68rem] leading-relaxed text-slate">
            No numeric condition ranges are listed in this investigation
            summary, so the graph shows archived dataset size instead.
          </p>
        </>
      )}

      <p className="mt-3 text-[0.68rem] text-slate">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-flame hover:underline"
        >
          Open NASA PSI record
        </a>
      </p>
    </figure>
  );
}
