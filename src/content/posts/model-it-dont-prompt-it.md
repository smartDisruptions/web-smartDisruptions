---
title: I spent 577 credits teaching an AI to spin a can. Then I built the can.
slug: model-it-dont-prompt-it
excerpt: I burned 577 credits trying to get an AI to show the same can from every side. It never managed it once — and that's not bad luck, it's how these tools work. The fix took one sentence, no special skills, and it changed how I use AI images entirely.
category: Working With AI
publishDate: 2026-08-28
tags: [ai, images, 3d, product]
status: staged
heroImage: /images/content/model-it-dont-prompt-it-hero.webp
heroImageLight: /images/content/model-it-dont-prompt-it-hero-light.webp
heroImageAlt: Split card - 577 credits spent teaching a generative video model to rotate a can consistently, against the fix - building the can as real 3D geometry wearing a typeset label, correct at every angle.
ogImage: /images/content/model-it-dont-prompt-it.webp
channels:
  - name: linkedin
    status: planned
    note: "I spent 577 credits trying to get an AI to show the same can from every side.\n\nIt never managed it once.\n\nAnd it turns out that's not bad luck. When you ask AI for a picture, it isn't photographing an object — it's imagining a new picture every time. Show it the front of your product and it will match it beautifully. Then it has to draw the back, which it has never seen. So it makes one up. Different every time.\n\nWorse: AI can't write small text. My nutrition label came back as scribbles at first. Then, on a later try, it came back crisp and readable — with numbers the AI invented. 170 calories, on a drink that's supposed to have zero.\n\nBeautiful and wrong is worse than obviously fake.\n\nThe fix took one sentence: a can is just a cylinder.\n\nI stopped asking for pictures of the can and asked the AI to build the can — a real 3D object on the page, like a prop in a video game, wearing a label I typed myself. Real fonts. Real numbers. Now every angle is right automatically, because the back of the can exists the same way a real can's back does.\n\nI never opened any 3D software. The AI did all the technical work. The only thing that changed was my request.\n\nThe rule I kept: if something has to look the same twice, have the AI build it. Save the picture-making for backgrounds and scenery, where its imagination is exactly what you want.\n\nThe site is live and you can spin the can yourself — links in the comments."
    comment: "Spin the can: https://web-voltic.vercel.app · the side-by-side comparison you can drag: https://web-voltic.vercel.app/compare.html · the full write-up: https://www.smartdisruptions.com/content/model-it-dont-prompt-it"
  - name: substack
    status: planned
    note: "577 credits is what it cost me to learn where AI image tools actually break.\n\nI needed a can of a made-up energy drink to spin on a web page. The AI gave me a different can every time — because it isn't photographing an object, it's imagining a fresh picture on every try. And it can't write small text: my nutrition label came back with invented numbers. 170 calories on a zero-calorie drink.\n\nThe fix: a can is just a cylinder. I had the AI build the can as a real 3D object wearing a label I typed myself, and every angle became right automatically. No 3D skills involved — I just changed what I asked for.\n\nThe rule that survived: if it has to look the same twice, build it. If it only appears once, generate it. AI made every background and splash shot on that site, and it's genuinely great at those.\n\nFull story, with the live can you can spin: https://www.smartdisruptions.com/content/model-it-dont-prompt-it"
liveAt: 2026-08-29T00:00:00.000Z
---
I built a website for a made-up energy drink called VOLTIC. The showpiece is the can: it turns as you scroll down the page, and you can grab it and spin it yourself. It's live at [web-voltic.vercel.app](https://web-voltic.vercel.app) — go spin the can before you read how it nearly didn't work.

Every picture on that site was made by AI. The splash shots, the close-ups of water droplets, the moody hero image — all of it. And it looks great.

The can is a different story. The can cost me **577 credits** — the tokens you buy to use AI image and video tools, like tokens at an arcade — across four separate attempts. Every attempt failed. Understanding *why* turned out to be worth more than the website.

## Why the AI kept failing

Here's the thing I didn't understand when I started.

When you ask an AI for a picture, it isn't photographing an object that exists somewhere. It's *imagining* a brand-new picture, every single time.

So I could show it a photo of the front of my can and say "match this" — and it would, beautifully. But then it had to draw the *back* of the can. It has never seen the back. There is no back. So it made one up. A different one every time.

Show it the back instead, and it invents the front. There's no clever request that fixes this, because the AI isn't turning a can around — it's dreaming up a fresh can on every try and hoping. Each new attempt is a pull on a slot machine, and I paid for every pull.

