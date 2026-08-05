import type { Metadata } from 'next';
import { Bitter, Archivo, Roboto_Mono } from 'next/font/google';
import Bulletin from './Bulletin';

// Display: a slab with the weight of agricultural print. Not one of the
// training-data display defaults, and not the site's Instrument Sans — this
// surface is deliberately outside the Paper world.
const slab = Bitter({
  variable: '--font-bulletin-slab',
  subsets: ['latin'],
  display: 'swap',
});

// Labels and body: a grotesque that holds at small sizes in a data-dense page.
const sans = Archivo({
  variable: '--font-bulletin-sans',
  subsets: ['latin'],
  display: 'swap',
});

// Mono is for measurement here — yields, years, plot numbers — not costume.
const mono = Roboto_Mono({
  variable: '--font-bulletin-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Variety Trial Bulletin — Web Design Resume Sample',
  description:
    "A résumé designed as a land-grant extension bulletin: plots, seasons, and yields, over a live contour survey of the Palouse. One of four samples rendering the same record.",
  openGraph: {
    title: 'Variety Trial Bulletin — Web Design Resume Sample',
    description:
      'A résumé as a performance record under measured conditions. One of four visual worlds over the same facts.',
    url: 'https://smartdisruptions.com/web-design/resume-sample/bulletin',
    type: 'website',
  },
};

const CONTRACT = `
IMPECCABLE DIRECTION CONTRACT — seed 7a419897 (direction, mode: experience)

THESIS: A career is a performance record under measured conditions. Refuses the
dark-portfolio-with-one-accent arrangement this category always ships.

OWN-WORLD: Land-grant extension bulletin. Basalt ground (#0f1711), wheat gold,
survey teal, flagging-tape magenta. Slab display, grotesque labels, tabular
mono for measurement. Hairline rules and plate borders; no rounded cards.

STORY: The visitor reads a trial report, samples a plot, and understands the
work was measured rather than described.

FIRST VIEWPORT: Full-bleed animated contour ridgelines of the Palouse; the
bulletin plate sits left over them carrying masthead, name, standfirst and
three tabular stats.

FORM: Grounded candidate 6 of 7, assigned by the roll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
`;

export default function BulletinPage() {
  const modelEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className={`${slab.variable} ${sans.variable} ${mono.variable}`}>
      {/* The direction contract, emitted as an HTML comment so it survives the
          production build and can be audited against the render. CONTRACT is a
          module constant — no user input reaches this, and JSX cannot emit a
          comment node any other way. */}
      <div dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
      <Bulletin modelEnabled={modelEnabled} />
    </div>
  );
}
