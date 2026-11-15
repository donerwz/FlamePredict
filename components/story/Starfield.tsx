/**
 * Fixed background starfield in three depth layers, mounted once in
 * app/layout.tsx so every page shares it. Star patterns are CSS
 * tiles (globals.css); Landing's scroll timeline moves each layer upward at a
 * different rate for parallax. Static (no motion / no JS): stars simply hold.
 * Dim blue-whites only — the flame stays the brightest thing on the page.
 * Comets: a few faint streaks that cross now and then on long, co-prime
 * cycles (CSS only, `.comet` in globals.css). Hidden under reduced motion.
 */

/** Start point (% of viewport), heading (deg), cycle (s), delay (s). */
const COMETS = [
  { top: 14, left: -12, angle: 16, cycle: 13, delay: 1.2 },
  { top: 6, left: 30, angle: 34, cycle: 19, delay: 6 },
  { top: 52, left: -12, angle: -10, cycle: 23, delay: 11 },
  { top: 18, left: 78, angle: 150, cycle: 29, delay: 16 },
] as const;
export default function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      <div className="starfield-layer starfield-layer--far js-stars-far" />
      <div className="starfield-layer starfield-layer--mid js-stars-mid" />
      <div className="starfield-layer starfield-layer--near js-stars-near" />
      {COMETS.map((c, i) => (
        <span
          key={i}
          className="comet-path"
          style={{
            top: `${c.top}%`,
            left: `${c.left}%`,
            transform: `rotate(${c.angle}deg)`,
          }}
        >
          <span
            className="comet"
            style={{
              animationDuration: `${c.cycle}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
