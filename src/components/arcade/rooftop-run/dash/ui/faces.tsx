/**
 * Difficulty faces, Geometry Dash style, but Kiru's: the same hood, plate,
 * headband and face opening as the mascot rig (components/kiru/Kiru.tsx),
 * in the rig's own coordinates, with the expression doing the work. Five
 * are Kiru, from a smile to fiery eyes; the sixth, demon, is an oni mask in
 * vermilion. The headband takes the player's chosen colour, so the Gear
 * screen uses the same head as its preview.
 *
 * Mouths are drawn on the mask cloth, the way a face shows through a ninja's
 * hood. Every face is decorative: the difficulty is always written beside it.
 */
import { useId } from 'react';
import type { Difficulty } from '../types';

const LINE = '#3d4c95';
const SKIN = '#f6d0a8';
const SKIN_SHADE = '#e2b083';
const INK = '#13152a';
const STEEL = '#cfd5e2';
const STEEL_EDGE = '#8d95ab';
const RED = '#e8432a';
const RED_DARK = '#bd3019';
const MASK = '#6573c2';
const VIEW = '12 2 176 176';

const HOOD = 'M26 90a74 66 0 1 0 148 0a74 66 0 1 0 -148 0Z';
const FACE =
  'M44 80 C70 68 130 68 156 80 C168 85 168 104 156 109 C130 121 70 121 44 109 C32 104 32 85 44 80 Z';
const FACE_SHADE =
  'M44 80 C70 68 130 68 156 80 C160 82 162 85 163 88 C130 77 70 77 37 88 C38 85 40 82 44 80 Z';
const BOLT =
  'M103.5 46.5 L94 55.5 L100.5 55.5 L96.5 60.5 L107 51.5 L100.5 51.5 Z';

/** The headband's shadow side: the colour at 78%. */
function darker(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) =>
    Math.round(((n >> s) & 255) * 0.78)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

export type KiruMood = 'smile' | 'determined' | 'frown' | 'angry' | 'fiery';

const stroke = (w: number, color = INK) =>
  ({
    fill: 'none',
    stroke: color,
    strokeWidth: w,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }) as const;

