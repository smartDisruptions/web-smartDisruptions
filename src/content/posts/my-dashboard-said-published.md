---
title: My dashboard said the article was published. The article was returning a 404.
slug: my-dashboard-said-published
excerpt: I built a dashboard to tell me what's live on my own site. For a few hours it confidently reported an article as published while that exact URL returned a 404 — and 52 passing tests never noticed. Here's why status boards lie in the direction you want to believe, and the habit that catches it.
category: Working With AI
publishDate: 2026-08-02
tags: [ai, tooling, verification, shipping]
status: published
channels:
  - name: linkedin
    status: planned
    note: "My dashboard told me an article was published. I opened the URL and got a 404.\n\nI'd built it the day before: every article, its state, a publish button.\n\nEvery article carries a label, status draft or status published. The dashboard read the label and reported it back. But a label saying published is something I intended. Whether the page loads is something the world does. I'd built a tool that treated those as one.\n\nThey agree most of the time. They come apart in one window: after you mark something published, before it's actually gone out. Which is the normal state of anything you just finished.\n\nFifty-two tests passed. They checked whether the label logic was consistent, and it was, perfectly. The bug wasn't an inconsistency. It was the frame.\n\nWhat caught it was me looking at the board and thinking: hang on, wasn't that one still on the other branch?\n\nSo the question I ask about anything reporting status back to me, including an AI agent saying it's done, isn't whether it's accurate. It's whether it can be wrong in a way that feels reassuring. Those are the ones that survive.\n\nOne thing to try today: check something your tools say is finished against the thing itself, not the record. Load the URL.\n\nFull write-up in the comments."
    comment: "The full write-up, including the second bug I found in there: a safety net I'd written hours earlier that could have put an article on my site without me pressing anything. https://www.smartdisruptions.com/content/my-dashboard-said-published"
  - name: substack
    status: planned
    note: "I spent a day building a dashboard for my own site. Every article, what state it's in, a button to publish. Then it told me an article was published while that exact URL was returning a 404.\n\nThe reason is the part I keep thinking about. Every article carries a label: status published. The dashboard read the label. But the label is something I intended, and whether the page loads is something the world does. I'd built a tool that quietly treated those as one fact.\n\nFifty-two tests passed. They were checking that the label logic was consistent, and it was, perfectly. What caught the bug was me looking at the board and declining to believe it.\n\nWorth asking of anything that reports back to you, including an AI agent telling you it finished: can this be wrong in a way that feels reassuring?\n\nhttps://www.smartdisruptions.com/content/my-dashboard-said-published"
  - name: x
    status: planned
    note: "1/ My dashboard said an article on my site was published. Green badge. I opened the actual URL and got a 404. I'd built the dashboard the day before.\n\n2/ The mistake: every article carries a label, status draft or status published. The dashboard read the label. But a label saying published is something I intended. Whether the page loads is something the world does. I built a tool that treated them as one fact.\n\n3/ They agree most of the time. They come apart in exactly one window: after you mark something published, before it has actually gone out. Which is the normal state of anything you just finished.\n\n4/ I had 52 tests. Every one passed. They were checking whether the label logic was consistent, and it was, perfectly. The bug wasn't an inconsistency. It was the frame. What caught it was me looking at the board and declining to believe it.\n\n5/ Then I found a rule I'd written hours earlier: if a scheduled date has passed, treat the article as live. Safe when publishing only moved things to staging. I later changed publishing to go straight to the live site. Same rule, new blast radius. I deleted it.\n\n6/ So the question isn't: is this tool accurate. It's: can it be wrong in a way that feels reassuring? A tool that says error gets investigated in ten seconds. A tool that says done, all good gets believed, and the gap sits there for weeks."
    comment: "Full write-up, including the three habits I picked up from it and why no results should look suspicious to you: https://www.smartdisruptions.com/content/my-dashboard-said-published"
heroImage: /images/content/my-dashboard-said-published-hero.webp
heroImageAlt: "A run log: the dashboard reporting the article published, the URL returning 404, and 52 passing tests that caught none of it."
ogImage: /images/content/my-dashboard-said-published.webp
liveAt: 2026-08-02T13:00:00.000Z
heroImageLight: /images/content/my-dashboard-said-published-hero-light.webp
---
I spent yesterday building a dashboard for my own site.

