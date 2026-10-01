import { getPublishedPosts } from '@/lib/posts';
import { marketStormReports } from '@/data/marketStorm';
import { apps, ARCADE_SLUGS } from '@/data/apps';
import { projects, PROJECT_APP_SLUGS } from '@/data/projects';
import Kanji from '@/components/brand/Kanji';

/**
 * A vermilion band of receipts under the hero: counts read straight from the
 * site's own data at build time, so the numbers can't drift from the pages
 * they describe. CSS marquee; stopped (and wrapped) under reduced motion.
 */
export default function ReceiptsBand() {
  const builds =
    projects.length + apps.filter((a) => !(a.slug in PROJECT_APP_SLUGS) && !(ARCADE_SLUGS as readonly string[]).includes(a.slug)).length;
  const items = [
    `${getPublishedPosts().length} notes from the bench`,
    `${marketStormReports.length} Market Storm reports`,
    `${builds} things built`,
    `${ARCADE_SLUGS.length} games in the arcade`,
    'Mistakes included. Always.',
    'Receipts over claims',
  ];
  const row = (hidden: boolean) => (
    <ul className="hm-band-row" role="list" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t} className="flex items-center gap-6">
          <span>{t}</span>
          <Kanji char="忍" className="h-4 w-4 opacity-60" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="By the numbers" className="hm-band">
      <div className="hm-band-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
