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
  EXCERPT,
  LEVELS,
  PRICES,
  RECEIPT,
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
                most games never need the API
              </span>
            </h1>
            <p className="gd-dek font-read">
              Same Claude, two different bills. Your plan pays while Claude
              builds your game, your website or your app. Most of what you make
              never touches the second bill. Here&rsquo;s how to tell if yours
              will.
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
                {String(Math.round(RECEIPT.apiTotal))
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
              <span className="gd-odo-foot">
                one real 4-day build, at API prices
              </span>
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
              <p className="gd-lane-tag">Almost always</p>
              <p className="gd-lane-when">
                Claude helps <em>you</em> build a game, a website or an app
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
              <p className="gd-lane-tag">Only sometimes</p>
              <p className="gd-lane-when">
                The finished thing has <em>Claude inside it</em>, like a
                character that talks back
              </p>
              <p className="gd-lane-then font-display">The API pays</p>
              <p className="gd-lane-note">
                a small charge each time it&rsquo;s used
              </p>
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
                It isn&rsquo;t. And for most of what I build, the API never
                comes into it at all. Working out why turned out to be one of
                the most useful things I&rsquo;ve learned about building on a
                small budget. So let&rsquo;s walk through it together, the way I
                wish someone had walked me through it.
              </p>
            </div>
            <figure className="gd-quote">
              <span className="gd-quote-tag">Something I kept seeing</span>
              <blockquote className="font-display">
                &ldquo;This version of Claude cost <mark>$37</mark>&#32;to
                finish one coding test.&rdquo;
              </blockquote>
              <figcaption>
                Real number. Useful number. We&rsquo;ll come back to it in Level
                5, because it belongs to a different bill.
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
                room than Pro before you reach your limit. I build on the $200
                Max plan.
              </p>
              <p className="gd-way-like">
                <span>Feels like</span>&#32;a phone plan. One price, up to your
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
                typing. You only need it if your finished app has Claude inside
                it. You pay for what goes in and what comes out. These are the
                prices for Claude Opus 5.5, Anthropic&rsquo;s current Opus
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
              up much faster than you&rsquo;d guess. In my real session, that
              rereading was {RECEIPT.rereadShare}% of the cost.
            </p>
          </div>

          <h3 className="gd-h4">Words you&rsquo;ll see</h3>
          <WordCards words={WORDS} />
        </section>

        {/* ── Level 3 ─────────────────────────────────────────────────── */}
        <section id="day" className="gd-level" aria-labelledby="day-h">
          <LevelHead n={3}>Where my $536 actually went</LevelHead>
          <p className="gd-lede font-read">
            This is where it clicked for me. Here&rsquo;s my real session, the
            four days I spent building levels for my rhythm game, split into
            what Claude was actually doing. Scroll through it and watch both
            meters.
          </p>

          <BuildDay tasks={DAY} />

          <div className="gd-result">
            <p className="gd-result-line font-read">
              That&rsquo;s the whole ${dayTotal}, and only about $
              {DAY[DAY.length - 1].cost} of it was Claude writing the code.
              Here&rsquo;s the receipt it came from.
            </p>

            <figure className="gd-receipt">
              <figcaption className="gd-receipt-head">
                <span>My receipt</span>
                <span>{RECEIPT.dates}</span>
              </figcaption>
              <p className="gd-receipt-what">
                {RECEIPT.days} days building the levels for my rhythm game, with{' '}
                {RECEIPT.helpers} helper agents working at once, then a long
                review of my site.
              </p>
              <dl className="gd-receipt-lines">
                {RECEIPT.lines.map((l) => (
                  <div key={l.model}>
                    <dt>{l.model}</dt>
                    <dd className="tabular-nums">${l.cost.toFixed(2)}</dd>
                  </div>
                ))}
                <div className="gd-receipt-total" data-tone="api">
                  <dt>At API prices</dt>
                  <dd className="tabular-nums">
                    ${RECEIPT.apiTotal.toFixed(2)}
                  </dd>
                </div>
                <div className="gd-receipt-total" data-tone="plan">
                  <dt>On my ${PRICES.maxHigh} Max plan</dt>
                  <dd className="tabular-nums">about ${RECEIPT.planCost}</dd>
                </div>
              </dl>
              <p className="gd-receipt-note">
                Claude Code keeps its own count of what a session would cost at
                API prices. The same session used about {RECEIPT.planShare}% of
                my plan&rsquo;s week, which is about ${RECEIPT.planCost} of the
                ${PRICES.maxHigh}. That {RECEIPT.planShare}% is my best reading:
                it also counts my other sessions that week.
              </p>
            </figure>

            <p className="gd-result-big font-display">
              About {RECEIPT.times} times less.
            </p>
            <p className="gd-result-line font-read">
              For one person building on their own, that gap is a big deal.
            </p>
            <p className="gd-result-line gd-result-catch font-read">
              That $0 extra has one catch: plans have usage limits. I&rsquo;ll
              come back to that at the end.
            </p>
          </div>
        </section>

        {/* ── Level 4 ─────────────────────────────────────────────────── */}
        <section id="line" className="gd-level" aria-labelledby="line-h">
          <LevelHead n={5}>Do you ever need the API?</LevelHead>
          <p className="gd-lede font-read">
            For most of what I build, no. Here&rsquo;s the rule I use:
          </p>
          <p className="gd-rule font-display">
            If Claude is helping you <span data-tone="plan">make</span>&#32;the
            thing, your plan covers it. Most games run on their own once
            they&rsquo;re made. You only need the API if you want{' '}
            <span data-tone="api">Claude inside</span> the finished game,
            answering players while they play.
          </p>

          <LineSwitch />

          <div className="gd-cases">
            <div className="gd-case" data-tone="plan">
              <h3 className="gd-case-h">Runs on its own</h3>
              <p className="gd-case-sub">Your plan built it. No API needed.</p>
              <ul className="font-read">
                <li>Platformers, puzzle games, rhythm games, runners</li>
                <li>
                  A game full of story, as long as the lines were written while
                  you built it
                </li>
                <li>Your portfolio, a business site, a menu or booking page</li>
                <li>A habit tracker, a to-do app, a tool for your own work</li>
              </ul>
            </div>
            <div className="gd-case" data-tone="api">
              <h3 className="gd-case-h">Has Claude inside</h3>
              <p className="gd-case-sub">These need the API.</p>
              <ul className="font-read">
                <li>
                  A character who makes up new lines based on what the player
                  types
                </li>
                <li>A helper you can chat with inside your app or website</li>
                <li>
                  An app that writes something new for each person, like a
                  custom study guide
                </li>
                <li>A game master that invents quests while you play</li>
              </ul>
            </div>
          </div>
          <p className="gd-cases-note font-read">
            Almost everything in <Link href="/games">my arcade</Link> is in the
            first column.
          </p>

          <div className="gd-split gd-split-even">
            <div className="sd-sheet gd-sheet font-read">
              <h3 className="gd-h4">If you do put Claude inside</h3>
              <p>
                A personal plan is made for one person at the keyboard. It
                isn&rsquo;t meant to be the engine behind your players.
              </p>
              <p>
                So when your game or app asks Claude something for someone else,
                that goes through the API, and you pay a little for each use. It
                can be a great feature. It&rsquo;s worth choosing on purpose,
                because it&rsquo;s the one part of a project that costs more as
                more people use it.
              </p>
              <p>
                Anthropic&rsquo;s terms draw the same line. They say developers
                may not{' '}
                <q>
                  route requests through Free, Pro, or Max plan credentials on
                  behalf of their users.
                </q>{' '}
                Building something to sell, or a site for a client, on your plan
                is fine. What matters is who is using Claude: you building, or
                your product answering someone else.
              </p>
              <p className="gd-sheet-small">
                I read the terms in October 2026. This isn&rsquo;t legal advice.
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
          <LevelHead n={6}>Your turn: sort these</LevelHead>
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
          <LevelHead n={7}>Your month, with my numbers</LevelHead>
          <p className="gd-lede font-read">
            Now try my real day rates on a month of your own. Set how many
            normal days and big days you&rsquo;d have. It&rsquo;s a feel for
            scale, not a quote.
          </p>

          <MonthCalc
            normalDay={RECEIPT.normalDay}
            bigDay={RECEIPT.bigDay}
            weekAllowance={RECEIPT.weekAllowance}
            plans={[
              { label: 'Pro', price: PRICES.pro },
              { label: 'Max', price: PRICES.maxLow },
              { label: 'Max, more room', price: PRICES.maxHigh },
            ]}
          />

          <details className="gd-how font-read">
            <summary>How I got these numbers</summary>
            <p>
              They all come from the one receipt in Level 3. The big day is
              October 3, when ten helper agents built levels at once: about $
              {RECEIPT.bigDay} at API prices. The other three days shared the
              rest, about ${Math.round(RECEIPT.apiTotal) - RECEIPT.bigDay}, so a
              normal day is about ${RECEIPT.normalDay}.
            </p>
            <p>
              The weekly line works backwards from my plan&rsquo;s usage screen:
              if {RECEIPT.planShare}% of a week was $
              {RECEIPT.apiTotal.toFixed(2)} at API prices, a full week is worth
              about ${RECEIPT.weekAllowance.toLocaleString('en-US')}. That
              reading is rough, because it also counted my other sessions that
              week.
            </p>
            <p>
              This is one person&rsquo;s numbers from one project. A small game
              will cost less. A long session on a big project will cost more.
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
              <h3>Start fresh for each task</h3>
              <p className="font-read">
                {RECEIPT.rereadShare}% of my ${Math.round(RECEIPT.apiTotal)}{' '}
                session was Claude rereading the conversation, about{' '}
                {RECEIPT.rereadPerStep}&#32;tokens every step. A new session for
                each task keeps that small, so you stay further from your
                plan&rsquo;s limits.
              </p>
            </li>
          </ul>
          <p className="gd-fine-date font-read">
            Prices are the ones Anthropic posted on October 5, 2026. When they
            change, I&rsquo;ll update this page.
          </p>

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
