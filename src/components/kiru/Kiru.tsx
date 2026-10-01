import type { CSSProperties, ReactNode } from 'react';
import { svgString } from '@/components/brand/svgString';

/**
 * Kiru (切る, "to cut") — the Smart Disruptions ninja. He cuts through hype.
 *
 * Pure SVG, rendered on the server: a ninja costs a few KB of markup and no
 * JavaScript. Idle motion (breathing, blinking, head tilt) is CSS keyframes in
 * globals.css; the headband tails are SMIL path morphs. Both only run while
 * `data-live` is set, which the SiteFX island toggles as he scrolls in and
 * out of view — an off-screen ninja costs nothing per frame.
 *
 * His eyes follow the pointer through two CSS custom properties (--lx, --ly)
 * that SiteFX writes per instance. Without JS he simply looks ahead.
 *
 * Kiru is an OBJECT, like a sticky note: the same colours in both themes. Only
 * his outline (--kiru-line) and moonlight rim (--kiru-rim) follow the theme,
 * so he reads as ink-on-paper by day and moonlit at night.
 *
 * Shared gradients and clip paths live once per page in <KiruDefs />.
 */

export type KiruPose =
  | 'idle'
  | 'wave'
  | 'read'
  | 'storm'
  | 'build'
  | 'game'
  | 'meditate'
  | 'shh'
  | 'run'
  | 'sit'
  | 'peek'
  | 'throw'
  | 'bow';

export type KiruMood =
  | 'normal'
  | 'happy'
  | 'focus'
  | 'closed'
  | 'surprised'
  | 'wink';

// ── Palette (an object's colours, not theme tokens) ─────────────────────────
const LINE = 'var(--kiru-line)';
const GI = '#252d56';
const GI_LIT = '#2e3970';
const GI_SHADE = '#1a2044';
const SKIN = '#f6d0a8';
const SKIN_SHADE = '#e2b083';
const RED = '#e8432a';
const RED_DARK = '#bd3019';
const STEEL = '#cfd5e2';
const STEEL_EDGE = '#8d95ab';
const WRAP = '#e4e7f0';
const WRAP_SHADE = '#b6bccf';
const INK = '#13152a';
const GOLD = '#dcae4e';
const PAPER = '#f6ecd2';
const WOOD = '#9a6a37';

const OUT = 6; // outline width; paint-order puts half of it outside the fill

/**
 * A filled shape with the sticker outline painted underneath it. The outline
 * is a class (`ko`, in globals.css) rather than four attributes, because this
 * markup repeats in every ninja on the page — and again in the RSC payload.
 */
