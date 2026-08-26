import Image from 'next/image';
import type { Metadata } from 'next';
import { SectionContainer, RevealOnScroll } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Websites',
  description:
    'Three sites built end to end — a game with physics, synthesised sound and solver-verified puzzles in a single file, a scroll-driven brand launch page, and a restaurant taking card payments with a loyalty programme underneath.',
};

/**
 * WEBSITES — deliberately not another grid.
 *
 * /apps is a catalogue: eleven things, scannable, categorised. This page is the
 * opposite shape on purpose — three projects at length, each showing what it is
 * actually capable of.
 *
 * TONE (Josh's call, 2026-08-23): lead with capability, not with defects. An
 * earlier draft opened on a payment vulnerability and a dead database. Both
 * were true and both read as competence to an engineer — but a restaurant
 * owner reads them as risk. Rigour is stated as a property of the work
 * ("payments are settled server-side"), never as a war story about what was
 * once wrong. Bug-fixing is fine to discuss; failure is not the pitch.
 *
 * Every claim was verified against the live site or the build journal first.
 * This page argues for hiring him, so an unchecked claim costs more here than
 * anywhere else on the site.
 */

type Study = {
  eyebrow: string;
  name: string;
  what: string;
  image: string;
  imageAlt: string;
  href: string;
  hrefLabel: string;
  problem: string;
  decisionLabel: string;
  decision: string[];
  receipts: { value: string; label: string }[];
};

const studies: Study[] = [
  {
    eyebrow: 'Own work · live',
    name: 'The Pembroke File',
    what: 'A locked-cabinet noir mystery, and the site that has to sell it.',
    image: '/images/websites/pembroke-file.png',
    imageAlt: 'The Pembroke File site — a dark case room lit by a single desk lamp.',
    href: 'https://web-pembroke-file.vercel.app',
    hrefLabel: 'The Pembroke File',
    problem:
      'A five-puzzle mystery that runs entirely in a browser tab — no install, no account, no loading screen. The whole game is a single 130 KB file with nothing behind it: no framework, no build step, and not one network call, so it plays offline and will still play in a decade.',
    decisionLabel: 'What is built into it',
    decision: [
      'The puzzles are real mechanisms rather than riddles. A lamp is rewired on a cable that hangs and swings under Verlet physics on canvas. A sliding-block tray was generated and then solved exhaustively by breadth-first search before shipping, so its seventeen-move minimum is a measured fact instead of a guess. Every sound — the drawer, the dial, the flourish when the last lock gives — is synthesised at runtime, which is why there is nothing to download.',
      'It is built to be played by everyone. Each of the five puzzles has a keyboard route to its solution, motion respects the reduced-motion setting, and progress survives a closed tab, so a drawer opened tonight is still open tomorrow.',
      'The site around it was built with the same care as the game. The case room drifts behind the words as you scroll, dust moves through the lamplight, and the five drawers slide open in sequence as you reach them. Its original artwork was generated for it and compressed from 4.2 MB to 176 KB, so all of that atmosphere costs almost nothing to load.',
    ],
    receipts: [
      { value: '0', label: 'Dependencies, network calls' },
      { value: '130 KB', label: 'The entire game' },
      { value: '176 KB', label: 'Artwork, down from 4.2 MB' },
    ],
  },
  {
    eyebrow: 'Concept work · live',
    name: 'VOLTIC',
    what: 'A launch page for an energy drink that does not exist.',
    image: '/images/websites/voltic.webp',
    imageAlt:
      'The VOLTIC site — a matte black energy drink can lit cyan and lime, beaded with condensation.',
    href: 'https://web-voltic.vercel.app',
    hrefLabel: 'web-voltic.vercel.app',
    problem:
      'A brand page built the way the big product launches are built — a can you can turn in your hands, layers moving at their own depth, type the size of the screen. The brand is invented, so nothing here was licensed or borrowed: the photographs were generated for this build and the site was designed around what came back. The can at the centre of it is not a photograph at all. It is live 3D, so it is correct from every angle rather than only the ones a camera caught.',
    decisionLabel: 'What is built into it',
    decision: [
      'The centrepiece is a pinned section where scrolling turns the can through a full circle — and you can grab it and spin it yourself. It is real geometry wearing a label typeset in the fonts the site itself uses, carrying the exact nutrition values, which is the point rather than a detail: a generated image can invent a second logo, misspell a panel, or drift off its own rotation, and none of that is possible once the label is type and the turn is computed. The rotation eases to about a quarter speed as the back comes round, so the panel gets read time, and then the can dissolves and a nutrition card lands. Even the condensation is built rather than photographed — a height map of domes and a matching roughness map, because what reads as wet is a glossy droplet against a matte body, not a picture of a droplet.',
      'Getting the can to turn took two passes at the same problem. The first is generated footage pinned to real stills at both ends — a photograph of the front, and that same photograph edited to carry the back panel — because a video model will not render legible small print on its own, and a turn that ends on an unreadable label is not worth having. That version still ships, one query string away. Rebuilding the can as geometry took it further: the label is typeset rather than pinned, so every angle is correct, not only the two the footage was anchored to.',
      'Motion is declared in the markup rather than scripted element by element: each layer carries its own scroll speed and pointer depth, and one animation loop reads them and writes transforms, nothing else — and once scrolling settles it writes nothing at all. The page paints from a single 33 KB document with its stylesheet and script inlined; the 3D engine is a separate download that never touches that path, arriving after load as the section approaches.',
      'The first key press reveals a skip link, every focus stop is visible, and the turning can describes in words what it is doing. A regression suite holds that line on every run — an accessibility audit at six scroll positions, plus a sweep for broken requests and console errors — and fails rather than ships.',
    ],
    receipts: [
      { value: '0', label: 'Accessibility violations, six scroll states' },
      { value: '33 KB', label: 'The document that paints the page' },
      { value: '360°', label: 'Live geometry, legible from every angle' },
    ],
  },
  {
    eyebrow: 'Client work · live',
    name: 'Samurai Kitchen',
    what: 'A food truck and catering business, taking orders online.',
    image: '/images/websites/samurai-kitchen.webp',
    imageAlt: 'The Samurai Kitchen site, catering-first with online ordering.',
    href: 'https://samuraikitchencatering.com',
    hrefLabel: 'samuraikitchencatering.com',
    problem:
      'It replaced a dated WordPress site that could not take an order — every catering enquiry arrived as unstructured email and nothing could be paid for online. What went up in its place handles the whole order, end to end.',
    decisionLabel: 'What is built into it',
    decision: [
      'Customers browse a categorised menu with dietary tags, build a cart, and pay by card without leaving the site. Checkout runs on Square Web Payments, so card details never touch the server and the business inherits Square\'s compliance rather than having to earn it.',
      'A loyalty programme runs underneath: diners earn points on every order and redeem them at checkout, which is the part that turns a first order into a second. Catering is handled separately, with pre-built platter packages priced in tiers — the revenue the old contact form was quietly losing.',
      'Three of Square\'s systems are wired in at once — payments, live catalogue, and loyalty — with Supabase behind them. Prices are settled server-side against the real catalogue, so an order is always charged what the kitchen actually set.',
      'The owner ran a full order through it himself, start to finish, before it went anywhere near a customer.',
    ],
    receipts: [
      { value: 'Live', label: 'Ordering and card payments' },
      { value: 'Loyalty', label: 'Points earned and redeemed' },
      { value: 'Catering', label: 'Tiered package pricing' },
    ],
  },
];

