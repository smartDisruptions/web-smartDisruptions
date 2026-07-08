import { Button } from '@/components/ui';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-4">
      {/* Background grid effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08)_0%,transparent_70%)]" />

      <div className="animate-fade-in relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-mono-accent text-sm text-accent/70">
          {'// Josh — builder, teaching in public'}
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
          I build real things with AI — and show you exactly how.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Honest breakdowns of what I ship, what breaks, and what I&apos;d tell
          someone starting out. The goal: make advanced AI usable for people who
          feel behind, stuck, or underpowered.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button variant="primary" size="lg" href="/content">
            Read the writing
          </Button>
          <Button variant="secondary" size="lg" href="/apps">
            See what I&apos;ve built
          </Button>
        </div>
      </div>
    </section>
  );
}
