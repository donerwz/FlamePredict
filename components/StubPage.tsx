import Link from "next/link";

interface StubPageProps {
  route: string;
  title: string;
  lede: string;
  phase: number;
}

/** Placeholder for routes whose build phase hasn't arrived yet. */
export default function StubPage({ route, title, lede, phase }: StubPageProps) {
  return (
    <main className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-[clamp(1.25rem,6vw,5.5rem)] py-20">
      <p className="readout readout--dim">{route}</p>
      <h1 className="mt-4 max-w-2xl text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-icewhite">
        {title}
      </h1>
      <p className="mt-6 max-w-xl text-[1.05rem] leading-[1.7]">{lede}</p>
      <p className="mt-10 max-w-xl border-t border-flame/20 pt-6 text-sm leading-relaxed text-slate">
        This section is under construction — it arrives in phase {phase} of the
        build.
      </p>
      <Link
        href="/"
        className="mt-8 w-fit text-sm font-semibold text-flame underline-offset-4 hover:underline"
      >
        Return to the story
      </Link>
    </main>
  );
}
