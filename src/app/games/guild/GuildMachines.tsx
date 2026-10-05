import Link from 'next/link';
import type { App } from '@/data/apps';
import { builtHref } from '@/data/projects';

/**
 * The Broom & Blade Arcade's five machines.
 *
 * STUB (base commit): a plain list, so the page renders while the machines
 * agent builds the real ones. Same props when it lands.
 */
export default function GuildMachines({ games }: { games: App[] }) {
  return (
    <ul className="gm-stub">
      {games.map((game) => (
        <li key={game.slug}>
          <h3>{game.name}</h3>
          <p>{game.description}</p>
          {game.liveUrl && <a href={game.liveUrl}>Play</a>}{' '}
          <Link href={`${builtHref(game.slug)}?from=guild`}>Details</Link>
        </li>
      ))}
    </ul>
  );
}
