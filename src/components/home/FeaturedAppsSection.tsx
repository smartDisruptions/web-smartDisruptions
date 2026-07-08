import Link from 'next/link';
import { apps } from '@/data/apps';
import {
  SectionContainer,
  Card,
  Badge,
  Button,
  RevealOnScroll,
} from '@/components/ui';

export default function FeaturedAppsSection() {
  return (
    <SectionContainer id="featured-apps">
      <RevealOnScroll>
        <div className="text-center">
          <h2 className="font-mono-accent text-sm font-semibold uppercase text-accent/70">
            {'// Proof'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            The receipts behind the writing — real apps I&apos;ve shipped and
            put online. This is what the breakdowns are drawn from.
          </p>
        </div>
      </RevealOnScroll>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {apps.slice(0, 6).map((app, index) => (
          <RevealOnScroll key={app.slug} className={`delay-${index * 100}`}>
            <Link href={`/apps/${app.slug}`}>
              <Card hover={true} className="flex h-full flex-col">
                {/* Thumbnail */}
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={app.thumbnailUrl}
                    alt={`${app.name} screenshot`}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  {app.name}
                </h3>

                <p className="mt-2 flex-1 text-sm text-text-secondary">
                  {app.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {app.techStack.slice(0, 3).map((t) => (
                    <Badge key={t} variant="accent">
                      {t}
                    </Badge>
                  ))}
                </div>

                <span className="mt-4 inline-block text-sm font-medium text-accent">
                  View Details &rarr;
                </span>
              </Card>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      <RevealOnScroll>
        <div className="mt-12 text-center">
          <Button variant="secondary" href="/apps">
            View All Apps
          </Button>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
