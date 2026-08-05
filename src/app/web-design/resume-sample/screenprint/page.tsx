import type { Metadata } from 'next';
import { Anton, Work_Sans } from 'next/font/google';
import Screenprint from './Screenprint';

// Poster caps — the massed stencil voice a gig-poster press actually sets.
const poster = Anton({
  variable: '--font-print-poster',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

// Body — a workhorse grotesque that survives being printed small on stock.
const body = Work_Sans({
  variable: '--font-print-body',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Registered Screenprint — Web Design Resume Sample',
  description:
    'A résumé printed as translucent spot-colour passes. Drag the registration out of true and three careers separate into their own layers. One of four samples over the same record.',
  openGraph: {
    title: 'Registered Screenprint — Web Design Resume Sample',
    description:
      'Three roles at one university, printed one pass at a time. Pull them out of register to see each layer.',
    url: 'https://smartdisruptions.com/web-design/resume-sample/screenprint',
    type: 'website',
  },
};

const CONTRACT = `
IMPECCABLE DIRECTION CONTRACT — seed 7a419897 (challenger, mode: experience)

THESIS: A career is registered colour passes; the overlap is the person.
Refuses the tidy single-column CV and the dark-portfolio default alike.

OWN-WORLD: Screenprint on cool grey-linen stock (#e4e2d9) — deliberately not
the site's warm cream. Translucent cyan/amber/scarlet multiplying over each
other, 3px hard rules, offset block shadows as ink, drawn registration crosses,
paper tooth. Poster caps massed; no rounded corners anywhere.

STORY: The visitor sees one name, pulls it out of register, and understands
the three roles were laid over each other rather than swapped between.

FIRST VIEWPORT: Run line, then the name at 9rem set four times — cyan, amber
and scarlet passes under a black key — with the registration slider beneath.

FORM: Challenger, fused and chosen alongside the assigned direction.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
`;

export default function ScreenprintPage() {
  const modelEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className={`${poster.variable} ${body.variable}`}>
      {/* Direction contract as an HTML comment so it survives the production
          build. CONTRACT is a module constant — no user input reaches this. */}
      <div dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
      <Screenprint modelEnabled={modelEnabled} />
    </div>
  );
}
