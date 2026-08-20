---
title: AI wrote every line of my game. These seven steps were mine.
slug: escape-room-build-playbook
excerpt: The Pembroke File shipped as one 2,673-line file, and AI wrote all of it. What I supplied was seven decisions — and if you want to build a game like this, those are the transferable part. The how, the what, and the why of each step. None of them is code.
category: Working With AI
publishDate: 2026-08-20
tags: [ai, games, guide, playtesting]
status: staged
channels:
  - name: linkedin
    status: planned
    note: "I shipped an escape-room game without writing a line of code. If you want to build one, here are the seven steps that actually mattered:\n\n1. Pitch the idea as a question, not a spec. \"Is this possible? Can it be polished?\" A question invites the AI to improve the idea instead of obediently building a bad one.\n\n2. Get to a playable version immediately. You can't playtest a plan.\n\n3. Name the one rule everything serves. Mine: every answer lives in a document you have to actually read.\n\n4. Playtest every build, and speak as a player. \"The hint is too strong.\" \"This puzzle printed its own answer.\" That's the whole job, and the AI can't do it — it doesn't get bored, confused, or annoyed. You're the only instrument in the room that measures fun.\n\n5. If the theme fights the mechanic, replace the theme. Mine started as my résumé. The résumé didn't survive.\n\n6. Do a senses pass: a reward when a drawer opens, sound, a flourish at the end.\n\n7. Ship with proofs. The sliding puzzles were verified solvable by brute-force search before anyone else touched the game.\n\nThe AI supplies unlimited construction. You supply judgment.\n\nFull guide in the comments, with the receipts for each step."
    comment: "The step-by-step, with the actual playtest notes behind each one — and the game itself, playable: https://www.smartdisruptions.com/content/escape-room-build-playbook"
  - name: substack
    status: planned
    note: "An AI wrote all 2,673 lines of my escape-room game. My whole contribution was seven decisions: pitch the idea as a question, get playable fast, name the one rule everything serves, playtest out loud as a player, swap the theme when it fought the mechanic, do a senses pass, and ship with the puzzles proven solvable.\n\nThe step people skip is four. After every build I played it and said what felt wrong in plain speech — \"the hint is too strong,\" \"this puzzle's answer is literally in bold.\" The AI never gets bored or confused, which means it can't catch any of that. You're the only instrument in the room that measures fun.\n\nThe how, what, and why of each step: https://www.smartdisruptions.com/content/escape-room-build-playbook"
