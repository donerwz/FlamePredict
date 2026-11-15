import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import MoonBackdrop from "@/components/content/MoonBackdrop";
import Starfield from "@/components/story/Starfield";
import { pages } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Flames on a Moon base — FlamePredict",
  description:
    "How exploration atmospheres — more oxygen at lower pressure — change fire behaviour, and which PSI experiments bound the risk.",
};

export default function MoonPage() {
  const { title, lede, sections, atmospheres } = pages.moon;
  const briefLabel = "NASA SPACE APPS CHALLENGE BRIEF";

  return (
    <ContentPage
      route="/moon"
      title={title}
      lede={lede}
      sections={sections}
      backdrop={
        <>
          <Starfield />
          <MoonBackdrop />
        </>
      }
      waitForBackdrop
      credit="Moon textures: NASA/Goddard Scientific Visualization Studio, from Lunar Reconnaissance Orbiter camera (LROC) colour and laser altimeter (LOLA) elevation maps."
    >
      <section aria-labelledby="atmospheres-heading" className="mt-14">
        <h2
          id="atmospheres-heading"
          className="text-2xl font-bold tracking-tight text-icewhite"
        >
          Four atmospheres
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="text-xs text-slate">
                <th scope="col" className="pb-3 pr-6 font-semibold">
                  Where
                </th>
                <th scope="col" className="pb-3 pr-6 font-semibold">
                  Oxygen
                </th>
                <th scope="col" className="pb-3 pr-6 font-semibold">
                  Pressure
                </th>
                <th scope="col" className="pb-3 font-semibold">
                  What it means
                </th>
              </tr>
            </thead>
            <tbody>
              {atmospheres.map((a) => (
                <tr key={a.name} className="border-t border-flame/20 align-baseline">
                  <th
                    scope="row"
                    className="py-4 pr-6 font-semibold text-icewhite"
                  >
                    {a.name}
                  </th>
                  <td className="py-4 pr-6 font-data text-sm tabular-nums text-flame">
                    {a.o2}
                  </td>
                  <td className="py-4 pr-6 font-data text-sm tabular-nums text-flame">
                    {a.pressure}
                  </td>
                  <td className="py-4 text-sm leading-relaxed text-slate">
                    {a.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-data text-[0.68rem] tracking-[0.1em] text-slate">
          SOURCE:{" "}
          {pages.briefUrl ? (
            <a
              href={pages.briefUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame hover:underline"
            >
              {briefLabel}
            </a>
          ) : (
            briefLabel
          )}
        </p>
      </section>
    </ContentPage>
  );
}
