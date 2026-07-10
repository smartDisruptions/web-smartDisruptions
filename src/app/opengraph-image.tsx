import { ImageResponse } from 'next/og';

// Site-wide default social preview card (Open Graph + Twitter). Applies to every
// route that doesn't set its own image — so any smartdisruptions.com link shared
// to LinkedIn/X/Slack renders a branded card instead of a bare URL.
export const alt = 'SmartDisruptions — building real things with AI, in public';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Warm-dark brand palette (matches the site's [data-theme='dark'] --sd-* tokens).
const BG = '#191512';
const TEXT = '#f3eee4';
const MUTED = '#b1a798';
const ACCENT = '#f2793f';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BG,
          padding: '80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top: domain tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              backgroundColor: ACCENT,
              display: 'flex',
            }}
          />
          <div style={{ display: 'flex', fontSize: '30px', color: MUTED, letterSpacing: '0.04em' }}>
            smartdisruptions.com
          </div>
        </div>

        {/* Middle: wordmark + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '96px',
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            Smart Disruptions
          </div>
          <div style={{ display: 'flex', width: '160px', height: '8px', backgroundColor: ACCENT, marginTop: '32px', borderRadius: '4px' }} />
          <div style={{ display: 'flex', fontSize: '42px', color: MUTED, marginTop: '32px', lineHeight: 1.3 }}>
            Building real things with AI, in public.
          </div>
        </div>

        {/* Bottom: audience line */}
        <div style={{ display: 'flex', fontSize: '28px', color: MUTED }}>
          Honest breakdowns for people who feel behind on AI.
        </div>
      </div>
    ),
    { ...size },
  );
}
