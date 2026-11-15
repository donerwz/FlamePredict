# FlamePredict — Design Direction

Set in Phase 2. Every later phase checks against this file. The premise: **the
design encodes the physics.** On Earth a flame is a flickering amber teardrop;
in microgravity it is a dim, blue, almost perfectly still sphere. Palette,
motion and typography all take sides in that contrast.

## 1. Palette

The site lives in the dark — microgravity combustion is photographed in
darkened chambers where the flame is the only light source. The background is
not "dark mode"; it is the medium.

| Token | Hex | Role |
|---|---|---|
| `void` | `#050A14` | Background everywhere. Near-black with a blue undertone (combustion-chamber dark). |
| `flame` | `#5C9DFF` | Microgravity flame blue. Primary accent: links, data readouts, active states. |
| `icewhite` | `#D6E6FF` | Hot core. Headings and emphasis text. |
| `ember` | `#FFA552` | Earth-gravity flame. **Only** for 1g / Earth references (the teardrop flame, gravity meter, Earth zones in charts). Never a generic accent. |
| `fog` | `#C7D3E6` | Body text. |
| `slate` | `#8495B2` | Secondary text, captions. (≈6.5:1 on void — AA at any size.) |

Rule: **amber means gravity, blue means freefall.** If a color choice doesn't
map to that axis, use the neutrals. All pairs above clear WCAG AA on `void`.

## 2. Typography

Two faces, locked in Phase 1, with strict roles (see `fonts/README.md`):

- **Syne** (`font-sans`, variable 400–800) — everything people *read*:
  headings, body, nav, CTAs. Display at 700–800 with slightly tight tracking
  and line-height ≈1.05–1.1; body at 400, line-height ≈1.6–1.7, max width
  ~34rem (<80ch). Syne's wide geometric character *is* the brand voice — let
  headlines be big and plain, no per-word color accents or italic tricks.
- **5by7** (`font-data`, 400/700) — everything an *instrument* would say:
  numbers, stat readouts, PSI IDs, DOIs, axis/tick labels, the gravity meter,
  route tags. Small sizes (0.62–0.8rem), letter-spacing 0.08–0.14em,
  `tabular-nums`. Uppercase is allowed here (telemetry vernacular) and only
  here — never as decorative eyebrow labels over Syne headings.
- Subscripts: use `O<sub>2</sub>` markup in prose (the fonts lack U+2082) and
  plain `O2` inside 5by7 readouts.

## 3. Motion

Motion is argument, not garnish. The signature move of the whole site is one
scroll-scrubbed transformation on the landing page: teardrop → sphere while a
gravity readout ticks 1.00 g → 0.00 g.

- The Earth flame **flickers** (tiny transform jitter); the microgravity flame
  is **still**. Stillness is a deliberate, meaningful state — resist adding
  idle "breathing" loops to things.
- Animate **transform and opacity only** — plus `filter: blur()` for the
  blur-settle accent below, nothing else. Triggered (non-scrubbed) animations:
  300–800 ms, ease-out. Scroll-scrubbed timelines are position-mapped, not
  clock-mapped — keep segment proportions so nothing feels abrupt.
- One orchestrated moment per page. No per-section fade-up entrances, no hover
  lifts on every card. Hover/focus feedback = text brightens, background lifts
  ≤5% — that's it.
- `prefers-reduced-motion`: no Lenis, no scrub, no flicker. Content renders
  stacked in normal flow with the flame in its final (sphere) state. This is
  the no-JS rendering too.
