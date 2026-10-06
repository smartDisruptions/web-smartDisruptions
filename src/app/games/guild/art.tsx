import StaticSvg from '@/components/brand/StaticSvg';
import { LETTERING } from './lettering';
import { BOARD_H, SIGN_VB, signBulbs, stairArt, type Stair } from './scene';

/**
 * The hall's static art: everything here is drawn once on the server and
 * shipped as one markup string per <svg> (StaticSvg), so React neither sends
 * the paths as elements nor hydrates them. Nothing in here moves; what
 * flickers, chases and drifts is HTML on the compositor (GuildHall.tsx,
 * guild.css). Colours are Broom & Blade's own (the tokens on .gh), written
 * out because SVG paint can't always read a custom property.
 */

const GOLD = '#e8b24a';
const GOLD_DEEP = '#b07e24';
const BLOOD = '#8f2b1c';

// ── Shared paint and symbols, once per page ─────────────────────────────────
export function HallDefs() {
  return (
    <StaticSvg className="gh-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        <linearGradient id="gh-gilt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4cc" />
          <stop offset="0.36" stopColor="#f7cd63" />
          <stop offset="0.52" stopColor="#d6942c" />
          <stop offset="0.66" stopColor="#f2c157" />
          <stop offset="1" stopColor="#a2691b" />
        </linearGradient>
        <linearGradient id="gh-ember" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc59a" />
          <stop offset="0.45" stopColor="#ee7a3c" />
          <stop offset="1" stopColor="#a8391a" />
        </linearGradient>
        <linearGradient id="gh-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="0.5" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_DEEP} />
        </linearGradient>
        <linearGradient id="gh-iron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b4440" />
          <stop offset="1" stopColor="#1f1a17" />
        </linearGradient>
        <linearGradient id="gh-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8432b" />
          <stop offset="0.55" stopColor={BLOOD} />
          <stop offset="1" stopColor="#651c10" />
        </linearGradient>
        <linearGradient id="gh-straw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d27a" />
          <stop offset="1" stopColor="#c48a2c" />
        </linearGradient>
        <linearGradient id="gh-handle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a3517" />
          <stop offset="0.45" stopColor="#a06a36" />
          <stop offset="1" stopColor="#4a2c12" />
        </linearGradient>

        {/* The Golden Broom: a broom whose handle is a sword's hilt. Drawn
            upright, centred on 0,0, 100 units from pommel to bristle tips. */}
        <g id="gh-broom">
          <path d="M-14 22 L14 22 L18 47 Q11 51 6 47 Q2 52 -2 47 Q-7 52 -11 47 Q-16 51 -19 46 Z" fill="url(#gh-straw)" />
          <path d="M-9 24 L-12 46 M-4 24 L-5 47 M1 24 L1 47 M6 24 L8 47 M10 24 L14 45" stroke="#a8742a" strokeWidth="1.1" fill="none" opacity="0.7" />
          <rect x="-14.5" y="27" width="29" height="3.2" rx="1.2" fill="#c0392b" />
          <rect x="-15.5" y="32.5" width="31" height="3.2" rx="1.2" fill="#c0392b" />
          <rect x="-5" y="17" width="10" height="7" rx="1.6" fill="url(#gh-brass)" />
          <rect x="-2.6" y="-22" width="5.2" height="40" rx="2" fill="url(#gh-handle)" />
          <rect x="-3.3" y="-1" width="6.6" height="3" rx="1.2" fill="url(#gh-brass)" />
          <rect x="-18" y="-27" width="36" height="5.2" rx="2.6" fill="url(#gh-brass)" />
          <circle cx="-19" cy="-24.4" r="3.6" fill="url(#gh-brass)" />
          <circle cx="19" cy="-24.4" r="3.6" fill="url(#gh-brass)" />
          <rect x="-3.1" y="-43" width="6.2" height="17" rx="2.4" fill="#8a5a1c" />
          <path d="M-3 -39 h6 M-3 -35 h6 M-3 -31 h6" stroke={GOLD} strokeWidth="1.3" />
          <circle cx="0" cy="-47" r="5.2" fill="url(#gh-brass)" />
          <circle cx="-1.6" cy="-48.6" r="1.6" fill="#fff6d6" opacity="0.8" />
        </g>

        {/* A wall torch's iron sconce and wooden handle; the flame is HTML.
            The cup's mouth is at 0,0. */}
        <g id="gh-sconce">
          <path d="M-3 4 L3 4 L5 40 L-5 40 Z" fill="url(#gh-handle)" />
          <path d="M-11 -2 L11 -2 L7 8 L-7 8 Z" fill="url(#gh-iron)" />
          <rect x="-12" y="-4" width="24" height="3.4" rx="1.4" fill="#5d5550" />
          <path d="M0 18 Q-20 20 -22 40" stroke="#2a2420" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="-28" y="36" width="12" height="16" rx="2" fill="url(#gh-iron)" />
          <circle cx="-22" cy="44" r="1.6" fill="#8a807a" />
          <rect x="-6" y="16" width="12" height="4" rx="1.5" fill="#2a2420" />
        </g>
      </defs>
    </StaticSvg>
  );
}

