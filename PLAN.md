# FlamePredict: Claude Code Build Plan

A dashboard that summarizes, ranks and interprets NASA PSI microgravity combustion investigations for fire safety on spacecraft, the Moon and Mars.

**Where the SI comes in:** Claude (SI) is used only to analyse the PSI data and to build the site with Claude Code. **The website itself has no AI features.** Every summary, ranking and explanation is written ahead of time and stored in the data files, then served as static content.

**Audience:** researchers, professors, graduate and undergraduate students, aerospace engineers.
**Data:** `experiments.json` holds the 24 PSI Combustion Science investigations (12.35 TB of source data), ranked. It is the single source of truth and mirrors the Notion database "PSI Combustion Experiments (ranked)".

---

## 0. How to use this plan with Claude Code

1. Create an empty folder, put `experiments.json` and this file in it, then open Claude Code there.
2. Paste the starter prompt (section 9). Claude Code works phase by phase. After each phase, check the acceptance criteria before moving on.
3. Keep this file in the repo as `PLAN.md`. Add a short `CLAUDE.md` with the rules in section 8 so every session follows them.

### Which Claude model to use

Default to **Opus 5.5** (Claude Code's default; half the price of Fable). Switch to **Fable 5.2** for design-heavy work, where it narrowly won third-party design tests. Switch models anytime with `/model` in Claude Code.

| Phase | Model | Why |
|---|---|---|
| 1. Scaffold | Opus 5.5 | Routine setup |
| 2. Landing scroll story | **Fable 5.2** | First impression; Fable had tighter visual execution in design tests |
| 3. Explore hub + Data overview | Opus 5.5 | Data plumbing and charts |
| 4. Experiments tab | Opus 5.5 | Filters, re-ranking logic, layout animations |
| 5. Visualization tab | Opus 5.5 | Chart logic and animation performance |
| 6. Flame simulation | Opus 5.5 | Frame rate matters: Opus held 31–41 FPS vs Fable's 1–4 FPS in a third-party 3D simulation test. If the flame looks plain, have Fable restyle the shader, then re-check 60 fps |
| 7. Moon / Learned / Next pages | Opus 5.5 | Content layout from prewritten data |
| 8. QA + final design review | Opus 5.5 for QA, **Fable 5.2** for the design review pass | Fable for visual polish, Opus for fixes |

If time allows, run the Phase 2 prompt on both models and keep the better result. These comparisons come from small third-party tests (Nov 2026), not Anthropic benchmarks.

---

## 1. Tech stack (decided)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + React + TypeScript | React ecosystem for 3D and scroll animation (your sketch chose Next/React). No server routes needed, so it can ship as a static export (`output: 'export'`) |
| Styling | Tailwind CSS | Fast, consistent |
| 3D flame | three.js via react-three-fiber + drei | Your design resources list |
| Scroll story | GSAP (ScrollTrigger) + Lenis smooth scroll | Text appears as the user scrolls (your sketch) |
| UI pieces | react-bits (animated text/cards) | Your design resources list |
| Charts | Recharts (built-in draw-in animations) + Visx/D3 scales for custom marks | O₂-vs-pressure map, airflow ranges, matrices |
| Chart animation | Motion (`motion`, formerly Framer Motion) + GSAP ScrollTrigger | Animated transitions when data changes, staggered entrances, count-ups; charts animate as they scroll into view |
| Data validation | zod | Validate `experiments.json` at build time |
| Deploy | Vercel | Free tier, Next.js native |

Claude Code design skills:
- **frontend-design** (Anthropic, official): design fundamentals. Before writing UI it makes Claude pick a purpose, tone and a clear visual direction instead of generic AI defaults (typography, colour, motion, composition). It loads automatically on any UI work, with no slash command. Install once in Claude Code: `/plugin install frontend-design@claude-plugins-official` (if that fails: `/plugin marketplace add anthropics/claude-code` then `/plugin install frontend-design@claude-code-plugins`). It improves taste, not correctness, so the acceptance checks still matter.
- **Better Interface** and **Superfuture Design Review**: for design passes and reviews.

---

## 2. Information architecture (from your PDF sketch)

### A. Landing: scroll story
Text reveals as the user scrolls:
1. "Understanding flames in microgravity is essential for space exploration." + image of a microgravity flame (use a NASA image with credit).
2. "The lack of gravity on space stations means no buoyancy-driven convection…" Explain: hot air doesn't rise and cold air doesn't sink, so the flame is fed by slow molecular diffusion. A teardrop flame becomes a sphere.
3. "But scientists persist… over the years, experiments have been conducted to study flame in freefall."
4. Four CTA cards: **Explore the experiments** · **Learn how flames will behave on a Moon base** · **What we learned** · **What we need to do next**

Optional hook: Apollo 1, Apollo 13, the Mir fire, and the Artemis II smoke alarm (from the challenge brief).

### B. Explore the experiments: tab bar pinned on top
- **Data overview** (default tab)
- **Experiments**
- **Visualization**
- **Flames in Freefall simulation**

Header strip: `Data source: NASA PSI · 12.35 TB · 24 investigations (19 flight, 5 ground)`.

### C. Moon base page
- Atmospheres: Earth 21% O₂ @ 14.7 psi · ISS ≈ Earth · spacesuit 100% O₂ @ 4.3 psi · **Moon Base / rovers ≥30% O₂ @ ≤10.2 psi** (>40% more O₂ than Earth).
- What PSI says: BRE (26.5% @ 10.2 psia and 34% @ 8.2 psia, still air: flames kept burning, while at 21% they self-extinguished). FLEX-2 went up to 40% O₂. CFI-G went up to 85% O₂ from the burner.
- Partial gravity: no PSI data yet (LUCI and FM2 are expected). E-FIELD mimics a body force. 0 g and 1 g results bound 0.16 g and 0.38 g.

### D. What we learned
Synthesis cards grouped by **Prevention / Detection / Suppression**, each citing its PSI investigations (DOI links).

### E. What we need to do next
Data gaps: partial-g combustion, elevated O₂ on real solids, smoke-vs-lunar-dust discrimination (DAFT link), cool-flame re-ignition hazard.

---

## 3. Data layer

- `data/experiments.json`. Fields per experiment: `rank, stars, score, F, M, P, D, acc, acronym, name, type, platform, hardware, role[], sub, size, doi, dates, pis, goal, flame_3d, oxygen, flow, pressure, fuel, variables, sensors, findings, moon, related, url`.
- `lib/schema.ts`: zod schema plus TypeScript types.
- `lib/score.ts`: `score = wF*F + wM*M + wP*P + wD*D` (default 0.40 / 0.25 / 0.25 / 0.10). Stars: ≥4.0 → 5, ≥3.5 → 4, ≥3.0 → 3, ≥2.4 → 2, else 1. Exposed to the UI so users can re-weight.
- `data/conditions.json` (Phase 5). Numeric extraction for charts, hand-entered from the JSON text:
  - O₂ min/max (%), pressure min/max (psia), flow min/max (cm/s), gravity tag
  - Known values: BRE 21/26.5/34% at 14.7/10.2/8.2 psia, flow 0 · FLEX-2 10–40%, 0.5–3 atm · CFI-G ≤85% · BASS/BASS-II ≤40 cm/s, ≤21% · Saffire 20/30 cm/s · SPICE 5.4–65 cm/s · CFI 0.25–5 atm
- Thumbnails: PSI serves images at `https://psi.nasa.gov/geode-py/ws/investigations/<PSI-ID>/image`. Cache them locally at build time and credit NASA.
- (Optional) Refresh script: PSI's web app calls `https://psi.nasa.gov/geode-py/ws/repo/search?term=combustion&source=psi&type=investigation`. This is an internal endpoint, not a documented public API, so treat it as unstable and keep the JSON checked in.
- Citation rule: PSI requires citing each investigation's DOI, so show the DOI on every card and detail view.
- **All text is prewritten.** Summaries, rankings, "why this rank" notes and the What we learned / What's next copy are written beforehand (analysed with Claude, checked against PSI) and stored in the JSON or MDX files. Nothing is generated at runtime. If you want versions for different audiences (undergrad / grad / engineer), add them as extra prewritten fields.

---

## 4. Build phases and acceptance criteria

### Phase 1: Scaffold
`npx create-next-app@latest flamepredict --ts --tailwind --app`, then add `three @react-three/fiber @react-three/drei gsap lenis recharts zod motion`.
✅ Dev server runs, `experiments.json` loads through zod with no errors, and the type check passes.

### Phase 2: Landing scroll story
GSAP ScrollTrigger reveals each block, with Lenis smoothing. Four CTA cards link to their routes.
Before coding, have the frontend-design skill set the visual direction (palette, type pairing, motion style) for the whole site and save it to `design-direction.md`, so later phases stay consistent.
✅ Works on mobile, honors `prefers-reduced-motion`, scores Lighthouse ≥90 for accessibility.

### Phase 3: Explore hub + Data overview tab
Tab bar pinned at the top, with Data overview as the default. Data overview shows stat tiles (12.35 TB, 24 investigations, 19 flight / 5 ground, 4 hardware families), a role breakdown (Prevention / Detection / Suppression / Fundamental / Modelling), and a top-5 strip.
Animation: stat numbers count up from 0 when they enter the viewport, the role bars grow in with a stagger, and top-5 cards slide in.
✅ Tabs are deep-linkable (`/explore?tab=experiments`).

### Phase 4: Experiments tab
- Ranked list: ★ stars · title · PIs · place conducted (ISS / Cygnus / ground) → goal → what was learned
- Expand panel with the 5 required fields: **goal, 3D flame model, O₂ / airflow / pressure / fuel, variables, sensors**
- Filters: role, hardware group, flight/ground, Moon relevance. Search box.
- **Re-weight sliders** (F/M/P/D) that re-rank live. Cards glide to their new positions (Motion `layout` animation) and the stars and score tick to their new values. Show "why this rank" from the score breakdown as a small animated stacked bar.
- **Compare** mode: pick 2–3 experiments for a side-by-side table.
✅ All 24 render, the default order matches the Notion ranking, and changing weights reorders the list.

### Phase 5: Visualization tab
1. **O₂ vs pressure map** (scatter + ranges) with shaded zones for Earth, spacesuit and Moon Base (≥30%, ≤10.2 psi). Each experiment's tested envelope is a box or point. This is the money chart.
2. **Airflow coverage** (range bars, cm/s): quiescent tests vs BASS/Saffire/SPICE.
3. **Role × hardware matrix** (heatmap): which hardware family answered which safety question.
4. **Data volume** treemap (GB per investigation).
5. **Timeline** of investigation dates.

**Animations (all start when the chart scrolls into view, via GSAP ScrollTrigger or `whileInView`):**
- O₂ vs pressure map: Earth, spacesuit and Moon Base zones fade in first, then experiment points drop in grouped by hardware family. Changing a filter animates points in and out instead of jumping. A "Moon Base" button zooms the axes to the ≥30% O₂, ≤10.2 psi region.
- Airflow coverage: range bars grow from 0 cm/s to their real range, staggered by experiment.
- Role × hardware matrix: cells fade and scale in row by row. Hovering a cell highlights the matching experiments.
- Data volume treemap: tiles expand from the centre, and the total counts up to 12.35 TB.
- Timeline: the axis line draws left to right and each investigation pops in at its start date.
- Keep it 300–800 ms, ease-out, and animate only transform and opacity for smoothness.

✅ Every mark links to its experiment, and tooltips cite PSI IDs. Animations run once on entry and on data changes (not on every re-render), hold 60 fps, and switch off with `prefers-reduced-motion` (charts appear in their final state). Use the `dataviz` skill for colours and accessibility.

### Phase 6: Flames in Freefall simulation (react-three-fiber)
- Flame = a shader on a deformed sphere/ellipsoid with a noise-based flicker, rendered with additive blending.
- Controls: **gravity** 0 → 1 g (presets ISS 0, Moon 0.16, Mars 0.38, Earth 1), **O₂ %**, **pressure (psi)**, **airflow (cm/s)**, **fuel/geometry** (droplet sphere · gas jet · solid sheet · porous sphere).
- Visual heuristics, shown clearly as qualitative:
  - Shape: aspect ratio interpolates from sphere (0 g, quiescent) to teardrop (1 g). Airflow stretches the flame downstream (concurrent) or compacts it (opposed), as in BASS and Saffire.
  - Colour: blue (soot-free, low O₂ / 0 g) → yellow-orange (sooty). Higher O₂ means a brighter, smaller, hotter flame.
  - Quiescent + 21% O₂ + 0 g: flame dims and extinguishes. Quiescent + ≥26.5% O₂: sustained (BRE).
- A side panel, **"What the data says"**, lists which PSI experiments bound the current setting, and flags "no PSI data at this gravity" for 0 < g < 1.
- Optional: a mode that renders a specific experiment's geometry from the `flame_3d` field.
✅ 60 fps on a laptop, a visible disclaimer, and every preset cites its sources.

### Phase 7: Moon base, What we learned, What we need to do next
Content from section 2C–E, with citations.
✅ Every claim links to a PSI DOI or the challenge brief.

### Phase 8: QA and ship
- Fact-check pass: script-diff UI strings against `experiments.json`.
- Accessibility: keyboard tabs, alt text, colour contrast, reduced motion.
- Performance: lazy-load the 3D canvas and charts.
- Deploy to Vercel. Write a README with data citation (DOIs), credits and the scoring method.
- Run the **Superfuture Design Review** skill on the final UI, checking it against `design-direction.md` and the frontend-design principles.

---

## 5. Folder structure

```
app/
  page.tsx                 # scroll story
  explore/page.tsx         # tab hub
  moon/page.tsx
  learned/page.tsx
  next/page.tsx
components/
  story/  tabs/  experiments/  charts/  flame/
data/ experiments.json  conditions.json
lib/ schema.ts  score.ts
public/thumbs/
```

---

## 6. Resources

**Data and science**
- NASA PSI search (combustion): https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation
- Investigation pages: `https://psi.nasa.gov/physci/repo/data/investigations/PSI-<n>`
- DOIs: `https://doi.org/10.60555/...` (listed per experiment in the JSON and Notion)
- NASA Space Apps challenge brief (in the project files): context on Moon O₂/pressure, hardware families, LUCI/FM2
- Notion: "NASA Space Apps" → "PSI Combustion Experiments (ranked)"

**Libraries / docs**
- Next.js: https://nextjs.org/docs
- react-three-fiber: https://r3f.docs.pmnd.rs · drei: https://github.com/pmndrs/drei
- three.js: https://threejs.org/docs
- GSAP + ScrollTrigger: https://gsap.com/docs
- Lenis: https://github.com/darkroomengineering/lenis
- react-bits: https://reactbits.dev
- Recharts: https://recharts.org (animation props: `isAnimationActive`, `animationDuration`, `animationBegin`)
- Motion: https://motion.dev (layout animations, `whileInView`, `AnimatePresence`)
- Visx: https://airbnb.io/visx (custom chart marks)
- zod: https://zod.dev

**Claude Code skills / tools**
- frontend-design (Anthropic): design fundamentals, auto-loads on UI work
- Better Interface, Superfuture Design Review (yours)
- `dataviz` skill for chart colours and layout
- Notion MCP (optional) to re-export the database to JSON

---

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Simulation mistaken for a real prediction | Label it as qualitative and cite the bounding experiments |
| No partial-g data | State the gap explicitly. Use 0 g and 1 g bounds plus the E-FIELD proxy |
| PSI endpoint changes | JSON is checked in; the refresh script is optional |
| Scope creep in a 48 h hackathon | Phases 1–5 are the MVP. Phases 6–7 are stretch, in that order |

---

## 8. CLAUDE.md rules (paste into the repo)

- `experiments.json` is the only source of facts. Never invent experiment data. If a value is missing, show "—".
- Every experiment mention shows its PSI ID and links to its DOI.
- No AI/LLM features in the site and no API keys. All text is prewritten in the data files.
- Label the simulation as interpretive, not measured.
- Mobile-first, accessible, and respect `prefers-reduced-motion`.
- After each phase, run the type check and lint, and check that phase's acceptance criteria.

---

## 9. Starter prompt for Claude Code

> Read PLAN.md and data/experiments.json. We're building "FlamePredict", a Next.js + TypeScript dashboard for the NASA Space Apps challenge, following PLAN.md exactly. Start with Phase 1 (scaffold + zod validation of experiments.json), then stop and show me the result before Phase 2. Follow the CLAUDE.md rules. Use react-three-fiber, GSAP + Lenis, react-bits, Recharts and Motion as specified. Ask me before adding any dependency not listed.
