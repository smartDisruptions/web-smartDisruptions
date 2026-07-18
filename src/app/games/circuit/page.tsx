import type { Metadata } from 'next';
import { SectionContainer } from '@/components/ui';
import CircuitGame from './CircuitGame';

const TITLE = 'Circuit of the Day — a tiny daily logic puzzle';
const DESCRIPTION =
  'One hidden circuit per day, same board for everyone. Flip the switches, read the truth table, and deduce which logic gate goes in each slot. Free, no signup, ~2 minutes.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/games/circuit' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://smartdisruptions.com/games/circuit',
    type: 'website',
    images: [{ url: '/images/apps/circuit-of-the-day-1.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/apps/circuit-of-the-day-1.png'],
  },
};

export default function CircuitPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Same red scanline wash as the Arcade — this page is part of the cabinet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(239,68,68,0.04)_0px,rgba(239,68,68,0.04)_1px,transparent_1px,transparent_3px)]"
      />
      <SectionContainer className="relative py-16">
        <div className="text-center">
          <p
            className="font-mono-accent text-sm uppercase tracking-[0.3em]"
            style={{ color: 'var(--arcade-red-ink)' }}
          >
            ★ Daily Puzzle ★
          </p>
          <h1 className="font-mono-accent mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--arcade-yellow-ink) 0%, var(--arcade-blue-ink) 100%)',
              }}
            >
              Circuit of the Day
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
            One hidden circuit per day — same board for everyone. Flip the
            switches, watch the signal run, and deduce which gate goes in each{' '}
            <span className="font-mono-accent font-bold">?</span> chip until the
            lamp matches the truth table.
          </p>
        </div>
        <div className="mt-8">
          <CircuitGame />
        </div>
      </SectionContainer>
    </div>
  );
}
