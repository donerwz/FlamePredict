import Link from "next/link";
import EdgeBlur from "@/components/EdgeBlur";
import { pages, resolveCitations } from "@/lib/pages";
import type { PageItem, PageSection } from "@/lib/schema";
import { sectionId } from "./sectionId";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/moon", label: "Moon base" },
  { href: "/learned", label: "What we learned" },
  { href: "/next", label: "What's next" },
  { href: "/feedbacks", label: "Feedbacks" },
] as const;

interface ContentPageProps {
  route: "/explore" | "/moon" | "/learned" | "/next";
  title: string;
  lede: string;
  sections: PageSection[];
  /** Optional visual paired with each item, in section order. */
  itemVisuals?: React.ReactNode[];
  /** Rendered between the lede and the sections (e.g. the atmospheres table). */
  children?: React.ReactNode;
  /** Fixed decorative layer behind the content (e.g. the Moon scene). */
  backdrop?: React.ReactNode;
  /** Visuals shown at the end of a section, keyed by its heading. */
  sectionExtras?: Record<string, React.ReactNode>;
  /** Extra footer line, e.g. an image credit. */
  credit?: string;
  /** Hold the content back until the backdrop signals it has arrived. */
  waitForBackdrop?: boolean;
}

function Sources({ item }: { item: PageItem }) {
  const cites = resolveCitations(item.cites);
  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-data text-[0.68rem] tracking-[0.1em] text-slate">
      {item.hypothesis && (
        <span className="border border-ember/60 px-1.5 py-0.5 text-ember">
          HYPOTHESIS
        </span>
      )}
      {cites.map((c) => (
        <a
          key={c.acc}
          href={`https://doi.org/${c.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-flame hover:underline"
          aria-label={`${c.acronym}, ${c.acc}, DOI ${c.doi}`}
        >
          {c.acronym} {c.acc}
        </a>
      ))}
      {item.brief &&
        (pages.briefUrl ? (
          <a
            href={pages.briefUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame hover:underline"
          >
            NASA SPACE APPS CHALLENGE BRIEF
          </a>
        ) : (
          <span>NASA SPACE APPS CHALLENGE BRIEF</span>
        ))}
    </p>
  );
}

/** Shell for the prewritten content pages; all copy comes from data/pages.json. */
export default function ContentPage({
  route,
  title,
  lede,
  sections,
  itemVisuals,
  children,
  backdrop,
  sectionExtras,
  credit,
  waitForBackdrop = false,
}: ContentPageProps) {
  // Staggered entrance order; `plain` skips the blur on large blocks.
  const enter = (i: number, plain = false) =>
    waitForBackdrop
      ? {
          className: plain ? "after-moon after-moon--plain" : "after-moon",
          style: { "--i": i } as React.CSSProperties,
        }
      : { className: "", style: undefined };
  const e = [enter(0), enter(1), enter(2), enter(3, true), enter(4, true)];
  let itemVisualIndex = 0;

  return (
    <div className="mx-auto min-h-svh w-full px-[clamp(1rem,3vw,3rem)]">
      {backdrop}
      <EdgeBlur />
      <header
        className={`relative z-20 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-6 ${e[0].className}`}
        style={e[0].style}
      >
        <Link href="/" className="text-lg font-bold tracking-tight text-icewhite">
          FlamePredict
        </Link>
        <nav aria-label="Sections">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={n.href === route ? "page" : undefined}
                  className={
                    n.href === route
                      ? "text-icewhite underline decoration-ember decoration-2 underline-offset-8"
                      : "text-slate transition-colors duration-300 hover:text-fog"
                  }
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="pb-24 pt-12 md:pt-20">
        <h1
          className={`max-w-3xl text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.08] tracking-tight text-icewhite ${e[1].className}`}
          style={e[1].style}
        >
          {title}
        </h1>
        <p
          className={`mt-6 max-w-2xl text-[1.05rem] leading-[1.7] md:text-[1.12rem] ${e[2].className}`}
          style={e[2].style}
        >
          {lede}
        </p>

        <div className={e[3].className} style={e[3].style}>
        {children}

        {sections.map((section) => (
          <section
            key={section.heading}
            id={sectionId(section.heading)}
            className="mt-16 scroll-mt-24 md:mt-20"
          >
            <h2 className="text-2xl font-bold tracking-tight text-icewhite">
              {section.heading}
            </h2>
            {section.intro && (
              <p className="mt-2 text-sm text-slate">{section.intro}</p>
            )}
            <ul className="mt-6">
              {section.items.map((item) => {
                const visual = itemVisuals?.[itemVisualIndex++];
                return (
                  <li
                    key={item.title}
                    className={`grid gap-x-10 gap-y-3 border-t border-flame/20 py-7 ${
                      visual
                        ? "md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:items-center"
                        : "md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]"
                    }`}
                  >
                    {visual ? (
                      <>
                        <div className="flex min-h-28 items-center md:justify-center">
                          {visual}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-snug text-icewhite">
                            {item.title}
                          </h3>
                          <div className="mt-3 max-w-3xl">
                            <p className="text-[0.98rem] leading-[1.7]">
                              {item.text}
                            </p>
                            <Sources item={item} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold leading-snug text-icewhite">
                          {item.title}
                        </h3>
                        <div className="max-w-2xl">
                          <p className="text-[0.98rem] leading-[1.7]">
                            {item.text}
                          </p>
                          <Sources item={item} />
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {sectionExtras?.[section.heading] && (
              <div className="mt-4 space-y-12">
                {sectionExtras[section.heading]}
              </div>
            )}
          </section>
        ))}
        </div>
      </main>

      <footer
        className={`border-t border-flame/20 pb-24 pt-10 ${e[4].className}`}
        style={e[4].style}
      >
        <p className="readout readout--dim">
          DATA: NASA PHYSICAL SCIENCES INFORMATICS (PSI)
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
          Each claim links to the DOI of the PSI investigation it rests on, or
          names the NASA Space Apps challenge brief. Built for the NASA Space
          Apps Challenge.
        </p>
        {credit && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
            {credit}
          </p>
        )}
        <Link href="/feedbacks" className="mt-5 inline-block text-sm font-semibold text-flame hover:underline">
          View feedbacks →
        </Link>
      </footer>
    </div>
  );
}
