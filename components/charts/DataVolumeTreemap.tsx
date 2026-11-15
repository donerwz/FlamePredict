"use client";

import { Treemap, ResponsiveContainer } from "recharts";
import { FAMILY_COLORS } from "./chartTheme";
import CountUp from "../tabs/CountUp";
import type { VizExperiment } from "@/lib/conditions";

interface Props {
  items: VizExperiment[];
  totalTb: number;
  inView: boolean;
  reduced: boolean;
}

interface TileDatum {
  name: string;
  size: number;
  acc: string;
  acronym: string;
  sizeLabel: string;
  color: string;
  url: string;
  // Recharts' TreemapDataType requires an index signature.
  [key: string]: string | number;
}

// Recharts spreads each node's datum onto the content props along with geometry.
interface TileProps extends Partial<TileDatum> {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function Tile({ x = 0, y = 0, width = 0, height = 0, acc, acronym, sizeLabel, color, url }: TileProps) {
  if (width <= 0 || height <= 0) return null;
  const big = width > 54 && height > 26;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <title>{`${acronym} (${acc}) — ${sizeLabel}`}</title>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color ?? "#8495b2"}
        fillOpacity={0.85}
        stroke="#050a14"
        strokeWidth={1.5}
      />
      {big && (
        <text
          x={x + 6}
          y={y + 16}
          fill="#050a14"
          style={{ fontSize: 11 }}
          fontFamily="var(--font-data), monospace"
        >
          {acronym}
        </text>
      )}
    </a>
  );
}

export default function DataVolumeTreemap({ items, totalTb, inView, reduced }: Props) {
  const data: TileDatum[] = items.map((e) => ({
    name: e.acronym,
    size: e.sizeGb,
    acc: e.acc,
    acronym: e.acronym,
    sizeLabel: e.size,
    color: FAMILY_COLORS[e.family],
    url: e.url,
  }));

  return (
    <div>
      <p className="mb-4 font-data text-sm tabular-nums text-icewhite">
        <CountUp value={totalTb} decimals={2} className="text-2xl text-flame" />{" "}
        TB total · tile area ∝ data volume
      </p>
      <div className="h-[420px] w-full">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              content={<Tile />}
              isAnimationActive={!reduced}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