// ── The stair ───────────────────────────────────────────────────────────────
export function StairArt({ s, className }: { s: Stair; className?: string }) {
  const a = stairArt(s);
  return (
    <StaticSvg viewBox={`0 0 ${s.w} ${s.h}`} className={className} aria-hidden="true" focusable="false" overflow="visible">
      <defs>
        <linearGradient id={`gh-solid-${s.w}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#25243a" />
          <stop offset="0.55" stopColor="#2b2019" />
          <stop offset="1" stopColor="#1d140c" />
        </linearGradient>
      </defs>
      {/* the landing's edge catches the neon from above */}
      <path d={a.solid} fill={`url(#gh-solid-${s.w})`} />
      <path d={a.mortar} stroke="#120c08" strokeWidth="2" opacity="0.55" fill="none" />
      {a.steps.map((st, i) => (
        <g key={i}>
          <rect x={st.x} y={st.y} width={s.run + 0.5} height={s.rise} fill={st.fill} />
          <rect x={st.x} y={st.y + s.rise - 5} width={s.run + 0.5} height="5" fill="#000" opacity="0.22" />
          <rect x={st.x - 3} y={st.y - 1} width={s.run + 6} height="5" rx="1.5" fill="#fff" opacity={0.1 + (0.18 * i) / s.n} />
          <rect x={st.x + s.run - 2} y={st.y} width="2.5" height={s.rise} fill="#000" opacity="0.28" />
        </g>
      ))}
      <path d={`M-2000 ${s.y0}L${s.x0} ${s.y0}`} stroke="#ff7ab8" strokeWidth="2" opacity="0.5" />
      <rect x="-2000" y={s.y0 - 1} width={2000 + s.x0} height="5" fill="#cfc8e8" opacity="0.14" />
      {/* the rope rail */}
      {a.posts.map((p, i) => (
        <g key={`p${i}`}>
          <rect x={p.x - 4} y={p.top} width="8" height={p.y - p.top} rx="2" fill="url(#gh-handle)" />
          <circle cx={p.x} cy={p.top} r="6.5" fill="url(#gh-brass)" />
        </g>
      ))}
      <path d={a.rope} stroke="#6e4512" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={a.rope} stroke="#e2ae4c" strokeWidth="4.2" fill="none" strokeLinecap="round" />
      <path d={a.rope} stroke="#fff0bf" strokeWidth="1.2" fill="none" strokeDasharray="3 5" opacity="0.7" />
    </StaticSvg>
  );
}

// ── The signboard ───────────────────────────────────────────────────────────
// SIGN_VB (scene.ts): the board is 0..800 × 0..BOARD_H, the crest pokes up
// above it, the ribbon hangs below it.
const notched = (x: number, y: number, w: number, h: number, n: number) =>
  `M${x + n} ${y}H${x + w - n}A${n} ${n} 0 0 0 ${x + w} ${y + n}V${y + h - n}A${n} ${n} 0 0 0 ${x + w - n} ${y + h}H${x + n}A${n} ${n} 0 0 0 ${x} ${y + h - n}V${y + n}A${n} ${n} 0 0 0 ${x + n} ${y}Z`;

export const SIGN_BULBS = signBulbs();

export function SignArt() {
  const L = LETTERING;
  // "Broom & Blade", centred: 0.97 of the baked size.
  const s1 = 0.97;
  const x1 = 400 - (L.broom.width * s1) / 2;
  const y1 = 162;
  // "The", small, over it.
  const s0 = 0.36;
  const x0 = 400 - (L.the.width * s0) / 2;
  const y0 = 84;
  // "ARCADE" on the ribbon.
  const s2 = 0.56;
  const x2 = 400 - (L.arcade.width * s2) / 2;
  const y2 = 241;

  const grain = [
    'M18 52 C180 44 300 60 460 50 S700 46 782 56',
    'M18 78 C140 86 320 70 520 82 S720 74 782 80',
    'M18 168 C200 160 330 176 500 166 S690 160 782 170',
    'M18 196 C150 204 360 188 540 200 S720 194 782 198',
    'M60 112 C130 106 170 118 240 112',
    'M560 140 C620 134 690 146 760 138',
  ];
  return (
    <StaticSvg
      viewBox={`${SIGN_VB.x} ${SIGN_VB.y} ${SIGN_VB.w} ${SIGN_VB.h}`}
      className="gh-sign-art"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="gh-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a4522" />
          <stop offset="0.5" stopColor="#4a2f16" />
          <stop offset="1" stopColor="#36210e" />
        </linearGradient>
        <linearGradient id="gh-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2410" />
          <stop offset="1" stopColor="#2a190a" />
        </linearGradient>
        <radialGradient id="gh-board-light" cx="0.5" cy="0.15" r="0.75">
          <stop offset="0" stopColor="#ffbe6a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffbe6a" stopOpacity="0" />
        </radialGradient>
        <path id="gh-lt-the" d={L.the.d} />
        <path id="gh-lt-broom" d={L.broom.d} />
        <path id="gh-lt-amp" d={L.broom.amp} />
        <path id="gh-lt-arcade" d={L.arcade.d} />
      </defs>

      {/* the board: a thick oak frame round a darker carved panel */}
      <path d={notched(0, 6, 800, BOARD_H, 30)} fill="#000" opacity="0.45" />
      <path d={notched(0, 0, 800, BOARD_H, 30)} fill="url(#gh-board)" />
      <path d={notched(14, 14, 772, BOARD_H - 28, 20)} fill="url(#gh-panel)" />
      <g stroke="#1b0f05" strokeWidth="1.6" fill="none" opacity="0.5">
        {grain.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d="M18 124 H782" stroke="#160c04" strokeWidth="2.4" opacity="0.6" />
      <path d="M18 126.5 H782" stroke="#8a5d31" strokeWidth="1" opacity="0.35" />
      <path d={notched(14, 14, 772, BOARD_H - 28, 20)} fill="url(#gh-board-light)" />
      {/* a bevel: dark under the frame's top edge, light along its foot */}
      <path d={`M34 15 H766`} stroke="#000" strokeWidth="3" opacity="0.35" />
      <path d={`M34 ${BOARD_H - 15} H766`} stroke="#a4723d" strokeWidth="1.6" opacity="0.5" />
      <path d={`M30 1.5 H770`} stroke="#b98a52" strokeWidth="2" opacity="0.55" />
      {/* the gilt bead inside the bulbs */}
      <path d={notched(34, 34, 732, BOARD_H - 68, 16)} fill="none" stroke={GOLD} strokeWidth="2.4" opacity="0.85" />
      <path d={notched(39, 39, 722, BOARD_H - 78, 13)} fill="none" stroke={GOLD_DEEP} strokeWidth="1" opacity="0.6" />

      {/* the bulbs' sockets, dark until the HTML glows light them */}
      {SIGN_BULBS.map((b, i) => {
        const cx = (b.x / 100) * SIGN_VB.w + SIGN_VB.x;
        const cy = (b.y / 100) * SIGN_VB.h + SIGN_VB.y;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="7.4" fill="#1a0f06" />
            <circle cx={cx} cy={cy} r="5.2" fill="#6b4a1f" />
            <circle cx={cx - 1.4} cy={cy - 1.6} r="1.6" fill="#f5dca0" opacity="0.5" />
          </g>
        );
      })}

      {/* "The", with a flourish each side */}
      <g transform={`translate(${x0} ${y0}) scale(${s0})`}>
        <use href="#gh-lt-the" transform="translate(0 7)" fill="#0d0703" opacity="0.8" />
        <use href="#gh-lt-the" fill="url(#gh-gilt)" stroke="#5c3a0e" strokeWidth="3" paintOrder="stroke" />
      </g>
      <g stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
        <path d="M282 74 H346 M454 74 H518" />
      </g>
      <g fill={GOLD}>
        <path d="M276 74 l6 -5 l6 5 l-6 5 Z M512 74 l6 -5 l6 5 l-6 5 Z" />
      </g>

      {/* "Broom & Blade": gilt, raised off the panel, the ampersand in ember */}
      <g transform={`translate(${x1} ${y1}) scale(${s1})`}>
        <use href="#gh-lt-broom" transform="translate(1.5 5)" fill="#0d0703" opacity="0.85" />
        <use href="#gh-lt-amp" transform="translate(1.5 5)" fill="#0d0703" opacity="0.85" />
        <use href="#gh-lt-broom" fill="url(#gh-gilt)" stroke="#4e300a" strokeWidth="2.2" paintOrder="stroke" />
        <use href="#gh-lt-amp" fill="url(#gh-ember)" stroke="#4a1606" strokeWidth="2.2" paintOrder="stroke" />
        <use href="#gh-lt-broom" fill="none" stroke="#fff6d4" strokeWidth="0.9" opacity="0.35" transform="translate(-0.6 -0.8)" />
      </g>

      {/* the ribbon: the games' own red-and-gold title banner */}
      <path d="M146 214 L226 214 L226 262 L146 262 L166 238 Z" fill="#651c10" />
      <path d="M654 214 L574 214 L574 262 L654 262 L634 238 Z" fill="#651c10" />
      <path d="M210 214 L226 206 L226 214 Z M590 214 L574 206 L574 214 Z" fill="#3e0f07" />
      <rect x="208" y="194" width="384" height="62" rx="4" fill="url(#gh-red)" />
      <rect x="208" y="194" width="384" height="62" rx="4" fill="none" stroke={GOLD} strokeWidth="3" />
      <rect x="215" y="201" width="370" height="48" rx="2" fill="none" stroke={GOLD_DEEP} strokeWidth="1.2" opacity="0.8" />
      <g transform={`translate(${x2} ${y2}) scale(${s2})`}>
        <use href="#gh-lt-arcade" transform="translate(0 5)" fill="#2a0904" opacity="0.8" />
        <use href="#gh-lt-arcade" fill="url(#gh-gilt)" stroke="#4e300a" strokeWidth="2" paintOrder="stroke" />
      </g>

      {/* the crest on top: the Golden Broom on a red roundel */}
      <circle cx="400" cy="2" r="40" fill="#000" opacity="0.4" transform="translate(0 4)" />
      <circle cx="400" cy="2" r="40" fill="url(#gh-brass)" />
      <circle cx="400" cy="2" r="33" fill="url(#gh-red)" />
      <circle cx="400" cy="2" r="33" fill="none" stroke="#5c1a0e" strokeWidth="2" />
      <g transform="translate(400 4) rotate(32) scale(0.6)">
        <use href="#gh-broom" />
      </g>
      {/* eye-bolts for the chains */}
      {[220, 580].map((x) => (
        <g key={x}>
          <circle cx={x} cy="-3" r="8" fill="none" stroke="url(#gh-iron)" strokeWidth="4" />
          <rect x={x - 9} y="1" width="18" height="7" rx="2" fill="#2c2520" />
        </g>
      ))}
      {/* gilt studs in the corners of the panel */}
      {[
        [54, 52],
        [746, 52],
        [54, 196],
        [746, 196],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.4" fill="url(#gh-brass)" stroke="#3b2208" strokeWidth="1" />
      ))}
    </StaticSvg>
  );
}

// ── A guild banner ──────────────────────────────────────────────────────────
export function BannerArt({ className }: { className?: string }) {
  return (
    <StaticSvg viewBox="0 0 120 270" className={className} aria-hidden="true" focusable="false">
      <rect x="-4" y="4" width="128" height="7" rx="3.5" fill="url(#gh-handle)" />
      <circle cx="-5" cy="7.5" r="6" fill="url(#gh-brass)" />
      <circle cx="125" cy="7.5" r="6" fill="url(#gh-brass)" />
      <path d="M8 11 H112 V248 L60 216 L8 248 Z" fill="url(#gh-red)" />
      <path d="M8 11 H112 V248 L60 216 L8 248 Z" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M16 18 H104 V234 L60 206 L16 234 Z" fill="none" stroke={GOLD} strokeWidth="2.4" />
      {/* folds: soft light and shade down the cloth */}
      <path d="M38 11 V226" stroke="#000" strokeWidth="9" opacity="0.12" />
      <path d="M82 11 V226" stroke="#fff" strokeWidth="7" opacity="0.06" />
      <circle cx="60" cy="112" r="34" fill="#651c10" stroke={GOLD} strokeWidth="2.6" />
      <circle cx="60" cy="112" r="28" fill="none" stroke={GOLD_DEEP} strokeWidth="1" />
      <g transform="translate(60 113) rotate(32) scale(0.55)">
        <use href="#gh-broom" />
      </g>
      <path d="M60 52 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 Z" fill={GOLD} />
      <path d="M34 166 H86 M40 174 H80" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M60 216 V246" stroke={GOLD_DEEP} strokeWidth="2" />
      <circle cx="60" cy="250" r="5" fill="url(#gh-brass)" />
      <path d="M56 254 L54 268 M60 255 V270 M64 254 L66 268" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
    </StaticSvg>
  );
}

// ── The cellar door ─────────────────────────────────────────────────────────
// The frame (stone arch) and the door leaf are separate drawings, so the leaf
// can swing open on its hinges (a transform) over the light behind it.
export function DoorFrameArt() {
  const stones = Array.from({ length: 11 }, (_, i) => {
    const a = Math.PI - (i * Math.PI) / 10;
    const a2 = Math.PI - ((i + 1) * Math.PI) / 10;
    const p = (ang: number, rad: number) => `${(150 + Math.cos(ang) * rad).toFixed(1)} ${(150 - Math.sin(ang) * rad).toFixed(1)}`;
    return i < 10 ? `M${p(a, 104)}L${p(a, 138)}L${p(a2, 138)}L${p(a2, 104)}Z` : '';
  });
  return (
    <StaticSvg viewBox="0 0 300 420" className="gh-door-frame" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gh-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a5642" />
          <stop offset="1" stopColor="#3b2d20" />
        </linearGradient>
        <radialGradient id="gh-doorway" cx="0.5" cy="0.62" r="0.62">
          <stop offset="0" stopColor="#ffd38a" />
          <stop offset="0.45" stopColor="#d8862f" />
          <stop offset="1" stopColor="#3a1c08" />
        </radialGradient>
      </defs>
      {/* the doorway: warm light, and the first steps of a stair going up */}
      <path d="M46 420 V150 A104 104 0 0 1 254 150 V420 Z" fill="url(#gh-doorway)" />
      <g fill="#7a4a1e" opacity="0.85">
        <path d="M46 420 H254 V392 H46 Z" />
        <path d="M70 392 H254 V366 H70 Z" opacity="0.8" />
        <path d="M96 366 H254 V342 H96 Z" opacity="0.65" />
        <path d="M122 342 H254 V320 H122 Z" opacity="0.5" />
      </g>
      <g stroke="#ffe2a8" strokeWidth="2" opacity="0.5">
        <path d="M46 392 H254 M70 366 H254 M96 342 H254 M122 320 H254" />
      </g>
      {/* the arch: voussoirs and jambs */}
      <g fill="url(#gh-stone)" stroke="#1f160e" strokeWidth="2.5">
        {stones.map((d, i) => (d ? <path key={i} d={d} /> : null))}
        <path d="M12 150 H46 V420 H12 Z" />
        <path d="M254 150 H288 V420 H254 Z" />
        <path d="M12 200 H46 M12 252 H46 M12 304 H46 M12 356 H46 M254 200 H288 M254 252 H288 M254 304 H288 M254 356 H288" fill="none" />
      </g>
      <path d="M134 12 L166 12 L162 50 L138 50 Z" fill="url(#gh-brass)" stroke="#3b2208" strokeWidth="2" />
      <g transform="translate(150 31) rotate(32) scale(0.3)">
        <use href="#gh-broom" />
      </g>
    </StaticSvg>
  );
}

export function DoorLeafArt() {
  const planks = [46, 88, 130, 172, 214];
  return (
    <StaticSvg viewBox="46 46 208 374" className="gh-door-leaf-art" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gh-leaf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b3a1c" />
          <stop offset="0.5" stopColor="#4a2f16" />
          <stop offset="1" stopColor="#3a240f" />
        </linearGradient>
        <clipPath id="gh-leaf-clip">
          <path d="M46 420 V150 A104 104 0 0 1 254 150 V420 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#gh-leaf-clip)">
        <rect x="46" y="40" width="208" height="380" fill="url(#gh-leaf)" />
        {planks.map((x, i) => (
          <g key={x}>
            <path d={`M${x} 40 V420`} stroke="#1c1006" strokeWidth="3" />
            <path d={`M${x + 2.5} 40 V420`} stroke="#8a5f33" strokeWidth="1" opacity="0.4" />
            <path
              d={`M${x + 10} 60 C${x + 16} 140 ${x + 6} 220 ${x + 14} 300 S${x + 10} 400 ${x + 16} 420`}
              stroke="#2a180a"
              strokeWidth="1.2"
              fill="none"
              opacity={0.4 + (i % 2) * 0.2}
            />
          </g>
        ))}
        {/* iron straps with studs */}
        {[132, 300].map((y) => (
          <g key={y}>
            <rect x="46" y={y} width="208" height="16" fill="url(#gh-iron)" />
            <path d={`M46 ${y + 1.5} H254`} stroke="#7d746d" strokeWidth="1" opacity="0.6" />
            {[62, 104, 146, 188, 230].map((x) => (
              <circle key={x} cx={x} cy={y + 8} r="3.4" fill="#8f8780" stroke="#1a1512" strokeWidth="1" />
            ))}
          </g>
        ))}
        {/* hinge straps, curling at the ends */}
        <path d="M46 196 H120 q14 0 14 10" stroke="#231d19" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M46 364 H120 q14 0 14 -10" stroke="#231d19" strokeWidth="9" fill="none" strokeLinecap="round" />
      </g>
      {/* a little barred window */}
      <rect x="126" y="78" width="48" height="40" rx="6" fill="#1a0e05" stroke="url(#gh-iron)" strokeWidth="4" />
      <path d="M142 80 V116 M158 80 V116" stroke="#3a322d" strokeWidth="3.4" />
      <rect x="128" y="80" width="44" height="36" rx="4" fill="#ffb65e" opacity="0.32" />
      {/* the ring pull */}
      <circle cx="214" cy="268" r="9" fill="#2a231f" />
      <circle cx="214" cy="284" r="14" fill="none" stroke="url(#gh-brass)" strokeWidth="4.4" />
    </StaticSvg>
  );
}

// ── The plank floor ─────────────────────────────────────────────────────────
// One-point perspective: plank seams run from a vanishing point far above
// the middle, so the boards recede to the wall. Drawn into a squashable box
// (preserveAspectRatio none) with hairline strokes, so it fills any width.
export function FloorArt({ id = 'a' }: { id?: string }) {
  const VPX = 500;
  const VPY = -1400;
  const H = 180;
  const seams: string[] = [];
  const boards: { d: string; tone: number }[] = [];
  const front = Array.from({ length: 31 }, (_, i) => -250 + i * 50);
  const atY = (xf: number, y: number) => VPX + (xf - VPX) * ((y - VPY) / (H - VPY));
  for (let i = 0; i < front.length - 1; i++) {
    const a = front[i];
    const b = front[i + 1];
    boards.push({
      d: `M${atY(a, 0).toFixed(1)} 0L${atY(b, 0).toFixed(1)} 0L${b} ${H}L${a} ${H}Z`,
      tone: (i * 7) % 3,
    });
    seams.push(`M${atY(a, 0).toFixed(1)} 0L${a} ${H}`);
    // a butt joint somewhere along each board
    const y = 30 + ((i * 53) % 120);
    seams.push(`M${atY(a, y).toFixed(1)} ${y}L${atY(b, y).toFixed(1)} ${y}`);
  }
  const tones = ['#6e4c2b', '#7a5532', '#634325'];
  return (
    <StaticSvg viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" className="gh-floor-art" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`gh-floor-shade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#120a04" stopOpacity="0.75" />
          <stop offset="0.35" stopColor="#120a04" stopOpacity="0.2" />
          <stop offset="1" stopColor="#120a04" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id={`gh-floor-light-${id}`} cx="0.5" cy="0.2" r="0.7">
          <stop offset="0" stopColor="#ffb35c" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffb35c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {boards.map((b, i) => (
        <path key={i} d={b.d} fill={tones[b.tone]} />
      ))}
      <path d={seams.join('')} stroke="#2a1708" strokeWidth="1.4" vectorEffect="non-scaling-stroke" fill="none" />
      <rect width="1000" height={H} fill={`url(#gh-floor-light-${id})`} />
      <rect width="1000" height={H} fill={`url(#gh-floor-shade-${id})`} />
    </StaticSvg>
  );
}
