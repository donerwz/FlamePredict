"use client";

import { motion } from "motion/react";
import { BLUR_SOFT, SETTLED } from "@/lib/motion";
import RankBar from "./RankBar";
import type { Weights } from "@/lib/score";
import type { ExperimentWithFamily } from "@/lib/stats";
import type { VizExperiment } from "@/lib/conditions";
import ConditionRangeChart from "./ConditionRangeChart";

interface RowDetailProps {
  e: ExperimentWithFamily;
  weights: Weights;
  reduced: boolean;
  id: string;
  chartItem: VizExperiment;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-fog">{value || "—"}</dd>
    </div>
  );
}

/** Expanded panel: the five required field groups plus citations and meta. */
export default function RowDetail({
  e,
  weights,
  reduced,
  id,
  chartItem,
}: RowDetailProps) {
  return (
    <motion.div
      id={id}
      initial={reduced ? false : { opacity: 0, y: 6, filter: BLUR_SOFT }}
      animate={SETTLED}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-t border-flame/10 pb-7 pt-5"
    >
      <ConditionRangeChart item={chartItem} />

      <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Goal" value={e.goal} />
        </div>
        <Field label="3D flame model" value={e.flame_3d} />
        <div>
          <dt className="text-xs font-semibold text-slate">Conditions</dt>
          <dd className="mt-1">
            <ul className="space-y-1.5 text-sm leading-relaxed text-fog">
              <li>
                <span className="text-slate">
                  O<sub>2</sub>:
                </span>{" "}
                {e.oxygen || "—"}
              </li>
              <li>
                <span className="text-slate">Airflow:</span> {e.flow || "—"}
              </li>
              <li>
                <span className="text-slate">Pressure:</span>{" "}
                {e.pressure || "—"}
              </li>
              <li>
                <span className="text-slate">Fuel:</span> {e.fuel || "—"}
              </li>
            </ul>
          </dd>
        </div>
        <Field label="Variables" value={e.variables} />
        <Field label="Sensors" value={e.sensors} />
        <Field label="Moon relevance" value={e.moon} />
      </dl>

      <div className="mt-6">
        <RankBar e={e} weights={weights} reduced={reduced} />
      </div>

      <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-data text-[0.68rem] tracking-[0.1em] text-slate">
        <span>{e.hardware || "—"}</span>
        <span>{e.dates || "—"}</span>
        <span>{e.size || "—"}</span>
        <span>RELATED: {e.related || "—"}</span>
      </p>
      <p className="mt-3 flex gap-5 text-xs font-semibold">
        <a
          href={`https://doi.org/${e.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-flame hover:underline"
        >
          DOI {e.doi}
        </a>
        <a
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-flame hover:underline"
        >
          PSI entry ({e.acc})
        </a>
      </p>
    </motion.div>
  );
}
