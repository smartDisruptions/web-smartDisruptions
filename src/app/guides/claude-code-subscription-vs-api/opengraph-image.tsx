import { ImageResponse } from 'next/og';
import { GLYPHS } from '@/components/brand/glyphs';
import {
  CARD_FONTS,
  DISPLAY,
  SANS,
  NIGHT as N,
  display,
} from '@/fonts/card-fonts';

// The guide's social card, built at deploy time. The page's own two tones
// carry it: arcade blue for the plan, gold for the per-use meter, with 岐
// (a fork in the road) brushed behind. Words stay inside a wide margin
// because LinkedIn crops the sides.
export const alt =
  'Claude Code subscription vs API credits: most games never need the API. Your plan pays when Claude builds your game; the API only pays when Claude is inside the finished game.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PLAN = '#60a5fa';
const API = N.gold;

function Lane({
  when,
  then,
  color,
}: {
  when: string;
  then: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '22px 26px',
        borderRadius: 18,
        backgroundColor: N.surface,
        borderTop: `6px solid ${color}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          fontWeight: 700,
          color: N.muted,
        }}
      >
        {when}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 8,
          fontFamily: DISPLAY,
          fontSize: display(40),
          color,
        }}
      >
        {then}
      </div>
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 84px',
        backgroundColor: N.bg,
        fontFamily: SANS,
        position: 'relative',
      }}
    >
      <svg
        width={520}
        height={520}
        viewBox="0 0 1000 1000"
        style={{ position: 'absolute', right: -60, top: -40, opacity: 0.16 }}
      >
        <path d={GLYPHS.brush['岐'].d} fill={N.pen} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 21,
            fontWeight: 800,
            letterSpacing: '0.16em',
            color: N.muted,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 10,
              height: 10,
              backgroundColor: N.pen,
              transform: 'rotate(45deg)',
              marginRight: 14,
            }}
          />
          FIELD GUIDE · SMART DISRUPTIONS
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: 22,
            fontFamily: DISPLAY,
            fontSize: display(58),
            lineHeight: 1.08,
            color: N.text,
            maxWidth: 960,
          }}
        >
          Claude Code subscription vs API credits
        </div>
      </div>
      <div style={{ display: 'flex', gap: 22 }}>
        <Lane
          when="Almost always: Claude helps you build"
          then="A monthly plan covers it"
          color={PLAN}
        />
        <Lane
          when="Only if Claude is inside the game"
          then="You pay per use"
          color={API}
        />
      </div>
    </div>,
    { ...size, fonts: CARD_FONTS }
  );
}
