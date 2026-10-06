import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import Kiru, { type KiruPose } from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { getFieldNotes } from '@/lib/fieldNotes';
import { marketStormReports } from '@/data/marketStorm';
import { apps, GAME_SLUGS } from '@/data/apps';
import { projects, PROJECT_APP_SLUGS } from '@/data/projects';
import { IconArrowRight } from '@/components/icons';

/**
 * The Learn room's fireflies: where each one hovers and its own rhythm, so
 * no two blink together. They keep clear of the count chip and the title.
 */
const FIREFLIES = [
  { '--x': '12%', '--y': '52%', '--t': '6.4s', '--d': '-1.1s' },
  { '--x': '30%', '--y': '28%', '--t': '7.6s', '--d': '-4.3s' },
  { '--x': '70%', '--y': '60%', '--t': '5.9s', '--d': '-2.6s' },
  { '--x': '86%', '--y': '38%', '--t': '8.1s', '--d': '-5.4s' },
  { '--x': '54%', '--y': '20%', '--t': '6.9s', '--d': '-0.4s' },
] as unknown as CSSProperties[];

/**
 * The four rooms of the dojo as app tiles: each with its kanji, Kiru doing
 * that room's job, one line, and a live count. A 2×2 grid on a phone, a
 * bento row on a desktop. Each tile carries its own ground — ruled washi,
 * a lamplit study, a blueprint, a neon arcade — all CSS.
 */
export default function DojoMap() {
  const builds =
    projects.length +
    apps.filter(
      (a) =>
        !(a.slug in PROJECT_APP_SLUGS) &&
        !(GAME_SLUGS as readonly string[]).includes(a.slug)
    ).length;
  // The same list /content pages through (posts plus the pinned guide), so
  // this count and the Writing page's can never disagree.
  const notes = getFieldNotes().length;
  const rooms: {
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
  }[] = [
    {
      href: '/content',
      title: 'Writing',
      line: 'Field notes, and Market Storm on the AI market.',
      count: `${notes} notes`,
      more: ` · ${marketStormReports.length} reports`,
      kanji: '書',
      pose: 'read',
      tone: 'hm-room-writing',
    },
    {
      href: '/learn',
      title: 'Learn',
      line: 'Let’s learn to build websites, apps and games. No hype.',
      count: 'Free · by email',
      kanji: '学',
      pose: 'wave',
      tone: 'hm-room-learn',
      ground: (
        <span className="hm-fireflies" aria-hidden>
          {FIREFLIES.map((style, i) => (
            <i key={i} style={style} />
          ))}
        </span>
      ),
    },
    {
      href: '/built',
      title: 'What I Built',
      line: 'Websites, apps and tools — live, with receipts.',
      count: `${builds} builds`,
      kanji: '創',
      pose: 'build',
      tone: 'hm-room-built',
    },
    {
      href: '/games',
      title: 'Arcade',
      line: 'Games you can play right now. One was built by my son.',
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
