/**
 * The menus' icons: small inline SVGs in currentColor unless they are
 * objects (scrolls, stars, trail swatches), which keep their own colours.
 * All decorative: the button or the text beside them carries the meaning.
 */
import type { ModeId, TrailId } from '../types';

const box = { viewBox: '0 0 20 20', 'aria-hidden': true } as const;
const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function PlayIcon() {
  return (
    <svg {...box} fill="currentColor">
      <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg {...box} fill="currentColor">
      <rect x="4.5" y="3.5" width="4" height="13" rx="1.2" />
      <rect x="11.5" y="3.5" width="4" height="13" rx="1.2" />
    </svg>
  );
}

export function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg {...box} {...line} strokeWidth={1.8}>
      <path
        d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z"
        fill="currentColor"
        stroke="none"
      />
      {on ? (
        <path d="M13.5 7.2a4 4 0 0 1 0 5.6M15.8 5a7 7 0 0 1 0 10" />
      ) : (
        <path d="M13.5 7.5l4 5M17.5 7.5l-4 5" />
      )}
    </svg>
  );
}

export function FullIcon({ full }: { full: boolean }) {
  return (
    <svg {...box} {...line} strokeWidth={1.9}>
      {full ? (
        <path d="M7.5 3.5v4h-4M12.5 3.5v4h4M7.5 16.5v-4h-4M12.5 16.5v-4h4" />
      ) : (
        <path d="M3.5 7.5v-4h4M16.5 7.5v-4h-4M3.5 12.5v4h4M16.5 12.5v4h-4" />
      )}
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg {...box} {...line} strokeWidth={2.2}>
      <path d="M16 10H4.5M9 5 4 10l5 5" />
    </svg>
  );
}

export function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg {...box} {...line} strokeWidth={2.6}>
      <path d={dir === 'left' ? 'M12.5 4 6.5 10l6 6' : 'M7.5 4l6 6-6 6'} />
    </svg>
  );
}

export function RestartIcon() {
  return (
    <svg {...box} {...line}>
      <path d="M4.6 11.2A5.6 5.6 0 1 0 6.3 5.6" />
      <path d="M6.6 2.6 6.2 5.8l3.2.5" />
    </svg>
  );
}

export function LevelsIcon() {
  return (
    <svg {...box} fill="currentColor">
      <rect x="3" y="3" width="6" height="6" rx="1.6" />
      <rect x="11" y="3" width="6" height="6" rx="1.6" />
      <rect x="3" y="11" width="6" height="6" rx="1.6" />
      <rect x="11" y="11" width="6" height="6" rx="1.6" />
    </svg>
  );
}

/** Classic: the endless run. */
export function InfinityIcon() {
  return (
    <svg {...box} {...line} strokeWidth={2.2}>
      <path d="M10 10c-1.7-2.3-3.1-3.4-4.6-3.4a3.4 3.4 0 0 0 0 6.8c1.5 0 2.9-1.1 4.6-3.4s3.1-3.4 4.6-3.4a3.4 3.4 0 0 1 0 6.8c-1.5 0-2.9-1.1-4.6-3.4Z" />
    </svg>
  );
}

/** Gear: a headband, knotted, its tails flying. */
export function GearIcon() {
  return (
    <svg {...box} {...line}>
      <path d="M2.5 9.2c3.6-2.6 8.6-2.9 12.6-.9" strokeWidth={3} />
      <circle cx="15.6" cy="9" r="1.7" fill="currentColor" stroke="none" />
      <path d="M16.4 10.2l2.2 4.6M15.2 10.6l-.2 5.2" strokeWidth={1.8} />
    </svg>
  );
}

