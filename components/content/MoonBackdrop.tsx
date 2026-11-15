"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

// three.js only loads on the Moon page, after first paint.
const MoonScene = dynamic(() => import("./MoonScene"), { ssr: false });

/** Opacity once the reader has scrolled into the copy, so text stays legible. */
const DIMMED = 0.3;
/** If WebGL or the textures fail, show the page anyway after this long. */
const REVEAL_FALLBACK_MS = 5000;

/** Flags the page content (`.after-moon` in globals.css) to enter. */
function reveal() {
  document.documentElement.dataset.moon = "in";
}

/**
 * Fixed full-viewport Moon behind the page content. It fades in once its
 * textures are ready, then dims as the page scrolls into the body copy.
 * The page content waits for the Moon: it enters once the approach lands.
 */
export default function MoonBackdrop() {
  const reduced = useReducedMotion() ?? false;
  const [ready, setReady] = useState(false);
  const dimRef = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const fallback = window.setTimeout(reveal, REVEAL_FALLBACK_MS);
    return () => {
      window.clearTimeout(fallback);
      delete document.documentElement.dataset.moon;
    };
  }, []);

  useEffect(() => {
    const el = dimRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(window.scrollY / (window.innerHeight * 0.7), 1);
      el.style.opacity = (1 - (1 - DIMMED) * p).toFixed(3);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="moon-backdrop" aria-hidden="true">
      <div ref={dimRef} className="h-full w-full">
        <div
          className={`relative h-full w-full transition-opacity duration-700 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <MoonScene reduced={reduced} onReady={onReady} onArrive={reveal} />
          {/* Shades the terrain toward the bottom edge, where page text sits
              over it; the limb itself stays bright. Fades in with the Moon. */}
          <div className="moon-scrim" />
        </div>
      </div>
    </div>
  );
}
