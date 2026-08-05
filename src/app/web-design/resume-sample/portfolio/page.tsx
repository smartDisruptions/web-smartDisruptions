import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import Portfolio from './Portfolio';
import s from './portfolio.module.css';

// The category's own faces, used without irony. This surface is the control:
// dressing it in a characterful display face would make it a straw man and
// the four-way comparison worthless.
const display = Manrope({
  variable: '--font-portfolio-display',
  subsets: ['latin'],
  display: 'swap',
});

const body = Inter({
  variable: '--font-portfolio-body',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Category Standard — Web Design Resume Sample',
  description:
    'The dark developer portfolio, executed straight: full-height name, scroll reveals, a dotted timeline. Included as the control in a set of four samples over the same record.',
  openGraph: {
    title: 'The Category Standard — Web Design Resume Sample',
    description:
      'What this category ships by default, built to the same standard as the other three.',
    url: 'https://smartdisruptions.com/web-design/resume-sample/portfolio',
    type: 'website',
  },
};

const CONTRACT = `
IMPECCABLE DIRECTION CONTRACT — seed 7a419897 (canon, mode: experience)

THESIS: The category standard, played straight. It does NOT refuse the default
arrangement — it is the default arrangement, built well, so the other three
have something honest to be measured against.

OWN-WORLD: Near-black (#0a0a0b) with zinc borders, one indigo accent, 12–16px
radii, Manrope over Inter. Cards, pills, a dotted rail. The conventions, at
full craft.

STORY: The visitor recognises the form instantly, reads the record without
friction, and leaves knowing this one was a choice too.

FIRST VIEWPORT: Status pill, name at 6rem, accent role line, summary at 60ch,
two buttons. Exactly what the convention promises.

FORM: The standing exit — the canon card, executed at full fidelity.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
`;

export default function PortfolioPage() {
  const modelEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className={`${display.variable} ${body.variable}`}>
      {/* Direction contract as an HTML comment so it survives the production
          build. CONTRACT is a module constant — no user input reaches this. */}
      <div dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
      {/* Scroll reveals start at opacity 0. Without JS nothing would ever
          un-hide them, so the reveal is opt-in on JS being present. */}
      <noscript>
        <style>{`.${s.reveal}{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <Portfolio modelEnabled={modelEnabled} />
    </div>
  );
}
