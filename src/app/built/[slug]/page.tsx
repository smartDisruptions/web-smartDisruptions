import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { apps, getAppBySlug, type App } from '@/data/apps';
import {
  projects,
  getProjectBySlug,
  PROJECT_APP_SLUGS,
  type Project,
  type ProjectPart,
} from '@/data/projects';
import { Badge, Button, RevealOnScroll } from '@/components/ui';
import Kanji from '@/components/brand/Kanji';
import Kiru from '@/components/kiru/Kiru';
import { IconArrowRight, IconExternal } from '@/components/icons';
import Device from '@/components/built/Device';
import BuiltBackLink from '@/components/built/BuiltBackLink';
import { BackArrow, backTarget } from '@/components/built/back';
import {
  frameFor,
  hostOf,
  markFor,
  shotTransition,
  type FrameKind,
} from '@/components/built/media';
import '../built.css';

/**
 * One page per thing built. Two shapes behind one address:
 *
 * 1. A PROJECT (Broom & Blade, The Pembroke File, Samurai Kitchen, VOLTIC) —
 *    described part by part, because a project can be more than one thing.
 *    Broom & Blade is a game a family uses AND a website that explains it, and
 *    each half deserves its own description, its own link and its own evidence.
 *
 * 2. An APP from src/data/apps.ts — the smaller things, and the arcade games.
 *    This is the old /apps/[slug] page, moved here when /apps was removed.
 *
 * Slugs that a project covers under a different name (field-office ->
 * pembroke-file) are redirected in next.config.ts rather than rendered twice.
 *
 * LOOK (Shadow Dojo): the hero is the thing itself, in a CSS device, with Kiru
 * peeking over the top of it. That device shares a view-transition name with
 * the card on /built, so the picture travels from the card into the hero. It
 * is the page's one high-priority image. Each part's receipts are stamped as
 * hanko seals; its bullets are led by vermilion marks.
 */

// Every real page is known at build time (publishing is a rebuild), so an
// unknown one is a plain static 404 rather than an on-demand render that
// Next can only finish in the browser.
export const dynamicParams = false;

