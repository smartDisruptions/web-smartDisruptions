import Link from 'next/link';
import { apps } from '@/data/apps';
import { SectionContainer, Button, RevealOnScroll } from '@/components/ui';

export default function FeaturedAppsSection() {
  return (
    <SectionContainer id="featured-apps">
      <RevealOnScroll>
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display nb-underline text-4xl text-text-primary sm:text-5xl">
            stuff I built
          </h2>
        </div>
      </RevealOnScroll>

      {/* A wall of prints. Name and one label only — the description, stack
          and outcomes are on each app's own page. */}
      <div className="nb-wall mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
        {apps.slice(0, 6).map((app) => (
          <RevealOnScroll key={app.slug}>
            <Link
              href={`/apps/${app.slug}`}
              className="nb-polaroid nb-tape block p-2 pb-3 sm:p-2.5 sm:pb-4"
            >
              <img
                loading="lazy"
                decoding="async"
                src={app.thumbnailUrl}
                alt={`${app.name} screenshot`}
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <h3 className="font-display mt-2 text-center text-2xl leading-none text-text-primary sm:text-[1.7rem]">
                {app.name}
              </h3>
              <p className="font-mono-accent mt-1.5 text-center text-text-secondary">
                {app.category}
              </p>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      <RevealOnScroll>
        <div className="mt-14 text-center">
          <Button variant="secondary" href="/built">
            See all of it
          </Button>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
