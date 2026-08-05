import Link from 'next/link';
import { apps } from '@/data/apps';

/**
 * Template 2 — "The Receipts Wall"
 *
 * Asymmetric two-column: a sticky identity rail on the left, evidence on the
 * right. Built on the premise that this site's claim is "receipts, not claims",
 * so the proof should be structural rather than something you reach by reading
 * three paragraphs first.
 *
 * The counts come from the site's own data, not from prose, so the page can't
 * drift out of date the way a hand-typed number does.
 */
const liveApps = apps.filter((a) => a.status === 'live');

const proof = [
  {
    figure: '$80k',
    label: 'vendor product replaced',
    detail:
      'A university system I rebuilt in-house with an AI-native workflow, killing the renewal cost with it.',
  },
  {
    figure: '0',
    label: 'computer science degrees',
    detail:
      'Mine is a BS in psychology. I taught myself to build in 2008 and never stopped.',
  },
  {
    figure: `${liveApps.length}`,
    label: 'apps live on this site',
    detail: 'Deployed, linked, and used — not screenshots of a prototype.',
    href: '/apps',
    cta: 'See them',
  },
  {
    figure: '1',
    label: 'build I talked a client out of',
    detail:
      'I built a friend’s food truck a full Square ordering system, then shipped him a menu and a catering form instead. It was what his business needed.',
    href: '/content/food-truck-site-with-ai',
    cta: 'Read the build',
  },
];

export default function AboutReceipts() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16">
        {/* Identity rail — sticks while the evidence scrolls past it. */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <img
            src="/images/josh.webp"
            alt="Josh"
            width={112}
            height={112}
            className="h-28 w-28 rounded-2xl border border-border object-cover"
          />
          <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-text-primary">
            Josh Escusa
          </h1>
          <p className="mt-2 leading-relaxed text-text-secondary">
            Self-taught developer with a psychology degree. Enterprise developer
            at a university by day, building the rest of the time. Dad, and a
            BJJ coach for about two decades.
          </p>

          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a
              href="https://www.linkedin.com/in/joshescusa"
              className="text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              LinkedIn &rarr;
            </a>
            <Link
              href="/content"
              className="text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              The writing &rarr;
            </Link>
          </div>
        </aside>

        {/* Evidence column */}
        <div>
          <p className="font-mono-accent text-accent">What I actually do</p>

          <p className="font-display mt-5 text-3xl leading-[1.15] font-semibold tracking-tight text-text-primary sm:text-4xl">
            I build real things with AI, and show the whole receipt &mdash;
            timeline, method, mistakes.
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-[1.75] text-text-secondary">
            Everything I write about here, I did. The apps are deployed and I
            use them. The security holes I found were real holes in my own work.
            When I say I shipped something, there&rsquo;s a live link behind it
            &mdash; and when I didn&rsquo;t ship it, I say that instead.
          </p>

          {/* The wall itself. */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {proof.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <p className="font-display text-4xl font-semibold tracking-tight text-accent">
                  {item.figure}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {item.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {item.detail}
                </p>
                {item.href && (
                  <Link
                    href={item.href}
                    className="mt-4 inline-block text-sm font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
                  >
                    {item.cta}
                    {' →'}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Disclosure — sits below the evidence, deliberately. The proof
              earns the right to make the admission, rather than apologising
              for it up front. */}
          <div className="mt-12 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
            <p className="font-mono-accent text-accent">Disclosure</p>
            <h2 className="font-display mt-3 text-2xl font-semibold text-text-primary">
              I use AI to help write these posts
            </h2>

            <div className="mt-4 space-y-4 leading-[1.75] text-text-secondary">
              <p>
                I want to be upfront, because honesty is kind of the whole point
                of this site. The experiences are mine &mdash; the builds, the
                decisions, the dead ends, the things I got wrong and fixed all
                happened at my keyboard, on real projects. What AI helps with is
                getting them onto the page.
              </p>
              <p>
                I read and approve every word before it goes live. If a draft
                says something that isn&rsquo;t true, or frames me as something
                I&rsquo;m not, it gets fixed or cut &mdash; I&rsquo;ve done
                exactly that more than once.{' '}
                <strong className="font-semibold text-text-primary">
                  The receipts are real. The words had help.
                </strong>{' '}
                Both can be true at once, and I&rsquo;d rather tell you than
                have you wonder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
