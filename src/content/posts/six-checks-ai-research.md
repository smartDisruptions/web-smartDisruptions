---
title: AI research reads like the truth. Here are six checks I run before I believe it.
slug: six-checks-ai-research
excerpt: I had a research report with 45 claims in it. Nine were false and twelve couldn't be checked at all — because not one of the agents had opened a single original document. It read perfectly. Here are the six checks I run now, and the one that catches the most.
category: Working With AI
publishDate: 2026-08-22
tags: [ai, research, verification, workflow]
status: staged
channels:
  - name: linkedin
    status: planned
    note: "I asked AI to research a market for me. It came back with 45 claims, headings, figures, sources. It read like something a person spent a week on.\n\nNine of those claims were false. Twelve couldn't be checked at all.\n\nThe cause was dull: the research agents' web access was broken that day, so not one of them had opened a single original document. They wrote from what they already knew. Nothing warned me. The report looked exactly as good as a correct one.\n\nSix checks I run now, in order:\n\n1. Ask what it actually opened. Not what it cited — what it opened. Re-running that report with working access took it from 0 original documents to 83.\n\n2. Send a second pass whose only job is to refute, not review. Ask the session that wrote it and it defends its own work.\n\n3. Make it list every source, then count them. One of my reports cited 68 sources during the research and printed 11.\n\n4. Publish the corrections next to the conclusion.\n\n5. When the check didn't run, say so out loud. One of mine says on the page that its verification pass failed.\n\n6. Be most suspicious of the claim everybody repeats. The three that died in my re-run were all consensus.\n\nThe useful part: almost nothing comes back a lie. It comes back true-but-wrong.\n\nFull guide in the comments."
    comment: "The six checks with the receipts behind each one, and the reports themselves — method, verification ledger and every source visible on the page: https://www.smartdisruptions.com/content/six-checks-ai-research"
  - name: substack
    status: planned
    note: "A research report I had AI produce contained 45 load-bearing claims. Nine were false. Twelve couldn't be checked. The reason was mundane: the agents' web access was broken that day, so not one had opened an original document — and the report read exactly as well as a correct one would have.\n\nThat's the part worth sitting with. There was no warning sign, because confidence is free and being right isn't.\n\nSix checks I run now: ask what it actually opened (re-running took mine from 0 documents to 83); send a second pass to refute rather than review; make it list its sources and count them; publish the corrections beside the conclusion; say plainly when the check didn't run; and be most suspicious of the claim everyone repeats.\n\nAlmost nothing came back a lie. It came back true-but-wrong — a real number that didn't mean what I thought.\n\nhttps://www.smartdisruptions.com/content/six-checks-ai-research"
heroImage: /images/content/six-checks-ai-research-hero.webp
heroImageLight: /images/content/six-checks-ai-research-hero-light.webp
heroImageAlt: "Split card: the research pass opened zero original documents, and handed back 45 confident claims — nine of them false, twelve uncheckable, with no warning that anything was wrong."
ogImage: /images/content/six-checks-ai-research.webp
---
There's a section on my site called [Market Storm](https://www.smartdisruptions.com/market-storm), where AI agents research what's happening in the AI industry and I publish what survives. Open any report and you can see how it was made: who researched it, which claims got attacked, which ones broke, and every source it used.

That section is built the way it is because of a report I couldn't publish.

## The one that read perfectly and wasn't

I'd had AI produce a research report on whether the enormous spending on AI is sustainable or a bubble. It had 45 load-bearing claims — claims the conclusion actually rested on, as opposed to background. It had figures, structure, sources. It read like something a person had worked on for a week.

When I checked it: **nine of those claims were outright false, and twelve couldn't be verified at all.**

The cause was dull. The research agents' web access was broken during that run, so not a single one of them opened a single original document. They wrote from what they already knew and from second-hand descriptions of the documents. Nothing crashed. Nothing warned me.

That's the part I keep coming back to. It didn't look like a broken report. **Confidence is free; being right isn't.** A hollow report and a solid one arrive looking identical, which means you cannot tell them apart by reading — only by checking.

I re-ran the same question with the tools actually working. Same method, 15 agents, five named viewpoints deliberately at odds with each other — including a short seller, whose whole job is to argue the thing is overvalued.

| | first pass | re-run |
|---|---|---|
| original documents opened | 0 | 83 |
| claims refuted | 9 | 0 |
| claims that couldn't be checked | 12 | 0 |

Not one claim collapsed when it was checked against the document itself rather than against coverage of it. That comparison is the most useful thing that section has produced, and it isn't about finance at all.

Here are the six checks I run now. None of them needs code, and you can do all six in a chat window.

## 1. Ask what it actually opened

**What:** not what it *cited* — what it *opened*. Those are different, and the gap is where bad research lives.

