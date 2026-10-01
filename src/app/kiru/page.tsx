import type { Metadata } from 'next';
import Kiru, { type KiruPose } from '@/components/kiru/Kiru';
import Kanji, { Seal, Vertical, Slash } from '@/components/brand/Kanji';

export const metadata: Metadata = {
  title: 'Meet Kiru — Smart Disruptions',
  description: 'The Smart Disruptions ninja, every pose.',
  robots: { index: false },
};

const POSES: { pose: KiruPose; note: string }[] = [
  { pose: 'idle', note: 'On watch' },
  { pose: 'wave', note: 'Hello' },
  { pose: 'read', note: 'Reading the notes' },
  { pose: 'storm', note: 'Weathering the market' },
  { pose: 'build', note: 'Building' },
  { pose: 'game', note: 'In the arcade' },
  { pose: 'meditate', note: 'The path' },
  { pose: 'shh', note: 'Keeps secrets' },
  { pose: 'run', note: 'On the move' },
  { pose: 'sit', note: 'Taking a break' },
  { pose: 'peek', note: 'Peeking' },
  { pose: 'throw', note: 'Shuriken' },
  { pose: 'bow', note: 'Thanks for reading' },
];

export default function KiruPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
      <p className="sd-kicker">The house ninja</p>
      <h1 className="font-display mt-3 text-5xl sm:text-7xl">
        <Slash text="Meet Kiru." />
      </h1>
      <div className="mt-6 flex items-center gap-4">
        <Seal char="忍" className="w-12" />
        <Kanji char="斬" draw className="h-20 w-20 text-pen" />
        <Vertical text="スマート・ディスラプションズ" className="h-40 w-4 text-text-secondary" />
      </div>
      <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4" role="list">
        {POSES.map(({ pose, note }) => (
          <li key={pose} className="sd-card sd-tilt flex flex-col items-center p-5">
            <Kiru pose={pose} className="h-44 w-auto" />
            <p className="font-display mt-3 text-lg">{pose}</p>
            <p className="text-sm text-text-secondary">{note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
