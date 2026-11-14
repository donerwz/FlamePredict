/**
 * Illustrative CSS flame with two layers the scroll timeline crossfades:
 * - teardrop (amber, 1g) — flickers while visible
 * - sphere (blue, 0g) — deliberately still; also the static/no-JS state
 * Decorative only: real experiment visuals come from PSI data in later phases.
 */
export default function Flame() {
  return (
    <div className="flame-wrap" aria-hidden="true">
      <div className="flame-layer flame-layer--tear js-tear">
        <div className="tear-glow" />
        <div className="tear-flicker js-flicker">
          <div className="tear-shape">
            <div className="tear-fill" />
          </div>
        </div>
      </div>
      <div className="flame-layer js-sphere">
        <div className="sph-glow" />
        <div className="sph-shell" />
        <div className="sph-core" />
      </div>
    </div>
  );
}