Nothing fancy. I write, and I kept losing track of what I'd finished, what was scheduled, and what had actually gone out. So I built a small command center: every article, what state it's in, and a button to publish.

It worked. Then it told me something that wasn't true.

## The moment

One of the articles showed up as **Published**. Green badge. "Live on main." I'd written it the day before, so that tracked.

Except I happened to open the actual URL, and got a **404**.

Not a slow cache. Not a typo. The page did not exist on my site, and the tool I'd just built to tell me what was on my site was reporting it as live.

## Why it was wrong

Here's the thing I'd gotten wrong, and it's the part worth stealing.

Every article in my system carries a little label — `status: draft`, `status: published`. My dashboard read that label and reported it back to me.

But a label saying "published" is **something I intended**. Whether the page loads is **something the world does**. Those are two different facts, and I'd built a tool that quietly treated them as one.

They agree most of the time, which is what makes it dangerous. They come apart in exactly one window: after you mark something published, but before it's actually gone out. Which — if you think about it — is the normal state of anything you just finished.

So the tool was correct about my intentions and wrong about reality, and it reported the second one.

## Nothing caught it. I did — by not believing it.

There's a version of this story where a test catches the bug and I look organised. That's not what happened.

I had tests. Fifty-two of them, including ones that specifically try to break the publishing rules. Every one passed. They were all testing whether the label logic was consistent — and it was, perfectly. The bug wasn't an inconsistency. It was the whole frame being wrong.

What actually caught it was me looking at the board and thinking: *hang on, wasn't that one still sitting on the other branch?*

I was wrong about the details — the article wasn't in the state I thought it was either. But the instinct that something didn't line up was right, and that was enough to go look.

That's the uncomfortable lesson. **The check on the tool was a human declining to trust it.**

## The second one, which is worse

While I was in there, I found something I'd written myself a few hours earlier.

I'd added what felt like a sensible safety net: if an article is scheduled for a date, and that date has passed, treat it as live. That way if I forgot to press the button, the piece still went out roughly on time. Helpful.

It was completely safe when publishing only moved things to a staging area. Then I changed the system so publishing went straight to the live site — and that same helpful rule now meant this:

Schedule something for last Tuesday. Get busy. Never press publish. Then, a week later, publish a *completely different* article — and the forgotten one goes live too, because its date has passed.

I never pressed anything. It would just appear.

The rule didn't change. The blast radius did. **A safety net in one context is a footgun in another**, and nothing warns you when the context moves underneath a decision you already made.

I deleted it. Now exactly one thing puts an article on my site: me pressing a button.

## What I'd take from this

If you're using anything that reports status back to you — a dashboard, a deploy tool, a project board, an AI agent telling you it finished — the question worth asking is not *is this tool accurate?*

It's **can this tool be wrong in a way that feels reassuring?**

Because those are the wrong answers that survive. A tool that says "error" gets investigated in ten seconds. A tool that says "done, all good" gets believed, and the gap can sit there for weeks.

Three things I do now:

1. **Check the claim against the thing, not the record.** My dashboard said published; the answer was to load the URL. Whatever your tool reports, there's usually a five-second way to ask reality directly. Do that occasionally, especially when the news is good.
2. **When something's scope changes, re-derive the rules that were safe at the old scope.** Don't carry them across. I wrote a rule that was correct on Monday and dangerous on Tuesday because I'd moved what it applied to.
3. **Treat "no results" as suspicious.** A related bug: my tool skipped over anything empty, so "the live site has zero articles" looked identical to "I didn't check the live site." It literally could not tell it was wrong. If your instrumentation can't distinguish *nothing there* from *didn't look*, it can't tell you when it's blind.

None of this is about AI specifically. But it lands harder now, because more of us are running tools we didn't write and can't fully read — and the confident summary at the end is the part we're most tempted to take at face value.

The tool was mine. I built it that day. I still nearly believed it over the actual website.

---
