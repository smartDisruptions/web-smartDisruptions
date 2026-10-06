import type { ComponentType } from 'react';
import type { App } from '@/data/apps';
import MachineDefs from './machines/defs';
import Live from './machines/Live';
import Hoop from './machines/Hoop';
import Volt from './machines/Volt';
import Whack from './machines/Whack';
import Ring from './machines/Ring';
import Milk from './machines/Milk';
import type { MachineProps } from './machines/parts';
import './machines.css';

/**
 * THE MACHINES — the five games of Broom & Blade's Guild Arcade, standing on
 * the cellar floor of the Broom & Blade Arcade (the hall draws the room).
 *
 * Each one is its own object with its game's personality, drawn in SVG and
 * CSS on the server: an oak cabinet under a backboard, a hot-pink boxing
 * machine that followed you down from the neon, a whack-a-mole under a
 * striped awning, a ring-toss booth and a milk-bottle shelf. Every machine
 * has the game's attract screen under warm CRT glass, its name, what it is,
 * your best score in this browser, a ticket to play and a way to the details.
 *
 * The only JavaScript: the best scores (localStorage) and one observer that
 * marks which machines are on screen. The attract loops are CSS on the
 * compositor, running only while the room is live and the machine is on.
 */

const MACHINES: Record<string, { kind: string; Machine: ComponentType<MachineProps> }> = {
  'hoop-quest': { kind: 'hoop', Machine: Hoop },
  'kid-volt-knockout': { kind: 'volt', Machine: Volt },
  'whack-a-dust-bunny': { kind: 'whack', Machine: Whack },
  'ring-toss': { kind: 'ring', Machine: Ring },
  'milk-bottle-knockdown': { kind: 'milk', Machine: Milk },
};

export default function GuildMachines({ games }: { games: App[] }) {
  return (
    <div className="gm">
      <MachineDefs />
      <ul className="gm-row" role="list">
        {games.map((game, i) => {
          // A game without a machine of its own gets the oak cabinet.
          const { kind, Machine } = MACHINES[game.slug] ?? MACHINES['hoop-quest'];
          return (
            <li key={game.slug} className={`gm-m gm-m-${kind}`}>
              <Machine game={game} no={i + 1} />
            </li>
          );
        })}
      </ul>
      <Live />
    </div>
  );
}
