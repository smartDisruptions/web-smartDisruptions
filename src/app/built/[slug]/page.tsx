import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { apps, getAppBySlug, type App } from '@/data/apps';
import {
  projects,
  getProjectBySlug,
  PROJECT_APP_SLUGS,
  type Project,
} from '@/data/projects';
import { SectionContainer, Badge, Button } from '@/components/ui';
import BackLink from '@/components/BackLink';

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
 */

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
  return (
    <Suspense
      fallback={
        <Link
          href="/built"
          className="font-display inline-flex min-h-11 items-center gap-2 text-2xl text-accent transition-colors hover:text-accent-hover"
        >
          &larr; everything I built
        </Link>
      }
    >
      <BackLink variant="top" />
    </Suspense>
  );
}

function BottomBack() {
  return (
    <Suspense
      fallback={
        <Button variant="secondary" href="/built">
          &larr; everything I built
        </Button>
      }
    >
      <BackLink variant="bottom" />
    </Suspense>
  );
}

/** A project, described one part at a time. */
function ProjectPage({ project }: { project: Project }) {
  const many = project.parts.length > 1;

  return (
    <SectionContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <TopBack />

        <div className="mt-6 max-w-3xl">
          <p className="font-mono-accent text-text-secondary">
            {project.eyebrow}
          </p>
          <h1 className="font-display mt-1 text-[3rem] text-text-primary sm:text-7xl">
            {project.name}
          </h1>
          <p className="font-read mt-5 text-lg leading-[1.7] text-text-secondary">
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
        </div>

        {project.parts.map((part, i) => (
          <section
            key={part.heading}
            className={i === 0 ? 'mt-12' : 'mt-16 sm:mt-24'}
          >
            <div
              className={`grid items-start gap-10 lg:grid-cols-2 lg:gap-14 ${
                i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <a
                href={part.href}
                className={`nb-polaroid nb-tape block self-start p-2.5 pb-3 transition-transform hover:rotate-0 ${
                  i % 2 === 1 ? 'rotate-[1.2deg]' : 'rotate-[-1.2deg]'
                }`}
              >
                <Image
                  src={part.image}
                  alt={part.imageAlt}
                  width={part.imageWidth}
                  height={part.imageHeight}
                  className="h-auto w-full"
                />
              </a>

              <div>
                <p className="font-mono-accent text-text-secondary">
                  {part.kind}
                </p>
                <h2 className="font-display nb-underline mt-1 text-4xl text-text-primary sm:text-5xl">
                  {part.heading}
                </h2>
                <p className="font-read mt-6 text-lg leading-[1.7] text-text-primary">
                  {part.what}
                </p>
                <p className="font-read mt-4 max-w-[58ch] leading-[1.75] text-text-secondary">
                  {part.body}
                </p>
                <div className="mt-7">
                  <Button href={part.href}>{part.linkLabel}</Button>
                </div>
              </div>
            </div>

            <div className="nb-index-card mt-10 rotate-[-0.4deg] py-6 pr-5 pl-11 sm:pr-8 sm:pl-14">
              <p className="font-display text-2xl text-[var(--sd-pen-ink)]">
                what it does
              </p>
              <ul className="mt-3 max-w-[62ch] list-disc space-y-2.5 pl-5 leading-[1.7] text-text-secondary marker:text-[var(--sd-pen)]">
                {part.bullets.map((b) => (
                  <li key={b.slice(0, 32)}>{b}</li>
                ))}
              </ul>
            </div>

            <dl className="mt-8 grid gap-6 border-t-2 border-dashed border-border pt-6 sm:grid-cols-3">
              {part.receipts.map((r) => (
                <div key={r.label}>
                  <dt className="font-display text-4xl text-accent tabular-nums">
                    {r.value}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug text-text-secondary">
                    {r.label}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <div className="mt-20 text-center">
          <BottomBack />
        </div>
      </div>
    </SectionContainer>
  );
}

/** The smaller things and the arcade games. Was /apps/[slug]. */
function AppPage({ app }: { app: App }) {
  return (
    <SectionContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <TopBack />

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[3rem] text-text-primary sm:text-6xl">
              {app.name}
            </h1>
            <Badge variant={app.status === 'live' ? 'accent' : 'secondary'}>
              {app.status}
            </Badge>
          </div>
          <p className="font-read mt-5 max-w-3xl text-lg leading-[1.7] text-text-secondary">
            {app.longDescription}
          </p>
          {app.liveUrl && (
            <div className="mt-7">
              <Button href={app.liveUrl}>Try it &rarr;</Button>
            </div>
          )}
        </div>

        {app.screenshotUrls.length > 0 && (
          <div className="nb-wall mt-14 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {app.screenshotUrls.map((url) => (
              <div key={url} className="nb-polaroid nb-tape p-2.5 pb-3">
                <img
                  loading="lazy"
                  decoding="async"
                  src={url}
                  alt={`${app.name} screenshot`}
                  className="aspect-[4/3] w-full object-cover object-top"
                />
              </div>
            ))}
          </div>
        )}

        <div className="nb-index-card mt-14 rotate-[-0.4deg] py-6 pr-5 pl-11 sm:pr-8 sm:pl-14">
          <p className="font-display text-2xl text-[var(--sd-pen-ink)]">
            what it does
          </p>
          <ul className="mt-3 max-w-[62ch] list-disc space-y-2.5 pl-5 leading-[1.7] text-text-secondary marker:text-[var(--sd-pen)]">
            {app.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <p className="font-mono-accent text-text-secondary">Built with</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {app.techStack.map((tech) => (
              <Badge key={tech} variant="accent">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="nb-sticky nb-tape mx-auto mt-20 max-w-lg rotate-[1.4deg] px-7 pt-9 pb-8 text-center">
          <p className="font-display text-4xl leading-tight">
            want the how and why?
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--sd-sticky-ink)]/80">
            I write up builds like this one. What I did, what went wrong, and
            what is worth copying.
          </p>
          <Link
            href="/content"
            className="nb-wobble font-display mt-6 inline-flex min-h-12 items-center border-2 border-[var(--sd-sticky-ink)] px-7 py-2 text-2xl text-[var(--sd-sticky-ink)] transition-transform hover:-rotate-1 hover:scale-[1.03]"
          >
            Read the writing &rarr;
          </Link>
        </div>

        <div className="mt-16 text-center">
          <BottomBack />
        </div>
      </div>
    </SectionContainer>
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
