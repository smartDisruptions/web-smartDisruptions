import Image from 'next/image';
import type { Metadata } from 'next';
import { SectionContainer, RevealOnScroll } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Websites',
  description:
    'Three live sites, explained in plain language — a mystery game that runs in a browser tab, a launch page for an invented energy drink, and a restaurant ordering demo that takes card payments.',
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
 *
 * READING LEVEL (Josh's call, 2026-08-26): written for a non-technical
 * reader — short bullets under each study, no jargon. The person deciding
 * whether to hire is a business owner, not an engineer. Plain words are a
 * constraint, not a licence to round up: everything stated is still verified.
 */

type Study = {
  eyebrow: string;
  name: string;
  what: string;
  image: string;
  imageAlt: string;
  /** The file's real pixel size. Wrong values here re-introduce the crop. */
  imageWidth: number;
  imageHeight: number;
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
    what: 'A locked-cabinet mystery game, and the page that has to sell it.',
    image: '/images/websites/pembroke-file.png',
    imageAlt:
      'The Pembroke File site — a dark case room lit by a single desk lamp.',
    imageWidth: 1200,
    imageHeight: 630,
    href: 'https://web-pembroke-file.vercel.app',
    hrefLabel: 'The Pembroke File',
    problem:
      'A mystery game with five puzzles, played entirely in your browser tab — nothing to install, no account to make, no loading screen. The whole game is one small file with nothing behind it, so it works with no internet connection and will still work in a decade.',
    decisionLabel: 'What is built into it',
    decision: [
      'The puzzles are little machines, not trick questions. A lamp really swings on its cable, and a sliding-tile puzzle was solved by a program before shipping — so its seventeen-move minimum is a measured fact, not a guess.',
      'Every sound — the drawer, the dial, the flourish when the last lock opens — is made by the game as you play, so there is nothing extra to download.',
      'Anyone can play it. Every puzzle can be solved with just a keyboard, and progress saves itself — a drawer opened tonight is still open tomorrow.',
      'The page selling the game got the same care as the game: the case room drifts as you scroll, dust moves through the lamplight, and the artwork was shrunk from 4.2 MB to 176 KB, so all that atmosphere loads in a blink.',
    ],
    receipts: [
      { value: '0', label: 'Downloads, installs or internet calls' },
      { value: '130 KB', label: 'The entire game — less than one phone photo' },
      { value: '176 KB', label: 'All the artwork, compressed from 4.2 MB' },
    ],
  },
  {
    eyebrow: 'Concept work · live',
    name: 'VOLTIC',
    what: 'A launch page for an energy drink that does not exist.',
    image: '/images/websites/voltic.webp',
    imageAlt:
      'The VOLTIC site — a matte black energy drink can lit cyan and lime, beaded with condensation.',
    imageWidth: 1200,
    imageHeight: 750,
    href: 'https://web-voltic.vercel.app',
    hrefLabel: 'web-voltic.vercel.app',
    problem:
      'A brand page built the way the big product launches are built — a drink can you can spin, layers that drift as you scroll, type the size of the screen. The brand is invented, so nothing here was borrowed: the photos were generated for this build, and the site was designed around them. The can at the centre is not a photo at all — it is a live 3D model, so it looks right from every angle.',
    decisionLabel: 'What is built into it',
    decision: [
      'Scroll, and the can turns a full circle. Or grab it and spin it yourself.',
      'The can is a real 3D model wearing a label typed in the site’s own fonts, with the real nutrition numbers on the back. AI-generated images tend to invent extra logos or garble small print — a model wearing typed text cannot.',
      'The spin slows down as the back of the can comes round, so there is time to read the panel. Then the can fades out and a nutrition card takes its place.',
      'Getting the can to turn took two builds. The first stitched AI-generated video to real photos at each end — it still exists, tucked behind a special web address. Rebuilding the can in 3D went further: now every angle is correct, not just the two the video was pinned to.',
      'Even the condensation is built rather than photographed — tiny glossy droplets on a matte can, because the shine is what makes it look cold.',
      'The page draws from one small file, and the 3D engine downloads quietly afterwards, so nothing slows the first view. An automated accessibility check runs at six points down the page and blocks the release if anything fails.',
    ],
    receipts: [
      { value: '0', label: 'Accessibility problems found by automated checks' },
      { value: '33 KB', label: 'The file that draws the whole page' },
      { value: '360°', label: 'A real 3D can, readable from every angle' },
    ],
  },
  {
    eyebrow: 'Demo build · live',
    name: 'Kitsune Kitchen',
    what: 'A sushi counter that takes orders online — a working demo, not a real restaurant.',
    image: '/images/websites/kitsune-kitchen.webp',
    imageAlt:
      'The Kitsune Kitchen site — "Sliced Fresh Daily" in red over sushi on black, with a fox-mark roundel.',
    imageWidth: 1200,
    imageHeight: 750,
    href: 'https://japanese-sushi-website.vercel.app',
    hrefLabel: 'japanese-sushi-website.vercel.app',
    problem:
      'A complete restaurant ordering system, running as a demo anyone can try. Kitsune Kitchen is invented — the name, the fox logo, the address, the phone number — and the site says so in its own footer. The machinery underneath is real: it is the ordering platform built for a working food business, given a made-up brand so anyone can click through the whole thing without bothering a real kitchen.',
    decisionLabel: 'What is built into it',
    decision: [
      'Pick a category — curry, sushi and bowls, plates, sides — build a cart, leave a name and phone number for pickup, and pay by card without leaving the site.',
      'The menu is not typed into the page. It comes straight from the kitchen’s Square till system, so every price, description and option is whatever the kitchen actually set — a curry listed “from $12.10” really is three proteins at three prices.',
      'Payments are handled by Square, the company behind millions of shop card readers. Your card number goes to them directly and never touches this site.',
      'The same build runs in three modes — pretend payments for testing, Square’s practice mode, or a real business account — without changing a line of code.',
      'There is more behind the menu: catering enquiries, a locations page, a loyalty points programme, a customer feedback form, and a password-protected owner’s area for editing the site and reading what customers sent.',
      'Because it is a demo, it is safe to hand to a stranger: the footer says the restaurant is fictional, the phone number is a 555 number, and the address goes nowhere — nobody orders dinner by mistake.',
    ],
    receipts: [
      { value: '4', label: 'Square systems connected' },
      { value: '0', label: 'Card numbers this site ever sees' },
      { value: 'Fictional', label: 'Restaurant — the footer says so' },
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
            tab. One is a launch page for a drink that does not exist. One is a
            sushi counter that takes orders online. Each is written up below in
            plain language — what it does, and how it works.
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

                {/*
                  Each shot is its own shape (1200×630, 1200×750), so the cell
                  must not stretch: `self-start` keeps the grid from matching
                  the taller text column, and the image renders at its own
                  aspect ratio. It used to be h-full + object-cover, which on a
                  desktop-width screen cropped the sides clean off the VOLTIC
                  hero. A screenshot is evidence — cropping it loses the point.

                  The anchor is a sibling of the text link, never a wrapper
                  around it: an <a> inside an <a> is invalid HTML and broke
                  hydration on /apps once already (web PR #19).
                */}
                <a
                  href={s.href}
                  className="block self-start overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
                >
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    width={s.imageWidth}
                    height={s.imageHeight}
                    className="h-auto w-full"
                  />
                </a>
              </div>

              <div className="mt-12 border-l border-border pl-8 sm:pl-10">
                <p className="font-mono-accent mb-6 text-accent">
                  {s.decisionLabel}
                </p>
                <ul className="max-w-[62ch] list-disc space-y-3 pl-5 leading-[1.75] text-text-secondary marker:text-accent">
                  {s.decision.map((item) => (
                    <li key={item.slice(0, 32)}>{item}</li>
                  ))}
                </ul>
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
              All three were built the same way: get something working early,
              then do the slower work of making it fast, easy for everyone to
              use, and safe enough to hand to real customers. If you need a site
              that takes orders, that is the work I do.
            </p>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