**How:** ask straight out: which documents did you actually retrieve and read, and which are you recalling? Then ask for the count. Zero is an answer you will get more often than you expect, and it is the single fastest tell.

**Why:** an AI describing a document from memory sounds exactly like an AI quoting one in front of it. My first pass opened nothing and read fine; the re-run opened 83 and the false claims disappeared. Same method, same model, same question — the only variable was whether it had the documents.

## 2. Send a second pass whose only job is to refute

**What:** a fresh session that never wrote the thing, told to treat every claim as false until a source proves otherwise. Not "review this" — *attack this*.

**How:** paste the report into a new chat and say: assume every claim here is wrong until you find an original source that proves it; tell me which ones you cannot support. In my setup that runs as separate agents, one per claim, but the mechanism is nothing fancier than a fresh session with an adversarial instruction.

**Why:** ask the session that wrote something to check it, and it defends its own work — it's agreeing with its earlier self, which is the one thing it's guaranteed to do. And "review this" invites polish; "refute this" invites a fight. An earlier report of mine survived exactly one of eight claims intact and had its central argument withdrawn — a coming crisis that turned out to exist only in analysts quoting each other, with no original document behind it anywhere.

**Watch for "true, but."** Almost nothing comes back a flat lie. It comes back *true-but-wrong*: a real number that doesn't mean what the sentence implies. That's the failure mode a skim can never catch, and it's why this check finds the most.

## 3. Make it list every source — then count them

**What:** the full list of what the research actually touched, not a tidy handful at the bottom.

**How:** ask for every source, then compare that number against the research itself. When I checked mine, one report had cited 68 different sources while researching and printed 11 of them. Worse, all 11 were from the company being written about, while the text made comparisons to three competitors that a reader had no way to check.

**Why:** a short source list isn't neat, it's a hole in the page — the reader can verify the parts you kept and not the parts you dropped. I recovered the full lists from the research transcripts and republished them: one report went from 11 sources to 50, another from 8 to 42. Nothing in the conclusions changed. What changed is that a stranger can now audit them.

## 4. Publish the corrections next to the conclusion

**What:** show what the refutation pass did — confirmed, corrected, refuted — right there on the page, not in a private file.

**How:** every Market Storm report carries a verification ledger: how many claims were attacked, how many survived clean, which ones were corrected, and what the correction was.

**Why:** a report that shows only its conclusion is asking to be trusted. A report that shows its corrections is showing its work — and the corrections are usually more interesting than the conclusion, because they're where the thing you assumed turned out to be off. It also keeps me honest: knowing the corrections get printed changes what I'm willing to claim.

## 5. When the check didn't run, say so out loud

**What:** the disclosure that a step you advertise didn't happen this time.

**How:** on one report, every one of the six skeptic agents hit a limit and quit before attacking anything. Rather than quietly ship it, I verified each claim by hand against the original filings and the report says on the page: the adversarial pass did not run on this report — single-pass checking, not adversarial checking, and weaker for it.

**Why:** a check nobody watches isn't a control, it's a belief. And the honest version costs almost nothing: a reader who's told the verification was weaker can discount it themselves. A reader who finds out later stops believing everything else too.

## 6. Be most suspicious of the claim everybody repeats

**What:** the "everyone knows" claim — the one so widely repeated that nobody re-checks it.

**How:** track each claim back to an original document, not to another article. In my re-run, three widely-repeated arguments died on contact: one company was said to be stretching how it accounts for its equipment to flatter profits (it did the opposite, and took a $1.0 billion hit for it); a coming wall of power shortages turned out, in the government's own monthly table of new power plants, to be a queue and not a wall — of 590 units due in the first half of this year, 54% arrived, the median one ran four months late, and 0.7% were cancelled; and a widely-quoted productivity figure came from a model built on people's own guesses about what would have happened otherwise, which its authors say plainly in the paper.

**Why:** consensus claims are exactly the ones an AI is most likely to reproduce, because they appear everywhere in what it learned from. Repetition and evidence look identical from the inside. If a claim is load-bearing and everyone repeats it, that's a reason to check it first, not last.

## The whole thing in one paragraph

**What** you're checking is whether the words came from documents or from the air. **How** you check it: ask what it opened, send a second pass to refute rather than review, count the sources, print the corrections, disclose when the check didn't run, and go hardest at the claims everybody agrees on. **Why** it matters: AI research fails by being *plausible*, not by being obviously broken — so the only thing that separates a good report from a confident one is a check you actually ran.

**Try this tonight.** Take the last research answer an AI gave you — a market, a competitor, a product you were comparing. Open a brand-new chat, paste it in, and say: *assume every claim here is false until you find an original source that proves it.* Then read for the phrase "true, but."

I've never once run that and gotten everything back intact. That's not a reason to stop using AI for research. It's the reason to keep the second pass.
