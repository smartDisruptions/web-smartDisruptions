/**
 * The four Web Design resume samples.
 *
 * Same résumé (src/data/resume.ts), four visual worlds. The set exists to show
 * that the design is a decision, not a default — which only lands if the
 * content underneath is provably identical.
 *
 * `palette` is for the swatch chips on the index; each artifact owns its real
 * tokens in its own stylesheet.
 */

export type Sample = {
  slug: string;
  name: string;
  lineage: string;
  thesis: string;
  /** What a visitor should look at, in one line. */
  signature: string;
  palette: string[];
  /** Card ground + ink, so the index card can hint at the world it opens. */
  cardBg: string;
  cardInk: string;
  cardAccent: string;
};

export const samples: Sample[] = [
  {
    slug: 'bulletin',
    name: 'Variety Trial Bulletin',
    lineage: 'Land-grant extension bulletins — Palouse wheat variety trials',
    thesis:
      'A career as a performance record under measured conditions: plots, seasons, yields.',
    signature:
      'The Palouse drawn as live contour topography, with each project a surveyed plot you can sample.',
    palette: ['#0f1711', '#dfc46a', '#4f9d9d', '#d94f8a'],
    cardBg: '#0f1711',
    cardInk: '#eae4d2',
    cardAccent: '#dfc46a',
  },
  {
    slug: 'screenprint',
    name: 'Registered Screenprint',
    lineage: 'Translucent spot-colour printing, deliberate misregistration',
    thesis:
      'Each career layer is a colour pass; where they overlap is who he is now.',
    signature:
      'Drag the registration out of true and watch three careers separate into their own passes.',
    palette: ['#f2ece0', '#1b9aaa', '#e8a33d', '#d64550'],
    cardBg: '#f2ece0',
    cardInk: '#1a1a1a',
    cardAccent: '#d64550',
  },
  {
    slug: 'terminal',
    name: 'Phosphor Terminal',
    lineage: 'P1 green phosphor on curved glass, midnight machine room',
    thesis: 'The résumé as a live transcript you type into.',
    signature:
      'A working command line over the record — eleven years inside Banner, rendered as the surface it was.',
    palette: ['#050a06', '#33ff66', '#1a7a33', '#b8ffcc'],
    cardBg: '#050a06',
    cardInk: '#b8ffcc',
    cardAccent: '#33ff66',
  },
  {
    slug: 'portfolio',
    name: 'The Category Standard',
    lineage: 'The dark developer portfolio, executed straight',
    thesis:
      'What this category ships by default, built to the same standard as the other three.',
    signature:
      'The familiar one — full-height name, scroll reveals, a timeline down the left. Included as the control.',
    palette: ['#0a0a0b', '#fafafa', '#6366f1', '#a1a1aa'],
    cardBg: '#0a0a0b',
    cardInk: '#fafafa',
    cardAccent: '#6366f1',
  },
];

export function getSample(slug: string): Sample | undefined {
  return samples.find((s) => s.slug === slug);
}
