import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { apps, ARCADE_SLUGS } from '@/data/apps';
import {
  SectionContainer,
  Badge,
  Button,
  RevealOnScroll,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'What I built',
  description:
    'Websites, apps and games — all live, all free to try. A chore game and its wizard’s hall, a mystery game in a browser tab, a food truck that takes orders online, and a launch page for a drink that does not exist.',
};

/**
 * WHAT I BUILT — the single index for everything shipped.
 *
 * Replaces /websites (four long studies) and /apps (a filtered grid). Josh's
 * call, 2026-09-20: one page, four highlights, then the catalogue, then a door
 * to the Arcade so the games keep their own cabinet.
 *
 * TONE, inherited from /websites and unchanged: lead with capability, never
 * with defects. Rigour is a property of the work ("card details never touch the
 * site"), not a war story about what was once wrong. A business owner reads a
 * failure story as risk.
 *
 * Every claim below was verified against the live deployment when it was first
 * written, and each of the seven URLs was re-checked (200) on 2026-09-20. The
 * copy is carried over from those verified write-ups and cut to three bullets —
 * cut, not rewritten, because a reworded claim is an unverified one.
 *
 * READING LEVEL: plain language, short bullets. The person deciding whether to
 * hire is a business owner, not an engineer.
 */

type Highlight = {
  eyebrow: string;
  name: string;
  what: string;
  image: string;
  imageAlt: string;
  /** The file's real pixel size. Wrong values here re-introduce the crop. */
  imageWidth: number;
  imageHeight: number;
  body: string;
  bullets: string[];
  receipts: { value: string; label: string }[];
  /** The thing itself — the one a visitor should press first. */
  primary: { href: string; label: string };
  /** Its shop window, or its build write-up. */
  secondary?: { href: string; label: string };
};

const highlights: Highlight[] = [
  {
    eyebrow: 'Own work · live',
    name: 'Broom & Blade',
    what: 'A chore chart that plays like a game — and the page that sells it to a kid.',
    image: '/images/websites/broom-blade.webp',
    imageAlt:
      'The Broom & Blade site — a candlelit guild hall under a starry sky, the title in gold blackletter, a wizard’s opening line beneath it.',
    imageWidth: 1200,
    imageHeight: 750,
    body: 'A wizard tells the story — the dust came, so the chores became quests — and the page plays like the game does: a quest board you can actually seal, gear cards that flip to show their tale, a shelf of relics, a stranger’s box that stays shut. The game behind it turns chores into quests that pay gold and experience, and one household code puts the whole family on the same board.',
    bullets: [
      'The hall is drawn by code, not photographed: a sky of stars, a moon, two ranges of hills, timber beams, candles and drifting embers, each on its own layer, so the whole scene shifts as you scroll or move the mouse.',
      'Sealing a quest takes a real press-and-hold — a ring fills around the stamp — the same rule as the game, so a stray tap never counts.',
      'The whole page is one small file with no pictures in it. It loads in a blink, and the game it points to is the same shape: one file, free, no account, installs on a phone like an app.',
    ],
    receipts: [
      { value: '81 KB', label: 'The entire page — less than one phone photo' },
      {
        value: '0',
        label: 'Pictures on the page — every scene is drawn by code',
      },
      { value: '6', label: 'Layers of the hall that drift as you scroll' },
    ],
    primary: { href: 'https://broom-blade.vercel.app', label: 'Play it' },
    secondary: {
      href: 'https://web-broom-blade.vercel.app',
      label: 'See the site',
    },
  },
  {
    eyebrow: 'Own work · live',
    name: 'The Pembroke File',
    what: 'A locked-cabinet mystery game, and the page that has to sell it.',
    image: '/images/websites/pembroke-file.png',
    imageAlt:
      'The Pembroke File site — a dark case room lit by a single desk lamp.',
    imageWidth: 1200,
    imageHeight: 630,
    body: 'A mystery game with five puzzles, played entirely in your browser tab — nothing to install, no account to make, no loading screen. The whole game is one small file with nothing behind it, so it works with no internet connection and will still work in a decade.',
    bullets: [
      'The puzzles are little machines, not trick questions. A lamp really swings on its cable, and a sliding-tile puzzle was solved by a program before shipping — so its seventeen-move minimum is a measured fact, not a guess.',
      'Anyone can play it. Every puzzle can be solved with just a keyboard, and progress saves itself — a drawer opened tonight is still open tomorrow.',
      'The page selling the game got the same care as the game: the case room drifts as you scroll, dust moves through the lamplight, and the artwork was shrunk from 4.2 MB to 176 KB.',
    ],
    receipts: [
      { value: '0', label: 'Downloads, installs or internet calls' },
      { value: '130 KB', label: 'The entire game — less than one phone photo' },
      { value: '176 KB', label: 'All the artwork, compressed from 4.2 MB' },
    ],
    primary: { href: 'https://app-field-office.vercel.app', label: 'Play it' },
    secondary: {
      href: 'https://web-pembroke-file.vercel.app',
      label: 'See the site',
    },
  },
  {
    eyebrow: 'Client work · live',
    name: 'Samurai Kitchen',
    what: 'A food truck and catering business, taking orders online.',
    image: '/images/websites/samurai-kitchen.webp',
    imageAlt: 'The Samurai Kitchen site, catering-first with online ordering.',
    imageWidth: 1200,
    imageHeight: 750,
    body: 'It replaced a dated site that could not take an order — every catering enquiry arrived as unstructured email and nothing could be paid for online. What went up in its place handles the whole order, end to end.',
    bullets: [
      'Customers browse a menu with dietary tags, build a cart, and pay by card without leaving the site. Card details go straight to Square and never touch the site itself.',
      'A loyalty programme runs underneath — points earned on every order, redeemed at checkout — and catering has its own tiered packages, which is the revenue the old contact form was quietly losing.',
      'Prices are settled against the kitchen’s own live Square catalogue, so an order is always charged what the kitchen actually set. The owner ran a full order through it himself before it went anywhere near a customer.',
    ],
    receipts: [
      { value: '3', label: 'Square systems wired in: payments, menu, loyalty' },
      { value: '0', label: 'Card numbers this site ever sees' },
      { value: 'Live', label: 'Real orders, on the truck’s own domain' },
    ],
    primary: {
      href: 'https://samuraikitchencatering.com',
      label: 'Visit the site',
    },
    secondary: { href: '/apps/samurai-kitchen', label: 'How it was built' },
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
    body: 'A brand page built the way the big product launches are built — a drink can you can spin, layers that drift as you scroll, type the size of the screen. The brand is invented, so nothing here was borrowed: the photos were generated for this build, and the site was designed around them. The can at the centre is not a photo at all — it is a live 3D model, so it looks right from every angle.',
    bullets: [
      'Scroll, and the can turns a full circle. Or grab it and spin it yourself.',
      'The can is a real 3D model wearing a label typed in the site’s own fonts, with the real nutrition numbers on the back. AI-generated images tend to invent extra logos or garble small print — a model wearing typed text cannot.',
      'Even the condensation is built rather than photographed — tiny glossy droplets on a matte can, because the shine is what makes it look cold.',
    ],
    receipts: [
      { value: '0', label: 'Accessibility problems found by automated checks' },
      { value: '33 KB', label: 'The file that draws the whole page' },
      { value: '360°', label: 'A real 3D can, readable from every angle' },
    ],
    primary: { href: 'https://web-voltic.vercel.app', label: 'Visit the site' },
  },
];

