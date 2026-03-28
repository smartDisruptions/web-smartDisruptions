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
      <Link
        href="/apps"
        className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        &larr; Back to Apps
      </Link>

      {/* Header */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
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
          <div className="mt-6">
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
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
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

      {/* Tech Stack */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Tech Stack
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {app.techStack.map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* What It Does */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-text-primary">What It Does</h2>
        <p className="mt-4 max-w-3xl text-text-secondary">
          {app.longDescription}
        </p>
      </div>

      {/* Why It Works — Outcomes */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-text-primary">Why It Works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {app.outcomes.map((outcome) => (
            <Card key={outcome}>
              <p className="text-sm text-text-primary">{outcome}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Monetization Hooks */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2">
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

        <Card className="flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold text-text-primary">
            Build Plan
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Get the full build plan to replicate this app with your own AI
            orchestration setup.
          </p>
          <div className="mt-4">
            {app.buildPlanAvailable ? (
              <Button size="sm">View Build Plan</Button>
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
