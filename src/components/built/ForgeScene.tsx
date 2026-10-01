import Kiru from '@/components/kiru/Kiru';

/**
 * The /built hero: Kiru at the anvil, hammering a website into shape.
 *
 * He is nested inside this scene's own <svg> at his build pose's exact
 * viewBox (0 -24 250 264), so the anvil is drawn in his units and lines up
 * with the hammer: the head's lower edge crosses y≈110 at the bottom of his
 * swing (k-swing, 62% of 1.5s), and that is where the hot piece sits.
 *
 * The sparks and the glow are timed to the same 1.5s swing, and they only
 * run while he does — the selector is `.bt-forge:has(.kiru[data-live])`, so
 * SiteFX's liveness (on screen, motion allowed) switches both on together
 * and they start in step. Reduced motion: one still frame, sparks at rest.
 *
 * Outlines use --kiru-line, so the anvil is inked like he is: sumi by day,
 * moonlit at night. Everything else is an object colour, same in both themes.
 */
const LINE = 'var(--kiru-line)';
const STEEL = '#cfd5e2';
const STEEL_MID = '#a9b0c4';
const STEEL_EDGE = '#8d95ab';
const WOOD = '#9a6a37';
const WOOD_DARK = '#74491f';
const WOOD_TOP = '#c99a5f';

export default function ForgeScene({ className = '' }: { className?: string }) {
  return (
    <div className={`bt-forge ${className}`} aria-hidden="true">
      <svg viewBox="0 -24 312 264" className="bt-forge-svg" focusable="false">
        <defs>
          <radialGradient id="bt-forge-heat" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffcf70" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="#ff7a3d" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ff5b3d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bt-forge-hot" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff8a3d" />
            <stop offset="0.5" stopColor="#ffd27a" />
            <stop offset="1" stopColor="#ff8a3d" />
          </linearGradient>
        </defs>

        {/* ground shadow under both of them */}
        <ellipse className="bt-forge-ground" cx="160" cy="234" rx="132" ry="7" />

        {/* the stump the anvil stands on */}
        <path
          d="M212 158 L212 226 Q212 233 220 233 L270 233 Q278 233 278 226 L278 158 Z"
          fill={WOOD}
          stroke={LINE}
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <path d="M262 160 L262 231 L278 231 L278 160 Z" fill={WOOD_DARK} opacity="0.55" />
        <path
          d="M224 172 q3 18 0 34 M236 188 q2 14 0 30 M252 168 q-3 16 0 30"
          stroke={WOOD_DARK}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="245" cy="158" rx="33" ry="7" fill={WOOD_TOP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
        <ellipse cx="245" cy="158" rx="18" ry="3.4" fill="none" stroke={WOOD} strokeWidth="1.6" />

        {/* the anvil */}
        <path
          d="M214 146 L276 146 Q280 146 280 150 L280 154 L210 154 L210 150 Q210 146 214 146 Z"
          fill={STEEL_EDGE}
          stroke={LINE}
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <path
          d="M228 130 L262 130 L258 146 L232 146 Z"
          fill={STEEL_MID}
          stroke={LINE}
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <path
          d="M204 118 L278 118 Q300 119 306 123 Q298 128 278 130 L210 130 Q204 130 204 125 Z"
          fill={STEEL}
          stroke={LINE}
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <path d="M208 121.5 L276 121.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M210 128 L278 128" stroke={STEEL_EDGE} strokeWidth="2" strokeLinecap="round" />

        {/* heat under the piece — brightens on each strike */}
        <ellipse className="bt-forge-glow" cx="233" cy="112" rx="38" ry="20" fill="url(#bt-forge-heat)" />

        {/* the piece on the anvil: a small browser window, glowing hot */}
        <g className="bt-forge-piece">
          <rect x="214" y="105" width="40" height="13" rx="2.5" fill="url(#bt-forge-hot)" stroke={LINE} strokeWidth="3.4" paintOrder="stroke" />
          <circle cx="219.5" cy="109" r="1.5" fill="#b42a17" />
          <circle cx="224" cy="109" r="1.5" fill="#b42a17" />
          <circle cx="228.5" cy="109" r="1.5" fill="#b42a17" />
          <path d="M219 113.5 h22 M244 113.5 h5" stroke="#b9541a" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        <Kiru pose="build" x={0} y={-24} width={250} height={264} />

        {/* sparks off the strike, in front of everything */}
        {/* Rays around the strike point (232, 111); the group scales out
            from it, so they fly as they fade. */}
        <g className="bt-forge-sparks" strokeLinecap="round" fill="none">
          <path d="M217 111.5 L205 111.9" className="bs1" strokeWidth="3" />
          <path d="M217.3 104.7 L204.4 99.3" className="bs2" strokeWidth="2.6" />
          <path d="M217.3 94.7 L210.6 87.2" className="bs3" strokeWidth="2.4" />
          <path d="M248.3 96.3 L256.5 88.9" className="bs1" strokeWidth="2.8" />
          <path d="M248.2 105.7 L260.5 101.7" className="bs2" strokeWidth="2.6" />
          <path d="M250 111.6 L262 112" className="bs3" strokeWidth="2.6" />
          <path d="M245.7 117.1 L254.8 121.2" className="bs1" strokeWidth="2.4" />
          <path d="M219.1 116.5 L209.9 120.4" className="bs3" strokeWidth="2.2" />
          <circle cx="196.5" cy="104.7" r="2.2" className="bs1f" />
          <circle cx="219" cy="75.3" r="1.8" className="bs2f" />
          <circle cx="266.6" cy="91" r="2" className="bs3f" />
          <circle cx="268.2" cy="118.7" r="1.7" className="bs1f" />
          <circle cx="246.9" cy="80.4" r="1.6" className="bs2f" />
        </g>
      </svg>
    </div>
  );
}
