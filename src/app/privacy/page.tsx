import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import './privacy.css';

export const metadata: Metadata = {
  title: 'Privacy — SmartDisruptions',
  description:
    'What this site collects (very little), what I do with it (send you new builds if you asked for them), and how to be removed (just ask).',
};

// Plain-language privacy page. Everything stated here must stay TRUE of the
// actual system — if the data handling changes, this page changes with it.
//
// Shadow Dojo: 秘 ("secret") is the page kanji, Kiru keeps it with a finger to
// his lips, and the policy sits on a sheet in the reading face. Styles:
// ./privacy.css (pv-*).

/** Line icons for the four section heads — same 24px grid as the site's set. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="pv-ico" aria-hidden>
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {children}
      </svg>
    </span>
  );
}

const MAIL = (
  <>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  </>
);
const SHIELD = (
  <>
    <path d="M12 3.5 19 6v5.2c0 4.3-2.9 7.6-7 9.3-4.1-1.7-7-5-7-9.3V6z" />
    <path d="m9 12 2.2 2.2L15.2 10" />
  </>
);
const STEPS = (
  <>
    <ellipse cx="8.2" cy="7.4" rx="2.5" ry="3.5" />
    <circle cx="8.6" cy="13.7" r="1.7" />
    <ellipse cx="15.8" cy="10.6" rx="2.5" ry="3.5" />
    <circle cx="15.4" cy="16.9" r="1.7" />
  </>
);
const SERVER = (
  <>
    <rect x="4" y="4" width="16" height="6.5" rx="2" />
    <rect x="4" y="13.5" width="16" height="6.5" rx="2" />
    <path d="M7.5 7.25h.01M7.5 16.75h.01M11 7.25h5M11 16.75h5" />
  </>
);

export default function PrivacyPage() {
  return (
    <div className="pv-page pb-6">
      <div className="pv-top">
        <header className="pv-hero">
          <Kanji char="秘" className="sd-watermark pv-mark" />
          <div className="relative">
            <p className="sd-kicker">What the site keeps</p>
            <div className="pv-title-row">
              <Kanji char="秘" draw className="pv-kanji" />
              <h1 className="pv-h1 font-display">Privacy</h1>
            </div>
            <p className="pv-updated">Last updated: July 9, 2026</p>
          </div>
          <div className="pv-ninja">
            <Kiru pose="shh" />
          </div>
        </header>
      </div>

      <article className="pv-sheet sd-sheet font-read">
        <p className="pv-intro">
          I keep this simple because the site is simple. Here is everything it
          collects and what happens to it.
        </p>

        <section className="pv-sec" aria-labelledby="pv-subscribe">
          <div className="pv-sec-head">
            <Icon>{MAIL}</Icon>
            <h2 id="pv-subscribe" className="font-display">
              If you subscribe
            </h2>
          </div>
          <div className="pv-sec-body">
            <p>
              I store the email address you give me, which page you signed up
              from, and when. That&rsquo;s it. I use it for one thing: sending
              you an email when I publish a new build breakdown. I never sell
              it, share it, or use it for anything else.
            </p>
            <p>
              Want out? Reply &ldquo;unsubscribe&rdquo; to any email I send, or
              message me on{' '}
              <a href="https://www.linkedin.com/in/joshescusa">LinkedIn</a>, and
              I&rsquo;ll delete your address. You can also ask me what I have
              stored about you — the honest answer will be &ldquo;your email
              address.&rdquo;
            </p>
          </div>
        </section>

        <section className="pv-sec" aria-labelledby="pv-spam">
          <div className="pv-sec-head">
            <Icon>{SHIELD}</Icon>
            <h2 id="pv-spam" className="font-display">
              Spam protection
            </h2>
          </div>
          <div className="pv-sec-body">
            <p>
              To stop bots from flooding the signup form, the site briefly
              records the network address a signup came from. Those records are
              deleted automatically within about two hours.
            </p>
          </div>
        </section>

        <section className="pv-sec" aria-labelledby="pv-visiting">
          <div className="pv-sec-head">
            <Icon>{STEPS}</Icon>
            <h2 id="pv-visiting" className="font-display">
              Just visiting
            </h2>
          </div>
          <div className="pv-sec-body">
            <p>
              The site uses Vercel Analytics — aggregate, cookieless page counts
              so I can see which posts people read. It doesn&rsquo;t identify
              you, and there are no ad trackers here. The games and apps save
              progress in your own browser; nothing leaves your device.
            </p>
          </div>
        </section>

        <section className="pv-sec" aria-labelledby="pv-where">
          <div className="pv-sec-head">
            <Icon>{SERVER}</Icon>
            <h2 id="pv-where" className="font-display">
              Where it lives
            </h2>
          </div>
          <div className="pv-sec-body">
            <p>
              The site runs on Vercel; the subscriber list lives in a locked
              Supabase database that the public site can write to but never read
              from. I wrote up how that works —{' '}
              <Link href="/content/i-tried-to-break-my-friends-ai-site">
                security is kind of a thing here
              </Link>
              .
            </p>
          </div>
        </section>

        <div className="pv-sign">
          <p>If any of this changes, this page changes first.</p>
          <Seal char="秘" className="pv-seal" />
        </div>
      </article>
    </div>
  );
}
