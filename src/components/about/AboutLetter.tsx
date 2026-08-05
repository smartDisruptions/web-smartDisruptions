/**
 * Template 1 — "The Letter"
 *
 * Pure editorial. One column at reading measure, no cards, no grid. Hierarchy
 * comes from weight and size only, which is what DESIGN.md says holds this
 * brand up now that both faces are sans. The AI disclosure is a bordered aside
 * with an accent rule — the one place the page changes texture.
 */
export default function AboutLetter() {
  return (
    <div className="mx-auto max-w-[62ch] px-6 py-20 sm:py-28">
      <p className="font-mono-accent text-accent">About</p>

      {/* The opener is the h1, but set to read as the letter's first line
          rather than a label above one. Semantically it is still the page
          heading — the page must have exactly one, and this is it. */}
      <h1 className="font-display mt-6 text-3xl leading-[1.15] font-semibold tracking-tight text-text-primary sm:text-4xl">
        I&rsquo;m Josh. My degree is in psychology. I build software for a
        living, and I write down exactly how.
      </h1>

      <div className="mt-10 space-y-6 text-lg leading-[1.75] text-text-secondary">
        <p>
          There&rsquo;s no computer science degree behind any of this. I taught
          myself to build websites in 2008, running SEO for small businesses out
          of Seattle, and I&rsquo;ve been teaching myself the next thing ever
          since. That&rsquo;s the whole method, and it&rsquo;s the reason
          I&rsquo;m worth reading: I&rsquo;ve had to learn all of it the way
          you&rsquo;d have to.
        </p>

        <p>
          By day I&rsquo;m an enterprise developer at a university &mdash;
          twelve years there, which started in design, moved through
          communications, and only became engineering in 2024. Oracle SQL,
          Pro*C, the unglamorous systems that move real money to real students
          without anyone knowing they exist. Last year I replaced an $80k vendor
          product with an app I built in-house. That&rsquo;s where I learned
          that shipping something small that works beats shipping something
          clever that doesn&rsquo;t.
        </p>

        <p>
          The rest of the time I build. Thirty-odd projects in the last year
          &mdash; local business sites, a review-management SaaS, internal
          tools, games I make with my son. I write the part most people leave
          out: the timeline, the method, the mistakes, and the bits worth
          copying.
        </p>

        <p>
          Everything I write about here, I did. The apps are deployed and I use
          them. The security holes I found were real holes in my own work. And
          when a build didn&rsquo;t ship, I say that too &mdash; I built a
          friend&rsquo;s food truck a full ordering system with Square payments,
          then talked him out of launching it, because a menu and a catering
          form were what his business actually needed. Receipts, not claims,
          including the unflattering ones.
        </p>
      </div>

      {/* The disclosure. Given its own texture: an accent rule and a lifted
          surface, so it can't be skimmed past as more body copy. */}
      <aside className="mt-14 border-l-2 border-accent bg-surface py-8 pr-6 pl-6 sm:pl-8">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          About the writing &mdash; and where AI fits
        </h2>

        <p className="mt-4 leading-[1.75] text-text-secondary">
          I want to be upfront, because honesty is kind of the whole point of
          this site:{' '}
          <strong className="font-semibold text-text-primary">
            I use an AI model to help me write these posts.
          </strong>
        </p>

        <p className="mt-4 leading-[1.75] text-text-secondary">
          The experiences are mine. The builds, the decisions, the dead ends,
          the things I got wrong and fixed &mdash; those happened at my
          keyboard, on real projects. AI didn&rsquo;t have them; I did. What it
          helps with is getting them onto the page: drafting, structuring,
          tightening a rambling paragraph into a clear one.
        </p>

        <p className="mt-4 leading-[1.75] text-text-secondary">
          I read and approve every word before it goes live. If a draft says
          something that isn&rsquo;t true, or frames me as something I&rsquo;m
          not, it gets fixed or cut &mdash; I&rsquo;ve done exactly that more
          than once. The receipts are real. The words had help. Both can be true
          at once, and I&rsquo;d rather tell you than have you wonder.
        </p>
      </aside>

      {/* Signature block — the letter's sign-off, and the only photo. */}
      <div className="mt-14 flex items-center gap-4 border-t border-border pt-8">
        <img
          src="/images/josh.webp"
          alt="Josh"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full border border-border object-cover"
        />
        <div className="text-sm">
          <p className="font-semibold text-text-primary">Josh Escusa</p>
          <p className="mt-0.5 text-text-secondary">
            Building in public at{' '}
            <a
              href="https://www.linkedin.com/in/joshescusa"
              className="text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
