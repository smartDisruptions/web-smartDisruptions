import { sizeOf } from '@/components/built/media';
import { getAppBySlug } from '@/data/apps';
import { builtHref, getProjectBySlug } from '@/data/projects';

/**
 * The samples on the Build pages: three things I built, shown in place of
 * the guides until there are guides. Each room keeps its own list (the
 * samples.ts beside its page) and its own frame, and every sample is drawn
 * by the same card (SampleCard.tsx, styles in build-samples.css).
 *
 * A sample that is already a project or an app on this site takes its name,
 * line and pictures from src/data and links to its /built page; the room's
 * list only says what kind of thing it is and what the link should say.
 */
export type SamplePicture = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Sample = {
  key: string;
  name: string;
  /** What it is, in a word or two, shown above the name. */
  kind: string;
  /** One or two sentences, shown under the name. */
  summary: string;
  /** The thing itself. It opens in a new tab, so the Build page stays put. */
  href: string;
  /** What that link says: 'Visit the site', 'Play it', 'Try the app'. */
  goLabel: string;
  /** One wide picture, or three tall ones that the card sets side by side. */
  pictures: SamplePicture[];
  /** Its page on this site, when it has one. */
  builtHref?: string;
};

/** A picture at its real size (media.ts), so nothing moves as it loads. */
export function pic(src: string, alt: string): SamplePicture {
  const [width, height] = sizeOf(src);
  return { src, alt, width, height };
}

type Overrides = Pick<Sample, 'kind' | 'goLabel'> &
  Partial<Omit<Sample, 'kind' | 'goLabel'>>;

/** A sample from a project in src/data/projects.ts. */
export function projectSample(slug: string, o: Overrides): Sample {
  const p = getProjectBySlug(slug);
  if (!p) throw new Error(`No project "${slug}" for a Build page sample`);
  return {
    key: p.slug,
    name: p.name,
    summary: p.summary,
    href: p.parts[0].href,
    pictures: [pic(p.image, p.imageAlt)],
    builtHref: `/built/${p.slug}`,
    ...o,
  };
}

/** A sample from an app or game in src/data/apps.ts. */
export function appSample(
  slug: string,
  o: Overrides & Pick<Sample, 'pictures'>
): Sample {
  const a = getAppBySlug(slug);
  if (!a?.liveUrl) throw new Error(`No live app "${slug}" for a Build page sample`);
  return {
    key: a.slug,
    name: a.name,
    summary: a.description,
    href: a.liveUrl,
    builtHref: builtHref(a.slug),
    ...o,
  };
}
