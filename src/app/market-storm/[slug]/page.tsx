import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  marketStormReports,
  getReportBySlug,
  isArticle,
  shareImageOf,
} from '@/data/marketStorm';
import { articlePages } from '@/content/market-storm';
import { Badge, Button } from '@/components/ui';
import ReportView from '@/components/market-storm/ReportView';
import ArchivedNotice from '@/components/market-storm/ArchivedNotice';
import StormSky from '@/components/market-storm/StormSky';
import SubscribeForm from '@/components/SubscribeForm';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { formatDate } from '@/lib/format';

// Every real page is known at build time (publishing is a rebuild), so an
// unknown one is a plain static 404 rather than an on-demand render that
// Next can only finish in the browser.
export const dynamicParams = false;

export function generateStaticParams() {
  return marketStormReports.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = getReportBySlug(slug);
  if (!report) return {};

  const ticker = report.ticker ? `${report.ticker} — ` : '';
  const share = shareImageOf(report);
  const images = share
    ? [
        {
          url: share,
          width: 1200,
          height: 630,
          alt: report.cardImageAlt ?? report.title,
        },
      ]
    : undefined;

  return {
    title: `${ticker}${report.title} · Market Storm`,
    description: report.excerpt,
    alternates: { canonical: `/market-storm/${report.slug}` },
    openGraph: {
      title: `Market Storm — ${report.ticker ? `${report.ticker}: ` : ''}${report.title}`,
      description: report.excerpt,
      type: 'article',
      url: `/market-storm/${report.slug}`,
      publishedTime: new Date(report.publishDate).toISOString(),
      authors: ['Josh Escusa'],
      tags: report.tags,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Market Storm — ${report.ticker ?? report.title}`,
      description: report.excerpt,
      images,
    },
  };
}

export default async function MarketStormDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    headline: report.title,
    description: report.excerpt,
    datePublished: new Date(report.publishDate).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Josh Escusa',
      url: 'https://smartdisruptions.com',
    },
    about: report.company,
    mainEntityOfPage: `https://smartdisruptions.com/market-storm/${report.slug}`,
  };

  // Static local data, JSON-encoded; < escaped so content can never close the
  // script tag.
  const ld = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );

  // An article is its own page: nothing of the old report template around it.
  // Archived, it gets the notice as a bar above it, since the article's own
  // opening is its to design.
  if (isArticle(report)) {
    const page = articlePages[report.slug];
    if (!page) {
      throw new Error(
        `Market Storm article "${report.slug}" is listed in src/data/marketStorm.ts but has no page in src/content/market-storm/index.ts`
      );
    }
    const { default: Article } = await page();
    return (
      <>
        {ld}
        {report.archived && <ArchivedNotice report={report} strip />}
        <Article />
      </>
    );
  }

  return (
    <>
      {ld}

      {/* The storm band: the same live sky as the index, slimmer and calmer.
          A report is a page somebody reads for twenty minutes, so the band
          strikes rarely, never shakes the words, and — like every StormSky —
          stops drawing the moment it scrolls away. The live sky won over a
          static gradient because it costs nothing once it is off screen, and
          arriving from the index into the same weather is the point. */}
      <header className="ms-band">
        <StormSky variant="band" />
        <div
          className="ms-wm sd-watermark -right-[18%] -top-[1rem] w-[300px] sm:-right-[6%] sm:w-[380px] lg:right-[1%] lg:-top-[3rem] lg:w-[360px]"
          aria-hidden="true"
        >
          <Kanji char="嵐" draw className="h-full w-full" />
        </div>

        <div className="ms-band-inner mx-auto max-w-[72rem] px-5 pb-[5.5rem] pt-6 sm:px-6 sm:pb-28 sm:pt-9">
          <Link
            href="/market-storm"
            className="ms-back inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-[color,border-color,scale] hover:border-accent/40 hover:text-accent active:scale-[0.97]"
          >
            &larr; Back to Market Storm
          </Link>

          <div
            className="ms-clear mt-7 max-w-[54rem] lg:max-w-[48rem]"
            data-storm-avoid
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">Market Storm</Badge>
              {/* "Published" is doing real work: the hero below carries the date
                  the company REPORTED, and without the label a reader sees the
                  same date twice and assumes one of them is a mistake. They
                  coincide on Amazon and diverge on Palantir. */}
              <span className="text-sm text-text-secondary">
                Published {formatDate(report.publishDate)} · by Josh Escusa
              </span>
            </div>
            <h1
              id="ms-report-title"
              className="font-display mt-5 text-[1.8rem] leading-[1.1] text-text-primary sm:text-[2.35rem] lg:text-[2.6rem]"
            >
              {report.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {report.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
            {/* Archived: said here, with the page's other facts about itself,
                inside the clearing so it reads over the live sky. */}
            {report.archived && <ArchivedNotice report={report} />}
          </div>
        </div>

        {/* Kiru waits out the storm on the top edge of the report itself. */}
        <div
          className="ms-kiru bottom-16 right-[max(1.5rem,calc((100vw-72rem)/2+2.5rem))] hidden w-[170px] lg:block"
          aria-hidden="true"
        >
          <Kiru pose="storm" />
        </div>
      </header>

      <div className="relative z-[3] mx-auto -mt-16 max-w-[72rem] sm:px-6">
        {/* Wider than the 4xl the reports used to sit in, because the jump nav
            runs alongside the body on large screens instead of stacking on
            top of it. The prose inside is still clamped to its own measure —
            the extra width goes to the nav and to the charts and tables, which
            were the elements the old container was actually squeezing.

            The report is a sheet laid over the storm, like an article on the
            ground: the sky never runs behind a sentence or a chart. On a phone
            it is a native sheet — full width, rounded at the top. */}
        <article
          aria-labelledby="ms-report-title"
          className="ms-sheet sd-sheet px-5 pb-12 pt-8 sm:px-10 sm:pb-16 sm:pt-12"
        >
          {/* No hero image here, deliberately. ReportView opens with ReportHero —
              the ticker at display size, the company, the catalyst and the
              verdict — so an image above it repeated the identity and then
              added its own evidence on top, which read as a wall of text before
              the report had started. The simple ticker block this page wanted
              was already the next element down. */}
          <ReportView report={report} />
        </article>

        <div className="px-5 sm:px-0">
          {/* Subscribe — ink lacquer in both lights, like the footer. */}
          <section
            className="ms-night ms-subscribe relative mt-12 overflow-hidden rounded-[22px] border p-6 sm:p-10"
            aria-labelledby="ms-subscribe-title"
          >
            <div className="relative z-[1] grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h2
                  id="ms-subscribe-title"
                  className="font-display text-[1.75rem] leading-[1.12] text-text-primary sm:text-3xl"
                >
                  Get the next Market Storm in your inbox
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-text-secondary">
                  One email when a real market catalyst triggers a new report —
                  the method, the numbers, and what the verification pass
                  caught.
                </p>
                <SubscribeForm source="market-storm" className="mt-6" />
              </div>
              {/* Thanks for reading: Kiru bows out at the end of every report. */}
              <Kiru
                pose="bow"
                className="order-first w-[84px] sm:order-last sm:w-[150px] sm:justify-self-end"
              />
            </div>
          </section>

          <div className="mt-12 border-t border-border pt-10 text-center">
            <Button variant="secondary" href="/market-storm">
              &larr; Back to Market Storm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
