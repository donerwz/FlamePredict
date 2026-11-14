"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Flame from "./Flame";
import Starfield from "./Starfield";

interface LandingProps {
  count: number;
  totalTb: number;
  flight: number;
  ground: number;
}

export default function Landing({ count, totalTb, flight, ground }: LandingProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const destinations = [
    {
      href: "/explore",
      title: "Explore the experiments",
      desc: `All ${count} investigations ranked for Moon-base relevance — browse, re-weight the ranking, compare.`,
    },
    {
      href: "/moon",
      title: "Flames on a Moon base",
      desc: "What richer oxygen at lower pressure means for fire risk, and what the data already shows.",
    },
    {
      href: "/learned",
      title: "What we learned",
      desc: "The synthesis: preventing, detecting and suppressing fires in space.",
    },
    {
      href: "/next",
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
      const starSpeeds: Record<string, number> = {
        ".js-stars-far": -6,
        ".js-stars-mid": -12,
        ".js-stars-near": -20,
      };
      for (const [sel, yPercent] of Object.entries(starSpeeds)) {
        gsap.to(sel, {
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

      const gValue = root.querySelector<HTMLElement>(".js-gvalue");
      const gState = { g: 1 };

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

      tl.to(".js-beat1", { autoAlpha: 0, y: -28, duration: 0.8, ease: "power1.in" }, 2.2)
        .to(".js-tear", { autoAlpha: 0, duration: 1.2 }, 2.6)
        .fromTo(
          ".js-sphere",
          { autoAlpha: 0, scale: 0.72 },
          { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power1.out" },
          2.8,
        )
        .to(
          gState,
          {
            g: 0,
            duration: 1.8,
            onUpdate: () => {
              if (gValue) gValue.textContent = `${gState.g.toFixed(2)} g`;
            },
          },
          2.6,
        )
        .to(".js-gfill", { scaleY: 0, duration: 1.8 }, 2.6)
        .fromTo(
          ".js-beat2",
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "power1.out" },
          3.0,
        )
        .to(".js-beat2", { autoAlpha: 0, y: -28, duration: 0.8, ease: "power1.in" }, 6.2)
        .fromTo(
          ".js-beat3",
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "power1.out" },
          7.0,
        )
        .fromTo(
          ".js-stat",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power1.out" },
          7.6,
        )
        .to({}, { duration: 1.2 }); // hold beat 3 before unpinning
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete root.dataset.motion;
    };
  }, []);

  return (
    <div ref={rootRef}>
      <Starfield />
      <a
        href="#destinations"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-void focus:px-3 focus:py-2 focus:text-flame"
      >
        Skip the story
      </a>

      <header className="absolute inset-x-0 top-0 z-10 flex items-baseline justify-between px-[clamp(1.25rem,6vw,5.5rem)] py-6">
        <p className="text-lg font-bold tracking-tight text-icewhite">
          FlamePredict
        </p>
        <p className="readout readout--dim">NASA PSI / {totalTb} TB</p>
      </header>

      <main>
        {/* -------- Scroll story -------- */}
        <section
          className="story-stage"
          aria-label="How flames change in microgravity"
        >
          <Flame />

          <div className="gmeter" aria-hidden="true">
            <span>LOCAL G</span>
            <span className="gmeter-track">
              <span className="gmeter-fill js-gfill" />
            </span>
            <span className="js-gvalue">1.00 g</span>
          </div>

          <div className="beat js-beat1">
            <h1 className="text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.08] tracking-tight text-icewhite">
              Understanding flames in microgravity is essential for space
              exploration.
            </h1>
            <p className="mt-6 text-[1.02rem] leading-[1.7] md:text-[1.1rem]">
              Fire has shadowed every era of spaceflight — Apollo 1, Apollo 13,
              the fire aboard Mir, the smoke alarm that sounded on Artemis II.
              Before people live and work on the Moon, we need to know exactly
              how fire behaves when gravity lets go.
            </p>
          </div>

          <div className="beat js-beat2">
            <h2 className="text-[clamp(1.7rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-tight text-icewhite">
              In orbit, a flame has no up.
            </h2>
            <p className="mt-6 text-[1.02rem] leading-[1.7] md:text-[1.1rem]">
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
            <h2 className="text-[clamp(1.7rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-tight text-icewhite">
              So NASA set fires in freefall.
            </h2>
            <p className="mt-6 text-[1.02rem] leading-[1.7] md:text-[1.1rem]">
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
          className="mx-auto max-w-6xl px-[clamp(1.25rem,6vw,5.5rem)] pb-16 pt-24 md:pt-32"
        >
          <h2 className="mb-2 text-sm font-semibold text-slate">
            Four ways into the data
          </h2>
          <ul>
            {destinations.map((d) => (
              <li key={d.href} className="border-t border-flame/20">
                <Link
                  href={d.href}
                  className="group flex flex-col gap-2 py-7 transition-colors duration-300 ease-out hover:bg-flame/5 md:flex-row md:items-baseline md:gap-8"
                >
                  <span className="readout readout--dim shrink-0 transition-colors duration-300 group-hover:text-flame md:w-28">
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

      <footer className="mx-auto max-w-6xl border-t border-flame/20 px-[clamp(1.25rem,6vw,5.5rem)] py-10">
        <p className="readout readout--dim">
          DATA: NASA PHYSICAL SCIENCES INFORMATICS (PSI)
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
          Every experiment fact on this site comes from the PSI dataset and
          cites its DOI. The flame illustration is interpretive, not measured.
          Built for the NASA Space Apps Challenge; not an official NASA
          product.
        </p>
      </footer>
    </div>
  );
}