/** Practice: a checkpoint diamond. */
export function DiamondIcon({ mark }: { mark?: '+' | '-' }) {
  return (
    <svg {...box} {...line} strokeWidth={1.9}>
      <path d="M10 2.2 17.8 10 10 17.8 2.2 10Z" />
      {mark === '+' && <path d="M10 7v6M7 10h6" strokeWidth={2.2} />}
      {mark === '-' && <path d="M7 10h6" strokeWidth={2.2} />}
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...box} {...line} strokeWidth={1.8}>
      <rect x="4.5" y="9" width="11" height="8.2" rx="2" />
      <path d="M7 9V6.6a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

export function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="rr-star"
      data-on={filled ? '' : undefined}
    >
      <path
        d="M10 1.9l2.5 5 5.5.8-4 3.9.9 5.5L10 14.5l-4.9 2.6.9-5.5-4-3.9 5.5-.8Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A secret scroll: rolled paper with a vermilion tie; a ghost until found. */
export function ScrollIcon({ got }: { got: boolean }) {
  return (
    <svg
      viewBox="0 0 26 18"
      aria-hidden="true"
      className="rr-scroll"
      data-got={got ? '' : undefined}
    >
      <rect className="rr-scroll-paper" x="5" y="3" width="16" height="12" />
      <rect
        className="rr-scroll-roll"
        x="1.5"
        y="1"
        width="5"
        height="16"
        rx="2.5"
      />
      <rect
        className="rr-scroll-roll"
        x="19.5"
        y="1"
        width="5"
        height="16"
        rx="2.5"
      />
      <rect className="rr-scroll-tie" x="11.5" y="3" width="3" height="12" />
    </svg>
  );
}

/** The six ways to move, as glyphs. */
export function ModeIcon({ mode }: { mode: ModeId }) {
  return (
    <svg {...box} {...line} strokeWidth={1.8}>
      {mode === 'run' && (
        <>
          <path d="M3 13.5Q10 1 17 13.5" strokeDasharray="0.1 3.2" />
          <path d="M2 17.5h16" />
          <path
            d="M8 17.5 10 13l2 4.5Z"
            fill="currentColor"
            strokeWidth={1.2}
          />
        </>
      )}
      {mode === 'kite' && (
        <>
          <path d="M10 1.8 15.6 8 10 13.6 4.4 8Z" />
          <path d="M10 1.8v11.8M4.4 8h11.2" strokeWidth={1.2} />
          <path d="M10 13.6c-2 1.2-2 2.4 0 3.2s2 1.6.2 2.4" strokeWidth={1.4} />
        </>
      )}
      {mode === 'roll' && (
        <>
          <circle cx="10" cy="10" r="4.6" />
          <path d="M10 5.4v9.2" strokeWidth={1.2} />
          <path d="M3 15V5M1.2 7 3 5l1.8 2M17 5v10M15.2 13l1.8 2 1.8-2" />
        </>
      )}
      {mode === 'parasol' && (
        <>
          <path
            d="M2.2 10.2Q10 .6 17.8 10.2Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path d="M10 3.4 6.4 10M10 3.4l3.6 6.6" strokeWidth={1.2} />
          <path d="M10 10.2v6.2q0 1.8-1.8 1.6" />
        </>
      )}
      {mode === 'dragon' && (
        <path d="M2 15.5 6.2 6.5l4.2 9 4.2-9L18 13M18 13l-.4-3.2M18 13l-3-1" />
      )}
      {mode === 'shadow' && (
        <>
          <path d="M2.5 2.5h15M2.5 17.5h15" />
          <circle cx="10" cy="13.6" r="2.2" fill="currentColor" />
          <circle cx="10" cy="6.4" r="2.2" strokeWidth={1.3} />
          <path d="M10 9.4v1.6" strokeWidth={1.3} />
        </>
      )}
    </svg>
  );
}

/** What each trail leaves behind Kiru, in miniature. */
export function TrailIcon({ trail }: { trail: TrailId }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="rr-trail-art">
      {trail === 'none' && (
        <g fill="none" stroke="#9aa0c0" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="7" />
          <path d="M7 17 17 7" />
        </g>
      )}
      {trail === 'ink' && (
        <g fill="#b9c3ff">
          <path
            d="M3 15c3-1 5-4 9-4s6 2 9 1c-2 3-5 4-8 3s-5 1-10 0Z"
            opacity="0.85"
          />
          <circle cx="5" cy="10" r="1.4" opacity="0.6" />
          <circle cx="8.5" cy="7.5" r="1" opacity="0.45" />
        </g>
      )}
      {trail === 'petals' && (
        <g fill="#ff8fb8">
          <ellipse
            cx="6"
            cy="14"
            rx="3"
            ry="1.7"
            transform="rotate(-30 6 14)"
          />
          <ellipse cx="12" cy="9" rx="3" ry="1.7" transform="rotate(20 12 9)" />
          <ellipse
            cx="18"
            cy="15"
            rx="2.6"
            ry="1.5"
            transform="rotate(60 18 15)"
            opacity="0.8"
          />
        </g>
      )}
      {trail === 'sparks' && (
        <g stroke="#ffd36b" strokeWidth="2" strokeLinecap="round">
          <path d="M4 12h5M11 7l3-2M12 17l3 2M17 12h3" />
          <circle cx="10" cy="12" r="1.6" fill="#fff3dc" stroke="none" />
        </g>
      )}
      {trail === 'embers' && (
        <g>
          <circle cx="6" cy="15" r="2.4" fill="#ff5b3d" />
          <circle cx="12" cy="10" r="2" fill="#ffb547" />
          <circle cx="17.5" cy="14" r="1.5" fill="#ff7a2a" />
          <circle cx="12" cy="10" r="0.9" fill="#fff3dc" />
        </g>
      )}
      {trail === 'stars' && (
        <g fill="#fff3dc">
          <path d="M8 5l1.2 2.6 2.8.4-2 2 .5 2.8L8 11.5l-2.5 1.3.5-2.8-2-2 2.8-.4Z" />
          <path
            d="M17 12l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3Z"
            fill="#ffcf70"
          />
          <circle cx="13" cy="19" r="1" />
        </g>
      )}
    </svg>
  );
}
