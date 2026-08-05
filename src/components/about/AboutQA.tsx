import Link from 'next/link';

/**
 * Template 5 — "The Interview"
 *
 * A split hero, then the body as plain questions with short answers. The
 * reason to shape it this way: the AI disclosure stops being a confession
 * buried in paragraph six and becomes the direct answer to the question a
 * skeptical reader is already holding. Answering it head-on is stronger than
 * volunteering it.
 *
 * Best fit for a stranger arriving cold from LinkedIn.
 */
const qa = [
  {
    q: 'Who are you?',
    a: 'Josh. A self-taught developer with a psychology degree — no CS background, which I lead with because it is the whole point. Enterprise developer at a university by day, twelve years there, on Oracle SQL and Pro*C systems a few thousand people quietly depend on. The rest of the time I build with AI. Dad, and a BJJ coach for about two decades.',
  },
  {
    q: 'What have you actually built?',
    a: 'At work, a replacement for an $80k vendor product, built in-house with an AI-native workflow. On my own: Review Growth System, a review-management SaaS with automated collection and AI-drafted replies; nine apps live on this site; thirty-odd projects in the last year. My son and I make games together, and one of them he built himself.',
    link: { href: '/apps', label: 'See the list' },
  },
  {
    q: 'Anything you built and then threw away?',
    a: 'Yes, and it is the one I would point at first. I built a friend’s food truck a complete online ordering system — menu, cart, checkout, Square payments — and then told him not to launch it. What went live was a menu with photos and a catering form to his inbox, because that was what his business needed. Building it was the cheap part; knowing it was the wrong thing to ship was the actual work.',
    link: { href: '/content/food-truck-site-with-ai', label: 'Read the build' },
  },
  {
    q: 'Do you use AI to write these posts?',
    a: "Yes, and I'd rather say it than have you wonder. The experiences are mine — the builds, the decisions, the dead ends, the things I got wrong and fixed all happened at my keyboard, on real projects. AI didn't have them; I did. What it helps with is getting them onto the page: drafting, structuring, tightening a rambling paragraph into a clear one. I read and approve every word before it goes live, and I've cut drafts that framed me as something I'm not. The receipts are real. The words had help. Both can be true at once.",
    emphasis: true,
  },
  {
    q: 'Who is this site for?',
    a: "Working professionals who want a practical path into building with AI — especially people with real-world experience and no traditional computer science background. That was me, and in most rooms it still is. I teach up to my current level and keep raising the level. No jargon for its own sake, no course-selling, no pretending it's easier than it is.",
  },
  {
    q: 'Why should I believe any of it?',
    a: 'Because every post has a live link or a screenshot behind it. When I break something, I write that too — including the time I found a real security hole in my own work, and the time my dashboard said published while the URL said 404. Receipts, not claims.',
    link: { href: '/content', label: 'Read the writing' },
  },
];

export default function AboutQA() {
  return (
    <div>
      {/* Split hero — photo carries real weight here, which none of the other
          four templates do. It is the one that has to work for a stranger. */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_15%_-20%,rgba(194,65,12,0.07),transparent_60%)]"
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 sm:py-20 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14">
          <img
            src="/images/josh.webp"
            alt="Josh"
            width={240}
            height={240}
            className="h-44 w-44 rounded-2xl border border-border object-cover md:h-60 md:w-60"
          />
          <div>
            <p className="font-mono-accent text-accent">
              Josh · building in public
            </p>
            <h1 className="font-display mt-5 text-4xl leading-[1.06] font-semibold tracking-tight text-text-primary sm:text-5xl">
              Ask me the awkward questions first.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-secondary">
              Self-taught developer, psychology degree, no CS background. I
              build real things with AI and write about how they actually get
              made. Here are the answers to what people usually want to know
              &mdash; including the one about whether AI writes this.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <dl className="divide-y divide-border">
          {qa.map((item) => (
            <div key={item.q} className="py-9 first:pt-0 last:pb-0">
              <dt
                className={`font-display text-xl font-semibold sm:text-2xl ${
                  item.emphasis ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {item.q}
              </dt>
              <dd className="mt-4 leading-[1.8] text-text-secondary">
                {item.a}
                {item.link && (
                  <Link
                    href={item.link.href}
                    className="mt-4 block text-sm font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
                  >
                    {item.link.label}
                    {' →'}
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 border-t border-border pt-8 leading-[1.75] text-text-secondary">
          Anything I didn&rsquo;t answer? I&rsquo;m easy to find on{' '}
          <a
            href="https://www.linkedin.com/in/joshescusa"
            className="text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            LinkedIn
          </a>
          .
        </p>
      </div>
    </div>
  );
}