export function generateStaticParams() {
  const projectSlugs = projects.map((p) => p.slug);
  const appSlugs = apps
    .map((a) => a.slug)
    // Covered by a project page, under the project's own slug.
    .filter((s) => !PROJECT_APP_SLUGS[s] && !projectSlugs.includes(s));
  return [...projectSlugs, ...appSlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (project) {
    return { title: project.name, description: project.summary };
  }
  const app = getAppBySlug(slug);
  if (app) {
    return { title: app.name, description: app.description };
  }
  return { title: 'What I built' };
}

function TopBack() {
  const { href, label } = backTarget(false);
  return (
    <Suspense
      fallback={
        <Link href={href} className="bt-back">
          <BackArrow />
          {label}
        </Link>
      }
    >
      <BuiltBackLink variant="top" />
    </Suspense>
  );
}

function BottomBack() {
  const { href, label } = backTarget(false);
  return (
    <Suspense
      fallback={
        <Button variant="secondary" size="lg" href={href}>
          <span aria-hidden="true">&larr;</span> {label}
        </Button>
      }
    >
      <BuiltBackLink variant="bottom" />
    </Suspense>
  );
}

/** Portrait devices sit narrower in a column; the CSS reads this. */
function tallness(frame: FrameKind) {
  return frame === 'phone' ? 'phone' : frame === 'tablet-tall' ? 'tablet' : undefined;
}

/** The anchor for a part: "The game" -> "the-game". */
function partId(part: ProjectPart) {
  return part.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * A receipt as a hanko. "176 KB" stamps as a stacked number and unit, the way
 * a seal stacks its characters; a short value is stamped whole.
 */
function Hanko({ value }: { value: string }) {
  const [head, ...rest] = value.split(' ');
  const tail = rest.join(' ');
  const len = head.length <= 3 ? undefined : 'm';
  return (
    <dt className="bt-hanko" data-len={len}>
      {tail ? (
        <span className="bt-hanko-stack">
          <span>{head}</span>
          <span className="bt-hanko-unit">{tail}</span>
        </span>
      ) : (
        value
      )}
    </dt>
  );
}

/** The hero: words on one side, the thing itself on the other. */
function DetailHero({
  slug,
  frame,
  src,
  alt,
  url,
  children,
}: {
  slug: string;
  frame: FrameKind;
  src: string;
  alt: string;
  url?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bt-dhero">
      <div className="sd-watermark bt-dhero-mark">
        <Kanji char={markFor(slug)} draw />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 pt-5 sm:px-6 sm:pt-8">
        <TopBack />
        <div className="bt-dhero-grid mt-4 sm:mt-6">
          <div className="bt-dhero-media" data-tall={tallness(frame)}>
            <Device
              frame={frame}
              src={src}
              alt={alt}
              url={url}
              priority
              sizes={
                tallness(frame)
                  ? '(min-width: 1024px) 340px, 70vw'
                  : '(min-width: 1024px) 620px, 92vw'
              }
              style={shotTransition(slug)}
            />
            <Kiru pose="peek" className="bt-peek" />
          </div>
          <div className="bt-dhero-copy">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Part({
  part,
  i,
  count,
}: {
  part: ProjectPart;
  i: number;
  count: number;
}) {
  const frame = frameFor(part.image, part.kind);
  const flip = i % 2 === 1;
  return (
    <section id={partId(part)} className="bt-part">
      <div className="bt-part-grid sd-reveal" data-flip={flip || undefined}>
        <a
          href={part.href}
          className="bt-stage bt-open bt-power sd-print sd-tilt"
          data-tone={(i + 1) % 4}
          data-tall={tallness(frame)}
        >
          <span className="bt-stage-mark" aria-hidden="true">
            <Kanji char={part.kind === 'Website' ? '作' : '遊'} />
          </span>
          <Device
            frame={frame}
            src={part.image}
            alt={part.imageAlt}
            url={hostOf(part.href)}
            sizes={
              tallness(frame)
                ? '(min-width: 1024px) 300px, 56vw'
                : '(min-width: 1024px) 520px, 86vw'
            }
          />
        </a>
        <div>
          <p className="sd-kicker">
            {count > 1 ? `Part ${i + 1} of ${count} · ${part.kind}` : part.kind}
          </p>
          <h2 className="font-display sd-brush-under mt-3 text-4xl text-text-primary sm:text-5xl">
            {part.heading}
          </h2>
          <p className="font-read mt-6 text-xl leading-[1.6] text-text-primary">
            {part.what}
          </p>
          <p className="font-read mt-4 max-w-[58ch] text-[1.05rem] leading-[1.75] text-text-secondary">
            {part.body}
          </p>
          <div className="mt-7">
            <Button href={part.href} size="lg">
              {part.linkLabel}
              <IconExternal size={17} />
            </Button>
          </div>
        </div>
      </div>

      <div className="bt-details">
        <RevealOnScroll className="sd-sheet p-6 sm:p-8">
          <h3 className="font-display text-2xl text-[var(--sd-pen-ink)]">
            What it does
          </h3>
          <ul className="bt-bullets font-read mt-5 max-w-[62ch] text-[1.05rem] leading-[1.7] text-text-secondary">
            {part.bullets.map((b) => (
              <li key={b.slice(0, 32)}>{b}</li>
            ))}
          </ul>
        </RevealOnScroll>
        <div>
          <h3 className="bt-sr">Receipts for {part.heading.toLowerCase()}</h3>
          <dl className="bt-receipts">
            {part.receipts.map((r) => (
              <div key={r.label} className="bt-receipt sd-reveal">
                <Hanko value={r.value} />
                <dd>{r.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/** A project, described one part at a time. */
function ProjectPage({ project }: { project: Project }) {
  const many = project.parts.length > 1;

  return (
    <div className="bt pb-16">
      <DetailHero
        slug={project.slug}
        frame="laptop"
        src={project.image}
        alt={project.imageAlt}
      >
        <p className="sd-kicker">{project.eyebrow}</p>
        <h1 className="font-display mt-3 text-[3rem] leading-[1.02] text-text-primary sm:text-6xl lg:text-[4.2rem]">
          {project.name}
        </h1>
        <p className="font-read mt-5 text-xl leading-[1.6] text-text-secondary">
          {project.summary}
        </p>

        {/* When a project is more than one thing, say so before the reader
            has to work it out from the headings. */}
        {many && (
          <p className="font-read mt-4 text-lg leading-[1.7] text-text-primary">
            There are two parts to this one, and they are described separately
            below.
          </p>
        )}

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
        {many && (
          <nav aria-label="Parts" className="bt-jumps mt-4">
            {project.parts.map((part) => (
              <a key={part.heading} href={`#${partId(part)}`} className="bt-jump">
                {part.heading}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
              </a>
            ))}
          </nav>
        )}
      </DetailHero>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {project.parts.map((part, i) => (
          <div key={part.heading} className={i === 0 ? 'mt-16 sm:mt-24' : 'mt-24 sm:mt-32'}>
            <Part part={part} i={i} count={project.parts.length} />
          </div>
        ))}

        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <Kiru pose="bow" className="h-28 w-auto" />
          <BottomBack />
        </div>
      </div>
    </div>
  );
}

/** The smaller things and the arcade games. Was /apps/[slug]. */
function AppPage({ app }: { app: App }) {
  const frame = frameFor(app.thumbnailUrl, 'web-app');
  return (
    <div className="bt pb-16">
      <DetailHero
        slug={app.slug}
        frame={frame}
        src={app.thumbnailUrl}
        alt={`${app.name} screenshot`}
        url={hostOf(app.liveUrl)}
      >
        <p className="sd-kicker">{app.category}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-[2.7rem] leading-[1.04] text-text-primary sm:text-6xl lg:text-[3.9rem]">
            {app.name}
          </h1>
          <Badge variant={app.status === 'live' ? 'accent' : 'secondary'}>
            {app.status}
          </Badge>
        </div>
        {/* The button comes before the long description, so on a phone it
            is on the first screen rather than a long scroll down. */}
        {app.liveUrl && (
          <div className="mt-6">
            <Button href={app.liveUrl} size="lg">
              Try it
              <IconExternal size={17} />
            </Button>
          </div>
        )}
        <p className="font-read mt-6 text-lg leading-[1.75] text-text-secondary">
          {app.longDescription}
        </p>
      </DetailHero>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {app.screenshotUrls.length > 0 && (
          <section className="mt-16 sm:mt-24" aria-labelledby="bt-screens">
            <h2 id="bt-screens" className="sd-kicker">
              Screenshots
            </h2>
            <ul className="bt-gallery mt-6" role="list">
              {app.screenshotUrls.map((url, i) => (
                <li key={url} className="sd-reveal">
                  <Device
                    frame={frameFor(url, 'web-app')}
                    src={url}
                    alt={`${app.name} screenshot ${i + 1} of ${app.screenshotUrls.length}`}
                    url={hostOf(app.liveUrl)}
                    sizes="(min-width: 640px) 33vw, 86vw"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="bt-details mt-14 sm:mt-20">
          <RevealOnScroll className="sd-sheet p-6 sm:p-8">
            <h2 className="font-display text-2xl text-[var(--sd-pen-ink)]">
              What it does
            </h2>
            <ul className="bt-bullets font-read mt-5 max-w-[62ch] text-[1.05rem] leading-[1.7] text-text-secondary">
              {app.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </RevealOnScroll>
          <RevealOnScroll className="sd-sheet p-6 sm:p-8">
            <h2 className="sd-kicker">Built with</h2>
            <ul className="mt-4 flex flex-wrap gap-2" role="list">
              {app.techStack.map((tech) => (
                <li key={tech}>
                  <Badge variant="accent">{tech}</Badge>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>

        <RevealOnScroll>
          <div className="relative mx-auto mt-28 max-w-lg">
            <Kiru
              pose="read"
              className="pointer-events-none absolute -top-[5.6rem] right-5 h-28 w-auto"
            />
            <div className="sd-note px-7 pt-9 pb-8 text-center">
              <p className="font-display text-4xl leading-tight">
                Want the how and why?
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--sd-sticky-ink)]/80">
                I write up builds like this one. What I did, what went wrong,
                and what is worth copying.
              </p>
              <Link
                href="/content"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[var(--sd-sticky-ink)] px-7 py-2 font-bold text-[var(--sd-sticky-ink)] transition-[translate,scale,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--sd-sticky-ink)]/5 active:scale-[0.97]"
              >
                Read the writing
                <IconArrowRight size={18} />
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        <div className="mt-16 text-center">
          <BottomBack />
        </div>
      </div>
    </div>
  );
}

export default async function BuiltDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = getProjectBySlug(slug);
  if (project) return <ProjectPage project={project} />;

  const app = getAppBySlug(slug);
  if (!app) notFound();

  return <AppPage app={app} />;
}
