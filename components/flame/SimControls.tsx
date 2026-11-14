"use client";

import {
  FUELS,
  GRAVITY_PRESETS,
  type FuelKey,
  type SimParams,
} from "./simTypes";

interface SimControlsProps {
  params: SimParams;
  onChange: (p: SimParams) => void;
}

function Slider({
  id,
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs text-fog">
          {label}
        </label>
        <output
          htmlFor={id}
          className="font-data text-xs tabular-nums text-flame"
        >
          {value} {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(Number(ev.target.value))}
        className="mt-1 w-full accent-flame"
      />
    </div>
  );
}

export default function SimControls({ params, onChange }: SimControlsProps) {
  const partialG = params.g > 0.05 && params.g < 0.95;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="sim-g" className="text-xs text-fog">
            Gravity
          </label>
          <output
            htmlFor="sim-g"
            className="font-data text-xs tabular-nums text-flame"
          >
            {params.g.toFixed(2)} g
          </output>
        </div>
        <input
          id="sim-g"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={params.g}
          onChange={(ev) => onChange({ ...params, g: Number(ev.target.value) })}
          className="mt-1 w-full accent-ember"
        />
        <div className="mt-2 flex gap-2">
          {GRAVITY_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              aria-pressed={params.g === p.g}
              onClick={() => onChange({ ...params, g: p.g })}
              className={`border px-2.5 py-1 text-xs transition-colors duration-300 ${
                params.g === p.g
                  ? "border-ember/60 bg-ember/15 text-icewhite"
                  : "border-flame/15 text-slate hover:text-fog"
              }`}
            >
              {p.label} {p.g} g
            </button>
          ))}
        </div>
        {partialG && (
          <p className="mt-2 font-data text-[0.64rem] tracking-[0.1em] text-ember">
            NO PSI DATA AT THIS GRAVITY — BOUNDED BY 0 g AND 1 g
          </p>
        )}
      </div>

      <Slider
        id="sim-o2"
        label={
          <>
            O<sub>2</sub> concentration
          </>
        }
        min={10}
        max={85}
        step={0.5}
        value={params.o2}
        unit="%"
        onChange={(o2) => onChange({ ...params, o2 })}
      />
      <Slider
        id="sim-psi"
        label="Pressure"
        min={3}
        max={15}
        step={0.1}
        value={params.psi}
        unit="psia"
        onChange={(psi) => onChange({ ...params, psi })}
      />
      <Slider
        id="sim-flow"
        label="Airflow"
        min={0}
        max={65}
        step={1}
        value={params.flow}
        unit="cm/s"
        onChange={(flow) => onChange({ ...params, flow })}
      />

      <fieldset>
        <legend className="text-xs text-fog">Fuel / geometry</legend>
        <div className="mt-2 flex flex-col gap-1.5">
          {FUELS.map((f) => (
            <label
              key={f.key}
              className="flex cursor-pointer items-baseline gap-2 text-xs"
            >
              <input
                type="radio"
                name="sim-fuel"
                value={f.key}
                checked={params.fuel === f.key}
                onChange={() =>
                  onChange({ ...params, fuel: f.key as FuelKey })
                }
                className="accent-flame"
              />
              <span
                className={
                  params.fuel === f.key ? "text-icewhite" : "text-slate"
                }
              >
                {f.label}
              </span>
              <span className="ml-auto font-data text-[0.58rem] tracking-[0.08em] text-slate/70">
                {f.echoes}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
