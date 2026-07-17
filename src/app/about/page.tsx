import type { Metadata } from 'next';
import { SectionContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About — SmartDisruptions',
  description:
    'Who I am, and an honest note about the writing: the experiences here are real and mine — I use an AI model as an assistant to help put them into words.',
};

// Plain-language about page. Its main job is an honest disclosure: the writing
// gets AI help, but the experiences, judgment, and final say are Josh's.
export default function AboutPage() {
  return (
    <SectionContainer className="py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary">
          About
        </h1>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-text-primary">
          <p>
            I&rsquo;m Josh. I build real things &mdash; websites, apps, small
            tools, automations &mdash; mostly with AI, and I write about how they
            actually get made: the timeline, the method, the mistakes, and the
            parts worth copying.
          </p>

          <p className="text-text-secondary">
            Everything I write about here, I did. The food-truck site is a real
            site for a real friend. The apps are deployed, and I use them. The
            security holes I found were real holes in my own work. When I say I
            shipped something, there&rsquo;s a live link or a screenshot behind
            it &mdash; receipts, not claims.
          </p>

          <div>
            <h2 className="font-display text-xl font-semibold">
              About the writing &mdash; and where AI fits
            </h2>

            <p className="mt-3 text-text-secondary">
              I want to be upfront about something, because honesty is kind of
              the whole point of this site:{' '}
              <strong className="font-semibold text-text-primary">
                I use an AI model to help me write these posts.
              </strong>
            </p>

            <p className="mt-3 text-text-secondary">
              Here&rsquo;s what that means &mdash; and what it doesn&rsquo;t.
            </p>

            <p className="mt-3 text-text-secondary">
              The{' '}
              <strong className="font-semibold text-text-primary">
                experiences are mine.
              </strong>{' '}
              The builds, the decisions, the dead ends, the things I got wrong
              and fixed &mdash; those happened to me, at my keyboard, on real
              projects. AI didn&rsquo;t have them; I did. What AI helps me with is
              getting them onto the page: drafting, structuring, tightening a
              rambling paragraph into a clear one. It&rsquo;s an assistant to the
              writing, not the author of the experience.
            </p>

            <p className="mt-3 text-text-secondary">
              And I read and approve every word before it goes live. If a draft
              says something that isn&rsquo;t true, or frames me as something
              I&rsquo;m not, it gets fixed or cut &mdash; I&rsquo;ve done exactly
              that more than once. The judgment, the facts, and the final yes are
              mine.
            </p>

            <p className="mt-3 text-text-secondary">
              I think that&rsquo;s the honest way to use these tools: let them
              help you say the true thing more clearly, and never let them invent
              a thing that didn&rsquo;t happen. The receipts on this site are
              real. The words had help. Both of those can be true at once, and
              I&rsquo;d rather tell you than have you wonder.
            </p>
          </div>

          <p className="text-text-secondary">
            If you&rsquo;re building with AI too and want to compare notes,
            I&rsquo;m easy to find on{' '}
            <a
              href="https://www.linkedin.com/in/joshescusa"
              className="underline underline-offset-2 hover:text-accent"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
