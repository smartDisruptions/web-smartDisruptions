---
title: You don't get replaced for being slow at AI
slug: you-dont-get-replaced-for-being-slow
excerpt: The worry I keep hearing is 'AI is moving fast and I'm behind.' That's the fixable problem. The real risk is producing more than ever and not being able to tell when any of it is wrong. Three skills fix that — and there's a drill in this post that makes you do all three.
category: Working With AI
publishDate: 2026-08-01
tags: [ai, workflow, skills, interactive]
status: published
channels:
  - name: linkedin
    status: done
    note: "I wrote a post about catching errors that read as correct. Then, building the interactive drill that goes with it, I nearly shipped one.\n\nI had the AI write a test harness for the drill: 56 automated checks, running the whole thing twice — once answering everything perfectly, once getting everything wrong. Not because I doubted it. Because the post is about not trusting things that look fine.\n\nThe tests caught a real bug. Three overlapping style rules were fighting over one button's colour, and in one combination of light/dark mode and browser setting the text could have come out unreadable. It looked correct in the theme I happened to be working in. I'd never have found it by eye.\n\nAnd one more at my own expense: the first test run reported a failure. I went to fix the code, and the code was right. My test had the arithmetic wrong.\n\nSo the check on the AI's work was itself wrong on the first pass. Verification isn't something you switch on and then trust forever. It's a habit that also needs checking.\n\nOne thing to try today: stop accepting first drafts. Push back three times on every output, the way you would with a capable new hire.\n\nThe full write-up is in the first comment."
    comment: "The post is about the three skills that decide whether AI multiplies you or just makes more work — and it ends in a ten-minute drill: six questions about your own last week, then pick real context out of decoys, mark the planted errors in a report that reads perfectly, and split a real task. Nothing saved, nothing sent. https://www.smartdisruptions.com/content/you-dont-get-replaced-for-being-slow"
  - name: substack
    status: planned
    note: "I built an interactive drill to go with a post about catching errors that read as correct. Then I had the AI write a test harness for the drill: 56 automated checks, running the whole thing twice, once answering everything perfectly and once getting everything wrong. Not because I doubted it. Because the post is about not trusting things that look fine.\n\nIt caught a real bug. Three style rules were fighting over one button's colour, and in one combination of light/dark mode and browser setting the text could have come out unreadable. It looked completely correct in the theme I was working in.\n\nThen the first run reported a failure that wasn't one. The code was right. My test had the arithmetic wrong.\n\nVerification isn't a switch you flip once and trust forever. It's a habit that also needs checking.\n\nhttps://www.smartdisruptions.com/content/you-dont-get-replaced-for-being-slow"
  - name: x
    status: planned
    note: "1/ The worry I keep hearing is \"AI is moving fast and I'm behind.\" Being late to a tool is a weekend, maybe a month. The version I'd actually worry about: you produce more than you ever could, and you can't tell when any of it is wrong.\n\n2/ I wrote that up, then built an interactive drill to go with it — and nearly shipped that exact failure inside it. I had the AI write a test harness: 56 automated checks, running the whole thing twice, once answering everything right, once everything wrong.\n\n3/ It caught a real bug. Three overlapping style rules were fighting over one button's colour. In one combination of light/dark mode and browser setting, the text could have come out unreadable. It looked completely correct in the theme I was working in.\n\n4/ Then the part at my own expense. The first run reported a failure. I went to fix the code, and the code was right — my test had the arithmetic wrong. The check on the AI's work was itself wrong on the first pass.\n\n5/ Which is why expertise in your own field gets more valuable, not less. It's what lets you be the checker instead of the checked. Don't abandon your craft to become \"an AI person.\" Bring AI into your craft.\n\n6/ Verification isn't something you switch on and then trust forever. It's a habit that also needs checking."
    comment: "Full write-up, plus the ten-minute drill that makes you practise it — nothing saved, nothing sent anywhere: https://www.smartdisruptions.com/content/you-dont-get-replaced-for-being-slow"
heroImage: /images/content/you-dont-get-replaced-for-being-slow-hero.webp
heroImageAlt: "A card headed \"Three things in this are wrong\" over three phrases from a quarterly report, each underlined in red and labelled with its failure mode: invented source, asserted cause, no denominator"
ogImage: /images/content/you-dont-get-replaced-for-being-slow.webp
---
I keep hearing the same worry, phrased a dozen different ways. *AI is moving fast and I'm behind.*

I don't think that's the real risk.

Being late to a tool is a fixable problem. It's a weekend. Maybe a month. I've been late to plenty of them and caught up fine.

