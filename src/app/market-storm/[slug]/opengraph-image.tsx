import { ImageResponse } from 'next/og';
import { GLYPHS } from '@/components/brand/glyphs';
import { cardKpis, getReportBySlug, type Kpi } from '@/data/marketStorm';
import { CARD_FONTS, DISPLAY, SANS, NIGHT as N, display } from '@/fonts/card-fonts';

// Per-report social card (Open Graph + Twitter), generated at build time via
// Satori — no static image file to maintain. Shadow Dojo's storm: a deeper
// indigo than the rest of the site's night, the 嵐 (storm) kanji brushed
// behind it, and the report's own headline figures in the semantic inks
// (bull / bear / warn) the report page uses — the card is a promise about the
// page it opens, so it is built out of that page's parts.
//
// Words stay inside a generous margin because social clients (esp. LinkedIn
// mobile) crop the card's sides; only the brushed kanji runs off the edge.
export const alt = 'Market Storm — AI-market research by a multi-agent method';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Storm indigo: the night ground, pushed toward ai-iro. */
const STORM = '#0b1029';
const STORM_PANEL = 'rgba(23, 31, 70, 0.72)';

/** Text inks only — every one clears AA on the storm ground. */
const INK: Record<NonNullable<Kpi['tone']>, string> = {
  bull: N.bull,
  bear: N.bear,
  warn: N.warn,
  neutral: N.text,
};

/**
 * A title runs from one short line to a 160-character sentence. Step the
 * size down so the longest still lands in four lines above the figures,
 * instead of letting it push them off the card.
 */
function titleSize(title: string) {
  const n = title.length;
  if (n <= 60) return display(50);
  if (n <= 90) return display(44);
  if (n <= 125) return display(38);
  return display(34);
}

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

function Kicker({ children, color }: { children: string; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 21,
        fontWeight: 800,
        letterSpacing: '0.16em',
        color,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          backgroundColor: N.pen,
          borderRadius: 1,
          transform: 'rotate(45deg)',
          marginRight: 14,
          display: 'flex',
        }}
      />
      {children}
    </div>
  );
}

/** The report's first three headline figures, inked by their polarity. */
function Figures({ kpis }: { kpis: Kpi[] }) {
  const shown = kpis.slice(0, 3);
  if (!shown.length) return null;
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: STORM_PANEL,
        border: `1px solid ${N.rule}`,
        borderRadius: 16,
      }}
    >
      {shown.map((kpi, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 24px 18px',
            borderLeft: i ? `1px solid ${N.rule}` : 'none',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: N.muted,
              lineHeight: 1.3,
            }}
          >
            {kpi.label}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 8,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              color: INK[kpi.tone ?? 'neutral'],
            }}
          >
            {kpi.value}
          </div>
        </div>
      ))}
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
  // A dash belongs to the clause before it: a non-breaking space keeps the
  // balanced wrap from opening a line with one.
  const headline = (
    report?.title ?? 'The AI market, read by a research method'
  ).replace(/ — /g, '\u00a0— ');
  const catalyst = report?.catalyst ?? 'A multi-agent AI research method';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: STORM,
        backgroundImage:
          'radial-gradient(circle at 86% 0%, rgba(155, 176, 255, 0.24) 0%, rgba(155, 176, 255, 0.07) 36%, rgba(11, 16, 41, 0) 64%)',
        padding: '54px 74px 50px',
        position: 'relative',
        fontFamily: SANS,
        color: N.text,
      }}
    >
      {/* 嵐 — storm — brushed large behind everything, in moonlight rather than
          vermilion: at night a red watermark muddies to brown behind the title. */}
      <div
        style={{
          position: 'absolute',
          right: 52,
          top: 44,
          display: 'flex',
          opacity: 0.09,
        }}
      >
        <svg width={400} height={400} viewBox="0 0 1000 1000">
          <path d={GLYPHS.brush['嵐'].d} fill={N.accent} />
        </svg>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Kicker color={N.accent}>MARKET STORM</Kicker>
        <div
          style={{
            display: 'flex',
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: N.muted,
          }}
        >
          SMARTDISRUPTIONS.COM
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontFamily: DISPLAY,
            fontSize: display(ticker.length > 6 ? 84 : 100),
            lineHeight: 1,
            letterSpacing: '0.01em',
            color: N.text,
          }}
        >
          {ticker}
        </div>
        <div style={{ display: 'flex', marginTop: 10, marginLeft: -4 }}>
          <Brush width={230} height={20} />
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 22,
            fontFamily: DISPLAY,
            fontSize: titleSize(headline),
            lineHeight: 1.16,
            letterSpacing: '-0.005em',
            color: N.text,
            maxWidth: 1052,
            textWrap: 'balance',
          }}
        >
          {headline}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {report ? <Figures kpis={cardKpis(report)} /> : null}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 20,
            fontSize: 20,
            fontWeight: 500,
            color: N.muted,
            lineHeight: 1.35,
          }}
        >
          <div style={{ display: 'flex', maxWidth: 700 }}>{catalyst}</div>
          <div style={{ display: 'flex', flexShrink: 0, marginLeft: 24 }}>
            Multi-agent research · verified
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: CARD_FONTS,
    }
  );
}
