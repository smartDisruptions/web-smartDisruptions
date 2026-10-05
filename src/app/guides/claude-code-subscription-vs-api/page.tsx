import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import SubscribeForm from '@/components/SubscribeForm';
import LevelRail from '@/components/guide/LevelRail';
import WordCards from '@/components/guide/WordCards';
import BuildDay from '@/components/guide/BuildDay';
import LineSwitch from '@/components/guide/LineSwitch';
import SortGame from '@/components/guide/SortGame';
import MonthCalc from '@/components/guide/MonthCalc';
import {
  DAY,
  DOLLARS_PER_HOUR,
  EXCERPT,
  LEVELS,
  PRICES,
  SORT,
  TITLE,
  WORDS,
} from '@/components/guide/copy';
import './guide.css';

// A field guide, not a post. It has its own route because it is built out of
// things you use (a meter, a switch, a card game, a calculator) rather than
// markdown, and a post body can't hold that many islands.
//
// The page is a level-select map: six levels, a finish line. 岐 (a fork in
// the road) is the page kanji, because the whole guide is about where one
// path splits into two bills. Styles: ./guide.css (gd-*).
//
// Every price on this page is Anthropic's list price as of the publish date.
// If a price changes, change PRICES in copy.ts and the dated note in "The
// fine print"; nothing else hard-codes one.

const SLUG = 'claude-code-subscription-vs-api';
const PATH = `/guides/${SLUG}`;
const PUBLISHED = '2026-10-05';

export const metadata: Metadata = {
  title: `${TITLE} — SmartDisruptions`,
  description: EXCERPT,
  alternates: { canonical: PATH },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: EXCERPT,
    url: PATH,
    publishedTime: PUBLISHED,
    authors: ['Josh Escusa'],
    tags: ['claude code', 'pricing', 'game dev'],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: EXCERPT },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: EXCERPT,
  datePublished: PUBLISHED,
  author: { '@type': 'Person', name: 'Josh Escusa' },
  mainEntityOfPage: `https://smartdisruptions.com${PATH}`,
};

const usd = (n: number) => `$${n}`;
const dayTotal = DAY.reduce((s, t) => s + t.cost, 0);
const monthTotal = Math.round(dayTotal * 20);

function LevelHead({ n, children }: { n: number; children: ReactNode }) {
  const level = LEVELS[n - 1];
  return (
    <header className="gd-level-head">
      <span className="gd-level-badge" aria-hidden>
        <span className="gd-level-badge-k">
          <Kanji char={level.kanji} />
        </span>
        <span className="gd-level-badge-n">LV {n}</span>
      </span>
      <div>
        <p className="sd-kicker">Level {n}</p>
        <h2 id={`${level.id}-h`} className="font-display gd-h2 sd-brush-under">
          {children}
        </h2>
      </div>
    </header>
  );
}

