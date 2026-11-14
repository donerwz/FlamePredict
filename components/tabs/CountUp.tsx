"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { MOTION_BLUR_PX } from "@/lib/motion";

interface CountUpProps {
  value: number;
  decimals?: number;
  className?: string;
}

/**
 * Number that counts up from 0 when it enters the viewport, once.
 * SSR and reduced motion render the final value; clients that will animate
 * zero it out imperatively (textContent, no re-renders) until it scrolls in.
 */
export default function CountUp({ value, decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!inView) {
      el.textContent = (0).toFixed(decimals);
      return;
    }
    // Motion blur tied to speed: the eased progress is fastest at the start,
    // so the digits start blurred and sharpen as the count settles.
    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals);
        const progress = value ? v / value : 1;
        el.style.filter = `blur(${(MOTION_BLUR_PX * (1 - progress)).toFixed(2)}px)`;
      },
      onComplete: () => {
        el.style.filter = "none";
      },
    });
    return () => {
      controls.stop();
      el.style.filter = "none";
    };
  }, [inView, reduced, value, decimals]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
