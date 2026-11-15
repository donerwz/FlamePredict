import { learnedVisuals } from "@/lib/learnedVisuals";
import { resolveCitations } from "@/lib/pages";
import type { AgentUse } from "@/lib/schema";

const TAG: Record<AgentUse, string> = {
  suppressant: "border-flame bg-flame/20 text-icewhite",
  diluent: "border-dashed border-slate/50 text-slate",
};

/**
 * Agents × fuel forms. A solid tag means the investigation tested the gas as
 * an extinguishing agent; a dashed tag means it was only a diluent. Every tag
 * links to the investigation's DOI and carries its source phrase.
 */
export default function SuppressantMatrix() {
  const { title, blurb, caption, legend, agents, fuels, entries } =
    learnedVisuals.suppressants;

  return (
    <section className="border-t border-flame/20 pt-8">
      <div className="max-w-xl">
        <h3 className="text-lg font-semibold tracking-tight text-icewhite">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate">{blurb}</p>
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate">
        {(["suppressant", "diluent"] as const).map((use) => (
          <li key={use} className="flex items-center gap-2">
            <span
              className={`inline-block h-3 w-6 border ${TAG[use]}`}
              aria-hidden="true"
            />
            {legend[use]}
          </li>
        ))}
      </ul>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] table-fixed border-collapse text-left">
          <thead>
            <tr className="text-xs text-slate">
              <th scope="col" className="w-[9.5rem] pb-3 pr-4 font-semibold">
                Agent
              </th>
              {fuels.map((f) => (
                <th key={f.id} scope="col" className="pb-3 pr-4 font-semibold">
                  {f.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-t border-flame/20 align-top">
                <th scope="row" className="py-4 pr-4 font-normal">
                  <span className="block font-semibold text-icewhite">
                    {a.name}
                  </span>
                  <span className="font-data text-[0.7rem] tracking-[0.1em] text-flame">
                    {a.formula}
                  </span>
                </th>
                {fuels.map((f) => {
                  const cell = entries
                    .filter((en) => en.agent === a.id && en.fuel === f.id)
                    // Extinguishing-agent tests first.
                    .sort((x, y) => x.use.localeCompare(y.use) * -1);
                  return (
                    <td key={f.id} className="py-4 pr-4">
                      {cell.length === 0 ? (
                        <span className="text-slate/60">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">No investigation</span>
                        </span>
                      ) : (
                        <ul className="flex flex-wrap gap-1.5">
                          {cell.map((en) => {
                            const [c] = resolveCitations([en.acc]);
                            return (
                              <li key={en.acc}>
                                <a
                                  href={`https://doi.org/${c.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`${legend[en.use]}. Record: "${en.source}"`}
                                  aria-label={`${c.acronym}, ${c.acc}: ${legend[en.use]}. DOI ${c.doi}`}
                                  className={`inline-block border px-1.5 py-0.5 font-data text-[0.66rem] tracking-[0.08em] transition-colors duration-300 hover:border-flame hover:text-icewhite ${TAG[en.use]}`}
                                >
                                  {c.acronym} {c.acc}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-data text-[0.64rem] leading-relaxed tracking-[0.1em] text-slate/80">
        {caption}
      </p>
    </section>
  );
}
