import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import SubscribeForm from '@/components/SubscribeForm';
import './learn.css';

export const metadata: Metadata = {
  title: 'Learn to build, together — SmartDisruptions',
  description:
    'Learn how to build websites, apps and games with AI, in plain words. No hype. Just learning together.',
  alternates: { canonical: '/learn' },
};

// /learn — the email splash. 学 ("learn") is the page kanji and Kiru waves you
// in. One job: the form. Everything under it only answers "what am I signing
// up for", and every promise here must stay true of what the list actually
// sends (see /privacy). Styles: ./learn.css (ln-*).

const GETS = [
  {
    title: 'Plain words',
    body: "Written so you don't need any coding or AI experience. Every new word is explained the first time it shows up.",
  },
  {
    title: 'Real numbers',
    body: 'What I built, what it cost and what went wrong, measured rather than guessed.',
  },
  {
    title: 'One email per new guide',
    body: 'You hear from me when I publish something new. Nothing else, and you can leave any time.',
  },
];

export default function LearnPage() {
  return (
    <div className="ln-page">
      <section className="ln-hero" aria-labelledby="ln-title">
        <Kanji char="学" draw className="sd-watermark ln-mark" />
        <div className="ln-kiru">
          <Kiru pose="wave" />
        </div>
        <p className="sd-kicker">Learn together</p>
        <h1 id="ln-title" className="ln-h1 font-display">
          Let&rsquo;s learn to build websites, apps and games.
        </h1>
        <p className="ln-calm font-display">
          No hype. <span>Just learning together.</span>
        </p>
        <p className="ln-lede font-read">
          I build with Claude and write down what I learn as I go, in plain
          words. Leave your email and each new guide comes to you.
        </p>
        <SubscribeForm source="site" cta="Learn with me" className="ln-form" />
      </section>

      <section className="ln-gets" aria-label="What you get">
        <ol className="ln-list">
          {GETS.map((g) => (
            <li key={g.title} className="ln-item">
              <h2 className="font-display">{g.title}</h2>
              <p className="font-read">{g.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <nav className="ln-start" aria-label="Start here">
        <p className="sd-kicker">Or start reading now</p>
        <Link
          href="/guides/claude-code-subscription-vs-api"
          className="sd-card ln-card"
        >
          <span className="ln-card-tag">Field guide</span>
          <span className="font-display ln-card-title">
            Claude Code: monthly plan or pay per use?
          </span>
          <span className="ln-card-go" aria-hidden>
            Read it &rarr;
          </span>
        </Link>
      </nav>
    </div>
  );
}
