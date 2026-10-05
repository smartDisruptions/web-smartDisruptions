import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { apps, GAME_SLUGS } from '@/data/apps';
import { projects, PROJECT_APP_SLUGS, type Project } from '@/data/projects';
import {
  SectionContainer,
  Badge,
  Button,
  RevealOnScroll,
} from '@/components/ui';
import Kanji from '@/components/brand/Kanji';
import Kiru from '@/components/kiru/Kiru';
import { IconArrowRight, IconExternal } from '@/components/icons';
import Device from '@/components/built/Device';
import ForgeScene from '@/components/built/ForgeScene';
import ArmoryWall, { type WallItem } from '@/components/built/ArmoryWall';
import {
  frameFor,
  hostOf,
  markFor,
  shotTransition,
} from '@/components/built/media';
import './built.css';

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
 *
 * LOOK (Shadow Dojo, October 2026): Kiru at the anvil under a brush 創
 * ("to create"); each project's screenshot in a CSS device — a laptop for the
 * website, a tablet for the app beside it — on a tinted print that leans
 * toward the pointer; the smaller things as a swipe rail on a phone; and
 * every project, app and game on one 3D ring at the end. Each device carries
 * a view-transition name that its detail page's hero shares, so opening a
 * project carries the picture across instead of cutting to it.
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
    .filter((app) => !GAME_SLUGS.includes(app.slug) && !COVERED.has(app.slug))
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

/** The games the arcade shows (front room and archive) that no project card above already covers. */
const games = GAME_SLUGS.filter((slug) => !COVERED.has(slug))
  .map((slug) => apps.find((a) => a.slug === slug))
  .filter((a) => a !== undefined);

/**
 * Everything on one wall: the four projects, the catalogue, then the games.
 * Each plaque opens the thing's own page; Kitsune Kitchen has none, so it
 * opens the live demo.
 */
const wall: WallItem[] = [
  ...projects.map((p) => ({
    key: p.slug,
    name: p.name,
    kind: p.parts.map((part) => part.kind).join(' + '),
    href: `/built/${p.slug}`,
    src: p.image,
    mark: markFor(p.slug),
  })),
  ...catalogue.map((c) => ({
    key: c.key,
    name: c.name,
    kind: apps.find((a) => a.slug === c.key)?.category ?? 'Website',
    href: c.detailHref ?? c.liveUrl ?? '/built',
    external: !c.detailHref,
    src: c.thumbnail,
    mark: markFor(c.key),
  })),
  ...games.map((g) => ({
    key: g.slug,
    name: g.name,
    kind: g.category,
    href: `/built/${g.slug}`,
    src: g.thumbnailUrl,
    mark: markFor(g.slug),
  })),
];

const pad = (n: number) => String(n).padStart(2, '0');
const WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];
/** Small counts read as words in a sentence ("the five below"). */
const inWords = (n: number) => WORDS[n] ?? String(n);

