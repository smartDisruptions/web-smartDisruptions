---
title: I finished my research, then set an AI on it to prove me wrong. It broke seven of my eight claims.
slug: paid-an-ai-to-prove-me-wrong
excerpt: My first research pass produced a confident, well-sourced-looking report. A second pass — agents told to assume every claim was false until a source proved otherwise — corrected seven of eight and withdrew the central argument entirely. Here's the setup, and why the first version looked fine.
category: Working With AI
publishDate: 2026-08-04
tags: [research, verification, ai-workflow]
status: staged
channels: []
heroImage: /images/content/paid-an-ai-to-prove-me-wrong-hero.webp
heroImageAlt: "Two panels: a first research pass that looked sourced, structured and confident, above a second pass that corrected seven of its eight claims and withdrew the central thesis."
ogImage: /images/content/paid-an-ai-to-prove-me-wrong.webp
heroImageLight: /images/content/paid-an-ai-to-prove-me-wrong-hero-light.webp
---
I use AI to research things properly — not "summarize this article", but a real pass: several agents, each with a different angle, pulling sources and writing up what they find.

The output looks great. Headings, figures, citations. It reads like something a person spent a week on.

That's the problem. **I had no way to tell a good report from a confident one.**

So I ran a second pass whose only job was to attack the first.

Of eight claims: **one survived clean, seven needed correcting, and the report's central argument was withdrawn entirely** — it turned out to rest on something no primary source actually said.

Nothing here is about the subject I was researching. It's about the setup, because the setup is the transferable bit.

## First, the failure that taught me the most

Before any of that, the original run failed completely. Every agent came back empty — their tools were broken by something in the environment, not by the research itself.

Here's the part I keep thinking about: **not one of them made anything up.**

They had a topic, they had a role, they had no ability to look anything up. They returned nothing rather than a fluent, plausible summary from memory.

That's the only acceptable failure. A report that says "I found nothing" is recoverable. A report that quietly writes from memory in the same confident house style poisons everything downstream — and you cannot tell by reading it.

That's exactly why the second pass exists. If I can't tell those apart by eye, the reading isn't the check.

## The setup

**Pass one: several perspectives, deliberately opposed.**

Not "research this topic" five times. Five different jobs — someone looking for downside, someone looking for upside, a technical specialist, a buyer, a long-horizon view. They disagree with each other by construction, and the disagreement is where the useful stuff is.

Each ran three rounds, and this is the detail that matters: **each round had to build on what the last round actually found.** Not three variations of the same question — question two written after seeing answer one. That's what makes it research rather than a survey.

**Pass two: assume it's wrong.**

Separate agents, one per claim, with an explicit instruction: *treat this as false until a source proves otherwise.*

Four checks each:

1. Does the cited source actually say this?
2. Is there a primary source, or only commentary?
3. Is it still true today?
4. Does anything credible contradict it?

And the crucial framing: **the first report's figures went in as claims to attack, not as background.** Hand them over as context and the second pass just tidies the first one up. Hand them over as suspects and it can overturn them.

## Where the value actually landed

Not in "true" or "false."

Almost every finding came back **true but wrong in an important way.** The number was real; the thing I thought it meant wasn't.

**One error explains most of it: I trusted a headline instead of its definition.**

A figure I'd repeated as a single committed number turned out to be part commitment, part *option* — a thing that might happen, added to a thing that will, presented as one total. My report said the total. The filing said otherwise.

Another: a very large "annual revenue" figure was an annualization — take current conditions, multiply out a year, print it as though it were contracted. The formally recognized contracted figure was near zero, because that company only counts revenue actually delivered and accepted.

Both numbers were accurately reported. Both meant something different from what I'd written. **The mistake wasn't a bad source — it was reading a headline and not its footnote.**

And the pattern beneath it: I'd been treating *announced* and *operating* as the same word. They are extremely not the same word, and almost every marketing claim lives in that gap.

## The central argument just evaporated

The report was built around a specific future event — a thing I'd said would come due at a particular time.

The fact-checkers went looking and found it in no filing and no statement by anyone who would know. It existed in commentary: analysts referring to each other, each treating it as established because someone else had.

Nobody made it up. It just became true by repetition, and my report tidied it into a fact.

That's the one that changed how I read anything now. **A claim can be everywhere and sourced nowhere.** The check isn't "can I find this" — it's "can I find who *first* knew it."

## Why the first version looked completely fine

This is the part I'd want you to take away.

The first report wasn't sloppy. It had sources. The figures were real, copied correctly. It was well organised and confidently written.

**Every property I'd have used to judge it was present.** Fluency, structure, citations — those are exactly the things a language model is best at producing, whether or not the substance holds.

So they can't be the test. Not because AI is bad at research — mine did genuinely good work — but because the surface of a good report and the surface of a confident one are identical.

The only thing that separated them was a second pass that was *paid to disagree*.

## Try this today

You don't need agents. The shape works with one chat:

1. **Finish your thing.** The report, the plan, the recommendation.
2. **Open a fresh session** — no memory of writing it, so it has nothing to defend.
3. **Paste it in and say:** *"Assume every factual claim here is false until you find a source that proves it. For each one, tell me whether the source actually says it, whether there's a primary source, whether it's current, and what contradicts it."*
4. **Watch specifically for "true but".** That's where mine all were. Not lies — numbers that meant something narrower than I'd written.
5. **Ask of your headline claim: who first knew this?** If the trail is only people citing each other, you don't have a fact yet.

Step 3 matters more than it looks. Ask the session that *wrote* the thing to check it and it will defend its own work, politely and thoroughly.

## What I'd tell myself two years ago

I thought the risk with AI research was obvious nonsense — made-up citations, wrong numbers, the failure everyone warns about.

The real risk is quieter. It's a report that's accurate in every particular and wrong in aggregate, because a headline number got read without its definition and an analyst's guess got repeated until it sounded settled.

You cannot catch that by reading carefully. I read it carefully. **I caught it by building something whose only job was to disagree with me** — and then, importantly, by believing it when it did.
