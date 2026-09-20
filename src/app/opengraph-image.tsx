import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Notebook palette — the dark side of the `--sd-*` tokens in globals.css.
const BG = '#13151a';
const GRID = '#222733';
const TEXT = '#ebe7de';
const MUTED = '#a3a6b2';
const ACCENT = '#93b4ff';

/**
 * Caveat and Nunito as TTFs, because Satori cannot read woff2. Both are
 * registered below: with only one face loaded, Satori falls back to it for
 * every element, and the whole card came out in handwriting.
 */
const caveat = readFileSync(
  path.join(process.cwd(), 'src/fonts/caveat-700.ttf')
);
const nunito400 = readFileSync(
  path.join(process.cwd(), 'src/fonts/nunito-400.ttf')
);
const nunito800 = readFileSync(
  path.join(process.cwd(), 'src/fonts/nunito-800.ttf')
);

const CARD_FONTS = [
  {
    name: 'Caveat',
    data: caveat,
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'Nunito',
    data: nunito400,
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Nunito',
    data: nunito800,
    weight: 800 as const,
    style: 'normal' as const,
  },
];

/**
 * The graph-paper ground, drawn as elements: Satori has no repeating
 * backgrounds. The wrapper carries explicit left/top/width/height — `inset: 0`
 * alone left it unsized, and the lines were laid out from the parent's flex
 * centre, so the grid drew across one corner of the card.
 */
function GraphPaper() {
  const lines = [];
  for (let x = 24; x < 1200; x += 24) {
    lines.push(
      <div
        key={`v${x}`}
        style={{
          position: 'absolute',
          left: x,
          top: 0,
          width: 1,
          height: 630,
          backgroundColor: GRID,
        }}
      />
    );
  }
  for (let y = 24; y < 630; y += 24) {
    lines.push(
      <div
        key={`h${y}`}
        style={{
          position: 'absolute',
          left: 0,
          top: y,
          width: 1200,
          height: 1,
          backgroundColor: GRID,
        }}
      />
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1200,
        height: 630,
        display: 'flex',
      }}
    >
      {lines}
    </div>
  );
}

// Site-wide default social preview card (Open Graph + Twitter). Applies to every
// route that doesn't set its own image — so any smartdisruptions.com link shared
// to LinkedIn/X/Slack renders a branded card instead of a bare URL.
//
// Layout is CENTERED with a generous safe margin: social clients (esp. LinkedIn
// on mobile) crop the sides of the card, so keeping everything centered and away
// from the edges means no crop clips the wordmark or text.
export const alt = 'SmartDisruptions — building real things with AI, in public';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: BG,
        padding: '110px',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <GraphPaper />

      <div
        style={{
          display: 'flex',
          fontSize: '26px',
          color: MUTED,
          letterSpacing: '0.12em',
          marginBottom: '26px',
        }}
      >
        SMARTDISRUPTIONS.COM
      </div>

      <div
        style={{
          display: 'flex',
          fontFamily: 'Caveat, cursive',
          fontSize: '116px',
          color: TEXT,
          lineHeight: 1.05,
        }}
      >
        Smart Disruptions
      </div>

      <div
        style={{
          display: 'flex',
          width: '120px',
          height: '7px',
          backgroundColor: ACCENT,
          borderRadius: '4px',
          marginTop: '30px',
          marginBottom: '30px',
        }}
      />

      <div
        style={{
          display: 'flex',
          fontSize: '38px',
          color: TEXT,
          lineHeight: 1.3,
        }}
      >
        Building real things with AI, in public.
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '25px',
          color: MUTED,
          marginTop: '18px',
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
