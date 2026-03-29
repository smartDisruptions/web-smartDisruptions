import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apps, getAppBySlug } from '@/data/apps';
import {
  SectionContainer,
  Badge,
  Button,
  Card,
  ComingSoonBadge,
} from '@/components/ui';

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export default async function AppDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <SectionContainer className="py-20">
      {/* Back Navigation */}
      <div className="text-center sm:text-left">
        <Link
          href="/apps"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          &larr; Back to Apps
        </Link>
      </div>

      {/* Header */}
      <div className="mt-8 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            {app.name}
          </h1>
          <Badge variant={app.status === 'live' ? 'accent' : 'secondary'}>
            {app.status}
          </Badge>
        </div>
        <p className="mt-4 max-w-3xl text-lg text-text-secondary">
          {app.longDescription}
        </p>
        {app.liveUrl && (
          <div className="mt-6 text-center sm:text-left">
            <a
              href={app.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>Try Live Demo &rarr;</Button>
            </a>
          </div>
        )}
      </div>

      {/* Screenshots Gallery */}
      <div className="mt-12">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-text-secondary sm:text-left">
          Screenshots
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {app.screenshotUrls.map((url) => (
            <div
              key={url}
              className="overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <img
                src={url}
                alt={`${app.name} screenshot`}
                className="h-52 w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Try Live Demo (below screenshots) */}
      {app.liveUrl && (
        <div className="mt-8 text-center sm:text-left">
          <a
            href={app.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Try Live Demo &rarr;</Button>
          </a>
        </div>
      )}

      {/* Tech Stack */}
      <div className="mt-12">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-text-secondary sm:text-left">
          Tech Stack
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
          {app.techStack.map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Why It Works — Outcomes */}
      <div className="mt-12">
        <h2 className="text-center text-2xl font-bold text-text-primary sm:text-left">Why It Works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {app.outcomes.map((outcome) => (
            <Card key={outcome}>
              <p className="text-sm text-text-primary">{outcome}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Monetization Hooks */}
      <div className="mt-16">
        <Card className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold text-text-primary">
            Full Breakdown
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            See exactly how this app was architected, built, and deployed —
            stage by stage.
          </p>
          <div className="mt-4">
            {app.hasFullBreakdown ? (
              <Button size="sm">View Breakdown</Button>
            ) : (
              <ComingSoonBadge />
            )}
          </div>
        </Card>
      </div>

      {/* Back to Gallery */}
      <div className="mt-16 text-center">
        <Button variant="secondary" href="/apps">
          &larr; Back to All Apps
        </Button>
      </div>
    </SectionContainer>
  );
}
