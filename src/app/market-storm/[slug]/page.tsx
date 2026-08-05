import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marketStormReports, getReportBySlug } from '@/data/marketStorm';
import { SectionContainer, Badge, Button } from '@/components/ui';
import ReportView from '@/components/market-storm/ReportView';
import SubscribeForm from '@/components/SubscribeForm';
import { formatDate } from '@/lib/format';

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

  return {
    title: `${report.ticker} — ${report.title} · Market Storm`,
    description: report.excerpt,
    alternates: { canonical: `/market-storm/${report.slug}` },
    openGraph: {
      title: `Market Storm — ${report.ticker}: ${report.title}`,
      description: report.excerpt,
      type: 'article',
      url: `/market-storm/${report.slug}`,
      publishedTime: new Date(report.publishDate).toISOString(),
      authors: ['Josh Escusa'],
      tags: report.tags,
      // og:image is supplied by the co-located opengraph-image.tsx (generated).
    },
    twitter: {
      card: 'summary_large_image',
      title: `Market Storm — ${report.ticker}`,
      description: report.excerpt,
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

  return (
    <SectionContainer className="py-20">
      {/* Static local data, JSON-encoded; < escaped so content can never
          close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mx-auto max-w-4xl">
        <Link
          href="/market-storm"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          &larr; Back to Market Storm
        </Link>

        {/* Header */}
        <div className="mt-8">
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
          <h1 className="font-display mt-5 max-w-4xl text-3xl font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-[2.5rem]">
            {report.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* No hero image here, deliberately. ReportView opens with ReportHero —
            the ticker at display size, the company, the catalyst and the verdict
            — so an image above it repeated the identity and then added its own
            evidence on top, which read as a wall of text before the report had
            started. The simple ticker block this page wanted was already the
            next element down. */}

        {/* The full structured report */}
        <ReportView report={report} />

        {/* Subscribe */}
        <div className="mt-16 rounded-xl border border-border bg-accent/[0.05] p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Get the next Market Storm in your inbox
          </h2>
          <p className="mt-2 max-w-lg text-sm text-text-secondary">
            One email when a real market catalyst triggers a new report — the
            method, the numbers, and what the verification pass caught.
          </p>
          <SubscribeForm source="market-storm" className="mt-5" />
        </div>

        <div className="mt-12 border-t border-border pt-10 text-center">
          <Button variant="secondary" href="/market-storm">
            &larr; Back to Market Storm
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}
