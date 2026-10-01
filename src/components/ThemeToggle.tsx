'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

// The theme lives on <html data-theme> (set before paint by the layout's
// no-flash script) and in localStorage. It's external DOM state, so it is read
// with useSyncExternalStore — no setState-in-effect, and hydration-safe.
function subscribe(onChange: () => void) {
  window.addEventListener('themechange', onChange);
  return () => window.removeEventListener('themechange', onChange);
}
function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
function getServerSnapshot(): Theme {
  return 'light';
}

const CHROME: Record<Theme, string> = { light: '#f4efe4', dark: '#090b16' };

function apply(next: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', next);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME[next]);
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* private mode / storage blocked — the theme still applies this session */
  }
  window.dispatchEvent(new Event('themechange'));
}

/**
 * Day / night. The new theme is painted as a circle that grows out of the
 * button — a View Transition with a clip-path, so the browser snapshots both
 * themes and animates between them on the compositor. Browsers without View
 * Transitions, and readers who asked for reduced motion, just switch.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === 'dark';

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = isDark ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
    };
    if (!doc.startViewTransition || reduce) {
      apply(next);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.classList.add('sd-theme-vt');
    const vt = doc.startViewTransition(() => apply(next));
    vt.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          {
            duration: 650,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {});
    vt.finished.finally(() => root.classList.remove('sd-theme-vt'));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      title={isDark ? 'Day mode' : 'Night mode'}
      className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border text-text-secondary transition-colors hover:border-[var(--sd-border-strong)] hover:text-text-primary"
    >
      {/* One drawing that morphs: the sun's disc is masked into a crescent,
          the rays fold in. Transforms only. */}
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="overflow-visible">
        <mask id="sd-moon-mask">
          <rect width="24" height="24" fill="#fff" />
          <circle
            cx={isDark ? 30 : 17}
            cy={isDark ? -6 : 7}
            r="6.5"
            fill="#000"
            style={{ transition: 'cx .5s cubic-bezier(.16,1,.3,1), cy .5s cubic-bezier(.16,1,.3,1)' }}
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r={isDark ? 4.6 : 7.2}
          fill="currentColor"
          mask="url(#sd-moon-mask)"
          style={{ transition: 'r .5s cubic-bezier(.16,1,.3,1)' }}
        />
        <g
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          style={{
            transformOrigin: '12px 12px',
            transition: 'transform .5s cubic-bezier(.16,1,.3,1), opacity .3s',
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-60deg) scale(.4)',
            opacity: isDark ? 1 : 0,
          }}
        >
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </g>
      </svg>
    </button>
  );
}