- **Motion blur — "blur-settle".** The site's single motion signature. Things
  arriving come into focus; things leaving go out of focus — like a flame seen
  through chamber glass, or a camera pulling focus. It pairs with movement,
  never replaces it:
  - Entrance: `opacity 0 → 1`, a short offset (6–36 px) → 0, and
    `blur(6px) → blur(0)`, all on the same ease-out curve and duration
    (300–800 ms, or the matching scrub segment). Motion ends with
    `filter: none` (`SETTLED` in `lib/motion.ts`).
  - Exit: the mirror — fade, move, and soften to `blur(6px)` with an ease-in or
    ease-out curve.
  - Dissolve: large illustrative elements (the landing teardrop → sphere) use
    `blur(8px)` so the change reads as smoke dispersing / focus pulling.
  - Tokens: `BLUR_SOFT` (6px), `BLUR_DISSOLVE` (8px), `BLUR_SHARP`, `SETTLED`.
    Never hand-write a blur radius in a component; never exceed 8px.
  - Where it lives today: landing beats 1–3 and their stats, the landing flame
    dissolve, Explore tab-panel switches, top-5 overview cards, experiment rows
    entering/leaving on filter, row detail panels, the F/M/P/D axis legend.
  - Moon base page: the Moon approaches first (three.js, ~2.4 s — the one
    entrance allowed past 800 ms); header, title and lede then blur-settle in
    a 130 ms stagger, and the long body and footer fade up without blur
    (`.after-moon` in `globals.css`).
  - Count-ups: the one speed-driven case. Blur = 6px × (1 − eased progress),
    so the digits blur while they spin fastest and resolve as the number
    lands, then `filter: none` (Data overview stat tiles, treemap total).
  - Where it never goes: re-rank layout glides (rows must stay readable while
    moving), chart marks and axes (data stays crisp), live readouts (slider
    values, FPS, gravity meter), hover/focus states, the WebGL flame,
    parallax/starfield.
  - Performance: blur only elements up to roughly a text column or the flame
    illustration — never full-viewport layers. Reduced motion skips it entirely.
- Starfield background: three fixed layers of dim blue-white dots
  (alpha ≤ 0.6), parallax-scrubbed slower than content for depth. Stars never
  outshine the flame, and they hold still under reduced motion.

## 4. Layout

- Left-aligned text on a strong left rail; never centered prose. Max content
  width ~72rem; beat text ~34rem.
- Landing: a pinned full-viewport stage (flame center-right on desktop, top on
  mobile; text lower-left) → CTA rows → footer strip.
- CTAs and lists are **full-width rows with hairline top borders**
  (`flame` at ~18% alpha), not grids of identical rounded cards. A row =
  Syne title + one-line description + 5by7 route tag.
- Structure devices (rules, tags, readouts) must encode real information —
  a 5by7 string should always be an actual value, ID, or route.

## 4a. Charts (Phase 5)

- Numeric chart values come from `data/conditions.json` — envelopes hand-extracted
  from the prose in `experiments.json`, null where the source states no number.
  Never plot a number the text doesn't support; tooltips show the verbatim prose.
- Hardware families use a fixed cool-toned categorical palette
  (`components/charts/chartTheme.ts`): ACME blue, MDCA cyan, MSG periwinkle,
  Saffire sand, Other slate. **Ember stays out of charts** — the only ember on a
  chart is an Earth / 1g reference marker.
- Moon-base zone = flame-blue shaded region (≥30% O₂, ≤10.2 psi). The O₂-vs-pressure
  map is the hero; only BRE and FLEX-2 reach that zone, and that's the point.
- Every mark links to its PSI entry; every tooltip cites the PSI ID. Animations
  run once on scroll-in and re-run on data change (zoom/filter re-mount), 300–800 ms,
  transform/opacity only, off under reduced motion (final state shown).

## 5. Voice

- Plain verbs, sentence case, no filler. CTAs say where they go
  ("Explore the experiments"), never "Learn more".
- Facts come only from `data/experiments.json` + the challenge brief; every
  experiment mention carries its PSI ID and DOI. Missing value → "—".
- The simulation and any illustrative visual (including the CSS flame) is
  interpretive, not measured — say so where it matters.

## 6. Self-critique log

- *Rejected:* generic near-black + orange "fire" gradient hero (default tell);
  replaced with the semantic amber/blue axis — blue is the space-flame truth.
- *Rejected:* 2×2 CTA card grid with shared radius/shadow (SaaS-kit tell);
  replaced with manifest rows.
- *Rejected:* numbered markers on CTAs — the four destinations are not a
  sequence.
- *Kept with justification:* uppercase 5by7 micro-labels — authentic
  instrument vernacular, bound to real data values only.
- *Deferred:* a real NASA flame photograph (credited) can replace/augment the
  CSS flame in beat 1 once an image is chosen; CSS flame stands in and is
  honest about being illustrative.
