import { experimentsByRank, experimentsFile } from "@/lib/experiments";

// Phase 1 placeholder. This exists to prove the scaffold runs and that
// experiments.json loads through the zod schema at build time. Phase 2 replaces
// it with the landing scroll story (and sets the site's visual direction).

const STAR = "★";

export default function Home() {
  const { count, total_size_tb, source, retrieved } = experimentsFile;
  const flight = experimentsByRank.filter((e) => e.type === "Flight").length;
  const ground = count - flight;
  const topFive = experimentsByRank.slice(0, 5);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16 font-sans">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          FlamePredict · Phase 1 scaffold
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {count} NASA PSI microgravity combustion investigations
        </h1>
        <p className="font-data text-sm tracking-wide text-zinc-500">
          Data source: {source} · {total_size_tb} TB · {flight} flight /{" "}
          {ground} ground · validated through zod at build time.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
          Top 5 by rank
        </h2>
        <ol className="flex flex-col divide-y divide-zinc-200/60 dark:divide-zinc-800">
          {topFive.map((e) => (
            <li
              key={e.acc}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <span className="flex items-baseline gap-3">
                <span className="w-6 text-right font-data text-sm tabular-nums text-zinc-400">
                  {e.rank}
                </span>
                <span>
                  <span className="font-medium">{e.acronym}</span>{" "}
                  <span className="font-data text-sm text-zinc-500">
                    ({e.acc})
                  </span>
                </span>
              </span>
              <span className="flex items-baseline gap-3 text-sm">
                <span className="text-amber-500" aria-label={`${e.stars} stars`}>
                  {STAR.repeat(e.stars)}
                </span>
                <span className="font-data tabular-nums text-zinc-400">
                  {e.score.toFixed(2)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="text-xs text-zinc-400">
        Retrieved {retrieved}. Experiment facts come only from
        data/experiments.json. Every investigation cites its PSI ID and DOI.
      </footer>
    </main>
  );
}
