---
title: My publish button worked on day one. Teaching the robot to press it took six failures.
slug: five-of-six-failures-said-success
excerpt: I automated publishing my own articles. The code was written and tested in an afternoon. Getting it to actually work took a full day and six separate failures — five of which reported success. That last part is the whole lesson.
category: Working With AI
publishDate: 2026-08-03
tags: [automation, ci, verification, shipping]
status: staged
channels: []
heroImage: /images/content/five-of-six-failures-said-success-hero.webp
heroImageAlt: "A card contrasting what the scheduled job reported — nothing due, done, success — with what was actually true: an article stranded and going nowhere."
ogImage: /images/content/five-of-six-failures-said-success.webp
---
I wanted to schedule articles. Pick a time, walk away, have it go out without me.

The code took an afternoon. It was tested. I was pleased with it.

It then failed six separate times over the following day, and **five of those failures reported success.** Green checkmarks over a job that had achieved nothing.

That's the part worth your time. Not the automation — the specific way automation lies to you.

## First: the thing that already worked

Pressing publish myself worked from day one and never stopped. Every problem below is about the *other* half — the half that runs when I'm not looking.

Worth separating, because "does it work?" had two completely different answers all day, and I caught myself blurring them more than once.

## Failure 1 — a permission that had never been tested

The job flipped the article to published, then tried to open the request that ships it, and got refused. A setting I'd never heard of, off by default, blocking automated jobs from opening those requests.

Reasonable setting. My job had simply never run before — it had only just moved to the branch where it runs from.

**A job that has never run has never been tested**, no matter how carefully it was written. Everything I'd verified was the logic. None of it was the environment.

## Failure 2 — the same job then reported success, forever

This is the one I'd tattoo somewhere.

The refusal happened *after* it had already marked the article published. So the article sat marked-published, with nothing actually shipping it.

And here's the trap: my job looks for articles that are **scheduled and due**. This one was no longer scheduled — it had marked itself published. So on every later run it looked, found nothing due, and exited successfully.

It would have done that forever. A green checkmark, every fifteen minutes, over an article that was never going out.

Nothing was broken. Nothing was alerting. The only symptom was an article that didn't appear, and me eventually wondering why.

**A job that reports success while sitting on a stuck state is worse than one that crashes.** A crash gets looked at. This gets trusted.

## The fix: make it look for its own wreckage first

I couldn't just reorder the two steps — the second one needs the first to have happened.

So instead, every run now starts by asking a different question. Not *"what's due?"* but *"is there anything I already marked as done that never actually shipped?"*

If there is, it picks it up and finishes the job, whether or not anything new came due.

That's the generalisable bit. **If your job can half-finish, it must look for its own wreckage before it looks for new work.** Two steps that aren't atomic *will* eventually half-run — a permission, a rate limit, a bad minute at your provider. Design for the second half failing, because someday it will.

## Failures 3 and 4 — I blocked myself, twice, the same way

My publisher has a guard: it refuses to ship if the branch contains anything that isn't an article. Shipping code while nobody's watching isn't a decision a scheduled job should make.

I pushed the fix from failure 2 to that branch. The fix is code. **It blocked itself.**

Two hours later I pushed some tooling to the same branch, for unrelated reasons, and blocked it again.

Both times the guard was completely right. Both times my first instinct was to describe it as an obstacle.

The correction came from outside my own head. Rather than *"loosen the guard"*, the actual fix was: **keep content on the content branch and put tooling somewhere else.** Remove the cause instead of weakening the check that caught it.

I'd have widened the guard. That would have worked, once, and quietly made the guard worth less every time after.

**When a safety check keeps firing, suspect the habit, not the check.**

## Failure 5 — my fix would have broken the live site

Cleaning this up, I split the change: tooling to the live branch, content the normal way.

Except one of those tooling files was a test that *requires every article to have images*. And the image references were on the content branch, still travelling.

Ship the test first and the live branch fails its own checks until the content catches up.

Caught only because the tests failed — after I'd already committed without reading them.

**A check must not reach production before the content it checks.** Enforcement and the thing being enforced travel together, or you go red in the gap.

## Failure 6 — an article shipped with no images

Meanwhile, an article went out with no header image and nothing to show when shared. Nothing caught it, because there was no tool that made those images — they'd been made by hand each time — and the field was marked optional.

**A step that only happens when someone remembers is not part of a process.**

I wrote a generator, then did the thing that actually mattered: made the tests fail without the images.

That immediately found **two articles already published weeks ago with no share image at all.** Nobody had noticed. The check found it in its first run.

**A convention nothing checks is a preference.**

## Then it worked

Scheduled for 20:35. The job ran at 20:40, opened the request, merged it, and the article went live.

Five minutes late. Nobody watching. First time.

## One thing worth knowing if you try this

Scheduled jobs on GitHub are not punctual. Mine is set to run every 15 minutes; measured across the day, actual gaps were **66 to 92 minutes.** They throttle heavily.

The successful run was 5 minutes late, so it varies — but if you want something out at 9am, schedule it for 8.

## Try this today

If you have anything running on a schedule:

1. **Find its last "success" and read what it actually did.** Not the checkmark — the log. Did it do work, or did it correctly determine there was nothing to do? Those look identical from outside.
2. **Ask what happens if it dies halfway.** Two steps, and the second one fails — does the next run notice, or does the first step's result make it invisible?
3. **Ask what your green light is asserting.** Mine was asserting "this script ran to completion." I'd been reading it as "the thing I wanted has happened."

Number 3 is free and it's most of the value.

## What I'd tell myself two years ago

I thought automation was a code problem. Write it correctly, test it, done.

Every one of my six failures was environmental, ordering, or habit. A permission nobody had exercised. Two steps that weren't atomic. A check that outran its content. Twice, my own commits tripping my own guard.

The code was fine the whole time. The code was never the hard part.

And the honest ending: I only found most of this because I kept checking whether things had actually happened, rather than whether the job said it had. **The gap between "automated" and "working" is exactly the size of that habit.**
