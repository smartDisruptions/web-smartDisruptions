import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import { IconArrowRight } from '@/components/icons';
import Skills from '@/components/about/Skills';
import ThePath, { type Milestone } from '@/components/about/ThePath';
import { shareMeta } from '@/lib/shareCard';
import './about.css';

const TITLE = 'About me — SmartDisruptions';
const DESCRIPTION =
  'Self-taught developer. Three years of daily work with LLMs, from prompting to agent teams that build, test, and hand me the pull request — and an honest note about where AI fits in the writing.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about-me' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/about-me' }),
};

/**
 * About me (/about-me) — "The Path" (道), built as a timeline weighted toward
 * the AI arc. It was /about until October 2026, when /about became the page
 * about the work (the writing, the builds, Market Storm) and this one moved
 * here, the person behind it.
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
 *
 * READING LEVEL (Josh's call, 2026-08-26, same rule as /websites): plain
 * words, short bodies, jargon glossed the first time it appears ("a pull
 * request — a packaged-up change I can review"). The timeline stays — it is
 * already the navigable shape — and a three-stop jump nav covers the rest.
 *
 * SHADOW DOJO (October 2026): the timeline is drawn as a brush path that inks
 * itself as you scroll, with Kiru running it (components/about/ThePath.tsx —
 * CSS scroll timelines and offset-path, no JavaScript). Styles: ./about.css.
 */
const milestones: Milestone[] = [
  {
    year: '2008',
    title: 'Taught myself to build, in Seattle',
    body: 'Websites and search rankings for small businesses, self-employed, figuring it out as I went. Everything technical I do today traces back to this — self-taught then, and still the way I pick up anything new.',
  },
  {
    year: '2014',
    title: 'Joined a university — in design, not engineering',
    body: 'Design and content first, then financial aid communications: turning dense regulations into something a student could actually act on. Unglamorous — and the best writing training I have ever had.',
  },
  {
    era: 'Three years with LLMs',
    year: '2023',
    title: 'Prompting. Just prompting.',
    body: 'ChatGPT, then Claude, every day. The shape was a chat window and a lot of copy-paste: I asked for answers and moved them somewhere myself. That works. It is just not where it ends.',
  },
  {
    year: '2024',
    title: 'Became an engineer at work — with the tools already in hand',
    body: 'Ten years after walking into the university, I moved into engineering: Oracle SQL, Java, Banner — the systems that quietly move real money to real students.',
  },
  {
    year: '2025',
    title: 'Stopped asking for answers and started handing over the work',
    body: 'The shift from chat to agents: the AI reads my actual files, runs the commands, and opens a pull request — a packaged-up change I can review and approve. I stopped being the person typing and became the person deciding.',
  },
  {
    year: 'Early 2026',
    title: 'Built pipelines instead of prompts',
    body: 'Instead of steering one long conversation, I run named steps: spec, plan, build, check, ship. Reviews run as panels — the same work read through a product lens, a design lens and an engineering lens, with me settling the disagreements. One research run put twelve AIs on a single question at once and came back with a cited report.',
  },
  {
    year: 'Mid 2026',
    title: 'Gave it memory — one file, then a whole brain',
    body: 'It started as one file the AI reads before anything else. It grew into a linked wiki of every project, decision and person I build for, plus a map of it I can browse from my phone. Now a fresh session already knows who I am. Tested cold, it answered six of ten questions from the notes alone — and the misses were things I had never written down.',
  },
  {
    year: 'Now',
    title: 'Running a team that works while I sleep',
    body: 'Scheduled AI workers with names and job descriptions: one tidies the knowledge base nightly, one checks it weekly for rot, one drafts the day’s writing before I wake up. None of them can touch the live site — they work on a test copy and hand me the result to approve. Making that last step automatic would be easy, and I do not want it: judgment is the part I keep.',
    current: true,
  },
];

// Three stops, so nobody has to scroll blind to find the part they came for.
// Plain anchor links — no JavaScript.
const STOPS = [
  ['#story', 'My story'],
  ['#skills', 'What I can do'],
  ['#the-writing', 'About the writing'],
] as const;

