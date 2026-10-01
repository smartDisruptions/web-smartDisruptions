import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import { Seal } from '@/components/brand/Kanji';
import { Button } from '@/components/ui';

/** Josh, briefly — and the promise the site has kept since the first post. */
export default function AboutTeaser() {
  return (
    <section aria-labelledby="hm-josh" className="mx-auto max-w-6xl px-5 pt-24 sm:px-6 sm:pt-32">
      <div className="sd-sheet sd-reveal grid items-center gap-10 overflow-hidden p-6 sm:p-10 md:grid-cols-[auto_1fr_auto]">
        <div className="relative mx-auto w-44 sm:w-52">
          <img
            src="/images/josh.webp"
            alt="Josh Escusa"
            width={320}
            height={320}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full rounded-full object-cover ring-4 ring-[var(--sd-surface)] shadow-[0_24px_50px_-24px_var(--sd-card-shadow)]"
          />
          <Seal char="忍" className="absolute -right-1 bottom-2 w-12" />
          <p className="sd-note font-display absolute -bottom-6 -left-8 w-36 -rotate-6 p-3 text-[1.05rem] leading-tight">
            mistakes included. always.
          </p>
        </div>
        <div>
          <p className="sd-kicker">The person behind it</p>
          <h2 id="hm-josh" className="font-display mt-3 text-3xl sm:text-4xl">
            Hi, I&apos;m Josh.
          </h2>
          <p className="font-read mt-4 max-w-xl text-[1.08rem] leading-relaxed text-text-secondary">
            I build real things with AI and write up exactly how — so it&apos;s usable for people
            who feel behind, stuck, or underpowered.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" href="/about">
              More about me
            </Button>
            <Link
              href="/kiru"
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem] font-bold text-accent hover:bg-fill"
            >
              Meet Kiru, the ninja →
            </Link>
          </div>
        </div>
        <Kiru pose="meditate" className="mx-auto hidden h-52 w-auto md:block" />
      </div>
    </section>
  );
}
