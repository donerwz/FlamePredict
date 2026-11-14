import Link from "next/link";
import { pages, resolveCitations } from "@/lib/pages";
import type { PageItem, PageSection } from "@/lib/schema";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/moon", label: "Moon base" },
  { href: "/learned", label: "What we learned" },
  { href: "/next", label: "What's next" },
] as const;

interface ContentPageProps {
  route: (typeof NAV)[number]["href"];
  title: string;
  lede: string;
  sections: PageSection[];
  /** Rendered between the lede and the sections (e.g. the atmospheres table). */
  children?: React.ReactNode;
}

function Sources({ item }: { item: PageItem }) {
  const cites = resolveCitations(item.cites);
  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-data text-[0.68rem] tracking-[0.1em] text-slate">
      {item.hypothesis && (
        <span className="border border-slate/40 px-1.5 py-0.5 text-fog">
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
  children,
}: ContentPageProps) {
  return (
    <div className="mx-auto min-h-svh max-w-6xl px-[clamp(1.25rem,6vw,5.5rem)]">
      <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 py-6">
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
                      ? "text-icewhite underline decoration-flame decoration-2 underline-offset-8"
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
        <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.08] tracking-tight text-icewhite">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-[1.7] md:text-[1.12rem]">
          {lede}
        </p>

        {children}

        {sections.map((section) => (
          <section key={section.heading} className="mt-16 md:mt-20">
            <h2 className="text-2xl font-bold tracking-tight text-icewhite">
              {section.heading}
            </h2>
            {section.intro && (
              <p className="mt-2 text-sm text-slate">{section.intro}</p>
            )}
            <ul className="mt-6">
              {section.items.map((item) => (
                <li
                  key={item.title}
                  className="grid gap-x-10 gap-y-3 border-t border-flame/20 py-7 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]"
                >
                  <h3 className="text-lg font-semibold leading-snug text-icewhite">
                    {item.title}
                  </h3>
                  <div className="max-w-2xl">
                    <p className="text-[0.98rem] leading-[1.7]">{item.text}</p>
                    <Sources item={item} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="border-t border-flame/20 py-10">
        <p className="readout readout--dim">
          DATA: NASA PHYSICAL SCIENCES INFORMATICS (PSI)
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
          Each claim links to the DOI of the PSI investigation it rests on, or
          names the NASA Space Apps challenge brief. Built for the NASA Space
          Apps Challenge; not an official NASA product.
        </p>
      </footer>
    </div>
  );
}
