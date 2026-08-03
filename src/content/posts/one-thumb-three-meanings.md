---
title: My app had two features that wanted the same swipe. Neither was broken.
slug: one-thumb-three-meanings
excerpt: On my phone, swiping sideways meant both "next column" and "move this card" — and the card won every time. Nothing was buggy. Two features legitimately wanted the same gesture, and the fix was a ladder rather than a winner.
category: Build Breakdown
publishDate: 2026-08-04
tags: [mobile, ux, gestures, testing]
status: staged
channels: []
heroImage: /images/content/one-thumb-three-meanings-hero.webp
heroImageAlt: A card showing two features each correctly claiming the same horizontal gesture — the card believing horizontal drags are its own, the board believing horizontal swipes are its own.
ogImage: /images/content/one-thumb-three-meanings.webp
---
I built a little task board for myself. Columns across, cards down, the usual.

On a laptop it was fine. On my phone it was infuriating.

Swiping sideways was supposed to move between columns. It never did. Every swipe grabbed whatever card was under my thumb and started dragging it instead.

I went looking for the bug. There wasn't one.

## Both features were working correctly

On a phone, a column fills the screen. So the screen basically *is* cards. There's almost nowhere to swipe that isn't on top of one.

The card said "horizontal drags are mine." The board said "horizontal swipes are mine." The card is on top, so the card won — every time, exactly as written.

That reframed the whole thing. I wasn't fixing something broken. **I had two correct features that wanted the same gesture, and I hadn't decided which should win when.**

That's a design problem wearing a bug's clothes, and I think it's common. Anything with a list inside a pager has it.

## The options, and why most were bad

**Swipe zones at the screen edge** — reserve the left and right strips for navigation. On iPhone the left edge is already the system back gesture, so I'd be fighting the OS. Also the targets are tiny.

**A drag handle on each card** — a little grip you must grab to move it. Unambiguous, and it puts furniture on every card forever and demands precision from a thumb.

**Reveal-then-tap**, like swiping an email — swipe shows buttons, then you tap one. Clear, and it costs an extra tap on every single move. I vetoed it for that reason alone.

**Time** — how long your finger rests before moving.

I picked time, and the reason is the useful part.

## The insight: the two intents already feel different

Watch yourself use a phone. Flicking between screens is *reflexive* — fast, barely aimed, you're not looking at any one thing.

Moving a specific item is *deliberate*. You look at it. You press it. Then you move it.

There's already a beat of stillness in the deliberate one. **That pause isn't a cost I'm adding — it's something you already do.** So using it as the signal is free. No handles, no extra taps, no fighting the OS.

That was my constraint from the start: **zero extra taps.** Any answer that added a press or a confirm was out before I evaluated it.

## Version one, and the bug my own thumb found

Here's what I shipped first:

- Move immediately → navigation. Page to the next column.
- Rest ~200ms → the card "arms." It lifts slightly, tiny haptic tick. Now sideways moves the card.
- Keep holding to 500ms → drag mode, to reorder within a column.

Three behaviours, one axis. It read beautifully as a spec.

Then I used it on my actual phone, and within minutes: **the card stuck to my finger.**

Holding just slightly too long — which is most of the time, because I look at the card before deciding — pushed past 500ms into drag mode. I'd get a ghost card glued to my thumb, and since the other columns are off-screen on a phone, releasing dropped it right back where it started.

Nothing crashed. It just felt possessed.

## The fix, and the rule I'd keep

The problem was the second timer. **A clock was changing modes while my finger was already down.**

So I removed it. Now arming has no deadline. Once the card is armed, the *first direction you move* decides:

- mostly sideways → move the card between columns
- mostly up or down → pick it up and reorder

Here's the rule I'd carry to anything else: **a pause may unlock capability, but only movement should choose what happens.**

Dwell says "I'm being deliberate." Direction says "and here's what I meant." One is a state, the other is a decision — and a timer should never make the decision, because the user can't see the clock.

That stuck-to-my-finger feeling? That's what timer-selection feels like from the outside.

## One more rung: fast counts as much as far

The card only committed to a move once you'd dragged about a third of its width. Which quietly punished me for being confident — a short, decisive push did nothing and snapped back.

So the commit now triggers on distance **or** speed. A quick flick counts. Short-and-fast is exactly as intentional as long-and-slow, and treating only one as real makes an app feel like it's arguing with you.

That gave me a ladder, in order: **speed** decides navigate-or-card, **direction** decides which card action, **velocity** decides whether you meant it.

Each rung answers what the one above can't. Two gestures on one axis need a ladder, not a winner.

## The bit I didn't expect: I tested this without a phone

Touch bugs feel untestable. This one was entirely about *timing* — hold 320ms then slide, flick in 40ms, hold 900ms then swipe.

Browsers can be driven to synthesize real touches with controlled timing. So I wrote 17 checks, including the exact bug I'd hit as a permanent regression test: **hold a long time, then swipe — you must get the card move, never the ghost.**

The fix shipped with its own test before it went near my phone again.

One trap, in case you try it: my test setup re-ran its data seeding on every page reload, so a mid-test reload quietly reset the board and my assertions went stale. I lost a while to that before spotting it.

## Try this today

If something on your phone feels wrong but nothing is technically broken:

1. **Write down what each feature thinks it owns.** Mine: "the card owns horizontal drags", "the board owns horizontal swipes". Seeing them side by side ended the debugging.
2. **Don't pick a winner — find the disambiguator.** Speed, stillness, direction, distance. Something the user is already doing.
3. **Ban solutions that add a tap.** Make that a rule before you evaluate, or the easy-to-build one wins.
4. **Then use it with your actual thumb.** Mine found the flaw in minutes that the spec hid completely.

## What I'd tell myself two years ago

I'd have gone hunting for the bug — reading the drag code, adding logs, trying to make one gesture "work properly."

There was no bug. There was a decision I hadn't made yet.

The other half is that the spec was wrong in a way only a thumb could reveal. It read perfectly. It felt possessed. **Some categories of correctness only exist in your hand**, and no amount of re-reading gets you there.
