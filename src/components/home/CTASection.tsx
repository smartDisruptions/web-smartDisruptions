import { Button, ComingSoonBadge } from '@/components/ui';

export default function CTASection() {
  return (
    <section className="bg-accent/5 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
          See What AI Can Build
        </h2>

        <p className="mt-4 text-lg text-text-secondary">
          Explore real applications built from idea to deployment using our AI
          orchestration system.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button variant="primary" size="lg" href="/apps">
            Explore the Apps
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              Get the Full System
            </span>
            <ComingSoonBadge />
          </div>
        </div>

        {/* Email notification placeholder (non-functional) */}
        <div className="mx-auto mt-14 max-w-md">
          <p className="mb-3 text-sm text-text-secondary">
            Get notified when the system launches
          </p>
          <div className="flex overflow-hidden rounded-lg border border-white/10 bg-surface">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
              disabled
            />
            <button
              type="button"
              className="whitespace-nowrap bg-accent px-5 py-3 text-sm font-medium text-background opacity-60"
              disabled
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
