import ArmoryWall, {
  type WallGroup,
  type WallItem,
} from '@/components/built/ArmoryWall';
import { GlyphSeal } from '@/components/about/work/glyphs';
import {
  WORK_IDS,
  catalogue,
  featured,
  games,
  wall,
} from '@/components/about/work/data';
import './work-wall.css';

/**
 * Everything on one wall (#wall): the work, all of it, straight after the
 * threshold. The four projects, More builds and the games each had a section
 * above it until 2026-10-26, when Josh took them off and left the wall to
 * hold the lot; the four rooms (components/home/DojoMap) follow it.
 *
 * Every project, app and game on the site, one plaque each, hung on one ring in a hall lit by a single red
 * paper lantern. The ring turns through the lantern's light: the plaque at
 * the front is lit and glossed, the ones turning away go into the dark, the
 * far side shows the backs of the plaques with their seals. Day is the same
 * hall by paper-lamp light.
 *
 * The ring itself, its light and its behaviour are components/built/
 * ArmoryWall (+ ArmoryWallIsland, armory-drive.ts, wall.css). This file is
 * the room: the header, the chips' groups (read from the same lists the
 * receipt counts, so "Games 12" there is the Games chip's twelve here), and
 * the line that closes the work before the four rooms.
 *
 * Reduced motion: the plaques lie flat in a grid, the chips filter it, and
 * the lede says what the grid does instead of what the ring does.
 *
 * Styles: ./work-wall.css (wk-wl-): the hall's ground, which the ring's
 * shade is painted in, so the dark at its sides is the room's own colour.
 */
export default function WorkWall() {
  // Which chip finds each plaque: the four, More builds or the games.
  const groupOf = new Map<string, string>([
    ...featured.map((f) => [f.slug, 'projects'] as const),
    ...catalogue.map((c) => [c.key, 'more'] as const),
    ...games.map((g) => [g.slug, 'games'] as const),
  ]);
  const items: WallItem[] = wall.map((item) => ({
    ...item,
    group: groupOf.get(item.key),
  }));
  const groups: WallGroup[] = [
    { id: 'all', label: 'All', count: wall.length },
    { id: 'projects', label: 'Projects', count: featured.length },
    { id: 'more', label: 'More builds', count: catalogue.length },
    { id: 'games', label: 'Games', count: games.length },
  ];

  return (
    <section id={WORK_IDS.wall} aria-labelledby="wk-wl-h" className="wk-wl">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-6">
        <p className="sd-kicker">All of it at once</p>
        <h2
          id="wk-wl-h"
          className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl"
        >
          Everything on one wall
        </h2>
        <p className="font-read mx-auto mt-5 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
          <span className="bt-motion-only">
            Every project, app and game on this site, hung on one ring. Drag it
            round or use the arrows, and press any of them to open it.
          </span>
          <span className="bt-still-only">
            Every project, app and game on this site, in one place. Press any of
            them to open it.
          </span>
        </p>
      </div>

      <div className="wk-wl-ring">
        <ArmoryWall items={items} groups={groups} label="Everything I built" />
      </div>

      {/* The page closes with the seal it opened with (the receipt's 作,
          "made"), before the card that introduces the person. */}
      <p className="wk-wl-end">
        <GlyphSeal char="作" className="wk-wl-seal" />
        <span className="font-read">That&rsquo;s all of it, so far.</span>
      </p>
    </section>
  );
}
