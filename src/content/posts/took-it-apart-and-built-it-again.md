---
title: I built my own dashboard for my site — then took it apart and built it again
slug: took-it-apart-and-built-it-again
excerpt: Six hours in, I had a working dashboard for my own site. Then I said the architecture was wrong and pulled it out into its own app. The mistake is one almost everyone makes on their first internal tool, and it only becomes visible after the thing exists.
category: Working With AI
publishDate: 2026-08-03
tags: [architecture, internal-tools, ai-native, shipping]
status: staged
channels: []
heroImage: /images/content/took-it-apart-and-built-it-again-hero.webp
heroImageAlt: "A card showing the two flaws of a dashboard built inside the site it watches: it could only see one folder of articles, and it went down whenever the site did."
ogImage: /images/content/took-it-apart-and-built-it-again.webp
liveAt: 2026-08-04T13:00:00.000Z
---
I write here often enough that I kept losing track of my own work. What's finished, what's half-written, what I said I'd publish on Thursday and didn't.

So I built a small dashboard. Every article, what state it's in, and a button to publish.

It took a day. It worked. By evening I'd decided it was built wrong and taken it apart.

Nothing was broken. That's what makes it worth writing down — the mistake was invisible until the thing existed, and it's the one I'd bet on you making too.

## What I built first

The natural thing. The dashboard lived *inside* the website, at `/site-name/studio`, behind a password.

Every reason for that was good. The site already existed, so there was a place to put it. It already knew how to read my articles, so the dashboard did too. One thing to deploy, one thing to maintain.

It shipped and it worked. If I'd stopped there I'd have called it a success, and it would have quietly been the wrong shape for as long as I kept using it.

## The two things that went wrong, both invisible beforehand

**A dashboard built into the site dies with the site.**

That sentence is obvious once written down. It was not obvious while building.

The dashboard's job is telling me whether things are okay. But it was *part of* the thing it was watching. If a bad deploy broke the site, it broke the dashboard — so the one moment I'd most want to look at it is exactly the moment it's gone.

I'd built a smoke detector and wired it to the same circuit as the stove.

**It could only ever see articles.**

The dashboard read the site's own store of posts, because that's what was to hand. So posts were all it could ever show me.

I wanted it to show me pages too — the about page, the games section, the things that aren't articles. It structurally couldn't. Not "hadn't got to yet": the data it read didn't contain them.

Which meant every future thing I wanted from it — pages, other projects, whether my scheduled jobs are alive — was outside what it could see. I hadn't built a command center. I'd built a nicer view of one folder.

## Taking it apart

Thirty seconds first: I saved the existing version to a branch and tagged it.

That's the whole reason this was a comfortable decision instead of a nervous one. With the old version one command away, "should we rebuild this?" stops being a risk and becomes a preference. If the new shape turned out worse I'd lose an afternoon, not the work.

I'd argue that's the most portable thing here. **Archiving before you take something apart converts a scary decision into a cheap one**, and it costs less time than deciding whether to do it.

Then: its own repository, its own deploy. It reads the projects it manages from the outside and stores nothing itself.

That last part is the pivot. The first version *was* part of the system. The second version *looks at* the system. Everything good followed from that.

## What the outside version can do that the inside one couldn't

**It sees pages, by reading the files.** Rather than crawling the live site — which only shows what already shipped — it reads the route files in the repository. So a page that exists but hasn't gone live still appears. A crawl structurally cannot show you that; you can't crawl a thing that isn't there yet.

**It reports on my scheduled jobs.** I have a few automated routines. There's no way to ask one "did you run?" So the dashboard checks whether each left behind the file it's supposed to leave, and how long ago.

That's deliberately the harder-to-fake signal. A scheduler reporting its own success would have shown green for three weeks while one of those routines quietly produced nothing. Artifacts don't lie about themselves.

**It still works when the site is down.** Which was the entire point.

## The part I got wrong twice

I'd like to say I designed my way there. I didn't — I built the wrong thing first and noticed.

What made noticing possible was using it. Not reviewing it, not thinking hard about it. *Using* it, and running into the edges. Both problems announced themselves as small frustrations — "I wish this showed pages", "I can't check this right now, the deploy's broken" — before I recognised them as one root cause.

I'm suspicious of the version of this story where someone sketches the right architecture on day zero. Mine required a working wrong answer first.

## The question worth asking before you build one

If you're about to build an admin panel, dashboard, or ops tool, one question sorts it:

**If the thing I'm monitoring goes down, do I still have the monitor?**

If the answer is no, it belongs outside.

That's it. It takes ten seconds and it's the whole lesson. The follow-up, if you want a second one: *is the data it reads the data I'll eventually want?* If your tool can only see one folder because that's what was convenient, its ceiling is that folder.

## Try this today

Look at whatever internal tool you have — a script, a page, a spreadsheet with formulas:

1. **Ask where it lives.** Inside the thing it watches, or outside?
2. **Ask what it can see.** Is that everything you'll want, or just what was easiest to reach?
3. If either answer bothers you, **save a copy before you change anything.** A branch, a tag, a zip. Thirty seconds.

Step 3 is the one people skip, and it's the one that decides whether step 1 and 2 are interesting questions or frightening ones.

## What I'd tell myself two years ago

I used to think rewriting something meant I'd failed at planning. Real engineers, I assumed, got the shape right first.

The shape of this one was genuinely not knowable in advance. It looked right, it shipped fine, and the two reasons it was wrong only appeared once it was real and I was using it.

What I'd actually change isn't the first design. It's how long I'd have argued with myself before pulling it apart. Six hours of work felt like something to protect. It wasn't — it was six hours of finding out, and the finding out was the point.
