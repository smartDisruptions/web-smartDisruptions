---
title: I rebuilt my friend's food-truck site with AI. Five decisions did the real work.
slug: five-decisions-rebuilding-a-real-site
excerpt: A scroll-animated homepage, a menu redesigned as kitchen tickets, a catering page rebuilt around what Rob's customers actually ask. The AI wrote all of it. Five decisions are what made the difference between a demo and something a real business can put its name on.
category: Build Breakdown
publishDate: 2026-08-30
tags: [ai, design, client-work, accessibility]
status: staged
channels:
  - name: linkedin
    status: planned
    note: "I rebuilt my friend Rob's food-truck site with AI last week — animated homepage, menu redesigned as kitchen tickets, catering page rebuilt around what his customers actually ask for.\n\nThe AI wrote all of it. Five decisions were mine, and they're the transferable part:\n\n1. Ask for directions, not drafts. Instead of \"redesign the menu,\" I asked for three tappable samples. I picked one in about a minute. The two I didn't pick cost almost nothing — that's the point.\n\n2. Never let an image generator edit a real photo. Ask it to clean up a picture of a real dish and it doesn't edit, it regenerates. One pass handed me a shrimp sandwich that has never existed. Rob's customers have to see Rob's actual food, so real photos got deterministic tools and generators never touched them.\n\n3. Make bad layouts impossible, not unlikely. I spent rounds nudging floating decorations away from text, and they collided at some new screen width every time. The fix that held was structural: give the decoration its own reserved space so the collision can't happen.\n\n4. Verify motion by reading numbers, not by watching. Preview browsers throttle animation to nearly zero frames — watching proves nothing. Scroll the page in code, read the actual values at fixed points, compare against the intended curve.\n\n5. When someone says it's broken, get evidence before touching code. A mystery \"Mastercard, $15\" menu item was a typo in Rob's own register, mirrored faithfully. \"The animations are gone\" was an accessibility setting on his phone doing exactly what we built it to do.\n\nTwo of the five are about not writing code. That keeps being the pattern.\n\nThe site's live, link in the comments."
    comment: "The site is at samuraikitchencatering.com, and the write-up has the receipts behind each decision — including the prompt that caught a real logic bug by reading as a customer instead of a developer: https://www.smartdisruptions.com/content/five-decisions-rebuilding-a-real-site"
  - name: substack
    status: planned
    note: "I rebuilt a friend's food-truck site with AI last week. It wrote every line. Five decisions were mine, and those are the part worth copying.\n\nThe one that saved the most time: ask for directions, not drafts. Instead of \"redesign the menu,\" I asked for three tappable samples and picked one in a minute. The two losers cost almost nothing.\n\nThe one I'd argue hardest for: never let an image generator edit a real photo. It doesn't edit, it regenerates — one pass handed me a shrimp sandwich that has never existed. Rob's customers have to see Rob's actual food, so generators never touched a real dish.\n\nAnd the one that keeps being true: when someone says it's broken, get evidence first. A mystery \"$15 Mastercard\" menu item was a typo in his own register, mirrored faithfully by a working sync. \"The animations are gone\" was a phone setting, and the site was doing exactly what we built it to do.\n\nhttps://www.smartdisruptions.com/content/five-decisions-rebuilding-a-real-site"
