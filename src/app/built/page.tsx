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
    'Websites, apps and games I have built. A chore app for families, a mystery game, a food truck that takes orders online, and a launch page for an energy drink that does not exist. All of it is online and free to try.',
};

/**
 * WHAT I BUILT — the single index for everything shipped.
 *
 * Replaces /websites (four long studies) and /apps (a filtered grid). Josh's
 * call, 2026-09-20: one page, four highlights, then the catalogue, then a door
 * to the Arcade so the games keep their own cabinet.
 *
 * VOICE (Josh's call, 2026-09-20, and it overrides what /websites did):
 * write for the average person. No analogies, no wordplay, no sentence that
 * has to be read twice. Say the thing, in the shortest plain words that are
 * still true. "Less than one phone photo" is out even though it was helpful;
 * "The size of the whole page" is in.
 *
 * TONE, inherited from /websites and unchanged: lead with what the work does,
 * never with what once went wrong. A business owner reads a failure story as
 * risk.
 *
 * FACTS: every claim here was verified against the live deployment when it
 * was first written for /websites, and each of the seven URLs was re-checked
 * (200) on 2026-09-20. This rewrite changes the WORDS ONLY. Nothing was added,
 * and where a detail could not be said plainly it was cut rather than softened
 * — so if a claim below reads as smaller than the old one, that is the point.
 *
 * The catalogue one-liners are written here rather than taken from
 * src/data/apps.ts, whose `description` field is engineer-facing ("Real-time
 * orbital simulation of Earth-Mars Hohmann transfers"). That field still feeds
 * /games, so it is left alone.
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
  /** Its website, or its build write-up. */
  secondary?: { href: string; label: string };
};

