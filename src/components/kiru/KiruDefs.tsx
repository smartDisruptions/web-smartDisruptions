import { KiruParts } from './Kiru';
import { svgString } from '@/components/brand/svgString';

/**
 * Gradients, the head clip, and the shared body parts (hood, face, torso,
 * legs, katana) that every <Kiru /> on the page references by id. Rendered
 * once, in the root layout. Zero-sized rather than display:none,
 * because a gradient inside a display:none SVG doesn't paint in every browser.
 */
export default function KiruDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs
        dangerouslySetInnerHTML={{
          __html: svgString(
            <>
        <linearGradient id="kiru-hood" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#34417c" />
          <stop offset="0.5" stopColor="#252d56" />
          <stop offset="1" stopColor="#181d3b" />
        </linearGradient>
        <linearGradient id="kiru-gi" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#2e3970" />
          <stop offset="0.6" stopColor="#252d56" />
          <stop offset="1" stopColor="#1b2146" />
        </linearGradient>
        <radialGradient id="kiru-aura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ff8a5c" stopOpacity="0.16" />
          <stop offset="1" stopColor="#9bb0ff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="kiru-head-clip" clipPathUnits="userSpaceOnUse">
          <ellipse cx="100" cy="90" rx="74" ry="66" />
        </clipPath>
        <KiruParts />
            </>,
          ),
        }}
        suppressHydrationWarning
      />
    </svg>
  );
}
