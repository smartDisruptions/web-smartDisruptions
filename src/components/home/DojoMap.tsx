import Link from 'next/link';
import type { ReactNode } from 'react';
import Kiru, { type KiruPose } from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { counts } from '@/components/about/work/data';
import { getArchivedNotes, getFieldNotes } from '@/lib/fieldNotes';
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

/**
 * The four rooms of the dojo as app tiles (Josh's four, November 2026: Apps,
 * Learn, Arcade and Writing; until then the three Build rooms and the
 * Arcade). Each has its kanji, Kiru doing that room's job, one line, and a
 * chip that tells the truth, counted from the site's own data. A 2×2 grid on
 * a phone, a bento row on a desktop. Each tile carries its own ground, all
 * CSS (home.css).
 *
 * Apps: black urushi with a gold maki-e line and a phone made of light; Kiru
 * throws a shuriken, a tool that does one job. Learn: a shoji, paper in a
 * wooden lattice, with a browser's three dots in its top rail; Kiru is
 * building. Arcade: neon. Writing: ai-iro, the indigo of the site's ink,
 * ruled like a page; Kiru reads.
 */
export default function DojoMap() {
  const built = counts.websites + counts.apps + counts.games;
  const notes = getFieldNotes().length + getArchivedNotes().length;
  const rooms: Room[] = [
    {
      href: '/apps',
      title: 'Apps',
      line: 'Everything I’ve built. Free to try.',
      count: `${built} builds`,
      kanji: '器',
      pose: 'throw',
      tone: 'hb-door-app',
      ground: <span className="hb-door-phone" aria-hidden />,
    },
    {
      href: '/learn',
      title: 'Learn',
      line: 'Build websites, apps and games with AI.',
      count: 'Free',
      more: ' · by email',
      kanji: '学',
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
    {
      href: '/games',
      title: 'Arcade',
      line: 'Games you can play right now.',
      count: `${GAME_SLUGS.length} games`,
      kanji: '遊',
      pose: 'game',
      tone: 'hm-room-arcade',
    },
    {
      href: '/content',
      title: 'Writing',
      line: 'What I learn building, with receipts.',
      count: `${notes} notes`,
      kanji: '書',
      pose: 'read',
      tone: 'hm-room-writing',
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
