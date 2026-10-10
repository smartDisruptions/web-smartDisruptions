import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Glyph, GlyphSeal } from '@/components/about/work/glyphs';
import ArmoryWallIsland from './ArmoryWallIsland';
import { sizeOf } from './media';
import './wall.css';

export type WallItem = {
  key: string;
  name: string;
  /** Small label over the name: what the thing is. */
  kind: string;
  href: string;
  external?: boolean;
  src: string;
  /** The brush kanji on the back of the plaque. */
  mark: string;
  /** Which chip finds it (a WallGroup id). */
  group?: string;
};

/** A chip over the ring: 'all', or the group its plaques carry. */
export type WallGroup = { id: string; label: string; count: number };

/**
 * How far the ring stands from the first plaque before the behaviour wakes:
 * three plaques short, so its entrance can turn the last little way and
 * settle on the first one (armory-drive.ts). Without JavaScript it simply
 * stays here, a still ring of links.
 */
const PARK = 3;
/**
 * Which plaques show their backs while the ring stands parked. The drive
 * works this out exactly for the screen it is on (a plaque turns its back
 * on you a little before 90°, about 68–70° here); before it loads, any
 * threshold between the plaques either side of that will do.
 */
const AWAY = 0.36;

/**
 * Everything on one wall: a ring of plaques in CSS 3D, hung in a hall lit by
 * one lantern.
 *
 * All of it is server markup and CSS. Each plaque is placed with
 * rotateY(i × 360°/n) translateZ(r), and the ring turns by one value, its
 * own rotateY, which the drive writes as its transform. Before the behaviour
 * loads (and if it never does) this is already a ring of real links in tab
 * order, standing three plaques short of the first.
 *
 * Each plaque is one composited layer. Its back — lacquer, its seal, its
 * name — is drawn inside it, mirrored, and shown while that plaque faces
 * away (data-away), so the far side of the ring reads as a row of seals.
 *
 * The light is the hall's, not the plaques': the lantern's pool, the shadow
 * at the sides and the gleam on the floor stay where they are and the ring
 * turns through them (./wall.css), so turning it costs one transform.
 *
 * Under reduced motion the same plaques lie flat in a grid, the chips filter
 * it, and nothing loads.
 *
 * The seals and the lantern's 創 are drawn from /about's glyph sprite
 * (components/about/work/glyphs.tsx), so the page that hangs this wall must
 * render <GlyphSprite /> — /about does, and is the only page that does.
 */
