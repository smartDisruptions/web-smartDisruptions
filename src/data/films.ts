/**
 * The short films on /films: six films where every frame and every sound is
 * computed from code (shaders for the picture, WebAudio for the score), with
 * no camera, no footage and no image or video model. The page, the sitemap
 * and the search index all read this list, in screening order.
 *
 * The files live in public/films/<slug>/: film.mp4 (720p H.264, faststart,
 * about 1 Mbps, so it starts at once on a phone and plays while it downloads),
 * poster.webp (1280x720, the frame shown before play) and thumb.webp (640x360,
 * the same frame for the programme and for phones).
 */
export type Film = {
  slug: string;
  title: string;
  /** The look, in two or three words. */
  style: string;
  /** One line: what happens. */
  line: string;
  /** Two sentences: what to notice, all of it true of the film. */
  about: string;
  /** ISO date it was made. */
  date: string;
  /** Running time in seconds. */
  seconds: number;
};

export const films: Film[] = [
  {
    slug: 'speed-of-light',
    title: '186,282',
    style: 'Swiss graphic',
    line: 'One red photon crosses ever-larger distances until the numbers say it: everything you see is the past.',
    about:
      'A title sequence on a 16 × 9 grid. The Moon shot runs in real time and to scale, so the light takes the true 1.28 seconds to cross, and the score is tuned so one note sits at exactly 186.282 Hz.',
    date: '2026-11-15',
    seconds: 108,
  },
  {
    slug: 'three-against-four',
    title: 'Three Against Four',
    style: 'Bauhaus visual music',
    line: 'Every shape is an instrument, and the screen is the score.',
    about:
      'Red, yellow and blue on warm paper. The red circle plays three notes a bar, the blue square four and the yellow triangle five; they only meet on the bar line, and every cut lands on one of those shared beats.',
    date: '2026-11-15',
    seconds: 69,
  },
  {
    slug: 'fox-and-the-moon',
    title: 'The Fox and the Moon',
    style: 'Ink and wash',
    line: 'A young fox who can’t sleep spends a year trying to catch the moon in a mountain lake.',
    about:
      'Brush and ink on rice paper that is generated too. The moon is never painted: it is always the bare paper the brush went around.',
    date: '2026-11-15',
    seconds: 88,
  },
  {
    slug: 'rose-window',
    title: 'Rose Window',
    style: 'Stained glass',
    line: 'A tree’s whole year, told in one window by a single day’s sun.',
    about:
      'Dawn is spring, noon is summer, the afternoon is autumn and dusk is winter. Then the camera pulls back into the stone nave as the window’s colours slide across the floor.',
    date: '2026-11-15',
    seconds: 77.5,
  },
  {
    slug: 'one-drop',
    title: 'One Drop',
    style: 'Darkfield microscope',
    line: 'A whole living world, glowing in the dark inside one drop of pond water.',
    about:
      'Glass diatoms, rolling Volvox with daughter colonies inside, a rotifer whose crown spins like a wheel, and a water flea whose heart you can watch beating.',
    date: '2026-11-15',
    seconds: 81,
  },
  {
    slug: 'escapement',
    title: 'Escapement',
    style: 'Living blueprint',
    line: 'A blueprint draws itself to show how a mechanical watch keeps time, eight ticks a second.',
    about:
      'The mainspring winds, the gear train carries the energy, and the escapement lets it out in equal steps while the balance swings back and forth four times a second.',
    date: '2026-11-15',
    seconds: 96,
  },
];

export const filmFile = (
  f: Film,
  name: 'film.mp4' | 'poster.webp' | 'thumb.webp'
) => `/films/${f.slug}/${name}`;

/** "1:48" (whole seconds: a film can run 77.5 s) */
export const runTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
