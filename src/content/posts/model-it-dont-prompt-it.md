---
title: I spent 577 credits teaching an AI to spin a can. Then I built the can.
slug: model-it-dont-prompt-it
excerpt: Four rounds trying to make a generative video model rotate a product consistently. It can't — and the failure is structural, not bad luck. The fix took one sentence to say and an evening to build, and it's the rule I now use for every AI image job.
category: Working With AI
publishDate: 2026-08-28
tags: [ai, images, 3d, product]
status: staged
channels:
  - name: linkedin
    status: planned
    note: "I spent 577 credits teaching an AI video model to spin a can.\n\nIt never once gave me the same can twice.\n\nThe failure isn't bad luck — it's structural. A generated image can only anchor one side of an object. Seed the front, it invents the back. Seed the back, it invents a mirrored front. And video models can't render small text at all: my nutrition panel came back first as scribbles, then as invented values — 170 calories on a zero-calorie drink.\n\nBeautiful and wrong is worse than obviously fake.\n\nThe fix took one sentence: a can is a cylinder.\n\nI had the AI build the can as a real 3D object wearing a label I typeset myself — actual fonts, actual values. Now every angle is correct by construction. Gibberish text, duplicated logos, wrong numbers: structurally impossible. A label change is a text edit, not a slot-machine pull.\n\nThe rule I kept:\n\nFor anything that must be the same object twice — model it, don't prompt it. Generate the scenery; build the product.\n\nThe site is live, and there's a comparison page where you can drag a slider between three renderers and see exactly why each won or lost. Links in the comments."
    comment: "The live site (drag the can): https://web-voltic.vercel.app · the renderer face-off with wipe sliders: https://web-voltic.vercel.app/compare.html · the write-up with the full playbook: https://www.smartdisruptions.com/content/model-it-dont-prompt-it"
  - name: substack
    status: planned
    note: "577 credits is what it cost me to learn where generative video actually breaks.\n\nI needed a can of a fictional energy drink to rotate on a web page. The model gave me a different can every time — a generated image can only anchor one side of an object, so it invents the other. And it can't do small text: my nutrition panel came back as scribbles, then as confident wrong values. 170 calories on a zero-calorie drink.\n\nThe fix: a can is a cylinder. Build the object, typeset the label, and every angle is right by construction.\n\nThe rule that survived: for anything that must be the same object twice, model it — don't prompt it. Generation still does all the scenery, and it's genuinely great at that. The split is the lesson.\n\nFull playbook, with the live can and a three-renderer comparison you can drag: https://www.smartdisruptions.com/content/model-it-dont-prompt-it"
heroImage: /images/content/model-it-dont-prompt-it-hero.webp
heroImageLight: /images/content/model-it-dont-prompt-it-hero-light.webp
heroImageAlt: "Split card: 577 credits spent teaching a generative video model to rotate a can consistently, against the fix — building the can as real 3D geometry wearing a typeset label, correct at every angle."
ogImage: /images/content/model-it-dont-prompt-it.webp
---
I built a website for a fictional energy drink called VOLTIC. The whole point of the site is motion — the can turns as you scroll, and you can grab it and spin it yourself. It's live at [web-voltic.vercel.app](https://web-voltic.vercel.app) if you want to drag the can around before reading how it nearly didn't work.

Every image on that site is AI-generated. The splash shots, the macro droplets, the hero art — all of it came out of a generative model, and it's good.

The can did not. The can cost me **577 credits** across four rounds of trying, and every attempt failed the same two ways. Understanding *why* it failed turned out to be worth more than the site.

## The failure is structural, not bad luck

I kept treating each bad batch as a bad roll. Re-prompt, re-generate, burn more credits. Four rounds in, I finally looked at *how* it was failing instead of *that* it was failing, and both failure modes turned out to be built into how these models work.

**A generated image can only anchor one side of an object.** You can hand the model a reference photo of your can's front — a "seed" — and it will match that front faithfully. Then it reaches the back, which it has never seen, and it *invents* one. Give it the back instead and it invents a mirrored front. There is no prompt that fixes this, because the model isn't rotating an object — it's painting new pictures that resemble the last one. Every re-pull is the same slot machine.

