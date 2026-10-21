import { getProjectBySlug } from '@/data/projects';

/**
 * The samples on /build-websites: websites I built for businesses that do not
 * exist, so every button on them can be tried and nothing reaches anyone.
 * The page draws them as panes on a shoji wall, in this order.
 *
 * A sample with a project in src/data/projects.ts takes its name, line and
 * picture from there and links to its /built page. Gilt & Lather has no
 * project page, so its entry is written out here, and the site itself is
 * served from public/demo/gilt-and-lather (built in the vault's
 * Tools/gilt-and-lather; see the rewrite in next.config.ts).
 */
export type Sample = {
  key: string;
  name: string;
  /** What the made-up business is, shown above the name. */
  kind: string;
  /** One sentence, shown under the name. */
  summary: string;
  /** The website itself. */
  href: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /** Its page on this site, when it has one. */
  builtHref?: string;
};

function fromProject(slug: string, kind: string): Sample {
  const p = getProjectBySlug(slug);
  if (!p) throw new Error(`No project "${slug}" for the samples wall`);
  return {
    key: p.slug,
    name: p.name,
    kind,
    summary: p.summary,
    href: p.parts[0].href,
    image: p.image,
    imageAlt: p.imageAlt,
    imageWidth: p.imageWidth,
    imageHeight: p.imageHeight,
    builtHref: `/built/${p.slug}`,
  };
}

export const SAMPLES: Sample[] = [
  {
    key: 'gilt-and-lather',
    name: 'Gilt & Lather Barber Co.',
    kind: 'Barbershop',
    summary:
      'A website for a barbershop that does not exist, built to get people booked.',
    href: '/demo/gilt-and-lather',
    image: '/images/websites/gilt-and-lather.webp',
    imageAlt:
      'The Gilt & Lather Barber Co. website. Classic cuts, hot towels, done right, in gold letters beside a barber lifting a steaming hot towel.',
    imageWidth: 1200,
    imageHeight: 750,
  },
  fromProject('moonbowl', 'Ramen truck'),
  fromProject('voltic', 'Energy drink'),
];
