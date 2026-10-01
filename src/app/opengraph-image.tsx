import { ImageResponse } from 'next/og';
import { GLYPHS } from '@/components/brand/glyphs';
import { pagoda, torii, town } from '@/components/brand/scenery';
import { CARD_FONTS, DISPLAY, SANS, NIGHT as N, display } from '@/fonts/card-fonts';

// Site-wide default social preview card (Open Graph + Twitter). Applies to every
// route that doesn't set its own image — so any smartdisruptions.com link shared
// to LinkedIn/X/Slack renders a branded card instead of a bare URL.
//
// Shadow Dojo at night: the moon, the rooftops, Kiru's head beside the
// wordmark the way the top bar sets them, and one vermilion stroke. Everything
// is drawn — no image requests, the same rule the site keeps.
//
// Layout is CENTERED with a generous safe margin: social clients (esp. LinkedIn
// on mobile) crop the sides of the card, so everything that carries words stays
// centred and away from the edges. Only scenery reaches the sides.
export const alt = 'SmartDisruptions — building real things with AI, in public';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const W = 1200;
const SKY_H = 168;

/**
 * Kiru's head — the same mark as components/brand/KiruMark.tsx (the logo, the
 * favicon, the app icon), redrawn here because Satori can only render plain
 * SVG elements. At night the hood takes his ink outline and the moonlight rim
 * from the full rig, or the indigo hood sinks into the indigo sky.
 */