The second problem was worse.

**AI can't write small text.** The little nutrition label on the can came back as scribbles at first — panel-shaped squiggles where words should be. That at least *looked* wrong. On a later attempt, something sneakier happened: the label came back crisp and perfectly readable, with numbers the AI had invented. It said **170 calories**. My drink is supposed to have zero.

That's the sentence I carried out of this whole mess: **beautiful and wrong is worse than obviously fake.** A blurry label looks like a rough draft. A crisp label with made-up numbers looks like a fact.

## The fix took one sentence

A can is just a cylinder.

That's it. That was the entire insight. A can isn't a hard object like a face or a pair of hands — it's one of the simplest shapes there is, with a printed label wrapped around it.

So I changed what I was asking for. Instead of *"draw me pictures of this can from different angles,"* I asked the AI to **build the can**: a real 3D object that lives on the web page — like a prop in a video game — wearing a label I wrote myself, with real fonts and the real numbers.

Now every angle is right *automatically*. The back of the can exists for the same reason a real can has a back. The logo appears once because the label carries it once. The nutrition panel says zero calories because I typed zero calories. Made-up numbers, duplicate logos, gibberish text — not just fixed, but *impossible*. And when I want to change the label, I edit the text. No more slot machine.

And here's the part I want to be clear about, because it's where I would have assumed I was stuck: **I never opened any 3D software, and I didn't learn 3D modeling.** The AI wrote all the technical parts. The only thing that changed was my request.

## The playbook

Five decisions, in the order I'd make them next time.

### 1. Sort every image with one question

**What:** does this thing need to look the same twice?

**How:** go down your list of shots. A splashy background appears once — that's one pile. Your product shows up in six places from six angles — that's the other pile.

**Why:** "matching itself" is exactly the thing AI images can't promise. This two-minute sort decides everything else.

### 2. Let the AI make the scenery

**What:** everything in the appears-once pile goes to the AI.

**How:** exactly what you're already doing. My site is the proof — every scene on it is AI-made, and it's the best-looking part.

**Why:** a background has no wrong answer. Nothing has to match it, so the AI's imagination is pure upside there.

### 3. For the product, ask for the object — not pictures of the object

**What:** have the AI build the thing instead of drawing it.

**How:** ask one question first: *is this basically a simple shape with a printed surface?* A can is a cylinder. A cereal box is a box. A gift card is a rectangle. Most products are simpler than they look. If yes, tell the AI to build it that way — it handles the technical side; your job is the ask.

**Why:** a built object can't drift. Every side of it exists for the same reason the front does.

### 4. Words get typed, never generated

**What:** anything written on your product — the label, the ingredients, the fine print — is real text you wrote, placed onto the object.

**How:** I wrote my label the way you'd write any document, and the AI wrapped it around the can like a printed label.

**Why:** this is what makes wrong numbers *impossible* instead of just unlikely. An AI paints things that look like words. Typed text says what you typed. My 170-calorie surprise is the receipt.

### 5. When two versions look good, pick with numbers, not vibes

**What:** I ended up with two good cans — the one on the site, and one made in professional 3D animation software that had genuinely prettier lighting. I put them side by side on a [comparison page](https://web-voltic.vercel.app/compare.html) where you can drag a divider between them. It's still up.

**How:** the prettier one lost on two things I could measure. Its images were about **eight times heavier**, which slows the page down. And it could only turn the can in small steps — a subtle stutter — where the other version turns smoothly and lets you grab it.

**Why:** my site's entire sales pitch is smooth motion. The version that couldn't be smooth couldn't win, no matter how nice its reflections were. Knowing what the page is *selling* turned a taste call into arithmetic.

## The mistake that almost shipped

One honest one, because it's the part I'd want someone to tell me.

Near the end, I spotted two bad frames and asked the AI to fix them. It fixed both, ran its checks, and told me everything passed. But the animation *between* those two frames still didn't match — and nothing caught it, because every check was pointed at the parts we'd just repaired.

I caught it by eye, scrolling the page the way a visitor would.

The lesson sits right next to the big one: **check the whole thing, not just the part that got fixed.** The AI repairs what you point at. Walking through the finished thing like a customer is the job that stays yours.

## Try this tonight

Find the image you've re-generated the most — the product shot, the logo mockup, the diagram that never comes back quite the same.

Ask one question about it: **is this a simple shape with a printed surface?**

If it is, stop asking your AI for pictures of it. Ask it to build the thing — and keep the picture-making for the scenery, where an AI that invents things is exactly what you want.
