import { appSample, pic, type Sample } from '@/components/build/samples';

/**
 * The samples on /build-games: three of my games, free in the browser, in
 * the slots of the shelf. Each comes from src/data/apps.ts; this list says
 * what kind of game it is and which picture to show.
 */
export const SAMPLES: Sample[] = [
  appSample('the-moon-pearl', {
    kind: 'Escape room',
    goLabel: 'Play it',
    pictures: [
      pic(
        '/images/apps/the-moon-pearl-thumbnail.webp',
        'The Moon Pearl: a glowing pearl over a theater dressing room, framed by red stage curtains, above the line “Every night, Madame Luna makes the Moon Pearl vanish. Tonight, it didn’t come back.”'
      ),
    ],
  }),
  appSample('moondrift', {
    kind: 'Board tricks',
    goLabel: 'Play it',
    pictures: [
      pic(
        '/images/apps/moondrift-thumbnail.webp',
        'Cosmo’s Moondrift: Cosmo mid-flip on a glowing board over blue moon dunes, crystals and floating jellyfish lights around him, a ringed planet in the sky.'
      ),
    ],
  }),
  appSample('rubble-rouser', {
    kind: 'Demolition',
    goLabel: 'Play it',
    pictures: [
      pic(
        '/images/apps/rubble-rouser-thumbnail.webp',
        'Rubble Rouser: a rocket launcher aimed at a Ferris wheel at dusk as an explosion of fire and debris tears through the fairground below it.'
      ),
    ],
  }),
];
