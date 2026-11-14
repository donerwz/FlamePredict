"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

interface ChartFrameProps {
  title: string;
  blurb: string;
  caption?: string;
  action?: React.ReactNode;
  /** Receives whether the chart has scrolled into view, to start animations. */
  children: (inView: boolean) => React.ReactNode;
}

/**
 * Shared wrapper: section heading, one-line blurb, an optional control, a
 * source/caption line, and a single in-view trigger so each chart animates
 * once on entry (and its children re-run on data changes via their own keys).
 */
export default function ChartFrame({
  title,
  blurb,
  caption,
  action,
  children,
}: ChartFrameProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="border-t border-flame/20 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h3 className="text-lg font-semibold tracking-tight text-icewhite">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate">{blurb}</p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children(inView)}</div>
      {caption && (
        <p className="mt-4 font-data text-[0.64rem] leading-relaxed tracking-[0.1em] text-slate/80">
          {caption}
        </p>
      )}
    </section>
  );
}
