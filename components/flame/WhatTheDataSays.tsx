"use client";

import type { VizExperiment } from "@/lib/conditions";
import { isSustained, type SimParams } from "./simTypes";

interface Props {
  viz: VizExperiment[];
  params: SimParams;
}

function ExpLinks({ items }: { items: VizExperiment[] }) {
  if (items.length === 0) {
    return (
      <span className="text-slate/80">
        none — beyond the tested envelope
      </span>
    );
  }
  return (
    <>
      {items.map((e, i) => (
        <span key={e.acc} className="whitespace-nowrap">
          {i > 0 && ", "}
          <a
            href={`https://doi.org/${e.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame hover:underline"
            title={`${e.name} (${e.acc})`}
          >
            {e.acronym}
          </a>{" "}
          <span className="font-data text-[0.6rem] tracking-[0.08em] text-slate">
            {e.acc}
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Which PSI investigations bound the current setting. Matching runs against
 * the numeric envelopes in data/conditions.json — the same numbers the charts
 * plot — so this panel can never cite an experiment the data doesn't support.
 */
export default function WhatTheDataSays({ viz, params }: Props) {
  const inRange = (lo: number | null, hi: number | null, v: number) =>
    lo !== null && hi !== null && v >= lo - 1e-9 && v <= hi + 1e-9;

  const o2Matches = viz.filter((e) => inRange(e.o2Min, e.o2Max, params.o2));
  const psiMatches = viz.filter((e) => inRange(e.psiaMin, e.psiaMax, params.psi));
  const flowMatches = viz.filter((e) => inRange(e.flowMin, e.flowMax, params.flow));

  const microgravity = params.g <= 0.05;
  const earthG = params.g >= 0.95;
  const flightCount = viz.filter((e) => e.gravity === "microgravity").length;
  const groundLab = viz.filter((e) => e.gravity === "ground");
  const modeling = viz.filter((e) => e.gravity === "modeling");
  const sustained = isSustained(params);

  return (
    <section aria-labelledby="data-says-heading" className="text-xs leading-relaxed">
      <h3
        id="data-says-heading"
        className="text-sm font-semibold text-icewhite"
      >
        What the data says
      </h3>

      <dl className="mt-3 flex flex-col gap-3">
        <div>
          <dt className="font-data text-[0.64rem] tracking-[0.12em] text-slate">
            GRAVITY {params.g.toFixed(2)} g
          </dt>
          <dd className="mt-1 text-fog">
            {microgravity && (
              <>
                Microgravity — the dataset&apos;s home turf: {flightCount}{" "}
                flight investigations aboard the ISS and Cygnus.
              </>
            )}
            {earthG && (
              <>
                Earth gravity — ground studies: <ExpLinks items={groundLab} />
                {modeling.length > 0 && (
                  <>
                    {" "}
                    plus modelling that spans g: <ExpLinks items={modeling} />
                  </>
                )}
              </>
            )}
            {!microgravity && !earthG && (
              <span className="text-ember">
                No PSI data at this gravity. 0 g and 1 g results bound Moon
                (0.16 g) and Mars (0.38 g); E-FIELD{" "}
                <a
                  href="https://doi.org/10.60555/se5a-8c73"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-icewhite"
                >
                  PSI-22
                </a>{" "}
                mimics a gravity-like body force with an electric field.
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-data text-[0.64rem] tracking-[0.12em] text-slate">
            O2 {params.o2}%
          </dt>
          <dd className="mt-1 text-fog">
            Tested here: <ExpLinks items={o2Matches} />
          </dd>
        </div>

        <div>
          <dt className="font-data text-[0.64rem] tracking-[0.12em] text-slate">
            PRESSURE {params.psi} PSIA
          </dt>
          <dd className="mt-1 text-fog">
            Tested here: <ExpLinks items={psiMatches} />
          </dd>
        </div>

        <div>
          <dt className="font-data text-[0.64rem] tracking-[0.12em] text-slate">
            AIRFLOW {params.flow} CM/S
          </dt>
          <dd className="mt-1 text-fog">
            Tested here: <ExpLinks items={flowMatches} />
          </dd>
        </div>

        <div>
          <dt className="font-data text-[0.64rem] tracking-[0.12em] text-slate">
            FLAME {sustained ? "SUSTAINED" : "SELF-EXTINGUISHING"}
          </dt>
          <dd className="mt-1 text-fog">
            {sustained ? (
              <>
                Burning is sustained at this setting. BRE{" "}
                <a
                  href="https://doi.org/10.60555/vb93-3y72"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-flame hover:underline"
                >
                  PSI-20
                </a>{" "}
                found quiescent microgravity flames kept burning at ≥26.5% O
                <sub>2</sub>; airflow or gravity-driven convection also feeds a
                flame.
              </>
            ) : (
              <>
                Quiescent, 0 g, and under 26.5% O<sub>2</sub>: BRE{" "}
                <a
                  href="https://doi.org/10.60555/vb93-3y72"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-flame hover:underline"
                >
                  PSI-20
                </a>{" "}
                saw such flames dim and self-extinguish — &ldquo;turn off the
                fans&rdquo; works on the ISS, but not in richer atmospheres.
              </>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
