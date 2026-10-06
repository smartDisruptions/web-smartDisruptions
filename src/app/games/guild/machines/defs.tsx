import { fluff } from './geo';

/**
 * Shared paint for the five machines: gradients and the small props they
 * reuse (a basketball, a dust bunny, a milk bottle, a glass bottle, a boxing
 * glove, a lightning bolt, a baseball). Rendered ONCE, at the top of the row;
 * every machine points at these ids with url(#…) and <use href="#…">.
 *
 * Not display:none — some engines drop gradients defined inside a
 * display:none <svg> — so it is a 0×0 box out of the flow instead.
 */

const BUNNY_BODY = fluff(30, 41, 19, 18, 3.6);

export default function MachineDefs() {
  return (
    <svg className="gm-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        {/* Oak, brass, paint */}
        <linearGradient id="gm-g-oak-x" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#24180d" />
          <stop offset=".1" stopColor="#47331e" />
          <stop offset=".5" stopColor="#5a4229" />
          <stop offset=".9" stopColor="#47331e" />
          <stop offset="1" stopColor="#24180d" />
        </linearGradient>
        <linearGradient id="gm-g-oak-y" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a4229" />
          <stop offset="1" stopColor="#2e1f12" />
        </linearGradient>
        <linearGradient id="gm-g-board" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#453019" />
          <stop offset="1" stopColor="#2a1c10" />
        </linearGradient>
        <linearGradient id="gm-g-brass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe3a2" />
          <stop offset=".38" stopColor="#e8b24a" />
          <stop offset=".72" stopColor="#b07e24" />
          <stop offset="1" stopColor="#7a5414" />
        </linearGradient>
        <linearGradient id="gm-g-brass-x" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#7a5414" />
          <stop offset=".35" stopColor="#f3cf7a" />
          <stop offset=".6" stopColor="#e8b24a" />
          <stop offset="1" stopColor="#8a6018" />
        </linearGradient>
        <linearGradient id="gm-g-red" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#b33a24" />
          <stop offset="1" stopColor="#7e2414" />
        </linearGradient>
        <linearGradient id="gm-g-cream" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbf0d4" />
          <stop offset="1" stopColor="#dccaa0" />
        </linearGradient>
        <linearGradient id="gm-g-curtain" x1="0" x2="22" y1="0" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
          <stop offset="0" stopColor="#5a160d" />
          <stop offset=".5" stopColor="#8a2a19" />
          <stop offset="1" stopColor="#5a160d" />
        </linearGradient>
        <radialGradient id="gm-g-hole" cx=".5" cy=".42" r=".6">
          <stop offset=".55" stopColor="#030201" />
          <stop offset="1" stopColor="#24180d" />
        </radialGradient>
        <radialGradient id="gm-g-bulb" cx=".4" cy=".35" r=".65">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset=".4" stopColor="#ffe08a" />
          <stop offset=".75" stopColor="#e8a530" />
          <stop offset="1" stopColor="#9a6a1a" />
        </radialGradient>
        <radialGradient id="gm-g-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffd98c" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffd98c" stopOpacity="0" />
        </radialGradient>

        {/* Props */}
        <radialGradient id="gm-g-ball" cx=".36" cy=".3" r=".75">
          <stop offset="0" stopColor="#f7a160" />
          <stop offset=".5" stopColor="#d4622f" />
          <stop offset="1" stopColor="#7e2c12" />
        </radialGradient>
        <radialGradient id="gm-g-fluff" cx=".4" cy=".34" r=".7">
          <stop offset="0" stopColor="#ece8e2" />
          <stop offset=".55" stopColor="#aaa39b" />
          <stop offset="1" stopColor="#6f6860" />
        </radialGradient>
        <radialGradient id="gm-g-fluff-gold" cx=".4" cy=".34" r=".7">
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset=".5" stopColor="#f0c040" />
          <stop offset="1" stopColor="#a8741a" />
        </radialGradient>
        <linearGradient id="gm-g-milk" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#cbbd9f" />
          <stop offset=".3" stopColor="#fffaf0" />
          <stop offset=".7" stopColor="#f1e7d2" />
          <stop offset="1" stopColor="#bfae8c" />
        </linearGradient>
        <radialGradient id="gm-g-glove" cx=".32" cy=".3" r=".8">
          <stop offset="0" stopColor="#ff9ccb" />
          <stop offset=".45" stopColor="#f2448f" />
          <stop offset="1" stopColor="#9c124f" />
        </radialGradient>
        <linearGradient id="gm-g-bolt" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff7b8" />
          <stop offset=".45" stopColor="#ffd21f" />
          <stop offset="1" stopColor="#f29a00" />
        </linearGradient>
        <radialGradient id="gm-g-flash" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#fff0f5" stopOpacity=".7" />
          <stop offset=".5" stopColor="#ff4f7d" stopOpacity=".38" />
          <stop offset="1" stopColor="#ff4f7d" stopOpacity=".08" />
        </radialGradient>
        <linearGradient id="gm-g-chrome" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e9e6f2" />
          <stop offset=".45" stopColor="#8d88a0" />
          <stop offset=".55" stopColor="#4a465a" />
          <stop offset="1" stopColor="#a7a2b8" />
        </linearGradient>

        {/* A basketball, as in Hoop Quest: red-orange, gold seams. */}
        <symbol id="gm-s-bball" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="14" fill="url(#gm-g-ball)" />
          <g fill="none" stroke="#f2c46b" strokeWidth="1.25" strokeLinecap="round" opacity=".9">
            <path d="M15 1.2v27.6M1.2 15h27.6M5.6 4.9c4.3 3.8 4.3 16.4 0 20.2M24.4 4.9c-4.3 3.8-4.3 16.4 0 20.2" />
          </g>
          <circle cx="15" cy="15" r="13.6" fill="none" stroke="#5a200c" strokeWidth=".9" />
          <ellipse cx="10" cy="8.4" rx="5" ry="2.8" fill="#fff" opacity=".2" transform="rotate(-32 10 8.4)" />
        </symbol>

        {/* A dust bunny: grey fluff, tall ears, worried eyes. */}
        <symbol id="gm-s-bunny" viewBox="0 0 60 64">
          <g transform="rotate(-16 21 22)">
            <ellipse cx="21" cy="17" rx="7" ry="15" fill="#9c958d" stroke="#5f5850" strokeWidth="1.2" />
            <ellipse cx="21" cy="18" rx="3.4" ry="10" fill="#e6a2a6" />
          </g>
          <g transform="rotate(16 39 22)">
            <ellipse cx="39" cy="17" rx="7" ry="15" fill="#9c958d" stroke="#5f5850" strokeWidth="1.2" />
            <ellipse cx="39" cy="18" rx="3.4" ry="10" fill="#e6a2a6" />
          </g>
          <path d={BUNNY_BODY} fill="url(#gm-g-fluff)" stroke="#5f5850" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="23" cy="39" rx="5.6" ry="6.6" fill="#fff" stroke="#2a221c" strokeWidth="1" />
          <ellipse cx="37" cy="39" rx="5.6" ry="6.6" fill="#fff" stroke="#2a221c" strokeWidth="1" />
          <circle cx="24.2" cy="40.2" r="2.7" fill="#1a120b" />
          <circle cx="35.8" cy="40.2" r="2.7" fill="#1a120b" />
          <circle cx="25" cy="39.2" r=".9" fill="#fff" />
          <circle cx="36.6" cy="39.2" r=".9" fill="#fff" />
          <path d="M18.5 31.5l7 1.6M41.5 31.5l-7 1.6" stroke="#3a312a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M26.5 49.5q3.5 2.6 7 0" fill="none" stroke="#3a312a" strokeWidth="1.4" strokeLinecap="round" />
        </symbol>
        <symbol id="gm-s-bunny-gold" viewBox="0 0 60 64">
          <g transform="rotate(-16 21 22)">
            <ellipse cx="21" cy="17" rx="7" ry="15" fill="#e0a838" stroke="#8a5a10" strokeWidth="1.2" />
            <ellipse cx="21" cy="18" rx="3.4" ry="10" fill="#f6c6a0" />
          </g>
          <g transform="rotate(16 39 22)">
            <ellipse cx="39" cy="17" rx="7" ry="15" fill="#e0a838" stroke="#8a5a10" strokeWidth="1.2" />
            <ellipse cx="39" cy="18" rx="3.4" ry="10" fill="#f6c6a0" />
          </g>
          <path d={BUNNY_BODY} fill="url(#gm-g-fluff-gold)" stroke="#8a5a10" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="23" cy="39" rx="5.6" ry="6.6" fill="#fff" stroke="#3a2a10" strokeWidth="1" />
          <ellipse cx="37" cy="39" rx="5.6" ry="6.6" fill="#fff" stroke="#3a2a10" strokeWidth="1" />
          <circle cx="24.2" cy="40.2" r="2.7" fill="#1a120b" />
          <circle cx="35.8" cy="40.2" r="2.7" fill="#1a120b" />
          <circle cx="25" cy="39.2" r=".9" fill="#fff" />
          <circle cx="36.6" cy="39.2" r=".9" fill="#fff" />
          <path d="M26 48.5q4 3.2 8 0" fill="none" stroke="#3a2a10" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M10 22l2.2 1.2L14 21l-.4 2.5 2 1.6-2.5.3L12 28l-.9-2.4-2.5-.4 1.9-1.6Z" fill="#fff6c8" />
        </symbol>

        {/* A carnival milk bottle: cream glass, a red band, a white star. */}
        <symbol id="gm-s-milk" viewBox="0 0 20 30">
          <path d="M7 3.4h6v2.4c0 2.2 5 3 5 7.6v13c0 1.7-1.3 3-3 3H5c-1.7 0-3-1.3-3-3v-13c0-4.6 5-5.4 5-7.6Z" fill="url(#gm-g-milk)" stroke="#9c8c6c" strokeWidth=".8" />
          <rect x="6.4" y="1" width="7.2" height="3" rx="1" fill="#b8321f" />
          <rect x="2" y="15.4" width="16" height="6.4" fill="#b8321f" />
          <path d="M10 16.4l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3Z" fill="#fff6e4" />
          <rect x="4.2" y="10.6" width="1.8" height="15" rx=".9" fill="#fff" opacity=".55" />
        </symbol>

        {/* A glass bottle for the ring rack; its colour is currentColor. */}
        <symbol id="gm-s-bottle" viewBox="0 0 16 44">
          <path d="M5.6 1.5h4.8v1.8h-.6v8.4c0 2 5.6 3.6 5.6 8.6V41c0 1.4-1.1 2.5-2.5 2.5h-9.8C1.7 43.5.6 42.4.6 41V20.3c0-5 5.6-6.6 5.6-8.6V3.3h-.6Z" fill="currentColor" stroke="rgba(0,0,0,.45)" strokeWidth=".8" />
          <path d="M5.6 1.5h4.8v1.8H5.6Z" fill="#fff" opacity=".45" />
          <path d="M3 21.5c0-3.3 2.6-4.6 3.6-5.4V38.5c0 1-1.6 1-1.6 0V22c0-.4-1 .2-2-.5Z" fill="#fff" opacity=".42" />
          <rect x="11.6" y="24" width="1.4" height="14" rx=".7" fill="#000" opacity=".22" />
        </symbol>

        {/* Kid Volt's glove: hot pink leather, a white cuff, fist to the left. */}
        <symbol id="gm-s-glove" viewBox="0 0 92 70">
          <path d="M35 5C16 5 3 18 3 35.5S16 66 34 66h27c4 0 6.5-3 6.5-7V12c0-4-2.5-7-6.5-7Z" fill="url(#gm-g-glove)" stroke="#6e0b37" strokeWidth="2" />
          <path d="M12 47c6-9 23-11 38-5 5 2 5 9-1 10.4-11 2.4-24 3-33 2-6-.6-8.4-3.4-4-7.4Z" fill="#f45a9c" stroke="#6e0b37" strokeWidth="1.6" />
          <path d="M16 24c4-9 14-13 24-12" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity=".38" />
          <path d="M40 9.5c1.6 7 1.6 18 0 25" fill="none" stroke="#6e0b37" strokeWidth="1.3" opacity=".55" />
          <path d="M63 8h21c3.6 0 6 2.4 6 6v42c0 3.6-2.4 6-6 6H63Z" fill="#fff3f8" stroke="#6e0b37" strokeWidth="2" />
          <rect x="63" y="27" width="27" height="10" fill="#ff4f9a" />
          <path d="M79 14l-6 12h5l-3 10 8-13h-5l3-9Z" fill="#ffd21f" stroke="#6e0b37" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M67 44h19M67 50h19M67 56h19" stroke="#d9b3c6" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>

        {/* Kid Volt's bolt. */}
        <symbol id="gm-s-bolt" viewBox="0 0 60 100">
          <path d="M37 2 8 57h21L18 98l35-62H32L46 2Z" fill="url(#gm-g-bolt)" stroke="#7a4a00" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M37.5 8 15.5 52h17L26 82" fill="none" stroke="#fffbe0" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" opacity=".85" />
        </symbol>

        {/* A baseball for the milk-bottle booth. */}
        <symbol id="gm-s-baseball" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="9.2" fill="#fbf4e4" stroke="#9c8c6c" strokeWidth=".8" />
          <path d="M4.6 3.4c2.6 3.4 2.6 9.8 0 13.2M15.4 3.4c-2.6 3.4-2.6 9.8 0 13.2" fill="none" stroke="#c0392b" strokeWidth="1.1" strokeDasharray="1.4 1.1" />
          <ellipse cx="7" cy="6" rx="3" ry="1.8" fill="#fff" opacity=".7" transform="rotate(-30 7 6)" />
        </symbol>
      </defs>
    </svg>
  );
}