function S({
  d,
  fill,
  outline = true,
  className,
  style,
}: {
  d: string;
  fill: string;
  outline?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = [outline ? 'ko' : '', className ?? ''].join(' ').trim();
  return <path d={d} fill={fill} className={cls || undefined} style={style} />;
}

/** An arm: a two-stroke capsule (outline, then sleeve) ending in a wrapped hand. */
function Arm({
  d,
  hand,
  lit = true,
  className,
  fist = true,
}: {
  d: string;
  hand: [number, number];
  lit?: boolean;
  className?: string;
  fist?: boolean;
}) {
  const [hx, hy] = hand;
  return (
    <g className={className}>
      <path d={d} className="ka-o" />
      <path d={d} className={lit ? 'ka-l' : 'ka-s'} />
      <circle cx={hx} cy={hy} r={fist ? 9.5 : 10.5} className="kh" />
      <path d={`M${hx - 7} ${hy - 2.5}q7 3 14 0`} className="kw" />
    </g>
  );
}

// ── Headband tails: three keyframes each, same command structure, morphed ──
const TAIL_HI = [
  'M166 66 C182 54 196 62 210 52 C218 46 224 40 230 34 C226 48 218 58 206 64 C192 72 180 70 168 76 Z',
  'M166 66 C184 58 198 52 212 56 C220 58 228 54 235 48 C229 60 220 68 208 70 C194 72 180 74 168 76 Z',
  'M166 66 C182 50 194 44 208 46 C218 47 226 42 232 35 C228 50 220 58 208 59 C194 61 180 70 168 76 Z',
];
const TAIL_LO = [
  'M166 72 C184 70 196 82 214 76 C222 73 228 68 233 62 C228 76 218 86 205 89 C190 92 178 84 166 82 Z',
  'M166 72 C186 74 198 72 214 80 C222 84 230 82 237 78 C231 90 220 96 206 96 C190 96 178 88 166 82 Z',
  'M166 72 C184 68 198 76 212 70 C220 66 228 62 232 54 C230 70 220 80 206 82 C192 84 178 86 166 82 Z',
];
// Running: the tails stream flat behind him and flap fast.
const TAIL_HI_RUN = [
  'M166 66 C188 60 210 66 232 60 C242 57 250 56 258 54 C252 64 244 70 232 72 C212 76 190 74 168 76 Z',
  'M166 66 C188 64 210 58 232 64 C242 67 251 64 259 60 C253 70 244 76 232 77 C212 78 190 76 168 76 Z',
  'M166 66 C188 58 210 60 232 56 C242 54 250 50 257 46 C252 58 244 64 232 66 C212 70 190 74 168 76 Z',
];
const TAIL_LO_RUN = [
  'M166 72 C190 74 212 80 234 76 C244 74 252 74 260 72 C254 82 244 88 232 88 C210 90 188 86 166 82 Z',
  'M166 72 C190 72 212 74 234 82 C244 85 252 84 261 80 C255 90 244 94 232 94 C210 94 188 88 166 82 Z',
  'M166 72 C190 70 212 72 234 70 C244 69 252 66 259 62 C254 74 244 82 232 82 C210 84 188 86 166 82 Z',
];

function Tail({ frames, fill, dur }: { frames: string[]; fill: string; dur: string }) {
  return (
    <path d={frames[0]} fill={fill} className="kt">
      {/* Dormant until SiteFX sees this ninja on screen and begins it, so a
          page full of ninjas starts zero animations at load. */}
      <animate
        attributeName="d"
        begin="indefinite"
        dur={dur}
        repeatCount="indefinite"
        calcMode="spline"
        keyTimes="0;0.33;0.66;1"
        keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
        values={[...frames, frames[0]].join(';')}
      />
    </path>
  );
}

// ── Eyes ────────────────────────────────────────────────────────────────────
function Eyes({ mood, look }: { mood: KiruMood; look?: [number, number] }) {
  const arc = (x: number, up: boolean) =>
    up
      ? `M${x - 12} 99 Q${x} 84 ${x + 12} 99`
      : `M${x - 12} 92 Q${x} 103 ${x + 12} 92`;
  const lookT = look ? `translate(${look[0]} ${look[1]})` : undefined;

  const openEye = (x: number, rx = 12.5, ry = 14.5, cy = 95) => (
    <>
      <ellipse cx={x} cy={cy} rx={rx} ry={ry} fill="#fff" />
    </>
  );
  const pupil = (x: number, pr = 8.2, cy = 97) => (
    <>
      <circle cx={x + 2} cy={cy} r={pr} fill={INK} />
      <circle cx={x + 5} cy={cy - 4} r={pr * 0.37} fill="#fff" />
      <circle cx={x - 0.5} cy={cy + 3.5} r={pr * 0.17} fill="#fff" opacity={0.85} />
    </>
  );

  if (mood === 'happy' || mood === 'closed') {
    return (
      <g className="k-eyes" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round">
        <path d={arc(76, mood === 'happy')} />
        <path d={arc(124, mood === 'happy')} />
      </g>
    );
  }
  if (mood === 'wink') {
    return (
      <g className="k-eyes">
        {openEye(76)}
        <g className="k-pupils">
          <g transform={lookT}>{pupil(76)}</g>
        </g>
        <path d={arc(124, true)} fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      </g>
    );
  }
  const big = mood === 'surprised';
  const focus = mood === 'focus';
  return (
    <g className="k-eyes">
      {openEye(76, big ? 13.5 : 12.5, big ? 16 : focus ? 11.5 : 14.5, focus ? 98 : 95)}
      {openEye(124, big ? 13.5 : 12.5, big ? 16 : focus ? 11.5 : 14.5, focus ? 98 : 95)}
      <g className="k-pupils">
        <g transform={lookT}>
          {pupil(76, big ? 5.8 : 8.2, focus ? 99 : 97)}
          {pupil(124, big ? 5.8 : 8.2, focus ? 99 : 97)}
        </g>
      </g>
    </g>
  );
}

function Brows({ mood }: { mood: KiruMood }) {
  if (mood === 'closed' || mood === 'happy') {
    return (
      <g stroke={INK} strokeWidth={4.5} strokeLinecap="round">
        <path d="M63 77 Q75 73 87 77" fill="none" />
        <path d="M113 77 Q125 73 137 77" fill="none" />
      </g>
    );
  }
  const [l, r] =
    mood === 'surprised'
      ? ['M62 74 Q74 68 87 72', 'M113 72 Q126 68 138 74']
      : mood === 'focus'
        ? ['M60 79 L89 88', 'M111 88 L140 79']
        : ['M61 78 L87 84', 'M113 84 L139 78'];
  return (
    <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
      <path d={l} />
      <path d={r} />
    </g>
  );
}

// ── Head ────────────────────────────────────────────────────────────────────
function Head({
  mood,
  look,
  running,
  className = 'k-head',
  transform,
}: {
  mood: KiruMood;
  look?: [number, number];
  running?: boolean;
  className?: string;
  transform?: string;
}) {
  return (
    <g className={className} transform={transform}>
      <Tail frames={running ? TAIL_LO_RUN : TAIL_LO} fill={RED_DARK} dur={running ? '0.55s' : '2.2s'} />
      <Tail frames={running ? TAIL_HI_RUN : TAIL_HI} fill={RED} dur={running ? '0.5s' : '1.9s'} />
      <use href="#k-hood" />
      <Eyes mood={mood} look={look} />
      <Brows mood={mood} />
    </g>
  );
}

/**
 * The parts every ninja shares, drawn once per page inside <KiruDefs /> and
 * referenced by each pose with <use>. Only what animates or varies per pose
 * (tails, eyes, brows, arms, props) is drawn per instance — a ninja is ~3 KB
 * of markup instead of ~8 KB, which matters on a page with a dozen of them.
 */
export function KiruParts() {
  return (
    <>
      <g id="k-hood">
        <path d="M26 90a74 66 0 1 0 148 0a74 66 0 1 0 -148 0Z" fill="url(#kiru-hood)" stroke={LINE} strokeWidth={OUT} paintOrder="stroke" />
        <g clipPath="url(#kiru-head-clip)">
          <ellipse cx="132" cy="128" rx="82" ry="62" fill={GI_SHADE} opacity="0.55" />
          <ellipse cx="66" cy="40" rx="38" ry="15" transform="rotate(-24 66 40)" fill="#fff" opacity="0.08" />
          <path d="M14 78 Q100 34 186 78" stroke={RED} strokeWidth="18" fill="none" />
          <path d="M14 87 Q100 43 186 87" stroke={RED_DARK} strokeWidth="2.5" fill="none" opacity="0.9" />
        </g>
        {/* moonlight rim — night only */}
        <path
          d="M47 50 Q33 68 31 95"
          stroke="#a9bcff"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          style={{ opacity: 'calc(var(--kiru-rim) * 0.75)' }}
        />
        <ellipse cx="171" cy="64" rx="7.5" ry="5" transform="rotate(-32 171 64)" fill={RED_DARK} stroke={LINE} strokeWidth="3" paintOrder="stroke" />
        <ellipse cx="172" cy="79" rx="6.5" ry="5" transform="rotate(30 172 79)" fill={RED_DARK} stroke={LINE} strokeWidth="3" paintOrder="stroke" />
        <circle cx="166" cy="71" r="6" fill={RED} stroke={LINE} strokeWidth="3" paintOrder="stroke" />
        {/* plate: the bolt is the brand mark — a disruption, struck in steel */}
        <rect x="81" y="43" width="38" height="20" rx="4.5" fill={STEEL} stroke={LINE} strokeWidth="3.5" paintOrder="stroke" />
        <rect x="83.5" y="45.5" width="33" height="15" rx="3" fill="none" stroke={STEEL_EDGE} strokeWidth="1.2" />
        <path d="M103.5 46.5 L94 55.5 L100.5 55.5 L96.5 60.5 L107 51.5 L100.5 51.5 Z" fill={RED} />
        <circle cx="86.5" cy="53" r="1.3" fill={STEEL_EDGE} />
        <circle cx="113.5" cy="53" r="1.3" fill={STEEL_EDGE} />
        {/* face opening */}
        <path d="M44 80 C70 68 130 68 156 80 C168 85 168 104 156 109 C130 121 70 121 44 109 C32 104 32 85 44 80 Z" fill={SKIN} />
        <path
          d="M44 80 C70 68 130 68 156 80 C160 82 162 85 163 88 C130 77 70 77 37 88 C38 85 40 82 44 80 Z"
          fill={SKIN_SHADE}
          opacity="0.75"
        />
        <ellipse cx="57" cy="107" rx="7" ry="3.4" fill="#f08a78" opacity="0.5" />
        <ellipse cx="143" cy="107" rx="7" ry="3.4" fill="#f08a78" opacity="0.5" />
      </g>
      <g id="k-katana">
        {/* scabbard tip, behind the right leg */}
        <path d="M134 188 L157 224" stroke={LINE} strokeWidth="13" strokeLinecap="round" />
        <path d="M134 188 L157 224" stroke="#3a1f2a" strokeWidth="8" strokeLinecap="round" />
        <circle cx="157" cy="224" r="3.6" fill={GOLD} />
        {/* handle over the left shoulder */}
        <path d="M33 116 L57 150" stroke={LINE} strokeWidth="15" strokeLinecap="round" />
        <path d="M33 116 L57 150" stroke={INK} strokeWidth="9.5" strokeLinecap="round" />
        <path d="M31 120 l7 -3 M35 126 l7 -3 M39 132 l7 -3 M43 138 l7 -3" stroke={RED} strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="57" cy="150" rx="11" ry="4.2" transform="rotate(-55 57 150)" fill={GOLD} stroke={LINE} strokeWidth="3" paintOrder="stroke" />
      </g>
      <g id="k-torso">
        <path d="M64 158 Q66 146 82 143 L118 143 Q134 146 136 158 L133 199 Q100 205 67 199 Z" fill="url(#kiru-gi)" stroke={LINE} strokeWidth={OUT} strokeLinejoin="round" paintOrder="stroke" />
        <path d="M112 144 L118 143 Q134 146 136 158 L133 199 Q123 202 112 203 Z" fill={GI_SHADE} opacity="0.55" />
        <path d="M88 145 L100 166 L112 145 Z" fill="#c9cfe3" />
        <path d="M84 145 L100 170 L116 145" stroke={GI_LIT} strokeWidth="4.5" fill="none" strokeLinejoin="round" />
        <path d="M66 184 Q100 191 134 184 L133 196 Q100 203 67 196 Z" fill={RED} />
        <path d="M67 193 Q100 200 133 193" stroke={RED_DARK} strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M81 193 l-6 15 l8 -3 z M86 193 l2 15 l5 -5 z" fill={RED_DARK} stroke={LINE} strokeWidth="2" paintOrder="stroke" strokeLinejoin="round" />
        <circle cx="84" cy="192" r="5" fill={RED_DARK} stroke={LINE} strokeWidth="2.5" paintOrder="stroke" />
      </g>
      <g id="k-legs">
        <path d="M76 194 h20 v28 q0 6 -6 6 h-8 q-6 0 -6 -6 z" fill={GI} stroke={LINE} strokeWidth={OUT} strokeLinejoin="round" paintOrder="stroke" />
        <path d="M104 194 h20 v28 q0 6 -6 6 h-8 q-6 0 -6 -6 z" fill={GI_SHADE} stroke={LINE} strokeWidth={OUT} strokeLinejoin="round" paintOrder="stroke" />
        <path d="M67 232 q0 -10 12 -10 h12 q8 0 8 7 v3 z" fill={INK} stroke={LINE} strokeWidth={OUT} strokeLinejoin="round" paintOrder="stroke" />
        <path d="M133 232 q0 -10 -12 -10 h-12 q-8 0 -8 7 v3 z" fill={INK} stroke={LINE} strokeWidth={OUT} strokeLinejoin="round" paintOrder="stroke" />
      </g>
    </>
  );
}

// ── Body parts ──────────────────────────────────────────────────────────────
function ArmsIdle() {
  return (
    <>
      <Arm d="M73 156 Q61 170 58 187" hand={[58, 190]} />
      <Arm d="M127 156 Q139 170 142 187" hand={[142, 190]} lit={false} />
    </>
  );
}

function Shuriken({ x, y, r = 12, className }: { x: number; y: number; r?: number; className?: string }) {
  const p = [0, 1, 2, 3]
    .map((i) => {
      const a = (i * Math.PI) / 2;
      const tip = [x + Math.cos(a) * r, y + Math.sin(a) * r];
      const side = [x + Math.cos(a + Math.PI / 4) * r * 0.32, y + Math.sin(a + Math.PI / 4) * r * 0.32];
      return `${i === 0 ? 'M' : 'L'}${tip[0].toFixed(1)} ${tip[1].toFixed(1)} L${side[0].toFixed(1)} ${side[1].toFixed(1)}`;
    })
    .join(' ');
  return (
    <g className={className}>
      <path d={`${p} Z`} fill={STEEL} stroke={LINE} strokeWidth="3" paintOrder="stroke" strokeLinejoin="round" />
      <circle cx={x} cy={y} r={r * 0.17} fill={INK} />
    </g>
  );
}

// ── Poses ───────────────────────────────────────────────────────────────────
type PoseDef = {
  viewBox: string;
  mood: KiruMood;
  look?: [number, number];
  /** Behind everything (auras, umbrellas' far side, weather). */
  back?: ReactNode;
  /** Replaces the standing legs. */
  legs?: ReactNode | null;
  arms: ReactNode;
  /** In front of the body (scrolls, controllers, hands that hold them). */
  front?: ReactNode;
  head?: { className?: string; transform?: string };
  running?: boolean;
  bodyTransform?: string;
  bodyClass?: string;
  katana?: boolean;
  torso?: boolean;
};

const POSES: Record<KiruPose, PoseDef> = {
  idle: { viewBox: '0 0 240 240', mood: 'normal', arms: <ArmsIdle /> },

  wave: {
    viewBox: '0 0 240 240',
    mood: 'happy',
    arms: <Arm d="M73 156 Q61 170 58 187" hand={[58, 190]} />,
    front: <Arm className="k-wave" d="M128 157 Q160 152 177 121" hand={[179, 116]} lit={false} fist={false} />,
  },

  read: {
    viewBox: '0 0 240 240',
    mood: 'normal',
    look: [0, 3.5],
    arms: (
      <>
        <Arm d="M73 156 Q64 170 70 177" hand={[70, 178]} />
        <Arm d="M127 156 Q136 170 130 177" hand={[130, 178]} lit={false} />
      </>
    ),
    front: (
      <g>
        <rect x="66" y="162" width="68" height="28" rx="2" fill={PAPER} stroke={LINE} strokeWidth="3.5" paintOrder="stroke" />
        <path d="M74 170 h40 M74 176 h52 M74 182 h34" stroke="#b9ad92" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M118 170 h8" stroke={RED} strokeWidth="2.2" strokeLinecap="round" />
        <rect x="58" y="158" width="10" height="36" rx="5" fill={RED_DARK} stroke={LINE} strokeWidth="3" paintOrder="stroke" />
        <rect x="132" y="158" width="10" height="36" rx="5" fill={RED_DARK} stroke={LINE} strokeWidth="3" paintOrder="stroke" />
        <circle cx="64" cy="179" r="9.5" fill={WRAP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
        <circle cx="136" cy="179" r="9.5" fill={WRAP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
      </g>
    ),
  },

  storm: {
    viewBox: '-20 -56 260 296',
    mood: 'normal',
    look: [-1, -3],
    back: (
      <g>
        <path
          className="k-zap"
          d="M196 -40 L176 6 L190 6 L170 52 L206 -2 L191 -2 L206 -40 Z"
          fill="#ffd36b"
          stroke={LINE}
          strokeWidth="3"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <g stroke="#7f95d6" strokeWidth="2.4" strokeLinecap="round" opacity="0.7">
          <path d="M8 40 l-6 14 M24 80 l-6 14 M2 130 l-6 14 M196 70 l-6 14 M214 120 l-6 14 M186 170 l-6 14 M20 196 l-6 14" />
        </g>
      </g>
    ),
    arms: (
      <>
        <Arm d="M73 156 Q61 170 58 187" hand={[58, 190]} />
        <path d="M100 -24 L111 182" stroke={LINE} strokeWidth="8" strokeLinecap="round" />
        <path d="M100 -24 L111 182" stroke={WOOD} strokeWidth="4" strokeLinecap="round" />
        <path d="M111 182 q2 10 -6 11" stroke={LINE} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M111 182 q2 10 -6 11" stroke={WOOD} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    ),
    front: (
      <g>
        <Arm d="M127 157 Q142 168 112 169" hand={[110, 169]} lit={false} />
        {/* wagasa — the paper umbrella, in the house vermilion */}
        <path
          d="M2 18 Q100 -78 198 18 Q184 9 170 20 Q156 10 142 21 Q128 11 114 22 Q100 12 86 22 Q72 11 58 21 Q44 10 30 20 Q16 9 2 18 Z"
          fill={RED}
          stroke={LINE}
          strokeWidth="5"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <path d="M100 -30 Q30 -4 2 18 M100 -30 Q60 -2 30 20 M100 -30 Q82 0 58 21 M100 -30 Q96 0 86 22 M100 -30 Q104 0 114 22 M100 -30 Q118 0 142 21 M100 -30 Q140 -2 170 20 M100 -30 Q170 -4 198 18" stroke={RED_DARK} strokeWidth="1.8" fill="none" opacity="0.9" />
        <path d="M30 -4 Q100 -46 170 -4" stroke={PAPER} strokeWidth="4" fill="none" opacity="0.85" />
        <circle cx="100" cy="-31" r="5" fill={INK} />
      </g>
    ),
  },

  build: {
    viewBox: '0 -24 250 264',
    mood: 'focus',
    arms: <Arm d="M73 156 Q61 170 58 187" hand={[58, 190]} />,
    front: (
      <g>
        <g className="k-swing">
          <path d="M178 128 L204 80" stroke={LINE} strokeWidth="11" strokeLinecap="round" />
          <path d="M178 128 L204 80" stroke={WOOD} strokeWidth="6" strokeLinecap="round" />
          <g transform="rotate(-28 206 74)">
            <rect x="184" y="62" width="44" height="23" rx="5" fill={STEEL} stroke={LINE} strokeWidth="4.5" paintOrder="stroke" />
            <rect x="184" y="62" width="9" height="23" rx="3" fill={STEEL_EDGE} />
            <rect x="219" y="62" width="9" height="23" rx="3" fill={STEEL_EDGE} />
          </g>
          <Arm d="M128 157 Q158 154 175 132" hand={[178, 128]} lit={false} />
        </g>
        <g className="k-zap" fill={GOLD} stroke={LINE} strokeWidth="2" paintOrder="stroke">
          <path d="M226 26 l4 9 l9 -2 l-6 7 l5 8 l-9 -3 l-5 8 l0 -9 l-9 -3 l9 -3 z" />
          <path d="M240 62 l2 5 l5 -1 l-3 4 l3 4 l-5 -2 l-3 4 l0 -5 l-5 -1 l5 -2 z" />
        </g>
      </g>
    ),
  },

  game: {
    viewBox: '0 0 240 240',
    mood: 'focus',
    look: [0, 4],
    arms: (
      <>
        <Arm d="M73 156 Q60 174 70 186" hand={[71, 187]} />
        <Arm d="M127 156 Q140 174 130 186" hand={[129, 187]} lit={false} />
      </>
    ),
    front: (
      <g>
        <path
          d="M70 168 h60 q12 0 14 12 l3 10 q2 10 -8 10 q-6 0 -10 -7 h-48 q-4 7 -10 7 q-10 0 -8 -10 l3 -10 q2 -12 14 -12 z"
          fill="#2b3150"
          stroke={LINE}
          strokeWidth="4.5"
          paintOrder="stroke"
          strokeLinejoin="round"
        />
        <path d="M84 176 v12 M78 182 h12" stroke={WRAP} strokeWidth="3.6" strokeLinecap="round" />
        <circle cx="114" cy="178" r="3.8" fill={RED} />
        <circle cx="122" cy="185" r="3.8" fill={GOLD} />
        <circle cx="106" cy="185" r="3.8" fill="#7f95d6" />
        <rect x="95" y="172" width="10" height="3.4" rx="1.7" fill="#5a6390" />
        <g className="k-thumbs">
          <circle cx="68" cy="190" r="9.5" fill={WRAP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
        </g>
        <circle cx="132" cy="190" r="9.5" fill={WRAP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
      </g>
    ),
  },

  meditate: {
    viewBox: '-10 -10 260 250',
    mood: 'closed',
    bodyClass: 'k-float',
    back: (
      <circle className="k-aura" cx="100" cy="128" r="104" fill="url(#kiru-aura)" />
    ),
    legs: (
      <g>
        <S d="M54 212 Q100 186 146 212 Q154 226 138 231 Q100 239 62 231 Q46 226 54 212 Z" fill={GI} />
        <path d="M70 222 Q100 210 130 222" stroke={GI_SHADE} strokeWidth="5" fill="none" strokeLinecap="round" />
        <S d="M60 226 q-2 -9 9 -10 h10 q7 1 6 7 z" fill={INK} />
        <S d="M140 226 q2 -9 -9 -10 h-10 q-7 1 -6 7 z" fill={INK} />
      </g>
    ),
    arms: (
      <>
        <Arm d="M73 156 Q56 180 72 203" hand={[74, 205]} />
        <Arm d="M127 156 Q144 180 128 203" hand={[126, 205]} lit={false} />
      </>
    ),
  },

  shh: {
    viewBox: '0 0 240 240',
    mood: 'wink',
    arms: <Arm d="M73 156 Q61 170 58 187" hand={[58, 190]} />,
    front: (
      <g>
        <Arm d="M127 157 Q156 162 112 145" hand={[108, 143]} lit={false} />
        <rect x="102.5" y="117" width="9" height="24" rx="4.5" fill={WRAP} stroke={LINE} strokeWidth="3.5" paintOrder="stroke" />
      </g>
    ),
  },

  run: {
    viewBox: '-10 0 280 240',
    mood: 'focus',
    look: [-3, 0],
    running: true,
    bodyClass: 'k-bob',
    bodyTransform: 'rotate(-7 100 232)',
    legs: (
      <g>
        <g className="k-run-a">
          <path d="M90 196 L84 222" stroke={LINE} strokeWidth="24" strokeLinecap="round" />
          <path d="M90 196 L84 222" stroke={GI} strokeWidth="18" strokeLinecap="round" />
          <S d="M70 230 q0 -10 12 -10 h8 q6 0 6 6 v4 z" fill={INK} />
        </g>
        <g className="k-run-b">
          <path d="M110 196 L116 222" stroke={LINE} strokeWidth="24" strokeLinecap="round" />
          <path d="M110 196 L116 222" stroke={GI_SHADE} strokeWidth="18" strokeLinecap="round" />
          <S d="M104 230 q0 -10 12 -10 h8 q6 0 6 6 v4 z" fill={INK} />
        </g>
      </g>
    ),
    arms: (
      <>
        <Arm className="k-run-b" d="M73 156 Q56 164 48 178" hand={[46, 181]} />
        <Arm className="k-run-a" d="M127 156 Q142 166 152 178" hand={[154, 181]} lit={false} />
      </>
    ),
  },

  sit: {
    viewBox: '0 0 240 240',
    mood: 'happy',
    legs: (
      <g>
        <g className="k-dangle-l">
          <S d="M76 192 h20 v30 q0 6 -6 6 h-8 q-6 0 -6 -6 z" fill={GI} />
          <S d="M70 234 q0 -10 12 -10 h10 q7 0 7 7 v3 z" fill={INK} />
        </g>
        <g className="k-dangle-r">
          <S d="M104 192 h20 v30 q0 6 -6 6 h-8 q-6 0 -6 -6 z" fill={GI_SHADE} />
          <S d="M130 234 q0 -10 -12 -10 h-10 q-7 0 -7 7 v3 z" fill={INK} />
        </g>
      </g>
    ),
    arms: (
      <>
        <Arm d="M73 158 Q60 176 56 198" hand={[56, 200]} />
        <Arm d="M127 158 Q140 176 144 198" hand={[144, 200]} lit={false} />
      </>
    ),
  },

  peek: {
    viewBox: '0 0 240 178',
    mood: 'normal',
    torso: false,
    katana: false,
    legs: null,
    arms: null,
    front: (
      <g>
        <circle cx="62" cy="166" r="11" fill={WRAP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
        <circle cx="138" cy="166" r="11" fill={WRAP} stroke={LINE} strokeWidth="4" paintOrder="stroke" />
        <path d="M54 163 q8 3 16 0 M130 163 q8 3 16 0" stroke={WRAP_SHADE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    ),
  },

  throw: {
    viewBox: '0 0 280 240',
    mood: 'focus',
    look: [3, -1],
    back: (
      <g stroke="#9aa6c8" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <path d="M190 112 h28 M196 124 h34 M202 100 h22" />
      </g>
    ),
    arms: (
      <>
        <Arm d="M73 156 Q56 160 48 148" hand={[46, 146]} />
        <Arm d="M127 156 Q150 150 172 138" hand={[175, 136]} lit={false} fist={false} />
      </>
    ),
    front: <Shuriken x={250} y={112} r={15} className="k-spin" />,
  },

  bow: {
    viewBox: '0 0 240 240',
    mood: 'closed',
    head: { transform: 'rotate(10 100 150) translate(0 6)' },
    arms: (
      <>
        <Arm d="M73 156 Q74 174 95 168" hand={[97, 166]} />
        <Arm d="M127 156 Q126 174 105 168" hand={[103, 166]} lit={false} />
      </>
    ),
  },
};

export interface KiruProps {
  pose?: KiruPose;
  /** Overrides the pose's default expression. */
  mood?: KiruMood;
  className?: string;
  style?: CSSProperties;
  /** Accessible name. Omit for decoration (the default): he is aria-hidden. */
  title?: string;
  /** Mirror him to face the other way. */
  flip?: boolean;
  /** Hold still: no idle motion even when on screen. */
  still?: boolean;
  /** Placement when nested inside another SVG (a scene, the skyline). */
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
}

export default function Kiru({
  pose = 'idle',
  mood,
  className,
  style,
  title,
  flip,
  still,
  x,
  y,
  width,
  height,
}: KiruProps) {
  const p = POSES[pose];
  const m = mood ?? p.mood;
  // The art is static, so it ships as one string: React neither serialises
  // dozens of elements per ninja into the page payload nor hydrates them.
  const inner = svgString(
    <>
      {p.back}
      <g className={`k-body ${p.bodyClass ?? ''}`} transform={p.bodyTransform}>
        {p.katana !== false && <use href="#k-katana" />}
        {p.legs === undefined ? <use href="#k-legs" className="k-legs" /> : p.legs}
        {p.torso !== false && <use href="#k-torso" />}
        {p.arms}
        <Head
          mood={m}
          look={p.look}
          running={p.running}
          className={`k-head ${p.head?.className ?? ''}`}
          transform={p.head?.transform}
        />
        {p.front}
      </g>
    </>,
  );
  return (
    <svg
      viewBox={p.viewBox}
      x={x}
      y={y}
      width={width}
      height={height}
      className={`kiru ${className ?? ''}`}
      style={flip ? { ...style, scale: '-1 1' } : style}
      data-kiru={still ? 'still' : pose}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: inner }}
      suppressHydrationWarning
    />
  );
}