export default function GuidePage() {
  return (
    <div className="gd-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="gd-progress" aria-hidden />
      <LevelRail levels={LEVELS} />

      {/* ── Title screen ─────────────────────────────────────────────── */}
      <header className="gd-hero">
        <Kanji char="岐" className="sd-watermark gd-hero-mark" />
        <div className="gd-wrap gd-hero-grid">
          <div className="gd-hero-copy">
            <p className="sd-kicker">Field guide · Paying for AI</p>
            <h1 className="font-display gd-title">
              Claude Code subscription vs API credits:{' '}
              <span className="gd-title-turn">
                one builds your game, one runs it
              </span>
            </h1>
            <p className="gd-dek font-read">
              Same Claude, two very different bills. Here&rsquo;s which one you
              pay when Claude builds your game, your website or your app, and
              which one starts ticking once people use what you made.
            </p>
            <p className="gd-byline">
              <span>Josh Escusa</span>
              <span aria-hidden>·</span>
              <time dateTime={PUBLISHED}>October 5, 2026</time>
              <span aria-hidden>·</span>
              <span>8 min, plus a mini-game</span>
            </p>
          </div>

          <div className="gd-hero-art" aria-hidden>
            <div className="gd-ticket">
              <span className="gd-ticket-top">Monthly pass</span>
              <span className="gd-ticket-plans">
                <span>
                  <b>{usd(PRICES.pro)}</b> Pro
                </span>
                <span>
                  <b>{usd(PRICES.maxLow)}</b> Max
                </span>
                <span>
                  <b>{usd(PRICES.maxHigh)}</b> Max
                </span>
              </span>
              <span className="gd-ticket-foot">Claude Code included</span>
              <Seal char="作" className="gd-ticket-seal" />
            </div>
            <div className="gd-odo">
              <span className="gd-odo-top">Per-use meter</span>
              <span className="gd-odo-digits">
                <span className="gd-odo-sign">$</span>
                {String(monthTotal)
                  .split('')
                  .map((d, i) => (
                    <span
                      key={i}
                      className="gd-odo-col"
                      style={
                        {
                          '--d': Number(d),
                          '--i': i,
                        } as CSSProperties
                      }
                    >
                      <span className="gd-odo-strip">
                        {'0123456789'.split('').map((n) => (
                          <span key={n}>{n}</span>
                        ))}
                      </span>
                    </span>
                  ))}
              </span>
              <span className="gd-odo-foot">a busy month, paid per use</span>
            </div>
            <Kiru pose="build" className="gd-hero-kiru" />
          </div>
        </div>

        {/* The short version: the whole guide in two lanes. */}
        <div className="gd-wrap">
          <section className="gd-tldr" aria-labelledby="tldr-h">
            <h2 id="tldr-h" className="gd-tldr-h">
              The short version
            </h2>
            <div className="gd-lane" data-tone="plan">
              <Seal char="作" className="gd-lane-seal" />
              <p className="gd-lane-when">
                Claude is helping <em>you</em> make the thing
              </p>
              <p className="gd-lane-then font-display">Your plan pays</p>
              <p className="gd-lane-note">
                {usd(PRICES.pro)} to {usd(PRICES.maxHigh)} a month, flat, up to
                its limits
              </p>
            </div>
            <span className="gd-fork" aria-hidden>
              <Kanji char="岐" />
            </span>
            <div className="gd-lane" data-tone="api">
              <Seal char="遊" className="gd-lane-seal" />
              <p className="gd-lane-when">
                The thing you made needs Claude to work for{' '}
                <em>other people</em>
              </p>
              <p className="gd-lane-then font-display">The API pays</p>
              <p className="gd-lane-note">a small charge every time</p>
            </div>
          </section>

          {/* Level select: a map of the page. Every stop is a link. */}
          <nav className="gd-map" aria-label="Level select">
            <ol>
              {LEVELS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="gd-map-stop">
                    <span className="gd-map-node" aria-hidden>
                      {l.n}
                    </span>
                    <span className="gd-map-label">{l.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href="#finish" className="gd-map-stop" data-goal="true">
                  <span className="gd-map-node" aria-hidden>
                    ★
                  </span>
                  <span className="gd-map-label">Finish</span>
                </a>
              </li>
            </ol>
          </nav>
        </div>
      </header>

      <div className="gd-wrap gd-levels">
        {/* ── Level 1 ─────────────────────────────────────────────────── */}
        <section id="why" className="gd-level" aria-labelledby="why-h">
          <LevelHead n={1}>Why I asked</LevelHead>
          <div className="gd-split">
            <div className="sd-sheet gd-sheet font-read">
              <p>
                When I started building games with Claude, I kept seeing numbers
                like &ldquo;$37 to finish one coding test&rdquo; go by in videos
                and posts.
              </p>
              <p>
                My first thought was: wait. Is that what I&rsquo;m going to pay
                every time Claude writes code for me?
              </p>
              <p>
                It isn&rsquo;t. Working out why turned out to be one of the most
                useful things I&rsquo;ve learned about building on a small
                budget. So let&rsquo;s walk through it together, the way I wish
                someone had walked me through it.
              </p>
            </div>
            <figure className="gd-quote">
              <span className="gd-quote-tag">Something I kept seeing</span>
              <blockquote className="font-display">
                &ldquo;This version of Claude cost <mark>$37</mark> to finish
                one coding test.&rdquo;
              </blockquote>
              <figcaption>
                Real number. Useful number. We&rsquo;ll come back to it in Level
                4, because it belongs to a different bill.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── Level 2 ─────────────────────────────────────────────────── */}
        <section id="pay" className="gd-level" aria-labelledby="pay-h">
          <LevelHead n={2}>Two ways to pay for the same Claude</LevelHead>
          <p className="gd-lede font-read">
            From far away they look alike. Up close, they&rsquo;re built for
            different jobs.
          </p>

          <div className="gd-ways">
            <article className="gd-way" data-tone="plan">
              <p className="gd-way-tag">Way 1</p>
              <h3 className="font-display gd-h3">The monthly plan</h3>
              <ul className="gd-plans" role="list">
                <li>
                  <b className="tabular-nums">{usd(PRICES.pro)}</b>
                  <span>Pro</span>
                </li>
                <li>
                  <b className="tabular-nums">{usd(PRICES.maxLow)}</b>
                  <span>Max</span>
                </li>
                <li>
                  <b className="tabular-nums">{usd(PRICES.maxHigh)}</b>
                  <span>Max, more room</span>
                </li>
              </ul>
              <p className="font-read">
                Claude Code comes included. You pay the same price whether you
                build for one hour this month or forty. Max gives you a lot more
                room than Pro before you reach your limit.
              </p>
              <p className="gd-way-like">
                <span>Feels like</span> a phone plan. One price, up to your
                plan&rsquo;s limit, and then it resets.
              </p>
            </article>

            <article className="gd-way" data-tone="api">
              <p className="gd-way-tag">Way 2</p>
              <h3 className="font-display gd-h3">API credits</h3>
              <ul className="gd-plans" role="list">
                <li>
                  <b className="tabular-nums">{usd(PRICES.apiIn)}</b>
                  <span>per million tokens (chunks of words) Claude reads</span>
                </li>
                <li>
                  <b className="tabular-nums">{usd(PRICES.apiOut)}</b>
                  <span>per million tokens Claude writes</span>
                </li>
              </ul>
              <p className="font-read">
                The API is how an app talks to Claude on its own, with no person
                typing. You pay for what goes in and what comes out. These are
                the prices for Claude Opus 5.5, Anthropic&rsquo;s current Opus
                model.
              </p>
              <p className="gd-way-like">
                <span>Feels like</span> a taxi meter. Every trip costs a little,
                and it all adds up.
              </p>
            </article>
          </div>

          <div className="gd-aside">
            <Kiru pose="read" className="gd-aside-kiru" />
            <p className="font-read">
              Those prices look tiny, and a million tokens is a lot of words.
              But when Claude is building, it rereads your project again and
              again to keep track of what it&rsquo;s doing. So the tokens pile
              up much faster than you&rsquo;d guess.
            </p>
          </div>

          <h3 className="gd-h4">Words you&rsquo;ll see</h3>
          <WordCards words={WORDS} />
        </section>

        {/* ── Level 3 ─────────────────────────────────────────────────── */}
        <section id="day" className="gd-level" aria-labelledby="day-h">
          <LevelHead n={3}>A day of building, on two meters</LevelHead>
          <p className="gd-lede font-read">
            This is where it clicked for me. Picture a normal building day on a
            samurai game, like the ones in <Link href="/games">my arcade</Link>.
            Scroll through it and watch both meters.
          </p>

          <BuildDay tasks={DAY} />

          <div className="gd-result">
            <p className="gd-result-line font-read">
              That&rsquo;s one day: about{' '}
              <strong>${dayTotal.toFixed(0)}</strong> at per-use prices, by my
              rough math. Do that twenty days in a month and the meter reads
              about <strong>${monthTotal}</strong>.
            </p>
            <div
              className="gd-vs"
              aria-label={`$${monthTotal} paid per use, compared with $100 to $200 on a plan`}
            >
              <span className="gd-vs-side" data-tone="api">
                <b className="font-display tabular-nums">${monthTotal}</b>
                <span>paid per use</span>
              </span>
              <span className="gd-vs-mid" aria-hidden>
                vs
              </span>
              <span className="gd-vs-side" data-tone="plan">
                <b className="font-display tabular-nums">
                  ${PRICES.maxLow}–{PRICES.maxHigh}
                </b>
                <span>on a plan</span>
              </span>
            </div>
            <p className="gd-result-line font-read">
              A month that busy is more than Pro is built for, so you&rsquo;d
              probably want Max. Even then, ${PRICES.maxLow} or $
              {PRICES.maxHigh} is a long way from ${monthTotal}. For one person
              building on their own, that gap is a big deal.
            </p>
            <p className="gd-result-line gd-result-catch font-read">
              That $0 has one catch: plans have usage limits. I&rsquo;ll come
              back to that at the end.
            </p>
          </div>
        </section>

        {/* ── Level 4 ─────────────────────────────────────────────────── */}
        <section id="line" className="gd-level" aria-labelledby="line-h">
          <LevelHead n={4}>Where the line is</LevelHead>
          <p className="gd-lede font-read">
            So when does the API come in? Here&rsquo;s the rule I use:
          </p>
          <p className="gd-rule font-display">
            If Claude is helping you <span data-tone="plan">make</span> the
            thing, your plan covers it. If the thing you made needs Claude to{' '}
            <span data-tone="api">work for other people</span>, that&rsquo;s the
            API.
          </p>

          <LineSwitch />

          <div className="gd-split gd-split-even">
            <div className="sd-sheet gd-sheet font-read">
              <h3 className="gd-h4">Why one plan can&rsquo;t run your game</h3>
              <p>
                A personal plan is made for one person at the keyboard. It
                isn&rsquo;t meant to be the engine behind thousands of players.
              </p>
              <p>
                When your app talks to Claude for other people, that runs on the
                API, and you pay for each use. It&rsquo;s the same Claude, doing
                a different job, on a different bill.
              </p>
            </div>
            <div className="sd-sheet gd-sheet gd-callback font-read">
              <p className="gd-callback-tag">Back to that $37</p>
              <p>
                That number is real, and it&rsquo;s useful. It&rsquo;s what that
                test cost at API prices. That makes it a fair way to compare
                versions of Claude, and it&rsquo;s the number that matters once
                your app runs Claude for other people.
              </p>
              <p>
                It belongs to a different bill from the one I get when I sit
                down with Claude Code and say,{' '}
                <q>let&rsquo;s build the combat system today.</q> For that day,
                the extra cost on top of my plan is <strong>$0</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Level 5 ─────────────────────────────────────────────────── */}
        <section id="sort" className="gd-level" aria-labelledby="sort-h">
          <LevelHead n={5}>Your turn: sort these</LevelHead>
          <p className="gd-lede font-read">
            Eight situations. For each one, call which bill it lands on. No
            pressure, and no score that counts. We&rsquo;re learning this
            together.
          </p>

          <SortGame items={SORT} />

          <details className="gd-answers">
            <summary>See all eight answers in one list</summary>
            <table>
              <thead>
                <tr>
                  <th scope="col">What&rsquo;s happening</th>
                  <th scope="col">Which bill</th>
                </tr>
              </thead>
              <tbody>
                {SORT.map((s) => (
                  <tr key={s.text}>
                    <td>{s.text}</td>
                    <td data-tone={s.answer}>
                      {s.answer === 'plan' ? 'Your plan' : 'The API'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        {/* ── Level 6 ─────────────────────────────────────────────────── */}
        <section id="month" className="gd-level" aria-labelledby="month-h">
          <LevelHead n={6}>Your month, roughly</LevelHead>
          <p className="gd-lede font-read">
            Now try it with your own numbers. Slide these to match how you
            build. It&rsquo;s a feel for scale, not a quote.
          </p>

          <MonthCalc
            perHour={DOLLARS_PER_HOUR}
            plans={[
              { label: 'Pro', price: PRICES.pro },
              { label: 'Max', price: PRICES.maxLow },
              { label: 'Max, more room', price: PRICES.maxHigh },
            ]}
          />

          <details className="gd-how font-read">
            <summary>How I got ${DOLLARS_PER_HOUR} an hour</summary>
            <p>
              Each time Claude Code takes a step, it sends Claude everything it
              needs to know about your project again. Most of that is reread
              from a short-term memory called a cache, at $0.20 per million
              tokens. Some of it is new, at ${PRICES.apiIn} per million. What
              Claude writes, including its thinking, is ${PRICES.apiOut} per
              million.
            </p>
            <p>
              Add that up over a steady hour and I land somewhere around $5 to
              $8. I used ${DOLLARS_PER_HOUR}. Small projects cost less. Long
              sessions on big projects cost more. Your hours will look different
              from mine, and that&rsquo;s fine.
            </p>
          </details>
        </section>

        {/* ── Finish ─────────────────────────────────────────────────── */}
        <section id="finish" className="gd-finish" aria-labelledby="finish-h">
          <div className="gd-finish-banner" aria-hidden>
            <span>Stage clear</span>
          </div>
          <h2 id="finish-h" className="font-display gd-h2 sd-brush-under">
            The fine print I keep in mind
          </h2>

          <ul className="gd-fine" role="list">
            <li>
              <h3>Plans have limits</h3>
              <p className="font-read">
                Your plan&rsquo;s usage resets on a schedule. If you hit the
                limit, you wait for the reset or move up a plan. The price
                doesn&rsquo;t jump on you.
              </p>
            </li>
            <li>
              <h3>Going past them is your call</h3>
              <p className="font-read">
                Some plans let you switch on extra usage, billed per use, so you
                can keep going past a limit. It&rsquo;s a setting you choose,
                not a surprise.
              </p>
            </li>
            <li>
              <h3>A plan is for you</h3>
              <p className="font-read">
                Your subscription is for you at the keyboard. When customers
                need Claude inside your product, that&rsquo;s API work.
              </p>
            </li>
            <li>
              <h3>Prices move</h3>
              <p className="font-read">
                Everything here is the price Anthropic posted on October 5,
                2026. When it changes, I&rsquo;ll update this page.
              </p>
            </li>
          </ul>

          <div className="gd-try">
            <Kiru pose="game" className="gd-try-kiru" />
            <div>
              <p className="sd-kicker">Try this today</p>
              <h3 className="font-display gd-h3">Build one tiny game</h3>
              <ol className="gd-try-steps font-read">
                <li>
                  Pick something small. A button that plays a sound and counts
                  how many times you&rsquo;ve pressed it is perfect.
                </li>
                <li>
                  Open Claude Code. It&rsquo;s in the Claude desktop app and on
                  the web at claude.ai/code, and it comes with Pro.
                </li>
                <li>Describe your game in plain words, and let it build.</li>
                <li>
                  Ask for one change. Then another. Notice how it feels when
                  trying again costs nothing extra.
                </li>
              </ol>
            </div>
          </div>

          <div className="sd-sheet gd-sheet gd-close font-read">
            <p>
              We&rsquo;re all figuring this out while the tools keep changing.
              This is where I&rsquo;ve landed for now. If I learn something that
              changes it, I&rsquo;ll update it here.
            </p>
            <p>
              What I&rsquo;d pay attention to, if you&rsquo;re building games,
              websites or apps on your own: how much you get done each month for
              $20, $100 or $200. That matters more than what each token costs.
              That steady, predictable price is a big part of why building on
              your own is getting so interesting right now.
            </p>
            <Kiru pose="bow" className="gd-close-kiru" />
          </div>

          <div className="gd-sub sd-sheet">
            <p className="sd-kicker">Next level</p>
            <p className="font-read">
              I write up what I learn as I build. Want the next one?
            </p>
            <SubscribeForm source="post" className="mt-4" />
          </div>

          <nav className="gd-next" aria-label="Keep going">
            <Link href="/games" className="sd-card gd-next-card">
              <span className="sd-kicker">Play</span>
              <span className="font-display">
                Games I built with Claude Code
              </span>
            </Link>
            <Link href="/content" className="sd-card gd-next-card">
              <span className="sd-kicker">Read</span>
              <span className="font-display">More notes from the build</span>
            </Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
