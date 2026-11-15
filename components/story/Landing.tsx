"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Flame from "./Flame";
import EdgeBlur from "@/components/EdgeBlur";
import { BLUR_DISSOLVE, BLUR_SHARP, BLUR_SOFT } from "@/lib/motion";

interface LandingProps {
  count: number;
  totalTb: number;
  flight: number;
  ground: number;
}

export default function Landing({ count, totalTb, flight, ground }: LandingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const leavingRef = useRef(false);
  const router = useRouter();

  /**
   * Leaving for the Moon page: the page content blur-settles away (exit
   * mirror of the entrance), the starfield glides back to rest so it lines
   * up with the Moon page's static stars, then the route changes and the
   * Moon rises. Modified clicks and reduced motion navigate normally.
   */
  const leaveTo = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const root = rootRef.current;
    if (
      !root ||
      leavingRef.current ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    e.preventDefault();
    leavingRef.current = true;
    lenisRef.current?.stop();
    root.style.pointerEvents = "none";

    const go = () => router.push(href);
    const tl = gsap.timeline({ onComplete: go });
    tl.to(
      root.querySelectorAll(
        ".js-exit-header, #destinations > h2, #destinations li, .js-exit-footer",
      ),
      {
        autoAlpha: 0,
        y: -24,
        filter: BLUR_SOFT,
        duration: 0.6,
        ease: "power1.in",
        stagger: 0.05,
      },
      0,
    ).to(
      document.querySelectorAll(".starfield-layer"),
      { yPercent: 0, duration: 0.9, ease: "power2.inOut", overwrite: true },
      0,
    );
  };

  const destinations = [
    {
      href: "/explore",
      image: "/textures/destination-explore.webp",
      title: "Explore the experiments",
      desc: `All ${count} investigations ranked for Moon-base relevance — browse, re-weight the ranking, compare.`,
    },
    {
      href: "/moon",
      image: "/textures/destination-moon.webp",
      title: "Flames on a Moon base",
      desc: "What richer oxygen at lower pressure means for fire risk, and what the data already shows.",
    },
    {
      href: "/learned",
      image: "/textures/destination-flame.webp",
      title: "What we learned",
      desc: "The synthesis: preventing, detecting and suppressing fires in space.",
    },
    {
      href: "/next",
      image: "/textures/destination-next.webp",
      title: "What we need to do next",
      desc: "The open gaps: partial gravity, real materials at high oxygen, dust versus smoke.",
    },
  ];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Reduced motion (or no JS): the CSS-default stacked layout stands as-is.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ autoRaf: false });
    lenisRef.current = lenis;
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    root.dataset.motion = "on";

    const ctx = gsap.context(() => {
      // Initial states: 1g world. Teardrop burning, sphere unlit, beat 1 only.
      gsap.set(".js-tear", { autoAlpha: 1 });
      gsap.set(".js-sphere", { autoAlpha: 0 });
      gsap.set([".js-beat2", ".js-beat3"], { autoAlpha: 0 });

      // Starfield parallax: deeper layers drift slower, over the full page.
      // The starfield lives in the root layout (outside this context's
      // scope), so look its layers up on the document. ctx.revert() puts
      // them back at rest when the reader leaves the homepage.
      const starSpeeds: Record<string, number> = {
        ".js-stars-far": -6,
        ".js-stars-mid": -12,
        ".js-stars-near": -20,
      };
      for (const [sel, yPercent] of Object.entries(starSpeeds)) {
        gsap.to(document.querySelector(sel), {
          yPercent,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "max",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      }

      // Earth flames flicker (buoyant instability); it dies with the teardrop.
      gsap.to(".js-flicker", {
        scaleY: 1.045,
        scaleX: 0.965,
        duration: 0.09,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // One scrubbed timeline, position-mapped (units 0–10 across the pin).
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".story-stage",
          start: "top top",
          end: "+=260%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Motion blur (lib/motion.ts): beats soften as they leave and resolve
      // to sharp as they land; the teardrop dissolves like dispersing smoke
      // while the sphere comes into focus.
      tl.to(
        ".js-beat1",
        { autoAlpha: 0, y: -28, filter: BLUR_SOFT, duration: 0.8, ease: "power1.in" },
        2.2,
      )
        .to(".js-tear", { autoAlpha: 0, filter: BLUR_DISSOLVE, duration: 1.2 }, 2.6)
        .fromTo(
          ".js-sphere",
          { autoAlpha: 0, scale: 0.72, filter: BLUR_DISSOLVE },
          { autoAlpha: 1, scale: 1, filter: BLUR_SHARP, duration: 1.4, ease: "power1.out" },
          2.8,
        )
        .fromTo(
          ".js-beat2",
          { autoAlpha: 0, y: 36, filter: BLUR_SOFT },
          { autoAlpha: 1, y: 0, filter: BLUR_SHARP, duration: 0.9, ease: "power1.out" },
          3.0,
        )
        .to(
          ".js-beat2",
          { autoAlpha: 0, y: -28, filter: BLUR_SOFT, duration: 0.8, ease: "power1.in" },
          6.2,
        )
        .fromTo(
          ".js-beat3",
          { autoAlpha: 0, y: 36, filter: BLUR_SOFT },
          { autoAlpha: 1, y: 0, filter: BLUR_SHARP, duration: 0.9, ease: "power1.out" },
          7.0,
        )
        .fromTo(
          ".js-stat",
          { autoAlpha: 0, y: 10, filter: BLUR_SOFT },
          {
            autoAlpha: 1,
            y: 0,
            filter: BLUR_SHARP,
            duration: 0.5,
            stagger: 0.15,
            ease: "power1.out",
          },
          7.6,
        )
        .to({}, { duration: 1.2 }); // hold beat 3 before unpinning
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      delete root.dataset.motion;
    };
  }, []);

  return (
    <div ref={rootRef}>
      <EdgeBlur />
      <a
        href="#destinations"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-void focus:px-3 focus:py-2 focus:text-flame"
      >
        Skip the story
      </a>

      <header className="js-exit-header absolute inset-x-0 top-0 z-20 flex flex-col gap-1 px-[clamp(1.25rem,6vw,5.5rem)] py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <p className="text-lg font-bold tracking-tight text-icewhite">
          FlamePredict
        </p>
        <p className="readout readout--dim">NASA SPACE APPS 2026 / CREATED BY WENTAO AND GORDON</p>
      </header>

      <main>
        {/* -------- Scroll story -------- */}
        <section
          className="story-stage"
          aria-label="How flames change in microgravity"
        >
          <Flame />

          <div className="beat js-beat1">
            <h1 className="text-[clamp(2.6rem,min(6.4vw,9.5svh),5.75rem)] font-bold leading-[1.02] tracking-tight text-icewhite">
              Understanding flames in microgravity is essential for space
              exploration.
            </h1>
            <p className="mt-6 max-w-[34rem] text-[1.02rem] leading-[1.7] md:text-[1.1rem]">
              Fire has shadowed every era of spaceflight — Apollo 1, Apollo 13,
              the fire aboard Mir, the smoke alarm that sounded on Artemis II.
              Before people live and work on the Moon, we need to know exactly
              how fire behaves when gravity lets go.
            </p>
          </div>

          <div className="beat js-beat2">
            <h2 className="text-[clamp(2.2rem,min(5.2vw,8svh),4.6rem)] font-bold leading-[1.04] tracking-tight text-icewhite">
              In orbit, a flame has no up.
            </h2>
            <p className="mt-6 max-w-[34rem] text-[1.02rem] leading-[1.7] md:text-[1.1rem]">
              On Earth, buoyancy does the work: hot gas rises, fresh air sweeps
              in below, and the flame stretches into a teardrop. Remove gravity
              and nothing rises — oxygen reaches the flame only by slow
              molecular diffusion. The teardrop closes into a sphere: dimmer,
              cooler, often burning blue, and almost perfectly still.
            </p>
            <p className="readout mt-6">
              <span>BUOYANCY 0</span>
              <span>O2 BY DIFFUSION</span>
              <span>FLICKER NONE</span>
            </p>
          </div>

          <div className="beat js-beat3">
            <h2 className="text-[clamp(2.2rem,min(5.2vw,8svh),4.6rem)] font-bold leading-[1.04] tracking-tight text-icewhite">
              So NASA set fires in freefall.
            </h2>
            <p className="mt-6 max-w-[34rem] text-[1.02rem] leading-[1.7] md:text-[1.1rem]">
              For more than two decades, researchers burned droplets, fabrics
              and gases aboard the ISS and uncrewed Cygnus vehicles, publishing
              the results through the Physical Sciences Informatics repository.
              FlamePredict ranks and interprets those investigations for what
              comes next: Moon-base atmospheres richer in oxygen than any
              spacecraft cabin so far — where some flames keep burning that
              would go out on the ISS.
            </p>
            <p className="readout mt-8">
              <span className="js-stat">{count} INVESTIGATIONS</span>
              <span className="js-stat">{totalTb} TB</span>
              <span className="js-stat">
                {flight} FLIGHT / {ground} GROUND
              </span>
            </p>
          </div>
        </section>

        {/* -------- Destinations -------- */}
        <section
          id="destinations"
          className="mx-auto w-full px-[clamp(1rem,3vw,3rem)] pb-16 pt-24 md:pt-32"
        >
          <h2 className="mb-2 text-sm font-semibold text-slate">
            Four ways into the data
          </h2>
          <ul>
            {destinations.map((d) => (
              <li key={d.href} className="border-t border-flame/20">
                <Link
                  href={d.href}
                  onClick={d.href === "/moon" ? leaveTo(d.href) : undefined}
                  style={{
                    "--destination-image": `url('${d.image}')`,
                    "--destination-image-position": d.href === "/learned" ? "center 24%" : "center",
                  } as CSSProperties}
                  className="destination-link group flex flex-col gap-2 py-7 transition-colors duration-300 ease-out md:flex-row md:items-baseline md:gap-8"
                >
                  <span className="readout readout--dim shrink-0 transition-colors duration-300 group-hover:text-ember md:w-28">
                    {d.href}
                  </span>
                  <span>
                    <span className="block text-xl font-semibold text-icewhite md:text-2xl">
                      {d.title}
                    </span>
                    <span className="mt-1 block max-w-xl text-[0.95rem] leading-relaxed text-slate">
                      {d.desc}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="js-exit-footer mx-auto w-full border-t border-flame/20 px-[clamp(1rem,3vw,3rem)] pb-24 pt-10">
        <p className="readout readout--dim">
          DATA: NASA PHYSICAL SCIENCES INFORMATICS (PSI)
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
          Every experiment fact on this site comes from the PSI dataset and
          cites its DOI. The flame illustration is interpretive, not measured.
          Built for the NASA Space Apps Challenge.
        </p>
      </footer>
    </div>
  );
}
