# FlamePredict

A dashboard that summarises, ranks and interprets 24 NASA microgravity
combustion investigations for fire safety on spacecraft, the Moon and Mars.
Built for the NASA Space Apps Challenge by Wentao and Gordon.

- **Homepage** — a scroll story: how a flame changes when gravity lets go.
- **Explore** — data overview, the ranked list (re-weightable, filterable,
  comparable), five charts, and the qualitative "Flames in Freefall" simulation.
- **Moon base** — what richer oxygen at lower pressure means for fire risk.
- **What we learned** — prevention, detection and suppression, claim by claim.
- **What's next** — the open gaps in the data.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run build` | Static export to `out/` |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run validate` | Checks every data file against its schema and the scoring formula |
| `npm run factcheck` | After a build: diffs what the site shows against `data/experiments.json` |

The site is a static export (`output: "export"`): no server, no API routes, no
API keys. Any static host can serve `out/`.

## Data and citation

All experiment facts come from NASA's **Physical Sciences Informatics (PSI)**
repository — NASA PSI Combustion Science investigations (search 'combustion'), retrieved 2026-11-14: 24 investigations
(19 flight, 5 ground), 12.35 TB of open data.
`data/experiments.json` is the single source of truth; missing values are shown
as "—", never filled in.

PSI asks that its data be cited by DOI. Every mention of an investigation on
the site shows its PSI ID and links its DOI:

