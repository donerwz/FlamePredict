type GapVisual = "gravity" | "materials" | "dust" | "cool-flame";

const common = {
  line: "rgba(132, 149, 178, 0.42)",
  muted: "#8495b2",
  text: "#d6e6ff",
  blue: "#5c9dff",
  amber: "#ffa552",
};

export default function NextGapVisual({ kind }: { kind: GapVisual }) {
  if (kind === "gravity") {
    return (
      <svg
        viewBox="0 0 220 92"
        role="img"
        aria-label="Gravity scale: zero and one gravity are represented in the archive, while lunar and Martian gravity remain open test points."
        className="h-auto w-full max-w-[13rem]"
      >
        <title>Partial-gravity test gap</title>
        <line x1="18" y1="34" x2="202" y2="34" stroke={common.line} strokeWidth="2" />
        <line x1="18" y1="34" x2="202" y2="34" stroke={common.blue} strokeWidth="2" opacity="0.55" />
        <circle cx="18" cy="34" r="6" fill={common.blue} />
        <circle cx="48" cy="34" r="6" fill="var(--color-void)" stroke={common.amber} strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="88" cy="34" r="6" fill="var(--color-void)" stroke={common.amber} strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="202" cy="34" r="6" fill={common.blue} />
        <text x="18" y="59" textAnchor="middle" fill={common.muted} fontSize="9">0 g</text>
        <text x="48" y="59" textAnchor="middle" fill={common.muted} fontSize="9">Moon</text>
        <text x="88" y="59" textAnchor="middle" fill={common.muted} fontSize="9">Mars</text>
        <text x="202" y="59" textAnchor="middle" fill={common.muted} fontSize="9">1 g</text>
        <circle cx="18" cy="78" r="3" fill={common.blue} />
        <text x="26" y="81" fill={common.muted} fontSize="8">studied</text>
        <circle cx="93" cy="78" r="3" fill="var(--color-void)" stroke={common.amber} strokeWidth="1.5" strokeDasharray="2 1" />
        <text x="101" y="81" fill={common.muted} fontSize="8">open test point</text>
      </svg>
    );
  }

  if (kind === "materials") {
    return (
      <svg
        viewBox="0 0 220 104"
        role="img"
        aria-label="Test-condition matrix highlighting the untested combination of real solid materials, richer oxygen, and lower pressure."
        className="h-auto w-full max-w-[13rem]"
      >
        <title>Real-materials atmosphere gap</title>
        <text x="28" y="12" fill={common.muted} fontSize="8">LOWER PRESSURE</text>
        <rect x="28" y="19" width="176" height="58" fill="none" stroke={common.line} />
        <line x1="116" y1="19" x2="116" y2="77" stroke={common.line} />
        <line x1="28" y1="48" x2="204" y2="48" stroke={common.line} />
        <text x="72" y="39" textAnchor="middle" fill={common.muted} fontSize="8">REAL SOLIDS</text>
        <text x="160" y="39" textAnchor="middle" fill={common.muted} fontSize="8">GAS / DROPLET</text>
        <text x="72" y="66" textAnchor="middle" fill={common.muted} fontSize="8">CABIN AIR</text>
        <text x="160" y="66" textAnchor="middle" fill={common.muted} fontSize="8">OTHER TESTS</text>
        <circle cx="72" cy="33" r="13" fill={common.amber} fillOpacity="0.12" stroke={common.amber} strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="72" y="37" textAnchor="middle" fill={common.amber} fontSize="12">?</text>
        <text x="204" y="92" textAnchor="end" fill={common.muted} fontSize="8">MORE O₂ →</text>
      </svg>
    );
  }

  if (kind === "dust") {
    return (
      <svg
        viewBox="0 0 220 92"
        role="img"
        aria-label="Separate smoke and lunar-dust particle samples with a question mark at the missing side-by-side detector comparison."
        className="h-auto w-full max-w-[13rem]"
      >
        <title>Smoke versus lunar dust comparison gap</title>
        <g fill={common.blue} opacity="0.85">
          <circle cx="20" cy="24" r="2.5" /><circle cx="39" cy="39" r="3.5" />
          <circle cx="58" cy="22" r="2" /><circle cx="76" cy="40" r="2.8" />
          <circle cx="94" cy="26" r="3.2" />
        </g>
        <g fill={common.amber} opacity="0.9">
          <circle cx="129" cy="27" r="4" /><circle cx="147" cy="43" r="5" />
          <circle cx="166" cy="24" r="3.5" /><circle cx="185" cy="41" r="4.5" />
          <circle cx="203" cy="26" r="3" />
        </g>
        <line x1="105" y1="15" x2="105" y2="55" stroke={common.line} strokeDasharray="3 3" />
        <text x="110" y="39" fill={common.text} fontSize="15">?</text>
        <text x="57" y="75" textAnchor="middle" fill={common.muted} fontSize="9">SMOKE</text>
        <text x="167" y="75" textAnchor="middle" fill={common.muted} fontSize="9">LUNAR DUST</text>
        <text x="110" y="88" textAnchor="middle" fill={common.muted} fontSize="8">NOT MEASURED TOGETHER</text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 96"
      role="img"
      aria-label="After-suppression timeline from visible flame, through suppression and possible hidden cool flame, to confirming the habitat is safe."
      className="h-auto w-full max-w-[13rem]"
    >
      <title>After-suppression monitoring gap</title>
      <line x1="16" y1="34" x2="204" y2="34" stroke={common.line} strokeWidth="2" />
      <line x1="16" y1="34" x2="145" y2="34" stroke={common.blue} strokeWidth="2" opacity="0.55" />
      <circle cx="16" cy="34" r="5" fill={common.amber} />
      <circle cx="76" cy="34" r="5" fill={common.blue} />
      <circle cx="143" cy="34" r="5" fill="var(--color-void)" stroke={common.amber} strokeWidth="2" />
      <circle cx="204" cy="34" r="7" fill="var(--color-void)" stroke={common.text} strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="16" y="58" textAnchor="middle" fill={common.muted} fontSize="8">VISIBLE</text>
      <text x="76" y="58" textAnchor="middle" fill={common.muted} fontSize="8">SUPPRESS</text>
      <text x="143" y="58" textAnchor="middle" fill={common.muted} fontSize="8">COOL FLAME?</text>
      <text x="204" y="58" textAnchor="middle" fill={common.muted} fontSize="8">VERIFY</text>
      <text x="143" y="82" textAnchor="middle" fill={common.amber} fontSize="8">OPEN QUESTION</text>
    </svg>
  );
}