heroImage: /images/content/five-decisions-rebuilding-a-real-site-hero.webp
heroImageLight: /images/content/five-decisions-rebuilding-a-real-site-hero-light.webp
heroImageAlt: "Split card: the AI wrote every line of the rebuilt site, against the five decisions that stayed mine — two of which were rules about what not to let it touch and what not to believe."
ogImage: /images/content/five-decisions-rebuilding-a-real-site.webp
---
My friend Rob runs a Japanese food truck and catering business. I built his site last year, wrote about [what I chose not to ship](https://www.smartdisruptions.com/content/food-truck-site-with-ai), and then [tried to break it](https://www.smartdisruptions.com/content/i-tried-to-break-my-friends-ai-site). Last week I rebuilt most of it: a homepage where the food moves as you scroll, a menu redesigned as kitchen tickets, a catering page rebuilt around the question his customers actually ask.

It's live at [samuraikitchencatering.com](https://samuraikitchencatering.com). The AI wrote all of it.

Five decisions were mine, and they're the transferable part. Everything else was typing.

## 1. Ask for directions, not drafts

**What:** when a design is up for grabs, ask for a few real options you can look at — not one draft to react to.

**How:** the menu needed rebuilding and half the dishes had no photograph. Rather than "redesign the menu," I asked for three sample directions, each as something I could actually open and tap. I picked one in about a minute. Same move for the catering page: three directions, one pick, then the real build.

**Why:** judging is fast and specifying is slow. I couldn't have written a paragraph describing the design I chose, but I recognised it instantly. And the two directions I didn't pick cost almost nothing — that's the whole trick. When generating options is cheap, taste becomes the bottleneck, so give your taste something to point at.

## 2. Never let an image generator edit a real photo

**What:** a hard line. Generators may make decorative things. They may not touch a photograph of a real product.

**How:** the animated homepage needed sushi pieces cut out of their backgrounds. The obvious move is to hand the photo to an image model and ask it to clean up the edges. Don't. Ask an image model to "edit" a photo and it doesn't edit — it regenerates the whole thing from scratch. One pass gave me a shrimp sandwich that has never existed on Rob's menu. So real food got deterministic tools — the kind that only remove pixels that are already there — and generation was reserved for things that aren't real.

**Why:** trust is the product. A customer ordering off a photo must get that dish. It's the same finding my [spinning-can piece](https://www.smartdisruptions.com/content/model-it-dont-prompt-it) ran into from the other direction: these models make something *like* what you asked for, and "like" is fine for a background and a lie for a menu.

There's a smaller trap in the same pipeline worth knowing. I color-graded the images before cutting them out, which quietly lifted the old background into the transparent edge. Rob's site got faint grey rectangles behind every piece of sushi. The bug report was one line: *"it's not fully transparent anymore. I now see a square shade as the background."* The fix wasn't better cutting — it was doing the two steps in the other order.

## 3. Make bad layouts impossible, not unlikely

**What:** when something keeps colliding, change the structure rather than tuning the collision.

**How:** floating sushi decorations kept overlapping the text. I nudged them for a few rounds — move it up here, in a bit there — and at every fix they collided at some new screen width. The version that held gives each decoration its own reserved band in the layout, so the space is owned rather than borrowed. Nothing to tune, because overlap can no longer happen.

**Why:** tuning fixes the bug in front of you; structure fixes the category. This is the thing I most often catch AI doing on my behalf, because a model asked to fix an overlap will happily adjust the offset — that's a correct answer to the question I asked, and the wrong answer to the problem I had.

## 4. Verify motion by reading numbers, not by watching

**What:** proof that an animation works, rather than a feeling.

**How:** you cannot watch this one. The preview browsers in the loop throttle animation to nearly zero frames a second, so "let me look at it" produces a still image and a false verdict either way. Instead: scroll the page programmatically to fixed points, read the actual position and opacity values at each one, and compare them against the curve the design intended.

**Why:** it's the difference between "it looked fine when I checked" and a number you can put next to a requirement. This is the same habit that keeps showing up in everything I build with AI — [make it verify its own work](https://www.smartdisruptions.com/content/six-prompts-one-day) — with a wrinkle worth knowing: when the tool can't see, checking harder doesn't help. You have to change what counts as evidence.

## 5. When someone says it's broken, get evidence before you touch code

**What:** treat a bug report as a claim to check, not an instruction to act on. Twice in this rebuild the report was accurate and nothing was broken.

**How, the first time:** a mystery menu item appeared — "Mastercard," fifteen dollars. It looked like a bug in the payment code. It was a mistyped sushi roll sitting in Rob's own register, and the site was mirroring his live catalogue exactly as designed. The failure and the proof that the sync worked were the same fact. The fix belonged in his register, not in my code.

**How, the second time:** Rob reported that the animations were gone. They weren't. His phone had the system-wide "reduce motion" setting turned on — the accessibility setting people use when movement makes them ill — and it propagates to every browser on the device. His site checks that setting deliberately and holds still when it's on. It was doing exactly what we built it to do, on the day someone actually needed it to.

**Why:** both of those would have been hours of hunting for a bug that didn't exist, and the second one could have ended with me removing the accessibility behaviour to "fix" it. A bug report tells you what someone experienced, which is real and worth taking seriously — it doesn't tell you what caused it, and those are different claims.

## What shipped

The homepage animates as you scroll. The menu reads like kitchen tickets, works without photographs for the dishes that don't have them, and its ingredient lists open in a sheet instead of a wall of text — Rob's one hard requirement. The catering page prices platters by how many people they feed, which came out of him reading the flow as a customer and finding a real logic bug: *"if a small serves 8 and a large serves 15, then we should never have orders with 2 smalls. Make it make sense for the customer."*

Then an accessibility and quality audit, which returned seven findings: form labels, focus handling in dialogs, contrast, heading order, a button pointing at the wrong page. All seven fixed under a seven-word instruction that is my favourite prompt of the whole build: *"Fix them all, as long as it won't hurt or break anything else."* Scope plus a no-regression condition, and nothing else needed saying.

## The pattern I keep noticing

Two of the five decisions are about *not* writing code — one is a rule against a tool, one is a rule against believing a report. The other three are structural calls a person has to make because the model will cheerfully do the locally-correct thing forever.

That keeps being the shape of this work. The building is no longer the hard part. Knowing what not to build, what not to let it touch, and what not to believe is where the job went.

**Try this tonight:** next time you'd ask an AI to design something, ask it for three directions instead — real, openable, side by side — and pick one before you let it build anything. You'll spend a minute and save an afternoon, and you'll find out what you actually wanted by seeing it.
