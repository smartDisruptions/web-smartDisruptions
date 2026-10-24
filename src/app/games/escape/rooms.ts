/**
 * What the Escape Rooms section shows of each room, beyond its entry in
 * src/data/apps.ts (name, description, links): the stage it opens on, its
 * suspects and their alibis in their own recorded voices.
 *
 * The pictures are the game drawing itself, rendered by the vault's
 * Tools/moon-pearl/tools/site-art.mjs (no interface on them). The voices are
 * the game's own files, served beside it in public/games/<slug>/audio/.
 *
 * Stage positions are fractions of the stage picture: `pearl` is where it
 * glows on its stand, `drift` how far (x, y) its glow travels in the dark
 * before it goes out, toward the dressing-room door on the left.
 */

export type Suspect = {
  id: string;
  name: string;
  role: string;
  /** The alibi, word for word what the voice says. */
  quote: string;
  voice: string;
  img: string;
  w: number;
  h: number;
  /** Their colour in the game's case board: the quote's name tag. */
  ink: string;
};

type Frame = { phone: string; wide: string };
type Spot = { phone: [number, number]; wide: [number, number] };

export type Room = {
  slug: string;
  number: string;
  kicker: string;
  tagline: string;
  blurb: string;
  facts: { n: string; label: string }[];
  stage: {
    show: Frame;
    gone: Frame;
    alt: string;
    pearl: Spot;
    drift: Spot;
    captions: [string, string, string];
  };
  suspects: Suspect[];
  verdict: string;
};

export const ROOMS: Record<string, Room> = {
  'the-moon-pearl': {
    slug: 'the-moon-pearl',
    number: '01',
    kicker: 'A Mei mystery',
    tagline:
      'Every night, Madame Luna makes the Moon Pearl vanish. Tonight, it didn’t come back.',
    blurb:
      'The lights went out for seven seconds at her farewell show, and the new lighting tech got the blame. That’s Mei. She’s locked in the dressing room until the police arrive at dawn, with one night to find the pearl and prove who took it.',
    facts: [
      { n: '1', label: 'locked room' },
      { n: '3', label: 'suspects' },
      { n: '8', label: 'hours till dawn' },
      { n: '37', label: 'voiced lines' },
    ],
    stage: {
      show: {
        phone: '/images/escape/moon-pearl-show-800.webp',
        wide: '/images/escape/moon-pearl-show-1600.webp',
      },
      gone: {
        phone: '/images/escape/moon-pearl-gone-800.webp',
        wide: '/images/escape/moon-pearl-gone-1600.webp',
      },
      alt: 'The Lantern Theater’s stage at Madame Luna’s farewell show: Madame Luna in her cape of moons beside the Moon Pearl, glowing under a glass dome on its stand, and her assistant Ivy holding Pip the dove.',
      pearl: { phone: [0.4635, 0.417], wide: [0.466, 0.5] },
      drift: { phone: [-0.25, -0.05], wide: [-0.19, -0.07] },
      captions: [
        '9:42 PM. Madame Luna’s farewell show: the Vanishing Moon.',
        'The lights go out for seven seconds. In the dark, the pearl still glows.',
        'The lights come back on an empty stand. And the girl on the lights gets the blame.',
      ],
    },
    suspects: [
      {
        id: 'ivy',
        name: 'Ivy',
        role: 'Madame’s assistant',
        quote:
          'I was on the far side the whole time, holding Pip! I never moved.',
        voice: '/games/the-moon-pearl/audio/v_ivy_alibi.mp3',
        img: '/images/escape/who-ivy.webp',
        w: 387,
        h: 520,
        ink: '#5fe0a0',
      },
      {
        id: 'silas',
        name: 'Silas Vane',
        role: 'Rival magician',
        quote: 'Don’t look at me. I was in my seat, front row, all night.',
        voice: '/games/the-moon-pearl/audio/v_silas_alibi.mp3',
        img: '/images/escape/who-silas.webp',
        w: 324,
        h: 520,
        ink: '#c79bff',
      },
      {
        id: 'hart',
        name: 'Mrs. Hart',
        role: 'Owns the theater',
        quote:
          'And I was upstairs counting the ticket money, dear. Ask anyone.',
        voice: '/games/the-moon-pearl/audio/v_hart_alibi.mp3',
        img: '/images/escape/who-hart.webp',
        w: 392,
        h: 520,
        ink: '#ff9fb2',
      },
    ],
    verdict: 'One of them is lying.',
  },
};
