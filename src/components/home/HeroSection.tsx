import { Button } from '@/components/ui';

export default function HeroSection() {
  return (
    <section className="relative flex items-center px-6 pt-16 pb-20 sm:min-h-[82vh] sm:py-0">
      {/* Soft warm wash, top-left — the only ambient color, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_20%_-10%,rgba(194,65,12,0.06),transparent_60%)]"
      />

      <div className="animate-fade-in relative z-10 mx-auto w-full max-w-3xl">
        <p className="font-mono-accent text-accent">
          Josh · building in public
        </p>

        <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
          I build real things with AI — and show you exactly how.
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
          Honest breakdowns of what I ship, what breaks, and what I&apos;d tell
          someone starting out. The goal: make advanced AI usable for people who
          feel behind, stuck, or underpowered.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
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