export default function ArmoryWall({
  items,
  label,
  groups,
}: {
  items: WallItem[];
  label: string;
  groups?: WallGroup[];
}) {
  const n = items.length;
  const step = 360 / n;
  const park = n > 6 ? PARK : 0;
  const spin = park * step;
  const front = (n - park) % n;
  const away = (i: number) =>
    Math.cos(((spin + i * step) * Math.PI) / 180) < AWAY;
  const first = items[front];

  return (
    <div
      className="bt-wall"
      data-wall
      data-park={park ? '' : undefined}
      style={{ '--n': n, '--park': park } as CSSProperties}
    >
      {groups && groups.length > 1 && (
        <div className="bt-wall-chips" role="group" aria-label="Show me">
          {groups.map((g, gi) => (
            // Named by what it shows ("Games 12"), so the spoken name
            // matches the printed one.
            <button
              key={g.id}
              type="button"
              className="bt-wall-chip"
              data-wall-chip={g.id}
              data-label={g.label}
              aria-pressed={gi === 0}
            >
              <span>{g.label}</span>
              <span className="bt-wall-chip-n">{g.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="bt-wall-stage">
        {/* The polished floor, and its gleam under the front plaque. */}
        <div className="bt-wall-floor" aria-hidden="true" />

        <ul className="bt-ring" role="list" aria-label={label}>
          {items.map((item, i) => {
            const [w, h] = sizeOf(item.src);
            // The label painted on the plaque is part of the picture: the
            // hall's light shades it as the plaque turns away (wall.css), so
            // on the slivers at the edge of the light (three plaques round,
            // ~2.8:1) it is below AA by design. So it is presentation, and the
            // link is named by the sr-only copy: name, then kind, in words.
            // At AA the name is on the front plaque and in the caption under
            // the ring, which is where every keyboard path and every tap on a
            // far plaque brings it (armory-drive.ts), and on the flat grid
            // under reduced motion. The back is decoration too: the name is
            // already said once.
            const face = (
              <>
                <span className="bt-panel-shot">
                  <Image
                    src={item.src}
                    alt=""
                    width={w}
                    height={h}
                    sizes="(max-width: 639px) 176px, 252px"
                    loading="lazy"
                    draggable={false}
                  />
                </span>
                <span className="bt-panel-cap" aria-hidden="true">
                  <span className="bt-panel-name">{item.name}</span>
                  <span className="bt-panel-kind">{item.kind}</span>
                </span>
                <span className="sr-only">{`${item.name}, ${item.kind}`}</span>
                <span className="bt-panel-back" aria-hidden="true">
                  <GlyphSeal char={item.mark} />
                  <span className="bt-panel-back-name">{item.name}</span>
                </span>
              </>
            );
            return (
              <li
                key={item.key}
                className="bt-panel"
                data-group={item.group}
                data-front={i === front ? '' : undefined}
                data-away={away(i) ? '' : undefined}
                style={{ '--i': i } as CSSProperties}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bt-panel-face"
                    draggable={false}
                  >
                    {face}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="bt-panel-face"
                    draggable={false}
                  >
                    {face}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* The hall's light: the lantern's pool on the front plaque, and the
            dark the plaques turn into at the sides. Fixed to the room. */}
        <div className="bt-wall-light" aria-hidden="true" />

        {/* A red paper lantern (chōchin) hung over the ring, 創 on it:
            "to make". An object, so the same colours in both themes. */}
        <div className="bt-wall-lantern" aria-hidden="true">
          <span className="bt-wall-lantern-glow" />
          <span className="bt-wall-lantern-cord" />
          <svg
            className="bt-wall-lantern-art"
            viewBox="0 0 64 116"
            focusable="false"
          >
            <defs>
              <radialGradient id="bt-wall-paper" cx="0.5" cy="0.52" r="0.62">
                <stop offset="0" stopColor="#ffe6a6" />
                <stop offset="0.42" stopColor="#ff9b4b" />
                <stop offset="0.8" stopColor="#de4024" />
                <stop offset="1" stopColor="#a8261a" />
              </radialGradient>
            </defs>
            <path
              d="M20 21C3 29 3 87 20 95h24c17-8 17-66 0-74z"
              fill="url(#bt-wall-paper)"
            />
            <g fill="none" stroke="#7a1c10" strokeOpacity="0.38">
              <path d="M15 30q17 3 34 0" />
              <path d="M10 40q22 3.4 44 0" />
              <path d="M7 50q25 3.6 50 0" />
              <path d="M6 60q26 3.6 52 0" />
              <path d="M7 70q25 3.4 50 0" />
              <path d="M10 80q22 3 44 0" />
              <path d="M15 89q17 2.4 34 0" />
            </g>
            <path
              d="M14 34c-4 10-4 38 0 50"
              fill="none"
              stroke="#fff4dc"
              strokeOpacity="0.35"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <rect
              x="18"
              y="12"
              width="28"
              height="10"
              rx="2.5"
              fill="#1b1512"
            />
            <rect x="18" y="19.5" width="28" height="1.5" fill="#c8962e" />
            <rect x="18" y="94" width="28" height="9" rx="2.5" fill="#1b1512" />
            <rect x="18" y="95.5" width="28" height="1.5" fill="#c8962e" />
            <path d="M32 103v10" stroke="#1b1512" strokeWidth="2" />
          </svg>
          <Glyph char="創" className="bt-wall-lantern-k" />
        </div>
      </div>

      {/* The front plaque's name in big type, kept up to date as the ring
          turns. It is drawn for the eye (aria-hidden); the polite line the
          island renders says where the ring stopped, once, so a screen
          reader isn't read every plaque that passes. */}
      <div className="bt-wall-controls">
        <button
          type="button"
          className="bt-wall-btn"
          data-wall-prev
          aria-label="Turn the wall back one"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <p className="bt-wall-cap" aria-hidden="true">
          <span className="bt-wall-cap-kind" data-wall-kind>
            {first?.kind}
          </span>
          <span
            className="bt-wall-cap-name font-display"
            data-wall-name
            data-long={first && first.name.length > 22 ? '' : undefined}
          >
            {first?.name}
          </span>
        </p>
        <p className="bt-wall-at" aria-hidden="true">
          <span data-wall-at>{String(front + 1).padStart(2, '0')}</span>
          <span className="bt-wall-at-of"> / {String(n).padStart(2, '0')}</span>
        </p>
        <button
          type="button"
          className="bt-wall-btn"
          data-wall-next
          aria-label="Turn the wall on one"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <ArmoryWallIsland />
    </div>
  );
}
