---
title: I turned my résumé into an escape room — the game got good when I cut the résumé
slug: escape-room-ate-my-resume
excerpt: I pitched my AI an escape room where reading my résumé is how you get out. Thirty-three prompts later, a stolen-diamond noir leads my site's arcade — and the résumé is gone. I never wrote a line of code. What I did instead turned out to be the actual job.
category: Build Breakdown
publishDate: 2026-08-21
tags: [ai, games, playtesting, shipping]
status: published
channels:
  - name: linkedin
    status: planned
    note: "I asked an AI: what if my résumé was an escape room? Puzzles unlock the sections, and the answers hiding in my work history are how you get out.\n\nIt said the idea could work. I said build it.\n\nThen I spent the day doing the only job left: playing it and saying what felt wrong. Thirty-three prompts from idea to shipped, and not one of them is code. \"The hint is too strong.\" \"Nobody's reading the notes.\" \"This puzzle's answer is literally printed in bold.\"\n\nThe hardest note came near the end: the résumé itself wasn't working. Even gamified, nobody wants to read a résumé. So I cut it — kept every puzzle, replaced my career with a stolen diamond and a vanished insurance investigator.\n\nThe mechanic I invented to make people read my résumé turned out to work better on a story people actually want to read.\n\nIt shipped as one HTML file — draggable chain physics, synthesized sound, five locked drawers — and it leads the arcade on my site now.\n\nFull write-up in the comments, with the whole prompt trail."
    comment: "The Pembroke File is playable from the arcade, and the write-up has the prompts verbatim — including the one that killed the résumé: https://www.smartdisruptions.com/content/escape-room-ate-my-resume"
  - name: substack
    status: planned
    note: "I had an AI build an escape room where reading my résumé is how you get out. Thirty-three prompts from idea to shipped, and none of them were code — every one was a playtest note. \"The hint is too strong.\" \"The answer is literally printed in bold.\"\n\nThe last big note was the hardest: the résumé itself wasn't working. So I cut it. Kept every puzzle, swapped my career for a stolen diamond.\n\nThe part I built to force people to read my résumé works better on a story they want to read. That trade — the premise for the mechanic — was the best move of the build, and the AI couldn't have made it. It doesn't dislike things. That turned out to be my whole job.\n\nhttps://www.smartdisruptions.com/content/escape-room-ate-my-resume"
heroImage: /images/content/escape-room-ate-my-resume-hero.webp
heroImageLight: /images/content/escape-room-ate-my-resume-hero-light.webp
heroImageAlt: "Split card: the assignment — my résumé as an escape room — against what shipped: a stolen-diamond noir with the résumé cut, the same puzzles, and thirty-three prompts of which none were code."
ogImage: /images/content/escape-room-ate-my-resume.webp
liveAt: 2026-08-21T13:30:00.000Z
---
There's a game on my site now called The Pembroke File. A thirty-four-carat diamond leaves a museum in three minutes of dark, the insurance investigator who worked the claim disappears, and his locked filing cabinet is sitting in front of you — five drawers, five locks, and every answer written somewhere in the documents you've already opened.

It started life as my résumé.

## The pitch

I'd been trying to build an interactive résumé for a web-design showcase — something with movable parts and sound, proof of what AI can build in a browser. The mockups were fine. Fine wasn't the point.

So I pitched my AI something stranger, and the prompt is worth showing verbatim, stumbles and all:

> *"What if we build an escape room type of puzzle? basically doing certain puzzles can unlock certain parts of the resume. maybe the puzzle could even ask simple questions, and the answers on the resume help you escape the escape room. What do you think of this idea? Is it possible to make this look nice and polished? And is it possible for this to work as a resume?"*

Notice what I'm doing there: I'm not speccing a feature. I'm asking a colleague whether an idea has legs. It said the idea could work and sketched how.

My entire reply: *"yes. build it."*

## Thirty-three prompts, zero code

From that pitch to the finished game on my site's arcade, the transcript shows thirty-three prompts from me. I went back and read every one. Not a single line of code. No file names, no functions, no talk of frameworks.

What they are instead is playtest notes. I'd play the latest build, feel where it went wrong, and say so in plain speech — many of them dictated out loud, which you can tell because the transcription stumbles are still in there:

