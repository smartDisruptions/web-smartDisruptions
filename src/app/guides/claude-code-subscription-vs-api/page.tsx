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
  BILLS,
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
// Written for someone who has never coded or used AI: the word list comes
// before anything uses those words, every number says what it counts, and
// every sum is shown. The page is a level-select map: seven levels and a
// finish line. 岐 (a fork in the road) is the page kanji. Styles:
// ./guide.css (gd-*).
//
// Every price is Anthropic's posted price as of the publish date. If one
// changes, change PRICES in copy.ts and the dated note in the fine print.
//
// JSX drops a leading space after an element or expression in some places
// in this build, so a few spaces are written as &#32; on purpose.

const SLUG = 'claude-code-subscription-vs-api';
const PATH = `/guides/${SLUG}`;
const PUBLISHED = '2026-10-06';

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
const total = Math.round(RECEIPT.apiTotal);
const codeShare = DAY[DAY.length - 1].cost;

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
            <p className="sd-kicker">
              Field guide · Claude Code subscription vs API credits
            </p>
            <h1 className="font-display gd-title">
              Claude Code: monthly plan or pay per use?{' '}
              <span className="gd-title-turn">
                Most games only need the plan
              </span>
            </h1>
            <p className="gd-dek font-read">
              Claude is an AI that can build games, websites and apps for you.
              There are two ways to pay for it: a flat monthly plan, or paying
              each time it&rsquo;s used. Here&rsquo;s which one you need, in
              plain words, with my real numbers.
            </p>
            <p className="gd-byline">
              <span>Josh Escusa</span>
              <span aria-hidden>·</span>
              <time dateTime={PUBLISHED}>October 6, 2026</time>
              <span aria-hidden>·</span>
              <span>10-minute read, plus a mini-game</span>
            </p>
          </div>

          <div className="gd-hero-art" aria-hidden>
            <div className="gd-ticket">
              <span className="gd-ticket-top">Monthly plan</span>
              <span className="gd-ticket-plans">
                <span>
                  <b>{usd(PRICES.pro)}</b> Pro
                </span>
                <span>
                  <b>{usd(PRICES.maxLow)}</b> Max
                </span>
                <span>
                  <b>{usd(PRICES.maxHigh)}</b> Max+
                </span>
              </span>
              <span className="gd-ticket-foot">Claude Code included</span>
              <Seal char="作" className="gd-ticket-seal" />
            </div>
            <div className="gd-odo">
              <span className="gd-odo-top">Pay per use</span>
              <span className="gd-odo-digits">
                <span className="gd-odo-sign">$</span>
                {String(total)
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
                my 4 days of building, if paid per use
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
                Claude helps <em>you</em> build a game, a website or an app.
              </p>
              <p className="gd-lane-then font-display">
                A monthly plan covers it
              </p>
              <p className="gd-lane-note">
                {usd(PRICES.pro)} to {usd(PRICES.maxHigh)}&#32;a month. The
                price stays the same no matter how much you build, up to the
                plan&rsquo;s limit.
              </p>
            </div>
            <span className="gd-fork" aria-hidden>
              <Kanji char="岐" />
            </span>
            <div className="gd-lane" data-tone="api">
              <Seal char="遊" className="gd-lane-seal" />
              <p className="gd-lane-tag">Only sometimes</p>
              <p className="gd-lane-when">
                The finished game or app has <em>Claude inside it</em>, like a
                character that talks back to players.
              </p>
              <p className="gd-lane-then font-display">You pay per use</p>
              <p className="gd-lane-note">
                This is called the API. You pay a small amount every time your
                app uses Claude.
              </p>
            </div>
          </section>

          {/* Level select: a map of the page. Every stop is a link. */}
          <nav className="gd-map" aria-label="Level select">
            <ol>
              <li>
                <a href="#words" className="gd-map-stop">
                  <span className="gd-map-node" aria-hidden>
                    0
                  </span>
                  <span className="gd-map-label">Words you&rsquo;ll see</span>
                </a>
              </li>
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
        {/* ── Words first, so nothing later is a mystery ───────────────── */}
        <section id="words" className="gd-level" aria-labelledby="words-h">
          <header className="gd-level-head">
            <span className="gd-level-badge" aria-hidden>
              <span className="gd-level-badge-k">
                <Kanji char="書" />
              </span>
              <span className="gd-level-badge-n">START</span>
            </span>
            <div>
              <p className="sd-kicker">Before you start</p>
              <h2 id="words-h" className="font-display gd-h2 sd-brush-under">
                Words you&rsquo;ll see
              </h2>
            </div>
          </header>
          <p className="gd-lede font-read">
            You don&rsquo;t need to know anything about coding or AI to read
            this. Here are the words that come up, in plain English. Come back
            here any time one stops making sense.
          </p>
          <WordCards words={WORDS} />
        </section>

        {/* ── Level 1 ─────────────────────────────────────────────────── */}
        <section id="why" className="gd-level" aria-labelledby="why-h">
          <LevelHead n={1}>Why I asked what this costs</LevelHead>
          <div className="gd-split">
            <div className="sd-sheet gd-sheet font-read">
              <p>
                When I started building games with Claude, I kept seeing big
                numbers in videos and posts, like &ldquo;$37 to finish one
                coding test.&rdquo; A coding test is a standard set of coding
                tasks that companies use to compare AI models.
              </p>
              <p>
                My first thought was: wait. Am I going to pay that every time
                Claude writes code for me?
              </p>
              <p>
                No. For most of what I build, I never pay per use at all. I pay
                one flat monthly price. Working out why was one of the most
                useful things I&rsquo;ve learned about building on a small
                budget, so let&rsquo;s walk through it together.
              </p>
            </div>
            <figure className="gd-quote">
              <span className="gd-quote-tag">Something I kept seeing</span>
              <blockquote className="font-display">
                &ldquo;This version of Claude cost <mark>$37</mark>&#32;to
                finish one coding test.&rdquo;
              </blockquote>
              <figcaption>
                That&rsquo;s a real number, and a useful one. It&rsquo;s just
                for a different kind of bill. We&rsquo;ll come back to it in
                Level 5.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── Level 2 ─────────────────────────────────────────────────── */}
        <section id="pay" className="gd-level" aria-labelledby="pay-h">
          <LevelHead n={2}>Two ways to pay for the same Claude</LevelHead>
          <p className="gd-lede font-read">
            Both ways give you the same Claude. They&rsquo;re just built for
            different jobs.
          </p>

          <div className="gd-ways">
            <article className="gd-way" data-tone="plan">
              <p className="gd-way-tag">Way 1</p>
              <h3 className="font-display gd-h3">A monthly plan</h3>
              <ul className="gd-plans" role="list">
                <li>
                  <b className="tabular-nums">{usd(PRICES.pro)}</b>
                  <span>a month for Pro</span>
                </li>
                <li>
                  <b className="tabular-nums">{usd(PRICES.maxLow)}</b>
                  <span>a month for Max</span>
                </li>
                <li>
                  <b className="tabular-nums">{usd(PRICES.maxHigh)}</b>
                  <span>a month for Max with more room</span>
                </li>
              </ul>
              <p className="font-read">
                Claude Code is included in every plan. You pay the same price
                whether you build for one hour this month or forty.
              </p>
              <p className="font-read">
                The bigger plans let you do more before you reach your usage
                limit. I&rsquo;m on the $200 Max plan.
              </p>
              <p className="gd-way-like">
                <span>Feels like</span>&#32;a phone plan. One price each month,
                and if you use it all up, it resets.
              </p>
            </article>

            <article className="gd-way" data-tone="api">
              <p className="gd-way-tag">Way 2</p>
              <h3 className="font-display gd-h3">Paying per use (the API)</h3>
              <ul className="gd-plans gd-plans-rows" role="list">
                <li>
                  <span>Sonnet 5.5, the middle-size Claude I mostly use</span>
                  <b className="tabular-nums">
                    {usd(PRICES.sonnetIn)} to read a million tokens,{' '}
                    {usd(PRICES.sonnetOut)} to write a million
                  </b>
                </li>
                <li>
                  <span>Opus 5.5, the biggest Claude</span>
                  <b className="tabular-nums">
                    {usd(PRICES.apiIn)} to read a million tokens,{' '}
                    {usd(PRICES.apiOut)} to write a million
                  </b>
                </li>
              </ul>
              <p className="font-read">
                This is how a finished app talks to Claude on its own, with no
                person typing. You&rsquo;re charged for everything Claude reads
                and everything it writes. Bigger versions of Claude cost more.
              </p>
              <p className="font-read">
                You only need this if your finished app has Claude inside it.
              </p>
              <p className="gd-way-like">
                <span>Feels like</span>&#32;a taxi meter. Every trip costs a
                little, and it all adds up.
              </p>
            </article>
          </div>

          <div className="gd-aside">
            <Kiru pose="read" className="gd-aside-kiru" />
            <div className="font-read">
              <p>
                A million tokens is about 750,000 words, so those prices sound
                tiny.
              </p>
              <p>
                But while Claude builds, it rereads your whole project and
                conversation again and again to keep track of what it&rsquo;s
                doing. That adds up fast. In my real 4 days of building,
                rereading was {RECEIPT.rereadShare}% of the cost.
              </p>
            </div>
          </div>
        </section>

        {/* ── Level 3 ─────────────────────────────────────────────────── */}
        <section id="day" className="gd-level" aria-labelledby="day-h">
          <LevelHead n={3}>Where my ${total} actually went</LevelHead>
          <div className="gd-lede font-read">
            <p>
              This is where it clicked for me. In October I spent 4 days
              building levels for my rhythm game with Claude Code.
            </p>
            <p>
              Claude Code keeps a running total of what that work would have
              cost if I had paid per use. It came to ${total}. Below, that total
              is split into the four things Claude was actually doing. Scroll
              down and watch both meters.
            </p>
          </div>

          <BuildDay tasks={DAY} />

          <div className="gd-result">
            <p className="gd-result-line font-read">
              That&rsquo;s the whole ${total}. Only about ${codeShare}&#32;of it
              was Claude writing the code. Here&rsquo;s the receipt it came
              from.
            </p>

            <figure className="gd-receipt">
              <figcaption className="gd-receipt-head">
                <span>My receipt</span>
                <span>{RECEIPT.dates}</span>
              </figcaption>
              <p className="gd-receipt-what">
                {RECEIPT.days} days of building levels for my rhythm game. For
                part of it, {RECEIPT.helpers} helper agents (extra copies of
                Claude) worked at the same time. At the end, Claude reviewed my
                website.
              </p>
              <dl className="gd-receipt-lines">
                {RECEIPT.lines.map((l) => (
                  <div key={l.model}>
                    <dt>
                      {l.model}
                      <small>{l.note}</small>
                    </dt>
                    <dd className="tabular-nums">${l.cost.toFixed(2)}</dd>
                  </div>
                ))}
                <div className="gd-receipt-total" data-tone="api">
                  <dt>If I had paid per use</dt>
                  <dd className="tabular-nums">
                    ${RECEIPT.apiTotal.toFixed(2)}
                  </dd>
                </div>
                <div className="gd-receipt-total" data-tone="plan">
                  <dt>What it used of my ${PRICES.maxHigh} plan</dt>
                  <dd className="tabular-nums">about ${RECEIPT.planCost}</dd>
                </div>
              </dl>
              <div className="gd-receipt-note">
                <p>How I got about ${RECEIPT.planCost}:</p>
                <ol>
                  <li>
                    My plan costs ${PRICES.maxHigh}&#32;a month. That&rsquo;s
                    about ${RECEIPT.planWeek} a week.
                  </li>
                  <li>
                    These 4 days used about {RECEIPT.planShare}% of what my plan
                    allows in a week.
                  </li>
                  <li>
                    {RECEIPT.planShare}% of ${RECEIPT.planWeek} is about $
                    {RECEIPT.planCost}.
                  </li>
                </ol>
                <p>
                  I took the {RECEIPT.planShare}% from the usage meter in my
                  Claude settings. It&rsquo;s approximate, because it also
                  includes other work I did that week.
                </p>
              </div>
            </figure>

            <p className="gd-result-big font-display">
              ${total} versus about ${RECEIPT.planCost}.
            </p>
            <p className="gd-result-line font-read">
              Paying per use would have cost about {RECEIPT.times} times more.
              For one person building on their own, that gap is a big deal.
            </p>
            <p className="gd-result-line font-read">
              To be clear about the two numbers: the work cost me nothing on top
              of the $200 I already pay each month. The $7 is just the share of
              that $200 it used up.
            </p>
            <p className="gd-result-line gd-result-catch font-read">
              The catch: plans have usage limits. If you use too much in a week,
              you wait for it to reset. More on that at the end.
            </p>
          </div>
        </section>

        {/* ── Level 4: other people's bills ─────────────────────────────── */}
        <section id="others" className="gd-level" aria-labelledby="others-h">
          <LevelHead n={4}>Other people&rsquo;s bills</LevelHead>
          <div className="gd-lede font-read">
            <p>
              While I was learning this, I found people who had shared what
              building with AI cost them. Sometimes it was hundreds of dollars,
              sometimes thousands.
            </p>
            <p>
              They put their real numbers in public, and that&rsquo;s how the
              rest of us learn. Here are five numbers people have shared, and
              what I took from each one.
            </p>
          </div>

          <ul className="gd-bills" role="list">
            {BILLS.map((b) => (
              <li key={b.url} className="gd-bill">
                <p className="gd-bill-top">
                  <span className="gd-bill-kind">{b.kind}</span>
                  <span className="gd-bill-who">{b.who}</span>
                </p>
                <p className="gd-bill-amount font-display tabular-nums">
                  {b.amount}
                </p>
                <p className="gd-bill-what font-read">{b.what}</p>
                <p className="gd-bill-lesson font-read">
                  <span>What I took from it</span>
                  {b.lesson}
                </p>
                <a
                  className="gd-bill-src"
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source: {b.source}
                </a>
              </li>
            ))}
          </ul>

          <div className="gd-split gd-split-even">
            <div className="sd-sheet gd-sheet font-read">
              <h3 className="gd-h4">Same causes, different bill</h3>
              <p>
                Most of these stories, and my receipt, have the same causes.
                Most of the cost is Claude rereading a long conversation. The
                rest comes from helper agents, from leaving Claude running, and
                from using the biggest version of Claude.
              </p>
              <p>
                The difference is who pays for it. When you pay per use, every
                reread is a charge. On a monthly plan, it comes out of a weekly
                allowance you&rsquo;ve already paid for. My ${total} of work
                used about ${RECEIPT.planCost} of my plan.
              </p>
              <p>
                Paying per use is the right choice for plenty of people, like
                companies and anyone who needs more than a plan allows. Nobody
                here did anything wrong. They shared what they learned, and
                that&rsquo;s how I learned it.
              </p>
            </div>
            <div className="sd-sheet gd-sheet font-read">
              <h3 className="gd-h4">Habits I picked up from them</h3>
              <ul className="gd-habits">
                <li>
                  <strong>Start a new conversation for each job.</strong>
                  &#32;The longer a conversation gets, the more Claude has to
                  reread every step.
                </li>
                <li>
                  <strong>Use helper agents only when they really help.</strong>
                  &#32; My one day with 10 of them cost about ${RECEIPT.bigDay}
                  &#32;of my ${total}.
                </li>
                <li>
                  <strong>
                    Don&rsquo;t leave Claude working when you&rsquo;re not
                    watching.
                  </strong>
                  &#32; Running it around the clock is what weekly limits are
                  for.
                </li>
                <li>
                  <strong>Check which account is paying.</strong>&#32;In Claude
                  Code, type /status and press Enter. It shows whether
                  you&rsquo;re on your plan.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Level 5 ─────────────────────────────────────────────────── */}
        <section id="line" className="gd-level" aria-labelledby="line-h">
          <LevelHead n={5}>Do you ever need to pay per use?</LevelHead>
          <p className="gd-lede font-read">
            For most of what I build, no. Here&rsquo;s the rule I use:
          </p>
          <div className="gd-rules">
            <p className="gd-rule font-display">
              If Claude is helping you <span data-tone="plan">make</span>
              &#32;the thing, your monthly plan covers it.
            </p>
            <p className="gd-rule font-display">
              If the finished thing needs{' '}
              <span data-tone="api">Claude inside it</span>, talking to other
              people, you pay per use.
            </p>
          </div>
          <p className="gd-lede font-read">
            Most games don&rsquo;t need Claude once they&rsquo;re finished. Use
            the two buttons below to see the difference.
          </p>

          <LineSwitch />

          <div className="gd-cases">
            <div className="gd-case" data-tone="plan">
              <h3 className="gd-case-h">Works on its own</h3>
              <p className="gd-case-sub">
                Your plan pays to build it. Nothing to pay per use.
              </p>
              <ul className="font-read">
                <li>Most games: jumping games, puzzles, rhythm games</li>
                <li>
                  A game full of story, as long as the lines were written while
                  you built it
                </li>
                <li>A website about you or your business</li>
                <li>A menu, a booking page, a habit tracker or a to-do list</li>
              </ul>
            </div>
            <div className="gd-case" data-tone="api">
              <h3 className="gd-case-h">Has Claude inside</h3>
              <p className="gd-case-sub">These are paid per use.</p>
              <ul className="font-read">
                <li>
                  A character who makes up new things to say, based on what the
                  player types
                </li>
                <li>A helper you can chat with inside an app or website</li>
                <li>
                  An app that writes something new for each person, like a
                  custom study guide
                </li>
                <li>A storyteller that invents new quests while you play</li>
              </ul>
            </div>
          </div>
          <p className="gd-cases-note font-read">
            Almost every game I&rsquo;ve built is in the &ldquo;Works on its
            own&rdquo; list.
          </p>

          <div className="gd-split gd-split-even">
            <div className="sd-sheet gd-sheet font-read">
              <h3 className="gd-h4">If you do put Claude inside</h3>
              <p>
                A monthly plan is for one person, you, using Claude yourself. It
                isn&rsquo;t meant to power an app that thousands of other people
                use.
              </p>
              <p>
                So when your app asks Claude something for someone else, you pay
                per use. It can be a great feature. Just choose it on purpose,
                because it&rsquo;s the one part of a project that costs more as
                more people use it.
              </p>
              <p>
                Anthropic&rsquo;s rules say the same thing. In their words,
                developers may not{' '}
                <q>
                  route requests through Free, Pro, or Max plan credentials on
                  behalf of their users.
                </q>
              </p>
              <p>
                In plain words: don&rsquo;t let other people use Claude through
                your personal plan, including the free version. Building
                something you sell, or a website for a client, on your plan is
                fine.
              </p>
              <p className="gd-sheet-small">
                I read Anthropic&rsquo;s rules in October 2026. This isn&rsquo;t
                legal advice.
              </p>
            </div>
            <div className="sd-sheet gd-sheet gd-callback font-read">
              <p className="gd-callback-tag">Back to that $37</p>
              <p>
                That number is real, and it&rsquo;s useful. It&rsquo;s what one
                coding test cost when paid per use, so it&rsquo;s a fair way to
                compare versions of Claude.
              </p>
              <p>
                It&rsquo;s also the kind of number that matters once your app
                uses Claude for other people.
              </p>
              <p>
                But it&rsquo;s not my bill when I sit down with Claude Code and
                say, <q>let&rsquo;s build the combat for my game today.</q> That
                day costs me nothing extra on top of my plan.
              </p>
            </div>
          </div>
        </section>

        {/* ── Level 6 ─────────────────────────────────────────────────── */}
        <section id="sort" className="gd-level" aria-labelledby="sort-h">
          <LevelHead n={6}>Your turn: sort these</LevelHead>
          <p className="gd-lede font-read">
            Here are eight situations. For each one, pick who pays: your monthly
            plan, or paying per use (the API). You&rsquo;ll see a score at the
            end, but it&rsquo;s only for you. We&rsquo;re learning this
            together.
          </p>

          <SortGame items={SORT} />

          <details className="gd-answers">
            <summary>See all eight answers in one list</summary>
            <table>
              <thead>
                <tr>
                  <th scope="col">What&rsquo;s happening</th>
                  <th scope="col">Who pays</th>
                </tr>
              </thead>
              <tbody>
                {SORT.map((s) => (
                  <tr key={s.text}>
                    <td>{s.text}</td>
                    <td data-tone={s.answer}>
                      {s.answer === 'plan' ? 'Your plan' : 'Pay per use'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        {/* ── Level 7 ─────────────────────────────────────────────────── */}
        <section id="month" className="gd-level" aria-labelledby="month-h">
          <LevelHead n={7}>Your month, with my numbers</LevelHead>
          <div className="gd-lede font-read">
            <p>
              Now try my real numbers on a month of your own. Move the two
              sliders to pick how many days you&rsquo;d build. Together they go
              up to 30 days, one month.
            </p>
            <p>
              The calculator shows what that month would cost if you paid per
              use, next to the three monthly plan prices. It&rsquo;s a feel for
              the size of things, not a price quote.
            </p>
          </div>

          <MonthCalc
            normalDay={RECEIPT.normalDay}
            bigDay={RECEIPT.bigDay}
            weekAllowance={RECEIPT.weekAllowance}
            plans={[
              { label: 'Pro plan', price: PRICES.pro },
              { label: 'Max plan', price: PRICES.maxLow },
              { label: 'Max plan, more room', price: PRICES.maxHigh },
            ]}
          />

          <details className="gd-how font-read">
            <summary>How I got these numbers</summary>
            <p>
              All of them come from my one receipt in Level 3, which covered 4
              days and ${total}.
            </p>
            <ul>
              <li>
                <strong>A big day costs about ${RECEIPT.bigDay}.</strong>&#32;On
                October 3, 10 helper agents built levels at the same time. That
                one day came to about ${RECEIPT.bigDay} if paid per use.
              </li>
              <li>
                <strong>A normal day costs about ${RECEIPT.normalDay}.</strong>
                &#32; The other 3 days shared the rest: ${total} minus $
                {RECEIPT.bigDay} is ${total - RECEIPT.bigDay}, and $
                {total - RECEIPT.bigDay} split over 3 days is about $
                {RECEIPT.normalDay} a day.
              </li>
              <li>
                <strong>
                  My plan&rsquo;s weekly limit is worth about $
                  {RECEIPT.weekAllowance.toLocaleString('en-US')}.
                </strong>
                &#32; Those 4 days used about {RECEIPT.planShare}% of my weekly
                limit. If {RECEIPT.planShare}% is ${total}, then 100% is about $
                {RECEIPT.weekAllowance.toLocaleString('en-US')}. Because the 15%
                also counts my other work that week, the real weekly limit is
                probably a little higher.
              </li>
            </ul>
            <p>
              These are one person&rsquo;s numbers from one project. A small
              game will cost less. A long project with lots of helpers will cost
              more.
            </p>
          </details>
        </section>

        {/* ── Finish ─────────────────────────────────────────────────── */}
        <section id="finish" className="gd-finish" aria-labelledby="finish-h">
          <div className="gd-finish-banner" aria-hidden>
            <span>Stage clear</span>
          </div>
          <h2 id="finish-h" className="font-display gd-h2 sd-brush-under">
            Good to know before you start
          </h2>

          <ul className="gd-fine" role="list">
            <li>
              <h3>Plans have limits</h3>
              <p className="font-read">
                Your plan&rsquo;s usage resets on a schedule, including a weekly
                limit. If you hit the limit, you wait for it to reset or move to
                a bigger plan. The price never jumps on you.
              </p>
            </li>
            <li>
              <h3>Going past the limit is your choice</h3>
              <p className="font-read">
                Some plans let you turn on extra usage, which charges per use
                once you pass your limit. It&rsquo;s a setting you choose, so it
                won&rsquo;t surprise you.
              </p>
            </li>
            <li>
              <h3>A plan is for you</h3>
              <p className="font-read">
                Your monthly plan is for you, building. If customers need Claude
                inside your app, that part is paid per use.
              </p>
            </li>
            <li>
              <h3>Prices change</h3>
              <p className="font-read">
                Every price here is what Anthropic listed on October 6, 2026.
                When they change, I&rsquo;ll update this page.
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
                  Open Claude Code. It&rsquo;s in the Claude app for your
                  computer, and on the web at claude.ai/code. It comes with the
                  $20 Pro plan.
                </li>
                <li>
                  Describe your game in plain words, the way you&rsquo;d explain
                  it to a friend, and let Claude build it.
                </li>
                <li>
                  Ask for one change. Then another. Notice that trying again
                  doesn&rsquo;t cost anything extra.
                </li>
              </ol>
            </div>
          </div>

          <div className="sd-sheet gd-sheet gd-close font-read">
            <p>
              We&rsquo;re all figuring this out while the tools keep changing.
              This is where I&rsquo;ve landed for now, and I&rsquo;ll update
              this page if I learn something new.
            </p>
            <p>
              If you&rsquo;re building games, websites or apps on your own,
              here&rsquo;s what I&rsquo;d pay attention to: how much you can get
              done each month for $20, $100 or $200. That matters more than the
              price of a single token.
            </p>
            <p>
              That steady, predictable price is a big part of why building on
              your own is getting so exciting right now.
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
