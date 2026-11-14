# fonts/

## Typeface roles (project convention)

- **Syne** (`Syne-VariableFont_wght.ttf`) → Tailwind `font-sans`, the site
  **default**. Use for most text: headings, body, labels, nav. Usually needs no
  class since it's the default `font-family`.
- **5by7** (`5by7.regular.ttf` / `5by7.bold.ttf`) → Tailwind `font-data`.
  Reserved for **data and stylistic accents around it**: numbers/stat readouts
  (12.35 TB, scores, FPS), PSI IDs, DOIs, chart axis/tick labels, tabular
  values, the data-source header strip, HUD-style flourishes. Not for long-form
  reading text. Pair with `tabular-nums` and a little `tracking-*` at small
  sizes.

Registered in `lib/fonts.ts`, wired in `app/layout.tsx` + `app/globals.css`.

## Adding more fonts

Drop local font files here (`.ttf`, `.woff`, or `.woff2` all work), then
register them in `lib/fonts.ts` with `next/font/local`. Next.js self-hosts and
optimizes them at build time, so keep the source files **here**, not in
`public/` (they should not be served raw).

`.ttf` is fully supported — no conversion needed. If you later want smaller
downloads you can optionally convert to `.woff2`, but it's not required.

## How to add a font

1. Copy the files in, e.g.:

   ```
   fonts/
     Satoshi-Regular.ttf
     Satoshi-Medium.ttf
     Satoshi-Bold.ttf
   ```

2. Register it in `lib/fonts.ts` (uncomment / copy the example there). Each font
   exposes a CSS variable like `--font-display`.

3. Add the variable class to `<html>` in `app/layout.tsx`:

   ```tsx
   className={`${geistSans.variable} ${display.variable} ...`}
   ```

4. Expose it to Tailwind in `app/globals.css` under `@theme inline`:

   ```css
   --font-display: var(--font-display);
   ```

   Then use it with `font-display` (Tailwind) or `font-[family-name:var(--font-display)]`.

## Licensing

Only add fonts you have a license to embed on the web. Keep the license file
alongside the font (e.g. `fonts/Satoshi-LICENSE.txt`).
