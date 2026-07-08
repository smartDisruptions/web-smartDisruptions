import { Button, RevealOnScroll } from '@/components/ui';

export default function CTASection() {
  return (
    <section className="bg-accent/5 px-4 py-20 sm:px-6">
      <RevealOnScroll>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Start with one real build
          </h2>

          <p className="mt-4 text-lg text-text-secondary">
            Every post here is one project, broken down honestly — the timeline,
            the method, and the parts worth copying. Pick one and build
            alongside it.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button variant="primary" size="lg" href="/content">
              Read the writing
            </Button>
            <Button variant="secondary" size="lg" href="/apps">
              Browse the builds
            </Button>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
