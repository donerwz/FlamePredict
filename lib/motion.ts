/**
 * Motion-blur accent — the site's one motion style (see design-direction.md §3).
 *
 * "Blur-settle": an element arriving starts soft and offset, and resolves to
 * sharp as it lands; an element leaving softens as it goes. Like a flame
 * coming into focus through chamber glass. Used for entrances and exits only,
 * never for layout reorders, chart marks, numbers or the 3D canvas.
 *
 * Client-safe: constants only, no data imports.
 */

/** Blur radius at the start of an entrance / end of an exit (px). Max 8. */
export const MOTION_BLUR_PX = 6;

/** Stronger blur for large dissolving illustrations (the landing flame). */
export const MOTION_BLUR_DISSOLVE_PX = 8;

export const BLUR_SOFT = `blur(${MOTION_BLUR_PX}px)`;
export const BLUR_DISSOLVE = `blur(${MOTION_BLUR_DISSOLVE_PX}px)`;
export const BLUR_SHARP = "blur(0px)";

/**
 * Motion (framer) target for the end of an entrance: sharp, and the filter is
 * removed once settled so text renders crisply with no lingering filter layer.
 */
export const SETTLED = {
  opacity: 1,
  x: 0,
  y: 0,
  filter: BLUR_SHARP,
  transitionEnd: { filter: "none" },
} as const;