/** The highlights above are not repeated in the catalogue below. */
const HIGHLIGHTED_SLUGS = ['broom-blade', 'field-office', 'samurai-kitchen'];

type CatalogueEntry = {
  key: string;
  name: string;
  description: string;
  thumbnail: string;
  liveUrl?: string;
  /** Present when the project has an /apps/[slug] write-up. */
  detailHref?: string;
  status: string;
  tech: string[];
};

/**
 * The catalogue is what is left once the highlights have been shown and the
 * games have their own cabinet — the same rule /apps used. Kitsune Kitchen is
 * appended by hand because it is a site, not an app, and has never had an entry
 * in the apps data; without this line it would vanish with /websites.
 */
const catalogue: CatalogueEntry[] = [
  ...apps
    .filter(
      (app) =>
        !ARCADE_SLUGS.includes(app.slug) &&
        !HIGHLIGHTED_SLUGS.includes(app.slug)
    )
    .map((app) => ({
      key: app.slug,
      name: app.name,
      description: app.description,
      thumbnail: app.thumbnailUrl,
      liveUrl: app.liveUrl,
      detailHref: `/apps/${app.slug}`,
      status: app.status,
      tech: app.techStack.slice(0, 3),
    })),
  {
    key: 'kitsune-kitchen',
    name: 'Kitsune Kitchen',
    description:
      'The whole restaurant ordering system as a demo anyone can click through — invented restaurant, real machinery, card payments in a practice mode.',
    thumbnail: '/images/websites/kitsune-kitchen.webp',
    liveUrl: 'https://japanese-sushi-website.vercel.app',
    status: 'live',
    tech: ['Next.js', 'Square API', 'Demo build'],
  },
];

