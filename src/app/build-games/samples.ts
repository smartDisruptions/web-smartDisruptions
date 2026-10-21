import { appSample, pic, type Sample } from '@/components/build/samples';

/**
 * The samples on /build-games: three of my games, free in the browser, in
 * the slots of the shelf. Lantern Night and Path Not Taken come from
 * src/data/apps.ts. Rooftop Run plays inside its cabinet on /games and has
 * no page of its own, so its entry is written out here; its picture is the
 * cabinet's poster with the Start button taken off.
 */
export const SAMPLES: Sample[] = [
  {
    key: 'rooftop-run',
    name: "Kiru's Rooftop Run",
    kind: 'Runner',
    summary:
      'Kiru runs the rooftops of the town below: six levels, each timed to its own song, and six ways to move through them.',
    href: '/games#rooftop-run',
    goLabel: 'Play it',
    pictures: [
      pic(
        '/images/apps/rooftop-run-thumbnail.webp',
        'Kiru’s Rooftop Run: Kiru running across the rooftops at night toward a red torii gate, under a full moon.'
      ),
    ],
  },
  appSample('path-not-taken', {
    name: 'Path Not Taken',
    kind: 'Rhythm duel · pre-alpha',
    goLabel: 'Play it',
    pictures: [
      pic(
        '/images/apps/path-not-taken-thumbnail.webp',
        'Path Not Taken: a greybox swordsman in a straw hat swings a glowing blade under the moon, over a combo count of 4.'
      ),
    ],
  }),
  appSample('lantern-night', {
    kind: 'Lantern toss',
    goLabel: 'Play it',
    pictures: [
      pic(
        '/images/apps/lantern-night-thumbnail.webp',
        'Kiru’s Lantern Night: Kiru on a rooftop at night, festival lanterns over the town, and a firework bursting beside the moon.'
      ),
    ],
  }),
];
