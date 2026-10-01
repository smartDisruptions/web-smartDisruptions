import Link from 'next/link';
import Kiru, { type KiruPose } from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { getPublishedPosts } from '@/lib/posts';
import { marketStormReports } from '@/data/marketStorm';
import { apps, ARCADE_SLUGS } from '@/data/apps';
import { projects, PROJECT_APP_SLUGS } from '@/data/projects';
import { IconArrowRight } from '@/components/icons';

/**
 * The four rooms of the dojo as app tiles: each with its kanji, Kiru doing
 * that room's job, one line, and a live count. A 2×2 grid on a phone, a
 * bento row on a desktop. Each tile carries its own ground — ruled washi,
 * a storm, a blueprint, a neon arcade — all CSS.
 */
export default function DojoMap() {
  const builds =
    projects.length + apps.filter((a) => !(a.slug in PROJECT_APP_SLUGS) && !(ARCADE_SLUGS as readonly string[]).includes(a.slug)).length;
  const rooms: {
    href: string;
    title: string;
    line: string;
    count: string;
    kanji: string;
    pose: KiruPose;
    tone: string;
  }[] = [
    {
      href: '/content',
      title: 'Writing',
      line: 'How I built it, what broke, and the prompts I used.',
      count: `${getPublishedPosts().length} notes`,
      kanji: '書',
      pose: 'read',
      tone: 'hm-room-writing',
    },
    {
      href: '/market-storm',
      title: 'Market Storm',
      line: 'The AI market, read by a multi-agent research method.',
      count: `${marketStormReports.length} reports`,
      kanji: '嵐',
      pose: 'storm',
      tone: 'hm-room-storm',
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
      count: `${ARCADE_SLUGS.length} games`,
      kanji: '遊',
      pose: 'game',
      tone: 'hm-room-arcade',
    },
  ];

  return (
    <section aria-labelledby="hm-rooms" className="sd-defer mx-auto max-w-6xl px-5 pt-16 pb-6 sm:px-6 sm:pt-24" style={{ containIntrinsicSize: 'auto 620px' }}>
      <div className="sd-reveal flex items-end justify-between gap-6">
        <div>
          <p className="sd-kicker">Four rooms</p>
          <h2 id="hm-rooms" className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl">
            Pick a door.
          </h2>
        </div>
      </div>
      <ul className="hm-rooms mt-10" role="list">
        {rooms.map((r, i) => (
          <li key={r.href} className="sd-reveal" style={{ animationDelay: `${i * 60}ms` }}>
            <Link href={r.href} className={`sd-card sd-tilt hm-room ${r.tone}`}>
              <Kanji char={r.kanji} className="hm-room-kanji" />
              <span className="hm-room-count">{r.count}</span>
              <Kiru pose={r.pose} className="hm-room-kiru" />
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
