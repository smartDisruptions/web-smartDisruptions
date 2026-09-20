import { Button } from '@/components/ui';

export default function HeroSection() {
  return (
    <section className="px-5 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
      <div className="animate-fade-in mx-auto grid w-full max-w-5xl items-center gap-14 md:grid-cols-[1.35fr_1fr] md:gap-10">
        <div>
          <h1 className="font-display text-[3.4rem] leading-[0.95] text-text-primary sm:text-7xl lg:text-[5.5rem]">
            I build real things with AI. Then I{' '}
            <span className="relative inline-block whitespace-nowrap text-[var(--sd-pen-ink)]">
              show my work.
              {/* The pen stroke under the promise. Decorative. */}
              <svg
                aria-hidden
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                className="absolute -bottom-[0.12em] left-[-2%] h-[0.28em] w-[104%] overflow-visible"
              >
                <path
                  d="M3 12 C 50 2, 90 18, 140 9 S 230 3, 297 11"
                  fill="none"
                  stroke="var(--sd-pen)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Button variant="primary" size="lg" href="/content">
              Read the notes
            </Button>
            <Button variant="secondary" size="lg" href="/apps">
              See what I&apos;ve built
            </Button>
          </div>
        </div>

        {/* Josh, taped in, with the site's one-line promise stuck to the print. */}
        <div className="relative mx-auto mb-10 w-[min(250px,68vw)] md:mb-0">
          <figure className="nb-polaroid nb-tape rotate-[4deg] p-2.5 pb-2">
            <img
              src="/images/josh.webp"
              alt="Josh Escusa"
              width={320}
              height={320}
              className="aspect-square w-full object-cover"
            />
            <figcaption className="font-display pt-2 text-center text-2xl text-text-primary">
              Josh &mdash; that&apos;s me
            </figcaption>
          </figure>
          <p className="nb-sticky font-display absolute -bottom-16 -left-5 w-36 -rotate-[7deg] p-3 text-[1.35rem] leading-[1.02] md:-left-12">
            mistakes included. always.
          </p>
        </div>
      </div>
    </section>
  );
}
