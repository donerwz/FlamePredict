"use client";

import { useReducedMotion } from "motion/react";
import ChartFrame from "@/components/charts/ChartFrame";
import O2PressureMap from "@/components/charts/O2PressureMap";
import AirflowCoverage from "@/components/charts/AirflowCoverage";
import RoleHardwareMatrix from "@/components/charts/RoleHardwareMatrix";
import DataVolumeTreemap from "@/components/charts/DataVolumeTreemap";
import Timeline from "@/components/charts/Timeline";
import type { VizExperiment } from "@/lib/conditions";

interface Props {
  viz: VizExperiment[];
  totalTb: number;
}

export default function VisualizationPanel({ viz, totalTb }: Props) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="flex flex-col gap-14 pb-20">
      <ChartFrame
        title="Oxygen versus pressure — the money chart"
        blurb="Where each experiment burned, against the atmospheres that matter. Only two investigations reach into the Moon-base zone (richer oxygen, lower pressure) — most sit at cabin air."
        caption="Boxes span a tested range; points are single conditions. Experiments that ran at the same condition (cabin air: 21% O2 @ 14.7 psia) fan out in a ring around it. Marks grouped by hardware family; smoke/dust studies and entries without stated numbers are omitted. Pressure axis capped at 16 psia for readability; tooltips cite exact values and PSI IDs."
      >
        {(inView) => (
          <O2PressureMap items={viz} inView={inView} reduced={reduced} />
        )}
      </ChartFrame>

      <ChartFrame
        title="Airflow coverage"
        blurb="Forced-flow speed each experiment explored, in cm/s. Quiescent tests (no fan) deliberately mimic a spacecraft with ventilation off; BASS, Saffire and SPICE sweep the low-speed flows that feed fires in microgravity."
        caption="Only experiments with a stated flow range shown. Bars grow from 0 cm/s; values are the tested envelope."
      >
        {(inView) => (
          <AirflowCoverage items={viz} inView={inView} reduced={reduced} />
        )}
      </ChartFrame>

      <ChartFrame
        title="Which hardware answered which question"
        blurb="Safety role against hardware family. Darker cells ran more investigations on that question; hover a cell to see which."
        caption="Counts overlap — an investigation can serve several roles."
      >
        {(inView) => (
          <RoleHardwareMatrix items={viz} inView={inView} reduced={reduced} />
        )}
      </ChartFrame>

      <ChartFrame
        title="Data volume per investigation"
        blurb="The 12.35 TB is far from evenly shared — the ACME gas-flame and droplet campaigns dominate, while the modelling studies are kilobytes. Tile area is proportional to data size."
        caption="Tiles coloured by hardware family; click any tile for its PSI entry. Hover cites the PSI ID and exact size."
      >
        {(inView) => (
          <DataVolumeTreemap
            items={viz}
            totalTb={totalTb}
            inView={inView}
            reduced={reduced}
          />
        )}
      </ChartFrame>

      <ChartFrame
        title="Two decades of fires in freefall"
        blurb="When each investigation began. The work stretches from 1999 to a cool-flame dataset released in 2025."
        caption="Positioned by the first year in each investigation's date range; two entries without a stated start date are omitted. Click a dot for its PSI entry."
      >
        {(inView) => <Timeline items={viz} inView={inView} reduced={reduced} />}
      </ChartFrame>
    </div>
  );
}
