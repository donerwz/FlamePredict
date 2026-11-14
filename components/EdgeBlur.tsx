/**
 * Fixed progressive blur along the top and bottom viewport edges, so content
 * fades into the void instead of being cut off. Styles: `.edge-blur` in
 * app/globals.css (three stacked backdrop-blur layers + a tint).
 * Keep headers above it (z-20) and give footers ~6rem bottom padding.
 */
export default function EdgeBlur() {
  return (
    <>
      <div className="edge-blur edge-blur--top" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="edge-blur edge-blur--bottom" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </>
  );
}
