/**
 * Fixed background starfield in three depth layers. Star patterns are CSS
 * tiles (globals.css); Landing's scroll timeline moves each layer upward at a
 * different rate for parallax. Static (no motion / no JS): stars simply hold.
 * Dim blue-whites only — the flame stays the brightest thing on the page.
 */
export default function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      <div className="starfield-layer starfield-layer--far js-stars-far" />
      <div className="starfield-layer starfield-layer--mid js-stars-mid" />
      <div className="starfield-layer starfield-layer--near js-stars-near" />
    </div>
  );
}
