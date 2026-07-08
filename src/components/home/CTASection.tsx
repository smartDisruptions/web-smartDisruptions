import { Button, RevealOnScroll } from '@/components/ui';

export default function CTASection() {
  return (
    <section className="border-y border-black/10 bg-accent/[0.05] px-6 py-24">
      <RevealOnScroll>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Start with one real build
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
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
