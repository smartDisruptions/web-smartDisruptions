import { ImageResponse } from 'next/og';

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
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          backgroundColor: BG,
          padding: '110px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '26px',
            color: MUTED,
            letterSpacing: '0.12em',
            marginBottom: '30px',
          }}
        >
          SMARTDISRUPTIONS.COM
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '82px',
            fontWeight: 600,
            color: TEXT,
            letterSpacing: '-0.02em',
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
            marginTop: '34px',
            marginBottom: '34px',
          }}
        />

        <div style={{ display: 'flex', fontSize: '38px', color: TEXT, lineHeight: 1.3 }}>
          Building real things with AI, in public.
        </div>

        <div style={{ display: 'flex', fontSize: '25px', color: MUTED, marginTop: '18px', lineHeight: 1.3 }}>
          Honest breakdowns for people who feel behind on AI.
        </div>
      </div>
    ),
    { ...size },
  );
}
