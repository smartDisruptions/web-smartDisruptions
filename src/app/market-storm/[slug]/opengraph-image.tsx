import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getReportBySlug } from '@/data/marketStorm';

// Per-report social card (Open Graph + Twitter), generated at build time via
// Satori — no static image file to maintain. Notebook palette to match the
// site's [data-theme='dark'] tokens. Centered with a generous safe margin
// because social clients (esp. LinkedIn mobile) crop the card's sides.
export const alt = 'Market Storm — AI-market research by a multi-agent method';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  const ticker = report?.ticker ?? 'MARKET STORM';
  const headline = report?.title ?? 'The AI market, read by a research method';
  const catalyst = report?.catalyst ?? 'A multi-agent AI research method';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BG,
        padding: '80px 90px',
        position: 'relative',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <GraphPaper />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '24px',
          letterSpacing: '0.14em',
          color: MUTED,
        }}
      >
        <span style={{ display: 'flex', color: ACCENT }}>MARKET STORM</span>
        <span style={{ display: 'flex' }}>SMARTDISRUPTIONS.COM</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Caveat, cursive',
            fontSize: '128px',
            color: ACCENT,
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          {ticker}
        </div>
        <div
          style={{
            display: 'flex',
            width: '110px',
            height: '6px',
            backgroundColor: ACCENT,
            borderRadius: '4px',
            margin: '30px 0',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontFamily: 'Caveat, cursive',
            fontSize: '58px',
            color: TEXT,
            lineHeight: 1.16,
            maxWidth: '1000px',
          }}
        >
          {headline}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '24px',
          color: MUTED,
        }}
      >
        <span style={{ display: 'flex' }}>{catalyst}</span>
        <span style={{ display: 'flex' }}>Multi-agent research · verified</span>
      </div>
    </div>,
    {
      ...size,
      fonts: CARD_FONTS,
    }
  );
}
