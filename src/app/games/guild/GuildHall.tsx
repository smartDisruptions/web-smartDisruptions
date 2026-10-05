import type { App } from '@/data/apps';
import Pip, { PipDefs } from '@/components/pip/Pip';
import GuildMachines from './GuildMachines';
import './guild.css';

/**
 * THE BROOM & BLADE ARCADE — the last room on /games, above the archive's
 * door (Josh's call, 2026-10-05).
 *
 * STUB (base commit): the hall agent builds the real room. The anchor id
 * (#broom-blade-arcade) is a contract: the five games link back to it.
 */
export default function GuildHall({ games }: { games: App[] }) {
  return (
    <section id="broom-blade-arcade" className="gh" aria-labelledby="gh-title">
      <PipDefs />
      <h2 id="gh-title" className="font-display">
        The Broom &amp; Blade Arcade
      </h2>
      <Pip pose="wave" className="gh-pip" />
      <GuildMachines games={games} />
    </section>
  );
}
