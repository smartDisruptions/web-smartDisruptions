/**
 * A torii gate — where the path on /about changes gear (the AI years begin).
 * Decorative: the era is in the text beside it. The pillars stand wide enough
 * apart that the inked path, and Kiru running it, pass between them.
 *
 * Vermilion lacquer with an ink-dark cap, like the real thing; the cap uses
 * --kiru-line so it reads in both lights.
 */
export default function Torii({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* pillars, leaning in very slightly (the hashira's taper) */}
      <path d="M30 34 L42 34 L44 140 L28 140 Z" fill="var(--sd-pen)" />
      <path d="M158 34 L170 34 L172 140 L156 140 Z" fill="var(--sd-pen)" />
      {/* bases */}
      <rect
        x="25"
        y="136"
        width="22"
        height="9"
        rx="2"
        fill="var(--kiru-line)"
      />
      <rect
        x="153"
        y="136"
        width="22"
        height="9"
        rx="2"
        fill="var(--kiru-line)"
      />
      {/* nuki — the lower tie beam, running through the pillars */}
      <rect
        x="14"
        y="62"
        width="172"
        height="9"
        rx="1.5"
        fill="var(--sd-pen)"
      />
      {/* gakuzuka — the short strut between the beams */}
      <rect x="94" y="38" width="12" height="25" fill="var(--sd-pen)" />
      {/* shimaki under the cap */}
      <path
        d="M12 29 Q100 22 188 29 L186 39 Q100 33 14 39 Z"
        fill="var(--sd-pen)"
      />
      {/* kasagi — the dark cap with upturned ends */}
      <path
        d="M0 18 Q100 4 200 18 Q197 26 190 29 Q100 18 10 29 Q3 26 0 18 Z"
        fill="var(--kiru-line)"
      />
    </svg>
  );
}
