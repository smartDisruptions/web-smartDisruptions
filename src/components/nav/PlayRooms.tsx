import Kanji from '@/components/brand/Kanji';
import {
  apps,
  ARCADE_SLUGS,
  BROOM_BLADE_ARCADE_SLUGS,
  ESCAPE_ROOM_SLUGS,
} from '@/data/apps';
import { videos } from '@/data/videos';
import RoomLink from './RoomLink';

/**
 * The Play tab's two rooms: the Arcade (things you play) and Videos (things
 * you press play on). This strip sits right under the top bar on both pages,
 * the way a phone app splits one tab in two, and switches between them.
 *
 * It is two links, not two tabs: each room is its own page with its own
 * address, so it works without JavaScript, the browser's Back button does the
 * expected thing, and a screen reader hears a small navigation landmark with
 * the current page marked.
 *
 * What moves is the browser's work. The pill behind the current room has a
 * view-transition-name, so when the page changes it slides across (the phone
 * tab bar's pill and the header's brush stroke move the same way), and the
 * page slides in the direction of travel. Under reduced motion it just
 * switches.
 *
 * A wide window doesn't show it: the header there has room to name both
 * rooms (nav.ts), so this would only say it twice.
 *
 * Rendered on the server; the only script is the tap's short vibration
 * (RoomLink). Styles: .sd-rooms in globals.css.
 */
const ROOMS = [
  {
    id: 'arcade',
    href: '/games',
    name: 'Arcade',
    kanji: '遊',
    one: 'game',
    many: 'games',
  },
  {
    id: 'videos',
    href: '/videos',
    name: 'Videos',
    kanji: '影',
    one: 'video',
    many: 'videos',
  },
] as const;
type RoomId = (typeof ROOMS)[number]['id'];

/** The same count the Arcade's own "Games" sign shows. */
const GAMES = [
  ...ARCADE_SLUGS,
  ...ESCAPE_ROOM_SLUGS,
  ...BROOM_BLADE_ARCADE_SLUGS,
].filter((slug) => apps.some((app) => app.slug === slug)).length;

export default function PlayRooms({
  current,
  glyphs,
}: {
  current: RoomId;
  /** Ids of glyph <symbol>s already on the page, to reuse instead of drawing
      the two characters again (the videos page has both in its sprite). */
  glyphs?: Partial<Record<RoomId, string>>;
}) {
  const count: Record<RoomId, number> = {
    arcade: GAMES,
    videos: videos.length,
  };
  const here = ROOMS.findIndex((r) => r.id === current);
  return (
    <nav
      aria-label="Play"
      className="sd-rooms"
      style={{ viewTransitionName: 'sd-rooms' }}
    >
      <ul className="sd-rooms-track" role="list">
        {ROOMS.map((room, i) => {
          const on = i === here;
          const n = count[room.id];
          return (
            <li key={room.id}>
              <RoomLink
                href={room.href}
                current={on}
                types={on ? [] : [i > here ? 'nav-forward' : 'nav-back']}
                label={`${room.name}, ${n} ${n === 1 ? room.one : room.many}`}
              >
                {on ? (
                  <span
                    aria-hidden="true"
                    className="sd-room-pill"
                    style={{ viewTransitionName: 'sd-room-pill' }}
                  />
                ) : null}
                <span className="sd-seal sd-room-stamp" aria-hidden="true">
                  {glyphs?.[room.id] ? (
                    <svg viewBox="0 0 1000 1000" focusable="false">
                      <use href={`#${glyphs[room.id]}`} />
                    </svg>
                  ) : (
                    <Kanji char={room.kanji} />
                  )}
                </span>
                <span className="sd-room-name">{room.name}</span>
                <span className="sd-room-n">{n}</span>
              </RoomLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