function Hero() {
  return (
    <header className="bt-hero">
      <div className="sd-watermark bt-hero-mark">
        <Kanji char="創" draw />
      </div>
      <div className="bt-hero-grid mx-auto max-w-6xl px-5 pt-6 pb-4 sm:px-6 sm:pt-12 lg:pt-16">
        <ForgeScene className="bt-hero-forge" />
        <div className="relative">
          <p className="sd-kicker">The workshop</p>
          <h1 className="font-display mt-3 text-[3.3rem] leading-[0.98] text-text-primary sm:text-7xl lg:text-[5.4rem]">
            <span className="bt-cut">What I</span>{' '}
            <span
              className="bt-cut"
              style={{ '--d': '0.14s' } as CSSProperties}
            >
              built
            </span>
          </h1>
          <p className="font-read mt-6 max-w-[48ch] text-lg leading-[1.7] text-text-secondary sm:text-xl sm:leading-[1.65]">
            Websites, apps and games. All of it is online right now, and all of
            it is free to try. The {inWords(projects.length)} below are the ones
            I would show you first. Everything else is under them.
          </p>
          <nav aria-label="On this page" className="bt-jumps mt-8">
            <a href="#projects" className="bt-jump">
              <b>{projects.length}</b> projects
            </a>
            <a href="#everything-else" className="bt-jump">
              <b>{catalogue.length}</b> more
            </a>
            <a href="#wall" className="bt-jump">
              <b>{wall.length}</b> on one wall
            </a>
            <Link href="/games" className="bt-jump">
              <b>{GAME_SLUGS.length}</b> games
              <IconArrowRight />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

/** One of the four: the devices on a print, the name, a button per part. */
function Feature({ project, i }: { project: Project; i: number }) {
  // Sides alternate, so four in a row read as a gallery, not a spreadsheet.
  const flip = i % 2 === 1;
  // The project's own picture is the website; the other part (the game) gets
  // a second device beside it.
  const side = project.parts.find((part) => part.image !== project.image);

  return (
    <article className="bt-feature sd-reveal" data-flip={flip || undefined}>
      <Link
        href={`/built/${project.slug}`}
        className="bt-stage bt-open sd-print sd-tilt"
        data-tone={i % 4}
      >
        <span className="bt-stage-mark" aria-hidden="true">
          <Kanji char={markFor(project.slug)} />
        </span>
        <span className="bt-devices" data-pair={side ? '' : undefined}>
          <Device
            frame="laptop"
            src={project.image}
            alt={project.imageAlt}
            sizes="(min-width: 1024px) 560px, 90vw"
            // On a desktop the first project's screenshot is the largest
            // thing in the first view (the LCP); everything after it waits.
            priority={i === 0}
            className="bt-main"
            style={shotTransition(project.slug)}
          />
          {side && (
            <Device
              frame={frameFor(side.image, side.kind)}
              src={side.image}
              alt={side.imageAlt}
              url={hostOf(side.href)}
              sizes="(min-width: 1024px) 250px, 40vw"
              className="bt-side"
            />
          )}
        </span>
      </Link>

      <div>
        <span className="bt-num" aria-hidden="true">
          {pad(i + 1)} <span>/ {pad(projects.length)}</span>
        </span>
        <p className="sd-kicker mt-4">{project.eyebrow}</p>
        <h2 className="font-display sd-brush-under mt-3 text-4xl text-text-primary sm:text-5xl">
          {project.name}
        </h2>
        <p className="font-read mt-5 max-w-[46ch] text-lg leading-[1.7] text-text-primary">
          {project.summary}
        </p>

        {/* Straight to each part — the game, the website — and then the
            page that describes them. */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {project.parts.map((part, pi) => (
            <Button
              key={part.heading}
              href={part.href}
              variant={pi === 0 ? 'primary' : 'secondary'}
            >
              {part.linkLabel}
              <IconExternal size={16} />
            </Button>
          ))}
        </div>

        <Link href={`/built/${project.slug}`} className="bt-more mt-4">
          What is built into it
          <IconArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
}

function CatalogueCard({ item }: { item: CatalogueEntry }) {
  const frame = frameFor(item.thumbnail, 'web-app');
  return (
    <div className="bt-card sd-card">
      <div
        className="bt-card-stage bt-stage bt-power"
        data-tone={(item.key.length % 3) + 1}
      >
        <Device
          frame={frame}
          src={item.thumbnail}
          alt={`${item.name} screenshot`}
          url={hostOf(item.liveUrl)}
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 46vw, 80vw"
          style={item.detailHref ? shotTransition(item.key) : undefined}
        />
      </div>
      <div className="bt-card-body">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-[1.3rem] leading-tight text-text-primary sm:text-[1.45rem]">
            {item.name}
          </h3>
          <Badge variant={item.status === 'live' ? 'accent' : 'secondary'}>
            {item.status}
          </Badge>
        </div>
        <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-text-secondary">
          {item.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tech.map((t) => (
            <Badge key={t} variant="default">
              {t}
            </Badge>
          ))}
        </div>
        {/* The detail link is stretched across the whole card, so the live
            link stays a real sibling anchor — an <a> inside an <a> is invalid
            HTML and broke hydration on /apps once already. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5">
          {item.detailHref && (
            <Link href={item.detailHref} className="bt-more bt-stretch">
              How I built it
              <IconArrowRight size={18} />
            </Link>
          )}
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bt-more bt-over"
            >
              Try it
              <IconExternal size={16} />
              <span className="bt-sr"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuiltPage() {
  return (
    <div className="bt">
      <Hero />

      <section
        id="projects"
        aria-label={`The ${inWords(projects.length)} I would show you first`}
        className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-10 sm:px-6 sm:pt-16"
      >
        <div className="flex flex-col gap-20 sm:gap-28">
          {projects.map((project, i) => (
            <Feature key={project.slug} project={project} i={i} />
          ))}
        </div>
      </section>

      <SectionContainer
        id="everything-else"
        className="scroll-mt-16 pt-24 sm:pt-32"
      >
        <RevealOnScroll>
          <h2 className="font-display sd-brush-under text-4xl text-text-primary sm:text-5xl">
            Everything else
          </h2>
          <p className="font-read mt-5 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
            Smaller projects. All of them are online, and all of them are free
            to try.
          </p>
        </RevealOnScroll>

        <div className="bt-rail-wrap mt-10">
          <ul className="bt-rail" role="list" aria-label="Smaller projects">
            {catalogue.map((item) => (
              <li key={item.key} className="sd-reveal">
                <CatalogueCard item={item} />
              </li>
            ))}
          </ul>
          <div className="bt-rail-meter" aria-hidden="true">
            <span />
          </div>
        </div>
      </SectionContainer>

      <section
        id="wall"
        className="sd-defer scroll-mt-16 overflow-x-clip pt-8 pb-10 sm:pt-12"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <RevealOnScroll className="text-center">
            <p className="sd-kicker">All of it at once</p>
            <h2 className="font-display sd-brush-under mt-3 text-4xl text-text-primary sm:text-5xl">
              Everything on one wall
            </h2>
            <p className="font-read mx-auto mt-5 max-w-[46ch] text-lg leading-[1.7] text-text-secondary">
              <span className="bt-motion-only">
                Every project, app and game on this site, hung on one ring. Drag
                it round or use the arrows, and press any of them to open it.
              </span>
              <span className="bt-still-only">
                Every project, app and game on this site, in one place. Press
                any of them to open it.
              </span>
            </p>
          </RevealOnScroll>
          <div className="mt-6">
            <ArmoryWall items={wall} label="Everything I built, on one ring" />
          </div>
        </div>
      </section>

      {/* The games keep their own page. This is the link to it. */}
      <SectionContainer className="pt-10 pb-24">
        <RevealOnScroll>
          <div className="relative mx-auto max-w-xl">
            <Kiru
              pose="game"
              className="pointer-events-none absolute -top-[5.4rem] right-4 h-28 w-auto sm:-top-24 sm:right-6 sm:h-32"
            />
            <div className="sd-note px-7 pt-9 pb-8 text-center">
              <p className="font-display text-[2.1rem] leading-tight sm:text-5xl">
                All the games are in one place
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--sd-sticky-ink)]/80">
                {GAME_SLUGS.length} games. All of them free, and all of them play
                in your browser.
              </p>
              {/* Drawn on the slip, not themed: the paper is the same object
                  in both themes, so its ink is too. */}
              <Link
                href="/games"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[var(--sd-sticky-ink)] px-7 py-2 font-bold text-[var(--sd-sticky-ink)] transition-[translate,scale,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--sd-sticky-ink)]/5 active:scale-[0.97]"
              >
                Go to the games
                <IconArrowRight size={18} />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </div>
  );
}
