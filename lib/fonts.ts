import localFont from "next/font/local";

/**
 * Typography system. Two typefaces, with deliberate roles:
 *
 * - Syne (`--font-syne`, Tailwind `font-sans`): the PRIMARY face. Use it for
 *   most of the site — headings, body copy, labels, nav, prose. It is the
 *   default `font-family` (set in app/globals.css), so you usually don't need a
 *   class at all.
 *
 * - 5by7 (`--font-5by7`, Tailwind `font-data`): a dot-matrix / technical face
 *   reserved for DATA and stylistic accents around it — stat readouts and
 *   numbers (12.35 TB, scores, FPS), PSI IDs, DOIs, chart axis/tick labels,
 *   tabular values, the data-source header strip, and small "terminal/HUD"
 *   flourishes. Pair it with tabular-nums and a touch of tracking at small
 *   sizes. Do NOT use it for long-form reading text.
 *
 * Files live in /fonts. Both are self-hosted and optimized by next/font.
 */

// Primary typeface — most text on the website.
export const syne = localFont({
  src: "../fonts/Syne-VariableFont_wght.ttf",
  variable: "--font-syne",
  weight: "400 800", // variable weight axis
  display: "swap",
});

// Data / stylistic accent typeface — numbers, IDs, chart labels, HUD details.
export const fiveBySeven = localFont({
  src: [
    { path: "../fonts/5by7.regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/5by7.bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-5by7",
  display: "swap",
});