function Expression({ mood }: { mood: KiruMood }) {
  switch (mood) {
    case 'smile':
      return (
        <>
          <g {...stroke(6)}>
            <path d="M64 99 Q76 84 88 99" />
            <path d="M112 99 Q124 84 136 99" />
          </g>
          <g {...stroke(4.5)}>
            <path d="M63 76 Q75 71 87 76" />
            <path d="M113 76 Q125 71 137 76" />
          </g>
          <g fill="#f08a78" opacity="0.8">
            <ellipse cx="56" cy="107" rx="9" ry="4.5" />
            <ellipse cx="144" cy="107" rx="9" ry="4.5" />
          </g>
          <path d="M84 128 Q100 143 116 128" {...stroke(5.5, MASK)} />
        </>
      );
    case 'determined':
      return (
        <>
          <g fill="#fff">
            <ellipse cx="76" cy="98" rx="12.5" ry="11.5" />
            <ellipse cx="124" cy="98" rx="12.5" ry="11.5" />
          </g>
          <g fill={INK}>
            <circle cx="78" cy="99" r="8" />
            <circle cx="126" cy="99" r="8" />
          </g>
          <g fill="#fff">
            <circle cx="81" cy="95.5" r="3" />
            <circle cx="129" cy="95.5" r="3" />
          </g>
          <g {...stroke(5.5)}>
            <path d="M60 79 L89 88" />
            <path d="M111 88 L140 79" />
          </g>
          <path d="M89 133 H111" {...stroke(5.5, MASK)} />
        </>
      );
    case 'frown':
      return (
        <>
          <g fill="#fff">
            <ellipse cx="76" cy="100" rx="12.5" ry="10" />
            <ellipse cx="124" cy="100" rx="12.5" ry="10" />
          </g>
          <g fill={INK}>
            <circle cx="77" cy="102" r="7.2" />
            <circle cx="123" cy="102" r="7.2" />
          </g>
          <g fill="#fff">
            <circle cx="80" cy="99" r="2.6" />
            <circle cx="126" cy="99" r="2.6" />
          </g>
          <g {...stroke(6)}>
            <path d="M59 82 Q76 81 90 92" />
            <path d="M110 92 Q124 81 141 82" />
          </g>
          <path d="M100 79 V86" {...stroke(2.6, '#c98f65')} />
          <path d="M85 139 Q100 127 115 139" {...stroke(5.5, MASK)} />
        </>
      );
    case 'angry':
      return (
        <>
          <g fill="#fff">
            <path d="M62 94 L90 103 Q89 111 77 111 Q63 111 62 99 Z" />
            <path d="M138 94 L110 103 Q111 111 123 111 Q137 111 138 99 Z" />
          </g>
          <g fill={INK}>
            <circle cx="79" cy="105" r="5.2" />
            <circle cx="121" cy="105" r="5.2" />
          </g>
          <g {...stroke(7.5)}>
            <path d="M56 82 L91 97" />
            <path d="M109 97 L144 82" />
          </g>
          <path
            d="M82 135 l6 -5.5 6 5.5 6 -5.5 6 5.5 6 -5.5 6 5.5"
            {...stroke(4.8, MASK)}
          />
          {/* The sweat drop. */}
          <path
            d="M158 12 C150 27 144 36 146 44 C148 53 160 55 165 48 C169 42 167 33 158 12 Z"
            fill="#9fe0ff"
            stroke={LINE}
            strokeWidth="3.5"
            paintOrder="stroke"
          />
          <path d="M152 41 Q152.5 35 156 30" {...stroke(3, '#ffffff')} />
        </>
      );
    case 'fiery':
      return (
        <>
          <g {...stroke(5.5)}>
            <path d="M57 79 L90 91" />
            <path d="M110 91 L143 79" />
          </g>
          {[0, 1].map((side) => (
            <g
              key={side}
              transform={side ? 'translate(200 0) scale(-1 1)' : undefined}
            >
              <path
                d="M62 104 C60 97 63 92 66 87 C67 91 69 91 70 84 C73 89 76 86 77 77 C81 84 87 88 87 95 C89 94 90 90 91 88 C93 96 91 103 89 106 C85 113 66 113 62 104 Z"
                fill="#ff6a2a"
                stroke={LINE}
                strokeWidth="2.5"
                paintOrder="stroke"
              />
              <path
                d="M67 104 C66 99 68 97 70 94 C71 96 73 96 74 91 C77 95 82 98 82 101 C83 106 79 109 75 109 C71 109 67 108 67 104 Z"
                fill="#ffd36b"
              />
              <ellipse cx="76" cy="103" rx="4.4" ry="3.8" fill="#fff7e0" />
              <ellipse cx="76" cy="103" rx="1.7" ry="3.3" fill={INK} />
            </g>
          ))}
          <path
            d="M80 134 l6.6 -6 6.6 6 6.6 -6 6.6 6 6.6 -6 6.6 6"
            {...stroke(4.8, MASK)}
          />
        </>
      );
  }
}

/** Kiru's head with a mood and a headband colour. */
export function KiruHead({
  mood,
  band = RED,
  className,
}: {
  mood: KiruMood;
  band?: string;
  className?: string;
}) {
  const id = useId();
  const hood = `${id}h`;
  const clip = `${id}c`;
  const bandDark = darker(band);
  return (
    <svg
      viewBox={VIEW}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={hood}
          x1="48"
          y1="24"
          x2="152"
          y2="156"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#34417c" />
          <stop offset="0.5" stopColor="#252d56" />
          <stop offset="1" stopColor="#181d3b" />
        </linearGradient>
        <clipPath id={clip}>
          <path d={HOOD} />
        </clipPath>
      </defs>
      <path
        d={HOOD}
        fill={`url(#${hood})`}
        stroke={LINE}
        strokeWidth="6"
        paintOrder="stroke"
      />
      <g clipPath={`url(#${clip})`}>
        <ellipse
          cx="132"
          cy="128"
          rx="82"
          ry="62"
          fill="#1a2044"
          opacity="0.55"
        />
        <ellipse
          cx="66"
          cy="40"
          rx="38"
          ry="15"
          transform="rotate(-24 66 40)"
          fill="#fff"
          opacity="0.08"
        />
        <path
          d="M14 78 Q100 34 186 78"
          stroke={band}
          strokeWidth="18"
          fill="none"
        />
        <path
          d="M14 87 Q100 43 186 87"
          stroke={bandDark}
          strokeWidth="2.5"
          fill="none"
          opacity="0.9"
        />
      </g>
      <path
        d="M47 50 Q33 68 31 95"
        {...stroke(3.2, '#a9bcff')}
        opacity="0.75"
      />
      <g stroke={LINE} strokeWidth="3" paintOrder="stroke">
        <ellipse
          cx="171"
          cy="64"
          rx="7.5"
          ry="5"
          transform="rotate(-32 171 64)"
          fill={bandDark}
        />
        <ellipse
          cx="172"
          cy="79"
          rx="6.5"
          ry="5"
          transform="rotate(30 172 79)"
          fill={bandDark}
        />
        <circle cx="166" cy="71" r="6" fill={band} />
      </g>
      <rect
        x="81"
        y="43"
        width="38"
        height="20"
        rx="4.5"
        fill={STEEL}
        stroke={LINE}
        strokeWidth="3.5"
        paintOrder="stroke"
      />
      <rect
        x="83.5"
        y="45.5"
        width="33"
        height="15"
        rx="3"
        fill="none"
        stroke={STEEL_EDGE}
        strokeWidth="1.2"
      />
      <path d={BOLT} fill={RED} />
      <path d={FACE} fill={SKIN} />
      <path d={FACE_SHADE} fill={SKIN_SHADE} opacity="0.75" />
      {mood !== 'smile' && (
        <g fill="#f08a78" opacity="0.5">
          <ellipse cx="57" cy="107" rx="7" ry="3.4" />
          <ellipse cx="143" cy="107" rx="7" ry="3.4" />
        </g>
      )}
      <Expression mood={mood} />
    </svg>
  );
}