export default function WebsitesPage() {
  return (
    <>
      <SectionContainer className="pb-4">
        <RevealOnScroll>
          <p className="font-mono-accent text-accent">Websites</p>
          <h1 className="font-display mt-3 max-w-[20ch] text-4xl leading-[1.1] font-semibold tracking-tight text-text-primary sm:text-5xl">
Three sites, up close
          </h1>
          <p className="mt-8 max-w-[62ch] text-lg leading-[1.75] text-text-secondary">
            Three sites, all live. One is a mystery game that runs in a browser
            tab. One is a brand launch page for a product that does not exist.
            One is a restaurant that takes orders and payments online. Each is
            written up below — what it does, and how it works.
          </p>
        </RevealOnScroll>
      </SectionContainer>

      {studies.map((s) => (
        <SectionContainer key={s.name} className="py-10">
          <RevealOnScroll>
            <article className="border-t border-border pt-12">
              <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
                <div>
                  <p className="font-mono-accent text-text-secondary">
                    {s.eyebrow}
                  </p>
                  <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    {s.name}
                  </h2>
                  <p className="mt-3 text-lg leading-[1.75] text-text-secondary">
                    {s.what}
                  </p>
                  <p className="mt-6 max-w-[58ch] leading-[1.75] text-text-secondary">
                    {s.problem}
                  </p>
                  <a
                    href={s.href}
                    className="font-mono-accent mt-7 inline-block text-accent underline-offset-4 hover:underline"
                  >
                    {s.hrefLabel} →
                  </a>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    width={1200}
                    height={630}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-12 border-l border-border pl-8 sm:pl-10">
                <p className="font-mono-accent mb-6 text-accent">
                  {s.decisionLabel}
                </p>
                <div className="max-w-[62ch] space-y-4 leading-[1.75] text-text-secondary">
                  {s.decision.map((para) => (
                    <p key={para.slice(0, 32)}>{para}</p>
                  ))}
                </div>
              </div>

              <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
                {s.receipts.map((r) => (
                  <div key={r.label} className="bg-surface p-6">
                    <dt className="font-display text-3xl font-semibold tracking-tight text-accent tabular-nums">
                      {r.value}
                    </dt>
                    <dd className="font-mono-accent mt-2 text-text-secondary">
                      {r.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </RevealOnScroll>
        </SectionContainer>
      ))}

      <SectionContainer className="pt-4">
        <RevealOnScroll>
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-text-primary">
Want one of these?
            </h2>
            <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
              All three were built the same way: something working early, then
              the slower work of making it fast, accessible and safe enough to
              hand to real customers. If you need a site that takes orders, that
              is the work I do.
            </p>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
