import Link from 'next/link';
import { WORK_IDS, games } from '@/components/about/work/data';

/** STUB — the games. Replaced by the games builder. */
export default function WorkGames() {
  return (
    <section
      id={WORK_IDS.games}
      aria-labelledby="wk-games-h"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24 sm:px-6"
    >
      <h2
        id="wk-games-h"
        className="font-display sd-brush-under text-4xl sm:text-5xl"
      >
        The games
      </h2>
      <ul className="mt-8 grid gap-2" role="list">
        {games.map((g) => (
          <li key={g.slug}>
            <Link href={`/built/${g.slug}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
      <Link href="/games" className="mt-6 inline-block">
        Go to the Arcade
      </Link>
    </section>
  );
}