heroImage: /images/content/escape-room-build-playbook-hero.webp
heroImageLight: /images/content/escape-room-build-playbook-hero-light.webp
heroImageAlt: A seven-step rail — pitch, skeleton, core rule, playtest, story, senses, ship — with playtest and story marked as the steps where the game got good; none of the steps are code.
ogImage: /images/content/escape-room-build-playbook.webp
liveAt: 2026-08-22T16:00:00.000Z
---
There's a five-drawer mystery game leading [the arcade on my site](https://www.smartdisruptions.com/games) called The Pembroke File. An AI wrote all 2,673 lines of it. It didn't start as a mystery at all — it evolved out of an interactive-résumé experiment, and [the story of how the game ate the résumé](https://www.smartdisruptions.com/content/escape-room-ate-my-resume) is its own post.

This one is the other half. Not what happened — what I'd tell you to *do* if you wanted to build a game like this. Seven steps, each with the how, the what, and the why.

Here's the part worth saying up front: none of these steps is code. The code was never the bottleneck. The steps are the judgment calls the code can't make.

## 1. Pitch the idea as a question, not a spec

**What:** before anything gets built, put the idea to the AI the way you'd put it to a colleague, and ask it straight: does this have legs?

**How:** my opening prompt ended with three questions — what do you think of this idea? Is it possible to make it look nice and polished? Can it actually work? Only after it answered did I say *"yes. build it."*

**Why:** a question invites the AI to stress-test and improve the idea. A spec invites it to obediently build whatever you typed, including the flaws. Five minutes of "is this possible" told me the shape of the thing before I spent a day inside it.

## 2. Get to a playable version immediately

**What:** a rough, working skeleton — real clicks, real puzzles, ugly is fine.

**How:** one prompt. The words were literally "build it."

**Why:** every meaningful decision I made in this build came from *playing* a version, not from reviewing a plan. You cannot playtest a document. The sooner something runs, the sooner your taste has something to grab.

## 3. Name the one rule everything serves

**What:** a core rule the whole game answers to. Mine: **every answer lives in a document you have to actually read.** No trivia, no outside knowledge — the room contains everything, and reading is the game.

**How:** state it, then enforce it in review. When the combination dial sat above the document it belonged to, I had it moved below — so you meet the information before the lock. When a puzzle let players skip the text, I flagged it: the puzzles weren't making anyone read.

**Why:** without one organizing rule, an escape room is a pile of unrelated minigames. And the rule doubles as your test for every new puzzle: does this make the player read, or let them skip? If you're building your own game, the rule will be different — but have one, and ask every feature to justify itself against it.

## 4. Playtest every build, and speak as a player

This is the longest step because it *was* the build. After every version I played it and said what felt wrong, in plain speech — much of it dictated out loud. What those notes taught me generalizes:

**Set a hint policy and hold it.** Mine took three notes to land, ending with: *"I've decided you should not give the answer in the hints. After the 3rd hint, you should just stop giving any better hints."* A hint that solves the puzzle deletes the game — the player didn't escape, the hint did.

**Hunt for puzzles that solve themselves.** One note printed its own answer at the bottom. Another puzzle's answer was, in my words at the time, *"literally in bold"* on the page. No error, no crash — just typography quietly defeating the design. Only playing catches this.

**Kill what confuses you.** A cipher puzzle stumped me — me, the person it was built for: *"Solving the cipher doesn't make any sense to me."* We didn't tune it. We deleted it and put a circuit-repair puzzle in its place. If the designer can't solve their own puzzle, no player will, and confusion isn't difficulty — it's a bug wearing difficulty's clothes.

**Push toward hands, not quizzes.** At one point I caught the whole back half drifting into Q&A: *"it almost felt like it was a question and answer thing… we need to do more of a physical puzzle where we have to move objects and search for clues."* That note became a page torn into twelve pieces you reassemble, a jammed sliding tray, a lamp circuit you rebuild, a pencil rubbing that raises a name off a blank pad. Manipulating things gives your fingers something to do while your head thinks. Answering questions feels like a test.

**Sweat the ergonomics.** Instructions above the lock, not below. Opening a drawer zooms to the document, not the lock. A reset button, because I needed one. A lost player doesn't blame the game — they blame themselves, and then they leave.

**Why this step matters most:** the AI never gets bored, confused, or annoyed. It cannot feel a hint being too generous or a puzzle being tedious. You are the only instrument in the room that measures fun, and the reading is only taken when you play.

## 5. If the theme fights the mechanic, replace the theme

**What:** my read-everything mechanic was invented to make people read a résumé. It turns out a résumé is homework, and no puzzle fixes that.

**How:** one prompt, late in the build: redo the story completely — same puzzles, make it a stolen-diamond mystery. The career history became case documents, and the reading problem dissolved, because in a mystery, reading the case *is* the game.

**Why:** mechanics and theme have to pull the same direction. If players keep skipping the thing your game is about, the fix might not be a better puzzle — it might be a better reason to care. Swapping the story cost one prompt. Fighting the theme had cost me the whole day. [The full story of that kill is here.](https://www.smartdisruptions.com/content/escape-room-ate-my-resume)

## 6. Do a senses pass before you call it done

**What:** the layer that makes it feel like a game instead of a form: every drawer now produces a drawn exhibit when it opens — a piece of physical evidence as the reward — a case-closed flourish plays when the last drawer opens, and the sound is synthesized right in the browser, no audio files.

**How:** these were my last prompts of the build, after the puzzles already worked. One of them was just: make sound the default, with the choice remembered.

**Why:** the reward is the paycheck for every solved lock — without it, solving feels like filing. And default-on sound was its own small call: a game that starts muted hides half its craft from every player who never finds the toggle.

## 7. Ship with proofs, not hope

**What:** before the game went near my site, the parts that could silently fail got proven. The sliding-block puzzles were verified by brute-force search — the computer tried every board state to confirm each one is solvable, and in how many moves, before a stranger ever touched it. Keyboard paths exist for every puzzle. Progress saves, so closing the tab isn't a punishment. And the whole thing is one HTML file with zero dependencies — you could save the page and email it.

**How:** ask for the proof, not the vibe: "is this puzzle solvable" is a question a computer can answer exhaustively. Then put it at a real URL and give it a place on your own site.

**Why:** an unsolvable puzzle is the one bug playtesting can't catch — you already know the answers. The single file means there's nothing to install and almost nothing to break. And shipping somewhere strangers can reach is the step that makes it a game at all; [mine leads the arcade](https://www.smartdisruptions.com/games).

## The whole thing in one paragraph

**What** you're building is a loop: read, solve, unlock, get rewarded. **How** you build it, when AI writes the code, is playtest notes in plain English after every version — a hint policy, a self-solving-puzzle hunt, a kill list, a bias toward hands over quizzes. **Why** it works: the AI supplies unlimited construction, and you supply the judgment it structurally can't — what's too easy, what's tedious, what deserves to be cut.

If you want to try this today: pitch a game idea to an AI tonight as a question, get one playable room by the end of the session, and from then on only respond as a player. You'll be surprised how far "I don't like it" scales.