function KiruHead({ px }: { px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 64 64">
      <path
        d="M47 23c7-4 11-2 15-6-1 6-6 9-12 9 5 1 8 4 12 3-4 4-10 4-15 1z"
        fill="#bd3019"
        stroke={N.kiruLine}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <ellipse cx="31" cy="34" rx="26" ry="24" fill={N.kiruLine} />
      <ellipse cx="31" cy="34" rx="24.6" ry="22.6" fill="#252d56" />
      <path d="M12.4 19.4 Q7.5 26 6.8 35.8" stroke="#a9bcff" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M6.4 30 Q31 14.6 55.6 30" stroke="#e8432a" strokeWidth="7" fill="none" />
      <rect x="25" y="17.5" width="12" height="7" rx="1.6" fill="#cfd5e2" />
      <path d="M32.4 18.6 29 21.7h2.3l-1.4 1.9 3.8-3.2h-2.3z" fill="#e8432a" />
      <path
        d="M12 33c9-4.6 29-4.6 38 0 3.2 1.6 3.2 7.6 0 9.2-9 4.6-29 4.6-38 0-3.2-1.6-3.2-7.6 0-9.2Z"
        fill="#f6d0a8"
      />
      <ellipse cx="23.5" cy="37.6" rx="4" ry="4.6" fill="#fff" />
      <ellipse cx="38.5" cy="37.6" rx="4" ry="4.6" fill="#fff" />
      <circle cx="24.3" cy="38.3" r="2.6" fill="#13152a" />
      <circle cx="39.3" cy="38.3" r="2.6" fill="#13152a" />
      <circle cx="25.2" cy="37.2" r="0.9" fill="#fff" />
      <circle cx="40.2" cy="37.2" r="0.9" fill="#fff" />
      <path
        d="M18.5 31.6l8 2M43.5 31.6l-8 2"
        stroke="#13152a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The vermilion brush stroke from `.sd-brush-under`, as a shape. */
function Brush({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 14" preserveAspectRatio="none">
      <path
        d="M2 9.5C14 5 30 3.2 52 3.6 76 4 98 5.4 118 3c-6 4.8-24 7.8-48 8.4C44 12 20 12.5 2 9.5z"
        fill={N.pen}
      />
    </svg>
  );
}

/** A hanko: the vermilion seal with 忍 pressed into it (`.sd-seal`). */
function Seal({ px }: { px: number }) {
  return (
    <div
      style={{
        width: px,
        height: px,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: N.pen,
        borderRadius: Math.round(px * 0.22),
        boxShadow: `0 10px 26px -10px rgba(255, 91, 61, 0.7), inset 0 0 0 2px rgba(255, 255, 255, 0.22)`,
      }}
    >
      <svg width={Math.round(px * 0.74)} height={Math.round(px * 0.74)} viewBox="0 0 1000 1000">
        <path d={GLYPHS.brush['忍'].d} fill="#fff" />
      </svg>
    </div>
  );
}

/**
 * スマートディスラプションズ, top to bottom in the gothic face — the vertical
 * katakana tag from the site's headers. Baked paths, not a font.
 */
function KatakanaTag({ px, color }: { px: number; color: string }) {
  const chars = [...'スマートディスラプションズ'];
  const step = 1080;
  return (
    <svg
      width={px}
      height={Math.round((px * step * chars.length) / 1000)}
      viewBox={`0 0 1000 ${step * chars.length}`}
    >
      {chars.map((ch, i) => (
        <path
          key={i}
          d={GLYPHS.gothic[ch].d}
          fill={color}
          transform={`translate(0 ${i * step})${ch === 'ー' ? ' rotate(90 500 500)' : ''}`}
        />
      ))}
    </svg>
  );
}

/** A few stars, placed by hand so none sits behind a word. */
const STARS: [number, number, number, number][] = [
  [178, 70, 2, 0.7],
  [262, 128, 1.5, 0.45],
  [330, 52, 1.5, 0.5],
  [884, 60, 2, 0.6],
  [948, 150, 1.5, 0.4],
  [1132, 196, 2, 0.55],
  [1150, 300, 1.5, 0.35],
  [118, 268, 1.5, 0.4],
  [1084, 392, 2, 0.45],
  [196, 420, 1.5, 0.35],
];

/** The rooftops from the site's Skyline, in its night colours. */
function Rooftops() {
  const H = SKY_H;
  const far = `M0 ${H} L0 92 C100 70 175 54 275 68 C358 80 417 46 508 50 C600 55 658 86 750 75 C842 64 900 40 1000 49 C1083 57 1150 74 ${W} 66 L${W} ${H} Z`;
  const mid = `${pagoda(1040, H - 44, 5, 112, 24)} ${torii(150, H - 38, 78, 58)} M0 ${H} L0 ${H - 42} C170 ${H - 50} 350 ${H - 38} 584 ${H - 45} C816 ${H - 52} 1000 ${H - 40} ${W} ${H - 46} L${W} ${H} Z`;
  const near = town(W, H, 11, 64, 70);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={far} fill="#1c2350" />
      <path d={mid} fill="#131939" />
      <path d={near.roofs} fill="#05070e" />
      {near.windows.map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y} width="8" height="10" rx="1.5" fill={N.gold} opacity="0.85" />
      ))}
    </svg>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: N.bg,
        // Moonlight falls from the top right, as it does on the site's body.
        backgroundImage:
          'radial-gradient(circle at 84% 4%, rgba(155, 176, 255, 0.26) 0%, rgba(155, 176, 255, 0.08) 34%, rgba(9, 11, 22, 0) 62%)',
        fontFamily: SANS,
        color: N.text,
      }}
    >
      {STARS.map(([x, y, r, o], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x - r,
            top: y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            backgroundColor: N.moon,
            opacity: o,
            display: 'flex',
          }}
        />
      ))}

      {/* The moon, and its halo. */}
      <div
        style={{
          position: 'absolute',
          left: 1022,
          top: 38,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: N.moon,
          backgroundImage:
            'radial-gradient(circle at 38% 36%, #fffaf0 0%, #fff3d6 55%, #f1e3c0 100%)',
          boxShadow: '0 0 70px 26px rgba(255, 243, 214, 0.16)',
          display: 'flex',
        }}
      />

      {/* The vertical katakana tag, down the left margin. */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', opacity: 0.55 }}>
          <KatakanaTag px={24} color={N.muted} />
        </div>
        {/* The seal closes the column, the way a name is signed. */}
        <div style={{ display: 'flex', marginTop: 16 }}>
          <Seal px={44} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 630 - SKY_H, display: 'flex' }}>
        <Rooftops />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 96,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '0.16em',
          color: N.muted,
        }}
      >
        <div
          style={{
            width: 11,
            height: 11,
            backgroundColor: N.pen,
            borderRadius: 1,
            transform: 'rotate(45deg)',
            marginRight: 16,
            display: 'flex',
          }}
        />
        SMARTDISRUPTIONS.COM
      </div>

      {/* The lockup: Kiru's head beside the wordmark, as in the top bar. */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 30 }}>
        <KiruHead px={118} />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 26 }}>
          <div
            style={{
              display: 'flex',
              fontFamily: DISPLAY,
              fontSize: display(76),
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: N.text,
            }}
          >
            Smart Disruptions
          </div>
          <div style={{ display: 'flex', marginTop: 6, marginLeft: -4 }}>
            <Brush width={560} height={24} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 34,
          fontSize: 38,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: N.text,
          lineHeight: 1.25,
        }}
      >
        Building real things with AI, in public.
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 12,
          fontSize: 25,
          fontWeight: 500,
          color: N.muted,
          lineHeight: 1.3,
        }}
      >
        Honest breakdowns for people who feel behind on AI.
      </div>

    </div>,
    {
      ...size,
      fonts: CARD_FONTS,
    }
  );
}
