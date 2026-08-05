/**
 * Template 3 — "The Path"
 *
 * A vertical spine. The argument this layout makes is chronological: I was
 * where you are, here is the order things happened in, here is where it goes
 * next. Best for the reader the site is written for — someone who feels behind
 * and wants to see that the distance was walked, not jumped.
 *
 * The dates are real, taken from Josh's own work history. The eighteen-year
 * span is the point of this template — it is the one layout where the slowness
 * is the argument.
 */
const milestones = [
  {
    year: '2007',
    title: 'Graduated with a psychology degree',
    body: 'Not computer science. I mention it first because it is the part people assume must be missing from a story like this, and it is not — it just never came.',
  },
  {
    year: '2008',
    title: 'Taught myself to build, in Seattle',
    body: 'Websites and SEO for small businesses, self-employed, figuring it out as I went. Everything technical I can do today traces back to this, and none of it came from a classroom.',
  },
  {
    year: '2014',
    title: 'Joined a university — in design, not engineering',
    body: 'Design and content for a student financial-wellness program. I was the person who could make things look right and read clearly, years before I was the person who could make them run.',
  },
  {
    year: '2020',
    title: 'Moved into communications',
    body: 'Financial aid communications — turning regulations most people find impenetrable into something a student could act on. Unglamorous, and the single most useful writing training I have had.',
  },
  {
    year: '2024',
    title: 'Finally became an engineer, on the job',
    body: 'Oracle SQL, Pro*C, Banner, Argos — the systems that move real money to real students. Ten years after I walked in the door. Last year I replaced an $80k vendor product with an app I built in-house.',
  },
  {
    year: '2026',
    title: 'Started teaching it — publicly, with receipts',
    body: 'Founded Smart Disruptions and started writing. Every post is something I actually shipped: the timeline, the method, the mistakes, and the parts worth copying.',
    current: true,
  },
];

export default function AboutPath() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <img
          src="/images/josh.webp"
          alt="Josh"
          width={88}
          height={88}
          className="h-22 w-22 shrink-0 rounded-full border border-border object-cover"
        />
        <div>
          <p className="font-mono-accent text-accent">About</p>
          <h1 className="font-display mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-text-primary sm:text-5xl">
            I&rsquo;m Josh. Here&rsquo;s how I got here.
          </h1>
        </div>
      </header>

      <p className="mt-8 text-lg leading-[1.75] text-text-secondary">
        I build real things with AI &mdash; websites, apps, small tools &mdash;
        and I write about how they actually get made. It took eighteen years and
        a degree in the wrong subject to get here, which is exactly why
        it&rsquo;s worth putting in order. Nobody skipped to the end, least of
        all me.
      </p>

      {/* The spine. The border on the list draws it; each node's dot sits on
          top of the line via a negative offset. */}
      <ol className="mt-14 border-l border-border pl-8 sm:pl-10">
        {milestones.map((m) => (
          <li key={m.year} className="relative pb-12 last:pb-0">
            <span
              aria-hidden
              className={`absolute top-1.5 -left-[calc(2rem+5px)] block h-2.5 w-2.5 rounded-full sm:-left-[calc(2.5rem+5px)] ${
                m.current
                  ? 'bg-accent ring-4 ring-accent/20'
                  : 'bg-border ring-4 ring-background'
              }`}
            />
            <p className="font-mono-accent text-text-secondary">{m.year}</p>
            <h2 className="font-display mt-2 text-xl font-semibold text-text-primary sm:text-2xl">
              {m.title}
            </h2>
            <p className="mt-3 leading-[1.75] text-text-secondary">{m.body}</p>
          </li>
        ))}
      </ol>

      {/* The disclosure is the last node conceptually, but it gets its own
          frame so it reads as a standing policy rather than a life event. */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          One thing about the writing
        </h2>
        <div className="mt-4 space-y-4 leading-[1.75] text-text-secondary">
          <p>
            <strong className="font-semibold text-text-primary">
              I use an AI model to help me write these posts.
            </strong>{' '}
            The experiences are mine &mdash; the builds, the decisions, the dead
            ends, the things I got wrong and fixed happened at my keyboard, on
            real projects. AI helps me get them onto the page.
          </p>
          <p>
            I read and approve every word before it goes live, and I&rsquo;ve
            cut drafts that framed me as something I&rsquo;m not. The receipts
            are real. The words had help. Both can be true at once, and
            I&rsquo;d rather tell you than have you wonder.
          </p>
        </div>
      </div>

      <p className="mt-10 leading-[1.75] text-text-secondary">
        If you&rsquo;re building with AI too and want to compare notes,
        I&rsquo;m easy to find on{' '}
        <a
          href="https://www.linkedin.com/in/joshescusa"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          LinkedIn
        </a>
        .
      </p>
    </div>
  );
}
