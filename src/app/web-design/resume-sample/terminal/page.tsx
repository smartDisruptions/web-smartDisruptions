import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';
import Terminal from './Terminal';

// The face a DEC VT terminal actually set. One face at one size is the whole
// type system here — a character-cell display has nothing else.
const crt = VT323({
  variable: '--font-crt',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Phosphor Terminal — Web Design Resume Sample',
  description:
    'A résumé as a working command line on green phosphor. Type a command or ask it a question. One of four samples rendering the same record.',
  openGraph: {
    title: 'Phosphor Terminal — Web Design Resume Sample',
    description:
      'A résumé you type into. Eleven years inside Banner, rendered as the surface it actually was.',
    url: 'https://smartdisruptions.com/web-design/resume-sample/terminal',
    type: 'website',
  },
};

const CONTRACT = `
IMPECCABLE DIRECTION CONTRACT — seed 7a419897 (challenger, mode: experience)

THESIS: The résumé is a transcript you operate, not a document you scroll.
Refuses the read-only page entirely — every section is a command.

OWN-WORLD: P1 green phosphor (#33ff66) on near-black curved glass. One
monospaced bitmap face at one size; hierarchy from indentation, case and
full-width rules only. Scanlines, tube vignette, block cursor with bloom,
history dimming to afterimage. No cards, no other type, no colour but amber
for warnings.

STORY: The visitor types, the record answers, and the eleven years inside
Oracle and Banner stop being a bullet point.

FIRST VIEWPORT: Status bar, then the record printing itself line by line into
a 56-column field, ending at a live prompt with a breathing block cursor.

FORM: Challenger, fused and chosen alongside the assigned direction.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
`;

export default function TerminalPage() {
  const modelEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className={crt.variable}>
      {/* Direction contract as an HTML comment so it survives the production
          build. CONTRACT is a module constant — no user input reaches this. */}
      <div dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
      <Terminal modelEnabled={modelEnabled} />
    </div>
  );
}
