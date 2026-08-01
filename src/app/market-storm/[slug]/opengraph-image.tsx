import { ImageResponse } from 'next/og';
import { getReportBySlug } from '@/data/marketStorm';

// Per-report social card (Open Graph + Twitter), generated at build time via
// Satori — no static image file to maintain. Warm-dark brand palette to match
// the site's [data-theme='dark'] tokens. Centered with a generous safe margin
// because social clients (esp. LinkedIn mobile) crop the card's sides.
export const alt = 'Market Storm — AI-market research by a multi-agent method';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#191512';
const TEXT = '#f3eee4';
const MUTED = '#b1a798';
const ACCENT = '#f2793f';

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
        fontFamily: 'Georgia, serif',
      }}
    >
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
            fontSize: '104px',
            fontWeight: 700,
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
            fontSize: '40px',
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.24,
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
    { ...size }
  );
}