| Rank | PSI ID | Investigation | Score | DOI |
|---|---|---|---|---|
| 1 | PSI-20 | ACME BRE | 4.90 | [10.60555/vb93-3y72](https://doi.org/10.60555/vb93-3y72) |
| 2 | PSI-69 | FLEX | 4.40 | [10.60555/mbq8-0451](https://doi.org/10.60555/mbq8-0451) |
| 3 | PSI-25 | BASS-II | 4.30 | [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67) |
| 4 | PSI-68 | FLEX-2 | 4.10 | [10.60555/byp8-h018](https://doi.org/10.60555/byp8-h018) |
| 5 | PSI-26 | BASS | 4.05 | [10.60555/58h4-dy80](https://doi.org/10.60555/58h4-dy80) |
| 6 | PSI-99 | Saffire-II | 3.95 | [10.60555/2chp-m469](https://doi.org/10.60555/2chp-m469) |
| 7 | PSI-159 | ACME CFI-G | 3.95 | [10.60555/cyt1-kh64](https://doi.org/10.60555/cyt1-kh64) |
| 8 | PSI-22 | ACME E-FIELD Flames | 3.85 | [10.60555/se5a-8c73](https://doi.org/10.60555/se5a-8c73) |
| 9 | PSI-62 | UFGM / BASS modelling | 3.70 | [10.60555/e9xp-ex83](https://doi.org/10.60555/e9xp-ex83) |
| 10 | PSI-10 | ACME Flame Design | 3.70 | [10.60555/w4zy-bt45](https://doi.org/10.60555/w4zy-bt45) |
| 11 | PSI-101 | SAME-R | 3.45 | [10.60555/2np7-jv14](https://doi.org/10.60555/2np7-jv14) |
| 12 | PSI-98 | Saffire-I | 3.45 | [10.60555/0t15-1z43](https://doi.org/10.60555/0t15-1z43) |
| 13 | PSI-100 | Saffire-III | 3.45 | [10.60555/040q-4h36](https://doi.org/10.60555/040q-4h36) |
| 14 | PSI-21 | ACME CLD Flame | 3.45 | [10.60555/23e1-9950](https://doi.org/10.60555/23e1-9950) |
| 15 | PSI-102 | SAME | 3.35 | [10.60555/gd4k-8h62](https://doi.org/10.60555/gd4k-8h62) |
| 16 | PSI-115 | SAME modelling | 3.20 | [10.60555/q0v5-1v28](https://doi.org/10.60555/q0v5-1v28) |
| 17 | PSI-107 | SPICE | 3.15 | [10.60555/9kbh-e962](https://doi.org/10.60555/9kbh-e962) |
| 18 | PSI-23 | ACME s-Flame | 2.95 | [10.60555/k57n-p030](https://doi.org/10.60555/k57n-p030) |
| 19 | PSI-39 | CFI | 2.70 | [10.60555/m6pj-a914](https://doi.org/10.60555/m6pj-a914) |
| 20 | PSI-106 | SLICE | 2.50 | [10.60555/pm12-rg61](https://doi.org/10.60555/pm12-rg61) |
| 21 | PSI-60 | SPICE analysis | 2.40 | [10.60555/mzjm-yv57](https://doi.org/10.60555/mzjm-yv57) |
| 22 | PSI-47 | DAFT / DAFT-2 | 2.30 | [10.60555/ztgj-d202](https://doi.org/10.60555/ztgj-d202) |
| 23 | PSI-142 | Cool-flame counterflow | 2.15 | [10.60555/80qf-vj95](https://doi.org/10.60555/80qf-vj95) |
| 24 | PSI-117 | Cool-flame CFD | 2.15 | [10.60555/gz0q-b577](https://doi.org/10.60555/gz0q-b577) |

Moon-base context (≥30% O₂ at ≤10.2 psi; spacesuit 100% O₂ at 4.3 psi; Earth
21% at 14.7 psi) comes from the NASA Space Apps challenge brief. PSI holds no
partial-gravity combustion data yet, and the site says so wherever it matters.

Other data files, all hand-written and validated at build time:

- `data/conditions.json` — numeric oxygen, pressure and airflow ranges
  extracted from the prose in `experiments.json` (null where no number is given).
- `data/pages.json` — the copy for the Moon, Learned and Next pages. Every
  claim cites a PSI ID or the challenge brief; the build fails otherwise.
- `data/learned-visuals.json` — the agent-versus-fuel matrix and the cool-flame
  sketch. Each matrix entry quotes the phrase in the record it rests on.

## Scoring method

Each investigation carries four sub-scores from 0 to 5:

| Axis | Name | Question it answers | Default weight |
|---|---|---|---|
| **F** | Fire-safety directness | Does it inform prevention, detection or suppression for crew habitats? | 0.40 |
| **M** | Moon / Mars transfer | Does it test elevated O₂ / reduced pressure, still air, or mimic partial gravity? | 0.25 |
| **P** | Predictive-modelling value | Are O₂, airflow, pressure, etc. controlled so the data can feed fire models? | 0.25 |
| **D** | Data richness | Volume, experimental tables, imagery. | 0.10 |

`score = 0.40·F + 0.25·M + 0.25·P + 0.10·D`

Stars: ≥ 4.0 → 5, ≥ 3.5 → 4, ≥ 3.0 → 3, ≥ 2.4 → 2, otherwise 1.

The formula lives only in `lib/score.ts`. On the Experiments tab the weights are
sliders, so a reader can re-rank the list for their own priorities; the default
ranking is the one stored in the dataset, and `npm run validate` confirms the
stored scores match the formula.

## What is and isn't measured

- The **simulation** and the **flame illustrations** are qualitative. Shapes,
  colours and extinction behaviour follow trends reported in the cited
  investigations; nothing is a measured flame, and the site says so on screen.
- Statements that the source records phrase as hypotheses stay labelled
  **HYPOTHESIS**.
- Nothing on the site is generated at runtime. All text is prewritten and stored
  in the data files. There are no AI features.

## Credits

- **Data:** NASA Physical Sciences Informatics (PSI), cited by DOI above.
- **Moon textures:** NASA/Goddard Scientific Visualization Studio, from Lunar
  Reconnaissance Orbiter camera (LROC) colour and laser altimeter (LOLA)
  elevation maps (`public/textures/lroc_color_2k.jpg`, `ldem_3_8bit.jpg`).
- **Typefaces:** Syne and 5by7, self-hosted from `fonts/`.
- **Built with:** Next.js, TypeScript, Tailwind CSS, three.js /
  react-three-fiber, GSAP + Lenis, Motion, Recharts and zod.

Built for the NASA Space Apps Challenge.

## Project layout

```
app/            routes: / · /explore · /moon · /learned · /next
components/     story · tabs · experiments · charts · flame · content · learned
data/           experiments.json (source of truth) and the derived data files
lib/            schema.ts (zod) · score.ts (ranking) · loaders
scripts/        validate-experiments.mts · factcheck.mts
```

Design rules (palette, type, motion) are in `design-direction.md`; the build
plan is in `PLAN.md`.