**And video models can't write.** Small text — the kind on every real product — comes back as text-*shaped* marks. My nutrition panel came back as scribbles first. Then, on a later round, something worse: legible, confident, **invented values**. The panel said 170 calories. VOLTIC is a zero-calorie drink. I made it up, and my own product images were contradicting me.

That second failure taught me the sentence I'd carry out of this whole build: **beautiful and wrong is worse than obviously fake.** A blurry panel looks like a draft. A crisp panel with wrong numbers looks like a decision.

## The fix took one sentence

A can is a cylinder.

That's it. That was the whole insight. A can isn't a complicated object the way a face or a hand is — it's one of the simplest shapes there is, wearing a printed label.

So instead of asking the AI for *pictures of the can*, I asked it to *build the can*: a real 3D object on the page (three.js — the standard toolkit for putting live 3D in a browser), wearing a label I typeset myself with the site's own fonts and the actual panel values.

Now every angle is correct **by construction**. The back exists because the cylinder has a back. The logo appears once because the label carries it once. The panel says what I typed, because it *is* what I typed. Gibberish, duplicated logos, invented calories — not fixed, but structurally impossible. And a label change is now a text edit instead of a generation gamble.

The AI wrote all of that code, by the way. I never opened a 3D program. The move wasn't learning to model — it was changing what I asked for.

## The playbook

Five decisions, in the order I'd make them next time.

### 1. Sort every asset with one question

**What:** does this have to be the same thing twice?

**How:** go through your shot list. A hero splash appears once — generate it. A product that shows up in six places, from six angles, has a continuity requirement — that's the other pile.

**Why:** continuity is precisely the thing generation can't promise and geometry can't break. The sort takes two minutes and decides everything downstream.

### 2. Generate the scenery

**What:** everything in the one-off pile goes to the image model.

**How:** exactly what you're already doing. This is where these tools are genuinely excellent, and my site is proof — every scene image on it is generated.

**Why:** a splash has no wrong answer. Nothing else on the page has to match it, so the model's inventiveness is pure upside there.

### 3. Ask for the object, not pictures of the object

**What:** for the continuity pile, have the AI build the thing as geometry.

**How:** one question to ask first: *is this a simple shape wearing a surface?* A can is a cylinder. A box is a box. A card is a rectangle. Most products are simpler than they look. Then ask your AI to build it that way — it writes the code; your job is the ask.

**Why:** a built object can't drift. Every angle of it exists for the same reason the front does.

### 4. Any words on the thing are typed, never generated

**What:** the label is real typography — actual fonts, actual values — applied to the object as its surface.

**How:** I wrote the label the same way you'd write a document, using the site's own fonts, and the AI wrapped it onto the cylinder.

**Why:** this is what makes wrong values *impossible* rather than unlikely. A model paints text-shaped marks; type says what you typed. The 170-calorie panel is the receipt.

### 5. When two good options remain, judge on what the page is selling

**What:** I ended up with three working renderers and had to pick one — so I built a [comparison page](https://web-voltic.vercel.app/compare.html) with wipe sliders and judged side by side. It's still up; you can drag it.

**How:** with numbers, not taste. The path-traced version (built in Blender, a professional 3D tool) had genuinely prettier light — and cost 2 MB of frames against ~250 KB, and its 60 frames meant the rotation *steps* in 6° jumps instead of turning smoothly.

**Why:** the tiebreaker was the site's own thesis. This page sells smoothness, so the renderer that can't be smooth can't win it — no matter how it lights a rim. Knowing what the page is selling made a hard call mechanical.

## The miss that almost shipped

One honest beat, because it's the part I'd want told to me.

Late in the build I flagged two bad anchor photos. My AI fixed both, ran its checks, and called it done. The *video between them* still didn't match — and no check caught it, because every check was pointed at the parts we'd just repaired. I caught it by eye, scrolling the page the way a visitor would.

The lesson sits right next to the big one: **verify the deliverable, not the part you just fixed.** The AI repairs what you point at. Walking the whole thing end to end is the job that stays yours.

## Try this tonight

Find the image you've re-generated the most times — the product shot, the logo mockup, the diagram that never comes back quite the same.

Ask one question about it: **is this a simple shape wearing a surface?**

If it is, stop asking your AI for pictures of it. Ask for the object — and keep the picture-making for the scenery, where a model that invents things is exactly what you want.
