import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import Kiru, { type KiruPose } from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import StaticSvg from '@/components/brand/StaticSvg';
import { BUILD_ROOMS, type BuildRoom } from '@/components/build/rooms';
import { MOON, TILE_URI, pixelPaths } from '@/components/build/sections/pixels';
import { GAME_SLUGS } from '@/data/apps';
import { IconArrowRight } from '@/components/icons';

type Room = {
  href: string;
  title: string;
  line: string;
  count: string;
  /** More of the count, shown where the tile is wide enough to hold it
      on one line (a phone's half-width tile is not). */
  more?: string;
  kanji: string;
  pose: KiruPose;
  tone: string;
  /** Anything the room's ground draws above its kanji and behind Kiru. */
  ground?: ReactNode;
};

/** The games room's moon, in pixels like the room it opens onto. */
const MOON_PATHS = [...pixelPaths(MOON)];

/**
 * What each Build room's door is made of. Websites: a shoji, paper in a
 * wooden lattice, with a browser's three dots in its top rail; Kiru is
 * building it. Apps: black urushi with a gold maki-e line and a phone made
 * of light; Kiru throws a shuriken, a tool that does one job. Games: pixel
 * stars and copper roof tiles under a night sky; Kiru runs the level.
 */
const BUILD_DOORS: Record<
  BuildRoom['key'],
  Pick<Room, 'pose' | 'tone' | 'ground'>
> = {
  websites: {
    pose: 'build',
    tone: 'hb-door-web',
    ground: (
      <span className="hb-door-bar" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    ),
  },
  apps: {
    pose: 'throw',
    tone: 'hb-door-app',
    ground: <span className="hb-door-phone" aria-hidden />,
  },
  games: {
    pose: 'run',
    tone: 'hb-door-game',
    ground: (
      <>
        <span className="hb-door-stars" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <StaticSvg
          viewBox="0 0 17 17"
          shapeRendering="crispEdges"
          className="hb-door-moon"
          aria-hidden
        >
          {MOON_PATHS.map(([fill, d]) => (
            <path key={fill} d={d} fill={fill} />
          ))}
        </StaticSvg>
        <span
          className="hb-door-tiles"
          style={{ '--tile': TILE_URI } as CSSProperties}
          aria-hidden
        />
      </>
    ),
  },
};

/**
 * The four rooms of the dojo as app tiles: the three Build rooms and the
 * Arcade, each with its kanji, Kiru doing that room's job, one line, and a
 * chip that tells the truth. A 2×2 grid on a phone, a bento row on a
 * desktop. Each tile carries its own ground, all CSS (home.css).
 */
export default function DojoMap() {
  const rooms: Room[] = [
    ...BUILD_ROOMS.map((r) => ({
      href: r.href,
      title: r.title,
      line: r.line,
      // JOSH: no guides in these rooms yet, so no count. Once a room has
      // some, swap this for the real number (e.g. `${guides.length} guides`).
      count: 'New room',
      more: ' · free by email',
      kanji: r.kanji,
      ...BUILD_DOORS[r.key],
    })),
    {
      href: '/games',
      title: 'Arcade',
      line: 'Games you can play right now.',
      count: `${GAME_SLUGS.length} games`,
      kanji: '遊',
      pose: 'game',
      tone: 'hm-room-arcade',
    },
  ];

  return (
    <section
      aria-labelledby="hm-rooms"
      className="sd-defer mx-auto max-w-6xl px-5 pt-16 pb-6 sm:px-6 sm:pt-24"
      style={{ containIntrinsicSize: 'auto 620px' }}
    >
      <div className="sd-reveal flex items-end justify-between gap-6">
        <div>
          <p className="sd-kicker">Four rooms</p>
          <h2
            id="hm-rooms"
            className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl"
          >
            Pick a door.
          </h2>
        </div>
      </div>
      <ul className="hm-rooms mt-10" role="list">
        {rooms.map((r, i) => (
          <li
            key={r.href}
            className="sd-reveal"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Link href={r.href} className={`sd-card sd-tilt hm-room ${r.tone}`}>
              <Kanji char={r.kanji} className="hm-room-kanji" />
              <span className="hm-room-count">
                {r.count}
                {r.more && <span className="hm-room-count-more">{r.more}</span>}
              </span>
              <Kiru pose={r.pose} className="hm-room-kiru" />
              {r.ground}
              <span className="hm-room-text">
                <span className="font-display hm-room-title">{r.title}</span>
                <span className="hm-room-line">{r.line}</span>
              </span>
              <IconArrowRight size={20} className="hm-room-arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
