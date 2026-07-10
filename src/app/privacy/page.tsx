import type { Metadata } from 'next';
import { SectionContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy — SmartDisruptions',
  description:
    'What this site collects (very little), what I do with it (send you new builds if you asked for them), and how to be removed (just ask).',
};

// Plain-language privacy page. Everything stated here must stay TRUE of the
// actual system — if the data handling changes, this page changes with it.
export default function PrivacyPage() {
  return (
    <SectionContainer className="py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary">
          Privacy
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Last updated: July 9, 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-text-primary">
          <p>
            I keep this simple because the site is simple. Here is everything it
            collects and what happens to it.
          </p>

          <div>
            <h2 className="font-display text-xl font-semibold">
              If you subscribe
            </h2>
            <p className="mt-2 text-text-secondary">
              I store the email address you give me, which page you signed up
              from, and when. That&rsquo;s it. I use it for one thing: sending
              you an email when I publish a new build breakdown. I never sell
              it, share it, or use it for anything else.
            </p>
            <p className="mt-2 text-text-secondary">
              Want out? Reply &ldquo;unsubscribe&rdquo; to any email I send, or
              message me on{' '}
              <a
                href="https://www.linkedin.com/in/joshescusa"
                className="underline underline-offset-2 hover:text-accent"
              >
                LinkedIn
              </a>
              , and I&rsquo;ll delete your address. You can also ask me what I
              have stored about you — the honest answer will be &ldquo;your
              email address.&rdquo;
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">
              Spam protection
            </h2>
            <p className="mt-2 text-text-secondary">
              To stop bots from flooding the signup form, the site briefly
              records the network address a signup came from. Those records are
              deleted automatically within about two hours.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">
              Just visiting
            </h2>
            <p className="mt-2 text-text-secondary">
              The site uses Vercel Analytics — aggregate, cookieless page
              counts so I can see which posts people read. It doesn&rsquo;t
              identify you, and there are no ad trackers here. The games and
              apps save progress in your own browser; nothing leaves your
              device.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">
              Where it lives
            </h2>
            <p className="mt-2 text-text-secondary">
              The site runs on Vercel; the subscriber list lives in a locked
              Supabase database that the public site can write to but never
              read from. I wrote up how that works —{' '}
              <a
                href="/content/i-tried-to-break-my-friends-ai-site"
                className="underline underline-offset-2 hover:text-accent"
              >
                security is kind of a thing here
              </a>
              .
            </p>
          </div>

          <p className="text-text-secondary">
            If any of this changes, this page changes first.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