> *"I like it, but the hint is too strong. it should take maybe 3 hints before it just gives the full answer."*

> *"I think the dial needs to be under the information in the cabinet. That way… they read the information first before they get to the dial."*

> *"The note itself has the answer at the bottom of the note. It tells you exactly where to look."*

That last one is my favorite bug of the build: a puzzle that politely printed its own solution. No error, no crash — just a game quietly refusing to be a game. Nothing but a person playing it would ever catch that.

Some notes were pure taste, and I had to say the same one twice:

> *"Can we create a different puzzle for drawer two? I just don't like it… the number is literally in bold, and it's the easiest thing in the world."*

The AI never pushed back with "but it works." It rebuilt the drawer. When a cipher puzzle genuinely confused me — *"Solving the cipher doesn't make any sense to me"* — we didn't fix it. We deleted it and put a circuit-repair puzzle in its place, which is more fun anyway.

## The fight I kept losing

Underneath all those notes was one recurring problem: nobody was going to read the words.

The whole premise depended on it — the answers live in the résumé, so escaping means reading it. But I kept catching the puzzles letting the player skip the text: *"I don't think these puzzles are getting them to read the text in the notes enough."* I asked for the notes to be rewritten so they'd read like a real piece of a résumé and still work as clues — *"I need it to sound congruent."*

Congruent never quite arrived. A résumé is a document you read because you have to. Bolting puzzles onto it doesn't change that; it just makes the homework longer.

## The kill

Prompt twenty-seven of the thirty-three, and the best decision of the build:

> *"can we completely redo the story and make it a cool mystery story instead of the resume idea. Lets just make it a good story that talks about a stolen diamond or something like that. Use the same puzzles, but make the story feel related to the puzzles."*

Same locks, same drawers, same mechanics. The career history became case documents — a torn-up route reconstruction, a door-to-door canvass that came back empty, an appraisal proving the stone was glass. And the reading problem I'd been fighting for a day dissolved, because in a mystery, reading the case *is* the game. Nobody skips the evidence in a whodunit.

Here's the part I keep turning over: the mechanic I invented to force people to read my résumé — every answer is written in documents you have to actually open and read — turned out to be a genuinely good game mechanic. It just worked better on words worth reading. The premise was the problem. The mechanic was the product.

## What shipped

The Pembroke File is one HTML file — 2,673 lines, no frameworks, no dependencies, nothing to install. You could save the page and email it to someone. Inside that one file: a chain you can actually grab and pull, swinging on simulated physics; sound effects synthesized in the browser rather than loaded from audio files; sliding-block puzzles the AI brute-force-checked before shipping to prove they're solvable in a known number of moves; keyboard controls for every puzzle; and progress that survives closing the tab.

I asked for exactly one more thing after the story change — *"maybe the cabinet that's opened should also include something visual that is evidence of the claim"* — and each drawer now produces a drawn exhibit when it opens.

It [leads the arcade on this site](https://www.smartdisruptions.com/games), and you can [play it here](https://app-field-office.vercel.app). The résumé experiment isn't dead, by the way — it just moved out of the game, where it never belonged.

## What I actually contributed

The AI wrote all 2,673 lines. It's still my game, and I don't say that as a technicality.

The idea was mine. The hint policy was mine — three escalating hints, then stop, never the answer. The difficulty curve was mine, one "too easy" at a time. The rule that you read before you unlock was mine. And the kill was mine — the willingness to cut the founding premise of the whole project because the thing it grew into was better than the thing I asked for.

An AI can build almost anything you describe now. What it can't do is dislike things. Thirty-three prompts, and the ones that mattered most all reduce to *"I played it, and something's wrong here"* — a sentence that only means something coming from someone with a stake in how it feels.

If you're building something interactive with AI, here's the version you can try today: give your feedback only as a player. Not "change the function," not "move the div" — just what felt wrong and where. It's the highest-leverage sentence in the transcript, and anyone can write it.

And when one feature keeps fighting you no matter how many times it's rebuilt — ask whether the premise is the problem. The best fix I made all week was deleting the idea the project started with.