export default function AboutPage() {
  return (
    <div className="ab-page pb-4">
      <div className="ab-top">
        <header className="ab-hero">
          <Kanji char="道" draw className="sd-watermark ab-hero-mark" />

          <div className="ab-hero-grid">
            <div>
              <p className="sd-kicker">About &middot; The path</p>
              <h1 className="ab-h1 font-display">
                <span className="ab-h1-line">
                  <Slash text="I’m Josh." />
                </span>{' '}
                <span className="ab-h1-line">
                  <Slash text="Here’s how" delay={0.12} />
                </span>{' '}
                <span className="ab-h1-line">
                  <Slash text="I got here." delay={0.24} />
                </span>
              </h1>
            </div>

            {/* A shikishi board: the portrait, 道 brushed beside it, and the
                seal under the brushwork, the way a piece is signed. */}
            <figure className="ab-board">
              <span className="ab-board-disc" aria-hidden />
              <div className="ab-shikishi sd-tilt">
                {/* eslint-disable-next-line @next/next/no-img-element -- a 12 KB pre-sized webp; it is the LCP image, so it loads eagerly at high priority */}
                <img
                  src="/images/josh.webp"
                  alt="Josh Escusa"
                  width={320}
                  height={320}
                  fetchPriority="high"
                  decoding="async"
                  className="ab-photo"
                />
                <div className="ab-brush" aria-hidden>
                  <Kanji char="道" draw className="ab-brush-kanji" />
                  <Seal char="学" className="ab-brush-seal" />
                </div>
                <figcaption className="ab-board-cap">
                  <span>Josh Escusa</span>
                  <span>Self-taught since 2008</span>
                </figcaption>
              </div>
            </figure>
          </div>

          <div className="ab-lead sd-sheet">
            <p className="ab-lead-text font-read">
              I build real things with AI and write about how they actually get
              made. I&rsquo;ve worked with these tools daily for three years,
              and the interesting part isn&rsquo;t that I use them &mdash;
              everyone uses them. In 2023 I was copying answers out of a chat
              window. Now agents I built write code, ship it to a test build,
              and have a pull request and a preview waiting for me when I wake
              up &mdash; and I am the one who decides whether it goes live.
            </p>
            <nav aria-label="On this page" className="ab-toc">
              <p className="sd-kicker">On this page</p>
              <ul role="list">
                {STOPS.map(([href, label], i) => (
                  <li key={href}>
                    <a href={href}>
                      <span className="ab-toc-n" aria-hidden>
                        0{i + 1}
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
      </div>

      <section id="story" className="ab-sec" aria-labelledby="story-title">
        <div className="ab-sec-head">
          <p className="sd-kicker">The path &middot; 2008 to now</p>
          <h2 id="story-title" className="ab-sec-title font-display">
            My story
          </h2>
          <p className="ab-hint">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v16M6 14l6 6 6-6" />
            </svg>
            Scroll, and Kiru runs it with you.
          </p>
        </div>
        <ThePath milestones={milestones} />
      </section>

      <Skills />

      <div className="ab-sec">
        {/* The disclosure is a paper slip pinned to the page, so it reads as a
            standing policy rather than a life event. */}
        {/* id is "the-writing", not "writing" — the Skills list already owns
            #writing (the "Writing in public" row), and a duplicate id would
            send this jump link to the wrong element. */}
        <section
          id="the-writing"
          className="ab-ofuda sd-note sd-reveal"
          aria-labelledby="writing-title"
        >
          <div className="ab-ofuda-head">
            <Seal char="書" className="ab-ofuda-seal" />
            <h2 id="writing-title" className="font-display">
              One thing about the writing
            </h2>
          </div>
          <div className="ab-ofuda-body font-read">
            <p>
              <strong>I use an AI model to help me write these posts.</strong>{' '}
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
        </section>

        <div className="ab-end sd-reveal">
          <p className="ab-end-note font-read">
            If you&rsquo;re building with AI too and want to compare notes,
            I&rsquo;m easy to find on{' '}
            <a
              href="https://www.linkedin.com/in/joshescusa"
              className="ab-link"
            >
              LinkedIn
            </a>
            .
          </p>
          <Link href="/kiru" className="ab-meet sd-card">
            <Kiru pose="wave" />
            <span>
              <span className="ab-meet-k block">The house ninja</span>
              <span className="ab-meet-t block">Meet Kiru</span>
              <span className="ab-meet-s block">
                The ninja who lives on this site
              </span>
            </span>
            <IconArrowRight className="ab-meet-go" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
