/**
 * The theater's static art: the marquee's lights and the moon medallion over
 * the stage. Decoration only (aria-hidden).
 *
 * The marquee's bulbs are CSS, not SVG: each strip of bulbs is a repeating
 * radial gradient sized so a whole number of bulbs fits each edge (escape.css
 * sets the counts per layout). They chase the old way: every third bulb is
 * lit in one of three layers, and the layers light in turn, three opacity
 * animations the compositor runs. Twelve empty elements, no markup per bulb.
 */
export function MarqueeLights() {
  return (
    <div className="er-lights" aria-hidden="true">
      <span className="er-lights-off">
        <i />
        <i />
      </span>
      {[0, 1, 2].map((p) => (
        <span key={p} className="er-lights-on" data-p={p}>
          <i />
          <i />
        </span>
      ))}
    </div>
  );
}

/** The gilt medallion at the top of the proscenium: a crescent moon in a sunburst. */
export function Medallion({ className }: { className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r0 = 26,
      r1 = i % 2 ? 33 : 38;
    return `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}`;
  }).join('');
  return (
    <svg
      className={className}
      viewBox="-40 -40 80 80"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="er-gilt" x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c4" />
          <stop offset="0.45" stopColor="#e6b85c" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
      </defs>
      <path
        d={rays}
        stroke="url(#er-gilt)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle r="24" fill="#1a1238" stroke="url(#er-gilt)" strokeWidth="3.5" />
      <path
        d="M6 -14 A15 15 0 1 0 6 14 A11.5 11.5 0 1 1 6 -14 Z"
        fill="url(#er-gilt)"
      />
      <circle cx="9" cy="-4" r="1.6" fill="#fff2c4" />
      <circle cx="13" cy="6" r="1.1" fill="#fff2c4" />
    </svg>
  );
}
