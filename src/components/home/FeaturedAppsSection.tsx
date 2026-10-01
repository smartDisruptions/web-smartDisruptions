import Link from 'next/link';
import { apps, ARCADE_SLUGS } from '@/data/apps';
import { builtHref } from '@/data/projects';
import Kiru from '@/components/kiru/Kiru';
import { Button } from '@/components/ui';

/**
 * "Stuff I built" as a film reel: two rows of real screenshots that slide in
 * opposite directions as you scroll past — a scroll-driven CSS animation on
 * the section's own view timeline, so it costs no JavaScript and runs on the
 * compositor. Every frame is a real link, in reading order. Without scroll
 * timelines (or with reduced motion) the rows simply scroll sideways by hand.
 */
export default function FeaturedAppsSection() {
  const shown = apps.filter((a) => a.thumbnailUrl);
  const games = new Set<string>(ARCADE_SLUGS as readonly string[]);
  const half = Math.ceil(shown.length / 2);
  const rows = [shown.slice(0, half), shown.slice(half)];

  return (
    <section aria-labelledby="hm-built" className="hm-reel pt-24 sm:pt-32">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 sm:px-6">
        <div className="sd-reveal">
          <p className="sd-kicker">Live, with receipts</p>
          <h2 id="hm-built" className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl">
            Stuff I built
          </h2>
        </div>
        <Kiru pose="build" className="hidden h-32 w-auto shrink-0 sm:block" />
      </div>

      <div className="mt-10 space-y-5">
        {rows.map((row, r) => (
          <ul key={r} className={`hm-reel-row ${r ? 'hm-reel-rev' : ''}`} role="list">
            {row.map((app) => (
              <li key={app.slug}>
                <Link href={builtHref(app.slug)} className="sd-print hm-frame group">
                  <span className="hm-frame-bar" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <img
                    src={app.thumbnailUrl}
                    alt={`${app.name} screenshot`}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={300}
                    className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="hm-frame-cap">
                    <span className="font-bold">{app.name}</span>
                    <span className="text-text-secondary">{games.has(app.slug) ? 'Game' : app.category}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="sd-reveal mx-auto mt-10 max-w-6xl px-5 sm:px-6">
        <Button variant="secondary" href="/built">
          See all of it
        </Button>
      </div>
    </section>
  );
}