/** Demon: an oni mask in vermilion, horns of bone, gold eyes, fangs. */
export function OniMask({ className }: { className?: string }) {
  const brow = 'M42 63 L60 57 L74 64 L95 76 L90 85 L70 77 L48 75 Z';
  const eye = 'M54 89 Q73 75 93 91 Q74 101 54 89 Z';
  const horn = 'M60 45 C47 31 43 17 50 3 C60 18 70 28 79 38 Z';
  const fang = 'M66 143 L72 122 L80 141 Z';
  const mirror = 'translate(200 0) scale(-1 1)';
  return (
    <svg
      viewBox={VIEW}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {[0, 1].map((side) => (
        <g key={side} transform={side ? mirror : undefined}>
          <path
            d={horn}
            fill="#f3e6c8"
            stroke={LINE}
            strokeWidth="4"
            paintOrder="stroke"
            strokeLinejoin="round"
          />
          <path
            d="M53 20 q6 3 11 0 M57 30 q6 3 11 0"
            {...stroke(2.2, '#c8b48a')}
          />
        </g>
      ))}
      <path
        d="M100 24 C142 24 172 46 174 88 C176 124 152 154 100 160 C48 154 24 124 26 88 C28 46 58 24 100 24 Z"
        fill={RED}
        stroke={LINE}
        strokeWidth="6"
        paintOrder="stroke"
      />
      <path
        d="M174 88 C176 124 152 154 100 160 C132 148 158 124 161 92 Z"
        fill={RED_DARK}
        opacity="0.85"
      />
      <ellipse
        cx="70"
        cy="44"
        rx="26"
        ry="9"
        transform="rotate(-18 70 44)"
        fill="#fff"
        opacity="0.14"
      />
      <path
        d="M78 40 Q100 33 122 40 M84 50 Q100 45 116 50"
        {...stroke(3, RED_DARK)}
      />
      {[0, 1].map((side) => (
        <g key={side} transform={side ? mirror : undefined}>
          <path d={brow} fill={INK} />
          <path
            d={eye}
            fill="#ffcf3a"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="76" cy="89" r="5.4" fill={INK} />
          <circle cx="78" cy="87" r="1.6" fill="#fff" />
        </g>
      ))}
      <path
        d="M88 104 Q100 94 112 104 Q116 114 106 114 Q100 109 94 114 Q84 114 88 104 Z"
        fill={RED_DARK}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M54 124 Q100 110 146 124 Q136 151 100 153 Q64 151 54 124 Z"
        fill="#2a0906"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M62 124 Q100 113 138 124 L135 130 Q100 120 65 130 Z"
        fill="#fff"
      />
      {[0, 1].map((side) => (
        <path
          key={side}
          d={fang}
          transform={side ? mirror : undefined}
          fill="#fff"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

const MOODS: Record<Exclude<Difficulty, 'demon'>, KiruMood> = {
  easy: 'smile',
  normal: 'determined',
  hard: 'frown',
  harder: 'angry',
  insane: 'fiery',
};

export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  harder: 'Harder',
  insane: 'Insane',
  demon: 'Demon',
};

/** The face in its round badge, ringed in the difficulty's tube colour. */
export function DifficultyFace({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="rr-face" data-d={difficulty}>
      {difficulty === 'demon' ? (
        <OniMask />
      ) : (
        <KiruHead mood={MOODS[difficulty]} />
      )}
    </span>
  );
}
