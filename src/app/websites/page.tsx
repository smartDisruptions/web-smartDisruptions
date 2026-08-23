import Image from 'next/image';
import type { Metadata } from 'next';
import { SectionContainer, RevealOnScroll } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Websites',
  description:
    'Two sites built end to end, and the decisions behind them — a restaurant taking real orders, and a game that had to sell craft you cannot see.',
};

/**
 * WEBSITES — deliberately not another grid.
 *
 * /apps is a catalogue: eleven things, scannable, categorised. This page is the
 * opposite shape on purpose — two projects, at length, each carrying the one
 * decision that actually mattered. A prospective client reads this; the
 * catalogue is for people already browsing.
 *
 * Every number below was verified against the live site or the build journal
 * before it was written. This page argues for hiring him, so an unchecked claim
 * costs more here than anywhere else on the site.
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
    eyebrow: 'Client work · live',
    name: 'Samurai Kitchen',
    what: 'A food truck and catering business, taking orders online.',
    image: '/images/websites/samurai-kitchen.webp',
    imageAlt: 'The Samurai Kitchen site, catering-first with online ordering.',
    href: 'https://samuraikitchencatering.com',
    hrefLabel: 'samuraikitchencatering.com',
    problem:
      'The old site was a dated WordPress build that could not take an order. Everything ran through phone calls and a contact form, which meant catering enquiries arrived as unstructured email and nothing could be paid for online.',
    decisionLabel: 'The decision that mattered',
    decision: [
      'Before publicising that the site was built with AI, it got a full security pass — thirteen routes read line by line, on the principle that announcing how something was made paints a target on it.',
      'That pass found one genuine money-handling hole: the server trusted the payment amount sent by the browser. It also found an admin area where any signed-in user counted as an administrator.',
      'The payment hole was fixed. The admin hole was not — the feature behind it was deleted instead. It existed only to hold a feedback inbox nobody was reading, so removing it removed the vulnerability rather than guarding it. That is 1,447 fewer lines and one fewer thing to get wrong later.',
      'The same pass turned up a database that had been quietly dead for three months. Nothing the owner used had broken, because the parts he actually needed had never depended on it.',
    ],
    receipts: [
      { value: '1,447', label: 'Lines deleted, not patched' },
      { value: '3 mo', label: 'Backend dead, nothing broke' },
      { value: 'Live', label: 'Ordering, Square payments' },
    ],
  },
  {
    eyebrow: 'Own work · live',
    name: 'The Pembroke File',
    what: 'A locked-cabinet noir mystery, and the site that has to sell it.',
    image: '/images/websites/pembroke-file.png',
    imageAlt: 'The Pembroke File site — a dark case room lit by a single desk lamp.',
    href: 'https://web-pembroke-file.vercel.app',
    hrefLabel: 'The Pembroke File',
    problem:
      'The game is one HTML file with no dependencies and no network calls at all. Its puzzle boards were checked by exhaustive search before shipping, its sound is generated rather than downloaded, and every puzzle can be solved without a mouse. None of that is visible while playing — which is the problem, because invisible craft cannot sell anything.',
    decisionLabel: 'The decision that mattered',
    decision: [
      'Two audiences wanted opposite pages. Someone deciding whether to play needs atmosphere and a promise that the puzzles are fair. Someone deciding whether to hire needs the engineering.',
      'So there are two pages, and the front one never explains a puzzle. Describing how a lock works is proof of design to one reader and a spoiler to the other — the same five drawers are teased on one page and taken apart on the second, which is linked quietly from the footer.',
      'The artwork was generated rather than photographed, which is honest here in a way it would not be for a restaurant: there is no real office and no real diamond for it to misrepresent. It arrived as 4.2 MB and ships at 176 KB, sitting behind dark scrims so the words stay readable.',
    ],
    receipts: [
      { value: '0', label: 'Dependencies, network calls' },
      { value: '130 KB', label: 'The entire game' },
      { value: '176 KB', label: 'Artwork, down from 4.2 MB' },
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
            Two sites, and the decisions behind them
          </h1>
          <p className="mt-8 max-w-[62ch] text-lg leading-[1.75] text-text-secondary">
            Most portfolio pages show you a screenshot and a list of
            technologies. These are the two where something interesting had to
            be decided, so that is what is written down — one restaurant taking
            real orders, and one game whose best work is invisible while you
            play it.
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
              Both of these were built the same way — fast first version, then
              the unglamorous work of making it safe and fast enough to put in
              front of real people. If you run a business that needs a site that
              actually does something, that is the work.
            </p>
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