const highlights: Highlight[] = [
  {
    eyebrow: 'My own project · online now',
    name: 'Broom & Blade',
    what: 'An app that turns household chores into a game for kids.',
    image: '/images/websites/broom-blade.webp',
    imageAlt:
      'The Broom & Blade website. A candlelit hall under a night sky, with the name of the app in large gold letters.',
    imageWidth: 1200,
    imageHeight: 750,
    body: 'A parent puts the chores on a board. Every chore a child finishes pays out gold and points, and children level up as they go. One code signs the whole family in, so everyone shares the same board. The screenshot shows the website that explains the app.',
    bullets: [
      'The website contains no picture files at all. The sky, the hills, the candles and the smoke are built by the page while it loads, in layers that move separately as you scroll.',
      'To mark a chore finished you press and hold while a ring fills up. That way a chore is never marked done by a stray tap.',
      'The app is free, needs no account, and installs on a phone like any other app.',
    ],
    receipts: [
      {
        value: '81 KB',
        label: 'The size of the whole website, so it opens fast',
      },
      {
        value: '0',
        label: 'Pictures to load. The artwork is part of the page',
      },
      { value: '6', label: 'Layers that move separately as you scroll' },
    ],
    primary: { href: 'https://broom-blade.vercel.app', label: 'Try the app' },
    secondary: {
      href: 'https://web-broom-blade.vercel.app',
      label: 'See the website',
    },
  },
  {
    eyebrow: 'My own project · online now',
    name: 'The Pembroke File',
    what: 'A mystery game you play in a browser tab. Nothing to download.',
    image: '/images/websites/pembroke-file.png',
    imageAlt:
      'The Pembroke File website. A dark office lit by a single desk lamp.',
    imageWidth: 1200,
    imageHeight: 630,
    body: 'You search a locked filing cabinet and solve five puzzles to work out who took a diamond. There is nothing to install and no account to make. The whole game is one file, so once the page has opened it keeps working even if your internet drops.',
    bullets: [
      'The puzzles are things you handle rather than riddles you guess. The desk lamp really swings on its cable when you move it.',
      'One puzzle cannot be solved in fewer than seventeen moves. I had a program work that out before I released the game, so the number is checked, not guessed.',
      'You can play the whole game using only a keyboard, and it remembers where you got to. A drawer you opened tonight is still open tomorrow.',
    ],
    receipts: [
      { value: '0', label: 'Things to download, install or sign up for' },
      { value: '130 KB', label: 'The size of the whole game' },
      {
        value: '176 KB',
        label: 'The size of all the artwork, cut from 4.2 MB',
      },
    ],
    primary: {
      href: 'https://app-field-office.vercel.app',
      label: 'Play the game',
    },
    secondary: {
      href: 'https://web-pembroke-file.vercel.app',
      label: 'See the website',
    },
  },
  {
    eyebrow: 'Made for a client · online now',
    name: 'Samurai Kitchen',
    what: 'A food truck’s website, where customers order and pay online.',
    image: '/images/websites/samurai-kitchen.webp',
    imageAlt:
      'The Samurai Kitchen website, showing catering and online ordering.',
    imageWidth: 1200,
    imageHeight: 750,
    body: 'The old site could not take an order. Every catering request arrived as an email, and nobody could pay online. This one handles the whole order, from picking the food to paying for it.',
    bullets: [
      'Customers choose from the menu, build an order and pay by card without leaving the site. Card details go straight to Square. This site never sees them.',
      'Customers collect points on every order and spend them at the checkout. Catering has its own packages at set prices.',
      'Prices come from the same Square account the kitchen uses at the truck, so an order is always charged what the kitchen set. The owner placed a full order himself before any customer did.',
    ],
    receipts: [
      {
        value: '3',
        label: 'Parts of Square it uses: payments, menu and points',
      },
      { value: '0', label: 'Card numbers this site ever sees' },
      { value: 'Live', label: 'Taking real orders on the truck’s own website' },
    ],
    primary: {
      href: 'https://samuraikitchencatering.com',
      label: 'See the website',
    },
    secondary: { href: '/apps/samurai-kitchen', label: 'How I built it' },
  },
  {
    eyebrow: 'A practice project · online now',
    name: 'VOLTIC',
    what: 'A launch page for an energy drink that does not exist.',
    image: '/images/websites/voltic.webp',
    imageAlt:
      'The VOLTIC website. A black energy drink can lit in blue and green, covered in water droplets.',
    imageWidth: 1200,
    imageHeight: 750,
    body: 'I made the brand up, so nothing on the page belongs to anyone else. The can in the middle is not a photograph. It is a 3D model, which is why it still looks right when you turn it around.',
    bullets: [
      'Scroll down and the can turns all the way round. You can also grab it and spin it yourself.',
      'The label and the nutrition panel on the back are real typed text, not part of a picture. Images made by AI usually get small print wrong. Typed text does not have that problem.',
      'The water droplets on the can are not photographed either. The page builds those too.',
    ],
    receipts: [
      {
        value: '0',
        label: 'Problems found by the automatic accessibility check',
      },
      { value: '33 KB', label: 'The size of the file that draws the page' },
      { value: '360°', label: 'You can look at the can from any angle' },
    ],
    primary: {
      href: 'https://web-voltic.vercel.app',
      label: 'See the website',
    },
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
 * Plain one-liners, keyed by slug, replacing the engineer-facing `description`
 * in src/data/apps.ts. A slug with no line here falls back to the data, which
 * is the safe direction: a new app shows its old wording rather than nothing.
 */
const PLAIN_DESCRIPTIONS: Record<string, string> = {
  'pomodoro-timer':
    'A timer that splits work into short bursts with breaks in between, and keeps a record of what you got done.',
  'spacex-mars':
    'Shows the path a spacecraft takes from Earth to Mars. You can change the settings and watch the trip play out.',
  'ai-diary':
    'A private journal. It tracks your mood over time and has a companion you can talk to about what you wrote.',
  'going-traveling':
    'A twelve-day plan for a trip to Japan. Two versions of each day to choose between, a budget that changes with the size of your group, and an allergy list you set yourself.',
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
      description: PLAIN_DESCRIPTIONS[app.slug] ?? app.description,
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
      'The same ordering system as Samurai Kitchen, set up for a restaurant I made up so that anyone can try it. You can build an order and go through the checkout without buying anything.',
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
            Websites, apps and games. All of it is online right now, and all of
            it is free to try. The four below are the ones I would show you
            first. Everything else is under them.
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

                {/* The detail, on a ruled card. */}
                <div className="nb-index-card mt-10 rotate-[-0.4deg] py-6 pr-5 pl-11 sm:pr-8 sm:pl-14">
                  <p className="font-display text-2xl text-[var(--sd-pen-ink)]">
                    what it does
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
            Smaller projects. All of them are online, and all of them are free
            to try.
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
                        How I built it &rarr;
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

      {/* The games keep their own page. This is the link to it. */}
      <SectionContainer className="pt-6 pb-20">
        <RevealOnScroll>
          <div className="nb-sticky nb-tape mx-auto max-w-lg rotate-[1.4deg] px-7 pt-9 pb-8 text-center">
            <p className="font-display text-4xl leading-tight sm:text-5xl">
              all the games are in one place
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--sd-sticky-ink)]/80">
              Six games. All of them free, and all of them play in your browser.
            </p>
            {/* Drawn on the note, not themed: a sticky is a fixed yellow
                object in both themes, and the themed secondary button flipped
                to near-black ink on yellow in dark mode. */}
            <Link
              href="/games"
              className="nb-wobble font-display mt-6 inline-flex min-h-12 items-center border-2 border-[var(--sd-sticky-ink)] px-7 py-2 text-2xl text-[var(--sd-sticky-ink)] transition-transform hover:-rotate-1 hover:scale-[1.03]"
            >
              Go to the games &rarr;
            </Link>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
