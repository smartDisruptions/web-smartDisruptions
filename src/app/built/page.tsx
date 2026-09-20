import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { apps, ARCADE_SLUGS } from '@/data/apps';
import { projects, PROJECT_APP_SLUGS } from '@/data/projects';
import {
  SectionContainer,
  Badge,
  Button,
  RevealOnScroll,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'What I built',
  description:
    'Websites, apps and games I have built. A chore app for families, a mystery game, a food truck that takes orders online, and a launch page for an energy drink that does not exist. All of it is online and free to try.',
};

/**
 * WHAT I BUILT — the index. Replaces /websites and /apps.
 *
 * SHAPE (Josh's call, 2026-09-20): this page names things and points at them.
 * It does not describe them. Each project earns its own page at
 * /built/<slug>, because a project can be more than one thing — Broom & Blade
 * is a game a family uses AND a website that explains it, and the single
 * highlight this page used to carry was describing the game in its headline
 * and the website in its bullets.
 *
 * So a card shows what a project is, gives a button straight to each part, and
 * links to the page that describes them. The copy lives in
 * src/data/projects.ts alongside the rest of each project's detail.
 *
 * VOICE: written for the average person. No analogies, no wordplay, no
 * sentence that has to be read twice. That now includes src/data/apps.ts —
 * every description there was rewritten out of engineer-speak on 2026-09-20,
 * so this page can read the data directly instead of carrying its own copy.
 */

/** Slugs already shown as project cards, under either name. */
const COVERED = new Set([
  ...projects.map((p) => p.slug),
  ...Object.keys(PROJECT_APP_SLUGS),
]);

type CatalogueEntry = {
  key: string;
  name: string;
  description: string;
  thumbnail: string;
  liveUrl?: string;
  /** Present when the thing has its own page under /built. */
  detailHref?: string;
  status: string;
  tech: string[];
};

/**
 * The catalogue is what is left once the projects above have been shown and
 * the games have their own page. Kitsune Kitchen is appended by hand because
 * it is a site, not an app, and has never had an entry in the apps data;
 * without this line it would have vanished with /websites.
 */
const catalogue: CatalogueEntry[] = [
  ...apps
    .filter((app) => !ARCADE_SLUGS.includes(app.slug) && !COVERED.has(app.slug))
    .map((app) => ({
      key: app.slug,
      name: app.name,
      description: app.description,
      thumbnail: app.thumbnailUrl,
      liveUrl: app.liveUrl,
      detailHref: `/built/${app.slug}`,
      status: app.status,
      tech: app.techStack.slice(0, 3),
    })),
  {
    key: 'kitsune-kitchen',
    name: 'Kitsune Kitchen',
    description:
      'The same ordering system as Samurai Kitchen, set up for a restaurant I made up so that anyone can try it. You can build an order and go through the checkout without buying anything.',
    thumbnail: '/images/websites/kitsune-kitchen.webp',
    liveUrl: 'https://japanese-sushi-website.vercel.app',
    status: 'live',
    tech: ['Next.js', 'Square API', 'Demo build'],
  },
];

