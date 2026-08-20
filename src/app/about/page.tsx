import type { Metadata } from 'next';
import Skills from '@/components/about/Skills';

export const metadata: Metadata = {
  title: 'About — SmartDisruptions',
  description:
    'Self-taught developer. Three years of daily work with LLMs, from prompting to agent teams that build, test, and hand me the pull request — and an honest note about where AI fits in the writing.',
};

/**
 * The About page, built as a timeline weighted toward the AI arc.
 *
 * The career years are the setup; the three years with LLMs are the substance,
 * because that is the differentiator and the reason most people land here. The
 * AI-era nodes trace a progression rather than a list — prompting, then agents,
 * then pipelines, then memory, then a team — because "I use AI" says nothing
 * and the progression says everything.
 *
 * The dates are real, taken from Josh's own work history (reconciled against
 * his LinkedIn profile, 2026-08-05). If a claim here changes, that reconciliation
 * is the source — not this file.
 *
 * Chosen from five candidate layouts previewed side by side; the other four
 * (letter, receipts wall, spec sheet, interview) are in git history on
 * design/about-page-templates if one is ever worth revisiting.
 */
const milestones = [
  {
    year: '2008',
    title: 'Taught myself to build, in Seattle',
    body: 'Websites and SEO for small businesses, self-employed, figuring it out as I went. Everything technical I can do today traces back to this — self-taught then, and still the way I pick up anything new.',
  },
  {
    year: '2014',
    title: 'Joined a university — in design, not engineering',
    body: 'Design and content first, then financial aid communications: turning regulations most people find impenetrable into something a student could act on. Unglamorous, and the best writing training I have had.',
  },
  {
    era: 'Three years with LLMs',
    year: '2023',
    title: 'Prompting. Just prompting.',
    body: 'ChatGPT, then Claude, every day — but the shape was a chat window and a lot of copy-paste. I was asking for answers and pasting them somewhere myself. Most people I talk to are still here, and there is nothing wrong with being here. It is just not where it ends.',
  },
  {
    year: '2024',
    title: 'Became an engineer at work — with the tools already in hand',
    body: 'Ten years after walking into the university, I moved into engineering: Oracle SQL, Pro*C, Java, HTML, CSS, Banner, Argos — the systems that quietly move real money to real students.',
  },
  {
    year: '2025',
    title: 'Stopped asking for answers and started handing over the work',
    body: 'The shift from chat to agents: the model reads my actual files, runs the commands, opens the pull request. That changes what you are for. I stopped being the person typing and became the person deciding — the architect, with the agents as implementation leverage.',
  },
  {
    year: 'Early 2026',
    title: 'Built pipelines instead of prompts',
    body: 'Spec, then plan, then build, then QA, then ship — as named steps I invoke, not a conversation I steer. Reviews run as panels: the same work read by a product lens, a design lens, an engineering lens, and I arbitrate where they disagree. One research run put twelve agents on a question in parallel and came back with a cited report.',
  },
  {
    year: 'Mid 2026',
    title: 'Gave it memory — one file, then a whole brain',
    body: 'It started as a single file the agent reads before anything else. It became a linked wiki of every project, decision, and person I build for, plus a graph I can browse from my phone. Now a fresh session already knows who I am. I tested it cold once: six of ten questions right, citing where each answer came from, and the misses were things I had never written down.',
  },
  {
    year: 'Now',
    title: 'Running a team that works while I sleep',
    body: 'Scheduled agents with names and job descriptions: one tidies the knowledge base nightly, one sweeps it weekly for rot, one drafts the day’s writing before I wake up. Each has a trust level, and the ceiling is deliberate — they work in development, they push to a test build, and they hand me a pull request and a preview link. I read it and I decide what goes live. Making that last step automatic would be easy, and I do not want it: the point of the whole setup is that judgment is the part I keep.',
    current: true,
  },
];

export default function AboutPage() {
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

      <p className="mt-8 max-w-[62ch] text-lg leading-[1.75] text-text-secondary">
        I build real things with AI and write about how they actually get made.
        I&rsquo;ve worked with these tools daily for three years, and the
        interesting part isn&rsquo;t that I use them &mdash; everyone uses them.
        In 2023 I was copying answers out of a chat window. Now agents I built
        write code, ship it to a test build, and have a pull request and a
        preview waiting for me when I wake up &mdash; and I am the one who
        decides whether it goes live.
      </p>

      {/* The spine. The border on the list draws it; each node's dot sits on
          top of the line via a negative offset. */}
      <ol className="mt-14 border-l border-border pl-8 sm:pl-10">
        {milestones.map((m) => (
          <li key={m.year} className="relative pb-12 last:pb-0">
            {/* An era label marks where the story changes gear, without
                breaking the single chronological spine. */}
            {m.era && (
              <p className="font-mono-accent mb-6 text-accent">{m.era}</p>
            )}
            <span
              aria-hidden
              className={`absolute -left-[calc(2rem+5px)] block h-2.5 w-2.5 rounded-full sm:-left-[calc(2.5rem+5px)] ${
                m.era ? 'top-12' : 'top-1.5'
              } ${
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

      <Skills />

      {/* The disclosure gets its own frame so it reads as a standing policy
          rather than a life event. */}
      <div className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          One thing about the writing
        </h2>
        <div className="mt-4 space-y-4 leading-[1.75] text-text-secondary">
          <p>
            <strong className="font-semibold text-text-primary">
              I use an AI model to help me write these posts.
            </strong>{' '}
            Given everything above, it would be strange if I didn&rsquo;t
            &mdash; and stranger not to say so. The experiences are mine: the
            builds, the decisions, the dead ends, the things I got wrong and
            fixed happened at my keyboard, on real projects.
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