Here's the version I'd actually worry about: **you can produce more than you ever could, and you can't tell when any of it is wrong.**

That's the genuinely dangerous spot. Not because you're slow — because at that point you're a router. Work goes in, work comes out, and you're not adding a judgment the machine didn't already have.

I've been building with AI every day for about three years now. Client sites, games with my son, a review system for local businesses, the site you're reading this on. Three skills have separated the days where AI multiplied me from the days where it just generated more stuff I had to clean up.

## 1. Loading context

Most bad output isn't a bad model. It's starved input.

I used to send one-line requests and take roughly what came back. Then I'd blame the tool for being generic. The tool was being generic because I'd told it nothing — it had never seen my project, my client, or a single thing I'd written that actually worked.

The fix isn't clever phrasing. It's volume of real material: the actual documents, the real numbers, the constraints, and two examples of what "good" looks like from your own past work.

Showing beats telling. Every time.

## 2. Catching the confident error

This is the one that actually decides things.

Current models are extremely good at producing text that *reads* correct. When they're wrong, they're rarely wrong in a way that looks wrong — the fabricated statistic arrives in the most authoritative sentence in the paragraph. That's a known failure mode, not a knock on the tools, and it's exactly why the checker matters.

If you can't reliably separate correct from merely fluent, you're not supervising the output. You're forwarding it.

Here's the part I didn't expect: this makes deep expertise in your actual field *more* valuable, not less. Your expertise is the thing that lets you be the checker instead of the checked. So don't abandon your craft to become "an AI person." Bring AI into your craft.

## 3. Splitting the work

Most people hand over a whole task or none of it. The leverage is in the seam.

Mechanical work goes over completely. First drafts come back for editing. And some things never leave your desk at all — not because they're hard, but because handing them over costs you something. Telling your boss the launch slipped is a trust transaction. Outsourcing it doesn't save time, it spends credibility.

## Don't take my word for any of that

Reading about verification and being able to verify are unrelated skills. So rather than list these and hope, here's a drill that makes you do all three.

Six questions about what you actually did last week, then three exercises: pick real context out of decoys, mark the planted errors in a report that reads perfectly, and split a real task.

It takes about ten minutes. Nothing is saved and nothing is sent anywhere.

[[embed:directing-drill]]

## What building this taught me about the thing it teaches

Worth saying how this got made, because the process turned out to be the point.

I asked for the list of skills first. Got a good one. Then I asked whether it could become something interactive, and the first instinct — mine and the AI's — was a quiz.

A quiz would have been worthless. You can ace a quiz about verification and still not catch a single fabricated number. So we threw that out and built drills instead, where the only way through is to actually do it.

That's skill #3 in miniature. The AI was ready to build the wrong thing well. Deciding *what* to build was the part that stayed mine.

Then skill #2 showed up, uninvited.

I had it write a test harness for the drill — 56 automated checks, running the whole thing twice: once answering everything perfectly, once getting everything wrong. Not because I doubted it. Because the whole post is about not trusting things that look fine.

The tests caught a real bug. The button colour was being set by three overlapping style rules fighting each other, and in one combination of light/dark mode and browser setting the text could have come out unreadable. It looked completely correct in the theme I happened to be looking at. I'd never have found it by eye.

That's the exact failure mode this post is about, sitting inside the tool that teaches it.

And one more, at my own expense: the first test run reported a failure. I went to fix the code — and the code was right. My *test* had the arithmetic wrong.

So the check on the AI's work was itself wrong on the first pass. Which is the honest version of all of this. Verification isn't a thing you switch on and then trust forever. It's a habit that also needs checking.

## What I'd actually do this week

You'll overcomplicate this if you go looking for a prompt engineering course. Skip that. The whole thing is a practice, not a curriculum.

Pick one tool. Use it on real work — your actual inbox, your actual reports — not toy examples.

Then, one week at a time:

1. **Paste in three times more context than feels necessary.** Notice the difference. It's bigger than any wording change you'll ever make.
2. **Stop accepting first drafts.** Push back three times on every output, the way you would with a capable new hire.
3. **Find the task you repeat most and build a reusable prompt for it.** That's where the actual time savings live — not in any single conversation.
4. **Teach one person what you learned.** Teaching is how you find out what you actually know.

That's it. Four weeks, no course, no new subscription.

The whole thing compresses to one sentence: **get very good at directing work you didn't do yourself, and stay expert enough to know when it's wrong.**

Nobody's coming for the person who can do both.