export default function BuiltPage() {
  return (
    <>
      <SectionContainer className="pt-10 pb-2 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-[3.2rem] leading-[0.95] text-text-primary sm:text-7xl">
            what I built
          </h1>
          <p className="font-read mt-6 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
            Websites, apps and games. All of it is online right now, and all of
            it is free to try. The four below are the ones I would show you
            first. Everything else is under them.
          </p>
        </div>
      </SectionContainer>

      {projects.map((project, i) => {
        // Sides and tilt alternate, so four in a row read as a scrapbook
        // rather than a spreadsheet.
        const flip = i % 2 === 1;
        return (
          <section
            key={project.slug}
            className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14"
          >
            <RevealOnScroll>
              <article className="mx-auto max-w-5xl">
                <div
                  className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                    flip ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <Link
                    href={`/built/${project.slug}`}
                    className={`nb-polaroid nb-tape block self-start p-2.5 pb-3 transition-transform hover:rotate-0 ${
                      flip ? 'rotate-[1.2deg]' : 'rotate-[-1.2deg]'
                    }`}
                  >
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      width={project.imageWidth}
                      height={project.imageHeight}
                      className="h-auto w-full"
                    />
                  </Link>

                  <div>
                    <p className="font-mono-accent text-text-secondary">
                      {project.eyebrow}
                    </p>
                    <h2 className="font-display nb-underline mt-1 text-4xl text-text-primary sm:text-5xl">
                      {project.name}
                    </h2>
                    <p className="font-read mt-6 max-w-[48ch] text-lg leading-[1.7] text-text-primary">
                      {project.summary}
                    </p>

                    {/* Straight to each part — the game, the website — and then
                        the page that describes them. */}
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      {project.parts.map((part, pi) => (
                        <Button
                          key={part.heading}
                          href={part.href}
                          variant={pi === 0 ? 'primary' : 'secondary'}
                        >
                          {part.linkLabel}
                        </Button>
                      ))}
                    </div>

                    <Link
                      href={`/built/${project.slug}`}
                      className="font-display mt-5 inline-flex min-h-11 items-center text-2xl text-accent transition-colors hover:text-accent-hover"
                    >
                      What is built into it &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            </RevealOnScroll>
          </section>
        );
      })}

      <SectionContainer className="pt-10">
        <RevealOnScroll>
          <h2 className="font-display nb-underline text-4xl text-text-primary sm:text-5xl">
            everything else
          </h2>
          <p className="font-read mt-5 max-w-[52ch] leading-[1.75] text-text-secondary">
            Smaller projects. All of them are online, and all of them are free
            to try.
          </p>
        </RevealOnScroll>

        <ul
          className="nb-wall mt-10 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-12"
          role="list"
        >
          {catalogue.map((item) => (
            <li key={item.key} className="h-full">
              <RevealOnScroll className="h-full">
                {/* The detail link is stretched across the whole print, so the
                    live link stays a real sibling anchor — an <a> inside an <a>
                    is invalid HTML and broke hydration on /apps once already. */}
                <div className="nb-polaroid nb-tape flex h-full flex-col p-2.5 pb-4">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={item.thumbnail}
                    alt={`${item.name} screenshot`}
                    className="aspect-[4/3] w-full object-cover object-top"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <h3 className="font-display text-2xl leading-none text-text-primary">
                      {item.name}
                    </h3>
                    <Badge
                      variant={item.status === 'live' ? 'accent' : 'secondary'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tech.map((t) => (
                      <Badge key={t} variant="default">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="font-display mt-4 flex items-center gap-5 text-xl">
                    {item.detailHref && (
                      <Link
                        href={item.detailHref}
                        className="text-accent after:absolute after:inset-0 after:content-['']"
                      >
                        How I built it &rarr;
                      </Link>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative text-text-secondary transition-colors hover:text-accent"
                      >
                        Try it &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </SectionContainer>

      {/* The games keep their own page. This is the link to it. */}
      <SectionContainer className="pt-6 pb-20">
        <RevealOnScroll>
          <div className="nb-sticky nb-tape mx-auto max-w-lg rotate-[1.4deg] px-7 pt-9 pb-8 text-center">
            <p className="font-display text-4xl leading-tight sm:text-5xl">
              all the games are in one place
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--sd-sticky-ink)]/80">
              Six games. All of them free, and all of them play in your browser.
            </p>
            {/* Drawn on the note, not themed: a sticky is a fixed yellow
                object in both themes, and the themed secondary button flipped
                to near-black ink on yellow in dark mode. */}
            <Link
              href="/games"
              className="nb-wobble font-display mt-6 inline-flex min-h-12 items-center border-2 border-[var(--sd-sticky-ink)] px-7 py-2 text-2xl text-[var(--sd-sticky-ink)] transition-transform hover:-rotate-1 hover:scale-[1.03]"
            >
              Go to the games &rarr;
            </Link>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