export default function BuiltPage() {
  return (
    <>
      <SectionContainer className="pt-10 pb-2 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-[3.2rem] leading-[0.95] text-text-primary sm:text-7xl">
            what I built
          </h1>
          <p className="font-read mt-6 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
            Websites, apps and games — all live, all free to try. Four I&apos;d
            show you first, then everything else.
          </p>
        </div>
      </SectionContainer>

      {highlights.map((h, i) => {
        // Alternating sides, and the tilt alternates with them, so four
        // highlights in a row read as a scrapbook rather than a spreadsheet.
        const flip = i % 2 === 1;
        return (
          <SectionContainer key={h.name} className="py-8 sm:py-10">
            <RevealOnScroll>
              <article className="mx-auto max-w-5xl">
                <div
                  className={`grid items-start gap-10 lg:grid-cols-2 lg:gap-14 ${
                    flip ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  {/* The print. Each shot has its own shape (1200×630, 1200×750),
                      so it renders at its own aspect ratio — a screenshot is
                      evidence, and cropping it loses the point. */}
                  <a
                    href={h.primary.href}
                    className={`nb-polaroid nb-tape block self-start p-2.5 pb-3 transition-transform hover:rotate-0 ${
                      flip ? 'rotate-[1.2deg]' : 'rotate-[-1.2deg]'
                    }`}
                  >
                    <Image
                      src={h.image}
                      alt={h.imageAlt}
                      width={h.imageWidth}
                      height={h.imageHeight}
                      className="h-auto w-full"
                    />
                  </a>

                  <div>
                    <p className="font-mono-accent text-text-secondary">
                      {h.eyebrow}
                    </p>
                    <h2 className="font-display nb-underline mt-1 text-4xl text-text-primary sm:text-5xl">
                      {h.name}
                    </h2>
                    <p className="font-read mt-6 text-lg leading-[1.7] text-text-primary">
                      {h.what}
                    </p>
                    <p className="font-read mt-4 max-w-[58ch] leading-[1.75] text-text-secondary">
                      {h.body}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <Button href={h.primary.href}>{h.primary.label}</Button>
                      {h.secondary && (
                        <Button variant="secondary" href={h.secondary.href}>
                          {h.secondary.label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* What is built into it — on a ruled card, so the detail reads
                    as notes taken beside the work rather than more page. */}
                <div className="nb-index-card mt-10 rotate-[-0.4deg] py-6 pr-5 pl-11 sm:pr-8 sm:pl-14">
                  <p className="font-display text-2xl text-[var(--sd-pen-ink)]">
                    what&apos;s built into it
                  </p>
                  <ul className="mt-3 max-w-[62ch] list-disc space-y-2.5 pl-5 leading-[1.7] text-text-secondary marker:text-[var(--sd-pen)]">
                    {h.bullets.map((b) => (
                      <li key={b.slice(0, 32)}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* The receipts, as a torn-off stub: figures in pen, labels small. */}
                <dl className="mt-8 grid gap-6 border-t-2 border-dashed border-border pt-6 sm:grid-cols-3">
                  {h.receipts.map((r) => (
                    <div key={r.label}>
                      <dt className="font-display text-4xl text-accent tabular-nums">
                        {r.value}
                      </dt>
                      <dd className="mt-1 text-sm leading-snug text-text-secondary">
                        {r.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </RevealOnScroll>
          </SectionContainer>
        );
      })}

      <SectionContainer className="pt-10">
        <RevealOnScroll>
          <h2 className="font-display nb-underline text-4xl text-text-primary sm:text-5xl">
            everything else
          </h2>
          <p className="font-read mt-5 max-w-[52ch] leading-[1.75] text-text-secondary">
            Smaller things, all live and free to open.
          </p>
        </RevealOnScroll>

        <ul
          className="nb-wall mt-10 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-12"
          role="list"
        >
          {catalogue.map((item) => (
            <li key={item.key} className="h-full">
              <RevealOnScroll className="h-full">
                {/* The detail link is stretched across the whole print, so the
                    live link stays a real sibling anchor — an <a> inside an <a>
                    is invalid HTML and broke hydration on /apps once already. */}
                <div className="nb-polaroid nb-tape flex h-full flex-col p-2.5 pb-4">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={item.thumbnail}
                    alt={`${item.name} screenshot`}
                    className="aspect-[4/3] w-full object-cover object-top"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <h3 className="font-display text-2xl leading-none text-text-primary">
                      {item.name}
                    </h3>
                    <Badge
                      variant={item.status === 'live' ? 'accent' : 'secondary'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tech.map((t) => (
                      <Badge key={t} variant="default">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="font-display mt-4 flex items-center gap-5 text-xl">
                    {item.detailHref && (
                      <Link
                        href={item.detailHref}
                        className="text-accent after:absolute after:inset-0 after:content-['']"
                      >
                        How it was built &rarr;
                      </Link>
                    )}
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative text-text-secondary transition-colors hover:text-accent"
                      >
                        Try it &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            </li>
          ))}
        </ul>
      </SectionContainer>

      {/* The Arcade keeps its own cabinet — this is the door to it. */}
      <SectionContainer className="pt-6 pb-20">
        <RevealOnScroll>
          <div className="nb-sticky nb-tape mx-auto max-w-lg rotate-[1.4deg] px-7 pt-9 pb-8 text-center">
            <p className="font-display text-4xl leading-tight sm:text-5xl">
              the games live in the arcade
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--sd-sticky-ink)]/80">
              Six of them, in a cabinet of their own. Insert coin.
            </p>
            {/* Drawn on the note, not themed: a sticky is a fixed yellow
                object in both themes, and the themed secondary button flipped
                to near-black ink on yellow in dark mode. */}
            <Link
              href="/games"
              className="nb-wobble font-display mt-6 inline-flex min-h-12 items-center border-2 border-[var(--sd-sticky-ink)] px-7 py-2 text-2xl text-[var(--sd-sticky-ink)] transition-transform hover:-rotate-1 hover:scale-[1.03]"
            >
              Open the arcade &rarr;
            </Link>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
