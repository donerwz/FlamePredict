# FlamePredict

A Next.js dashboard for the NASA Space Apps challenge. It summarizes, ranks and interprets 24 NASA PSI microgravity combustion investigations for fire safety on spacecraft, the Moon and Mars.
Audience: researchers, professors, grad and undergrad students, aerospace engineers.

The full build plan is in `PLAN.md`. Work through it phase by phase, in order.

## Data and facts
- `data/experiments.json` is the only source of experiment facts. Never invent, guess or "fill in" experiment data. If a value is missing, show "—".
- Do not edit `experiments.json` unless asked. If you find an error in it, flag it.
- Every experiment mention shows its PSI ID (e.g. PSI-20) and links to its DOI (`https://doi.org/<doi>`). PSI requires DOI citation.
- Fields describing a hypothesis (they start with "Hypothesis:") must stay labelled as hypotheses, not results.
- Moon-base context comes from the challenge brief: ≥30% O₂ at ≤10.2 psi; spacesuit 100% O₂ at 4.3 psi; Earth 21% at 14.7 psi. PSI has no partial-gravity data yet.

## No AI in the site
- No AI/LLM features, chatbots, API routes for AI, or API keys. Claude is only used to build the site and analyse data.
- All text (summaries, ranking notes, page copy) is prewritten and stored in data files (JSON/MDX). Nothing is generated at runtime.
- The site should work as a static export (`output: 'export'`).

## Stack (locked)
Next.js (App Router) + TypeScript (strict) · Tailwind CSS · three.js via @react-three/fiber + drei · GSAP (ScrollTrigger) + Lenis · react-bits · Recharts (+ Visx/D3 scales for custom marks) · Motion · zod.
- Ask before adding any dependency not listed here.
- Validate `experiments.json` with the zod schema in `lib/schema.ts` at build time.
- Ranking math lives only in `lib/score.ts`. Default weights: F 0.40, M 0.25, P 0.25, D 0.10. Stars: ≥4.0→5, ≥3.5→4, ≥3.0→3, ≥2.4→2, else 1.

## Simulation
- The Flames in Freefall simulation is qualitative. It always shows a visible disclaimer that it is interpretive, not measured.
- Every preset (ISS, Moon, Mars, Earth) lists the PSI experiments that support it. For 0 < g < 1, show "No PSI data at this gravity".

## Animation and UX
- Animate only transform and opacity. Use 300–800 ms with ease-out. Charts animate on scroll-in and on data change, not on every re-render.
- Respect `prefers-reduced-motion`: show final states with no motion.
- Mobile-first and accessible: keyboard-navigable tabs, alt text, WCAG AA contrast, visible focus states.
- Lazy-load the 3D canvas and heavy charts. Target 60 fps.
- Credit NASA for any NASA image used.

## Workflow
- Do one phase at a time. At the end of each phase, run the type check and lint, check the phase's acceptance criteria in `PLAN.md`, then stop and summarize before starting the next phase.
- Keep components small and organized under `components/{story,tabs,experiments,charts,flame}`.
- Design fundamentals: follow the frontend-design skill (it auto-loads on UI work). Pick a deliberate visual direction, avoid generic AI defaults, and keep `design-direction.md` (set in Phase 2) as the reference for palette, type and motion across all pages.
- Use the dataviz skill for chart colours and layout. Use Better Interface / Superfuture Design Review for design passes.

## Commands
- `npm run dev`: local dev server
- `npm run build`: production build (must pass before a phase is done)
- `npm run lint` · `npx tsc --noEmit`: lint and type check
