export interface ContentEntry {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishDate: string;
  tags: string[];
  // On-page hero: a textless visual (the artifact/screenshot), shown under the
  // headline. Should NOT repeat the title — the H1 already carries the words.
  heroImage?: string;
  heroImageAlt?: string;
  // Social/OG card: the title-baked-in version, used only for link previews
  // (LinkedIn, X, Google Discover) where headline-on-image helps click-through.
  // Falls back to heroImage when unset.
  ogImage?: string;
}

export const contentEntries: ContentEntry[] = [
  {
    slug: 'what-ai-handed-back',
    title:
      'My AI built the whole thing — then handed me back the list of what it couldn\'t do',
    excerpt:
      "Twice in one day, my AI built something end to end — a payment system, then a whole website — and both times handed me a short list of what it couldn't do. Nothing on either list was hard. Every item was the same three things — and they map exactly where your job with AI actually is now.",
    body: `Twice in one day, my AI built something end to end — and both times, the last thing it did was hand me a short list of what it *couldn't* do.

Not because those things were hard. The AI had just done genuinely hard things — built a working payment system, rebuilt an entire website, put both on live servers. The list it handed back wasn't the hard stuff. It was a *different kind* of stuff. And once I saw the shape of it, I understood the real division of labor between me and the AI better than any explainer had managed.

## The first handoff: switching on online ordering

That morning, the job was taking a friend's food-truck online-ordering system live — cart, card payment, order confirmation, the works. The AI had built and tested all of it. My friend had even run a real test order through it, start to finish. The code was done.

Then it handed me a list. Six steps. Here's what was on it:

- **Sit with my friend and pull his payment credentials.** These live inside *his* account with the card-processing service — I can't get them, and honestly I shouldn't; they're his.
- **Decide, with him, where the menu comes from** — does he want to edit his own prices, or should we keep them in the code? His business, his call.
- **Put those credentials into my hosting account** — and get one setting exactly right, because the wrong value there would start charging real money on the demo.
- **Press the button that makes it live.** One click, and the site takes real orders. That click had to be mine.
- **Prove it's real with my own card** — buy the cheapest thing, watch it ring up on his register, then refund it.
- **Have him announce it** to his customers. An unannounced feature earns nothing.

Look at that list. Not one of those is "hard" the way building a payment system is hard. But every single one is something the AI structurally *can't* do — because each one runs on someone's account, someone's money, or someone's say-so.

## The second handoff, same day: launching my own site

Hours later, different project — putting my own site live at its real web address. Again the AI had done the heavy lifting: rebuilt the site, merged the changes, pushed it to live servers, even noticed on its own that my web address was still pointing at my old hosting.

And again, a short list came back. Three things this time:

- **Log into my hosting dashboard and add my web address.** My login. The AI doesn't have it.
- **Point that web address at the new site** — done inside *my* domain account, the one only I can sign into.
- **Publish it under my own name** — put the link somewhere a real person would actually see it.

Same shape as the first list. Accounts only I can log into. And one act that has to be mine: putting my name on it and saying "this is live."

## The pattern in what stayed mine

Here's the thing I keep coming back to. When people ask "what can AI actually do?", they picture a line between *hard* and *easy* — the AI takes the hard technical stuff, you keep the simple bits. That's not the line at all.

The AI carried the hard, technical, tedious work all the way to the doorstep — twice. What it handed back wasn't easier. It was **mine in a way that has nothing to do with difficulty.** Every leftover item was gated on one of three things:

- **The keys** — credentials and accounts that belong to me, or to someone else. The AI can't hold them, and it shouldn't.
- **The money** — spending real dollars, or a setting where a mistake spends them for you.
- **The final yes** — the irreversible go/no-go, and putting your own name behind it.

That's the real division of labor with AI. Not hard versus easy. **Who holds the keys, the money, and the final yes.**

## Why this is the good news

It sounds like a limitation. It's actually the most useful map I've got.

Because it tells me exactly where my job is now. It isn't in the parts the AI carries — I can stop white-knuckling those. My job is the doorstep: the judgment calls (where should the menu live?), the relationships (sitting with my friend, pulling his credentials together), the responsibility (my card, my login, my name on the launch).

Those are the parts that were always the point. The AI handling the plumbing frees me up *for* them, not out of them. The last mile — the keys, the money, the yes — is human on purpose. Which is exactly why it's the part worth getting good at.

And one more thing about that list: the AI didn't pretend it could do those steps. It told me, plainly, what it couldn't — and why each one was mine. That honesty is part of the work too. A tool that carries the load all the way to your door *and* tells you exactly what's left for you is a good collaborator. It's just never going to hold your keys.`,
    category: 'Working With AI',
    publishDate: '2026-07-16',
    tags: ['ai', 'workflow', 'collaboration', 'shipping'],
    heroImage: '/images/content/what-ai-handed-back-hero.webp',
    ogImage: '/images/content/what-ai-handed-back.webp',
    heroImageAlt:
      "A card titled 'What only I could do' with three rows — the keys (accounts and credentials), the money (real dollars), and the final yes (the go-live, your name on it).",
  },
  {
    slug: 'six-prompts-one-day',
    title:
      'I put an app on my home screen in a day — here are the six prompts',
    excerpt:
      "I built a to-do app and put it on my phone's home screen in a day — six prompts, start to finish. The surprising part wasn't that it worked. It's how loose the prompts were: typos, half-sentences, one that's just \"what next?\" — and that three of the six could be that sloppy because a system I'd built before the project carried the quality the words left out.",
    body: `I have a to-do app on my phone's home screen. I built it in a day, and it works the way I actually think — my University tasks, my business, my personal stuff, three columns I swipe cards across.

The surprising part wasn't that I could build it. It was how *loose* the prompts were. Six of them, start to home screen — typos, half-sentences, one that's just "what next?" Nothing like the careful spec I used to think building with AI required.

Here are the actual six, unedited, with what each one really did underneath. The gap between how sloppy they are and what came back is the whole point.

## The six prompts

**1.** *"build a polished Kanban so that I can track daily to-dos. ill use this for everything; work at the univeristy, business at home, personal, etc. I should be able to add and edit notes to items. I also want a graph and data of the activity."*
→ The one real build prompt — and look how loose it is. One run-on sentence, a typo, a hand-wave at the end ("a graph and data of the activity"). I named my three areas, sure, but I never explained what "business at home" is, or what that graph should actually be, or how any of it should be built. I didn't have to: the AI already had my context on file, so a sloppy sentence was enough to get a coherent app. It even turned that vague "graph and data" into a design that records every action as it happens — which is why the activity view is honest instead of guesswork — without me asking.

**2.** *"this needs to be mobile first, since I will mainly be using it on my phone. the touches and the uix needs to be polished and validated to fit this. I want it fast and useful and beautiful."*
→ Not a tweak — a full rework. And notice I said "validated" without ever saying validated *how*. I didn't need to: the standard was already written down in a design method I use — colorblind-safe colors, contrast checks, real rules. The word was mine; the bar was already on file. (It also kicked off a second round of the AI testing its own work — more on that below.)

**3.** *"I merged to gh. what next?"*
→ Not building — a handoff. The merge was mine to do ("gh" = GitHub, where the code lives); the AI just told me the next human step.

**4.** *"give me the click by click on how to deploy, give me links if needed. I'm on my phone."*
→ The human last mile. I gave it the one bit of context that mattered — "I'm on my phone" — so the steps came back phone-shaped instead of desktop instructions I'd have to translate. ("deploy" = put it on the internet at a real address.)

**5.** *"deployed, its live on my phone now."*
→ I confirm it's real; the AI verifies the live site — including checking that a private note returns "not found" — before we call it done.

**6.** *"journal this and how it was built. include all prompts used."*
→ This ran a skill I *wrote myself* — a reusable instruction set that records how a build happened, in my own format. It's the only reason I can show you these exact six prompts now: one of my own tools captured them as they happened.

## The split that actually matters

Read those six back and there are two very different kinds of prompt.

Three of them — **1, 2, and 6** — could be as short and sloppy as they are because a system I'd built *before this project* did the heavy lifting:

- **1** leaned on my context already being on file, so I never had to explain my life to get a coherent app out of one run-on sentence.
- **2** leaned on a design standard I'd written down once, so "validated" already meant something specific — I didn't have to spell it out.
- **6** ran a skill I built with my own hands.

The other three — **3, 4, and 5** — were just me, doing the parts only I can: I merged the code, I deployed from my phone, I confirmed it was live.

One of those human steps mattered more than it looks. This app lives *inside* my personal notes repo — my second brain, full of things I'd never put on the public internet. So before it went live, we set it up so only the app folder ever gets uploaded and served, and then *tested that a private note returns "not found"* on the live site before trusting it. That's not a call you let the AI make silently. That one's yours.

## Why the prompts could be that loose

Here's the reframe I wish I'd had earlier. When I started with AI, I thought a good prompt was a precise blueprint — the more detail I stuffed in, the better the result. It's backwards. A good prompt is a clear outcome and an honest constraint. The precision lives in the *system around the prompt* — your context on file, your methods written down, your own tools — and you build that up over time, not in the session you're typing.

That's the real reason six sloppy prompts produced a polished app. Not clever wording. A system doing the work the words left out. (The "context on file" part is its own story — I wrote about that separately, in *[I stopped re-explaining myself to my AI](https://smartdisruptions.com/content/stop-re-explaining-yourself-to-ai)*.)

## The one thing I add every single build

There's one more source of quality in that list, and it's not about my notes — it's a habit I'd never skip: I make the AI check its own work in a real browser.

After the first build, it drove the actual app — clicking, adding cards, dragging them to "done," hovering the charts — and caught bugs before I ever saw them: a crash in the quick-add box, ugly numbers on a chart axis. Fixed before the first save.

Then the mobile rework got its own round, this time faking finger-swipes and long-presses on a phone-sized screen. That caught three bugs that only happen on a phone: a tap that opened the edit sheet and instantly closed it again, tooltips that vanished the moment you lifted your finger, and date labels colliding in the small space. I'd never have found those by eyeballing it.

If you take one concrete thing from this: don't ask AI to write code, ask it to write code **and then prove it works by running it.** "Build it" and "build it and verify it in a browser" are two different instructions, and you get two different qualities of thing.

## What one day actually bought me

Not a prototype I screenshotted and abandoned. A tool I've used every day since — and one I've kept reshaping in the weeks after, usually a prompt or two at a time. It even keeps an honest activity log: a GitHub-style heatmap of what I finished, streaks, completions by area.

So building with AI isn't about describing an app perfectly. It's the system you bring to the session — your context, your methods, your own tools — plus making the AI verify its own work, plus keeping your hands on the few parts that are really yours.

The prompts get short when that system does the heavy lifting. That's the actual skill, and it isn't the typing. Six sloppy prompts looked like the story. The system underneath three of them was the real one.

It's on my home screen. Yours can be too — and most of the work happens before you ever open the project.`,
    category: 'Working With AI',
    publishDate: '2026-07-14',
    tags: ['ai', 'workflow', 'shipping', 'prompting'],
    heroImage: '/images/content/six-prompts-one-day-hero.webp',
    ogImage: '/images/content/six-prompts-one-day.webp',
    heroImageAlt:
      'The Daily Kanban board — University, Business, and Personal columns with task cards and an activity heatmap.',
  },
  {
    slug: 'stop-re-explaining-yourself-to-ai',
    title:
      "I stopped re-explaining myself to my AI — here's the one file that did it",
    excerpt:
      "Claude and ChatGPT remember things about me now — but it's their memory, built automatically and locked inside one tool. What actually changed how I work was the opposite: a file about myself that I wrote and control. It started as a CLAUDE.md and grew into a second brain.",
    body: `Most AI tools have a memory now. Claude remembers things about me between chats. So does ChatGPT. That's real, and it helps.

But it's *their* memory of me — built automatically, tucked away where I can't see it, and locked inside one product. What ChatGPT picked up doesn't follow me to Claude. What either of them decides to remember, I don't really get to steer. And every time I opened a fresh tool, or a new kind of session, I was back to typing out who I am and what I'm working on.

What actually changed how I work wasn't leaning harder on that built-in memory. It was the opposite: I started keeping a file about myself that *I* wrote and control.

## Where it started: a file the tool reads every time

I stumbled into this inside Claude Code — the coding tool I use most days. It reads a file called \`CLAUDE.md\` at the start of every session automatically. Think of it as a standing briefing note: whatever's in there, the AI has read before it answers your first question.

So I started putting things in it — on purpose. Nothing lands there on its own; the AI won't quietly decide to remember something for you. I either open the file and type, or I tell Claude "save that" and it writes the line. How I like to work — direct, ship fast, show me the simpler path. What I was building. Little corrections I was tired of repeating.

And that deliberateness turned out to be the feature, not a chore. Every session got sharper. The AI stopped handing me generic advice and started building on what I'd actually told it. I wasn't reminding it who I was anymore; it already knew, because I'd written it down once in a place it always looks.

That was the whole lesson, and it was smaller than I expected: the useful move isn't hoping the AI remembers me. It's writing down who I am, on purpose, in a file I own.

## Then I got carried away (on purpose)

Filling in that one file taught me how much leverage was sitting there — so I went further and built a whole second brain out of the idea: linked notes on every project I've shipped, the skills I'm working on, decisions I've made and why. One map file at the front points to the rest, one line per note.

And here's the part I like most: it's wired into that same little file. My \`CLAUDE.md\` doesn't hold all that knowledge — it just tells the AI where to look, pointing every session at the wiki. The file stays small; the knowledge behind it keeps growing.

I mapped 34 projects into it. It felt like a lot. It *was* a lot. But once it existed, I could test whether it actually worked.

## The test that told me it was real

I opened a completely fresh AI session — no history, nothing but those notes — and quizzed it about me like a stranger cramming before a meeting. Who is this person? What has he built? Why is he doing it this way?

It answered **6 out of 10 questions fully** — pulling the right notes, in one or two hops, and citing where each answer came from.

The four it missed weren't the system breaking. They were things I simply hadn't written down yet — and it flagged them as gaps instead of inventing an answer. That was the tell: the memory was exactly as good as what I'd actually fed it. The hard part was never the software. It was writing down what I know about myself.

## What I'd tell you to do this week

Skip the second brain. Start where I actually started — one file.

Open a note, or make a plain text file, and put in it:

1. **Who you are** — your work, your field, the thing you're genuinely good at.
2. **What you're working on right now** — the current project, the current problem.
3. **What you've done before** — a few real things you've built or shipped, so it has receipts to draw on.
4. **How you like to work** — short answers or full reasoning? Blunt or gentle? Say it plainly.

Then paste it in as your first message before you ask an AI for anything — or, if your tool has a "custom instructions" or memory box you *can* edit, put it there so it loads every time.

You'll feel the difference in the first reply. The advice gets specific to your situation instead of a generic one. And the file compounds: every time you catch yourself re-explaining something, that's the thing to go add to it.

The reason a file you write beats the memory the AI keeps for you is simple — yours is *portable* (it works in any tool), *legible* (you can read and edit exactly what it knows), and *deliberate* (you decide what goes in). The built-in kind is none of those.

## Where I'm headed next

The thing I'm still figuring out: making that memory follow me into *every* tool, not just the one that reads my file — same context in any chat app, any browser, whatever I happen to open — so I never introduce myself to my own AI again.

That's the next hill I'm climbing, and I'll write up how it goes. But the part that already changed how I work was embarrassingly simple: I wrote down who I am, once, in a file I control — and stopped making the AI guess.`,
    category: 'Working With AI',
    publishDate: '2026-07-13',
    tags: ['ai', 'workflow', 'memory', 'productivity'],
    heroImage: '/images/content/one-file-about-yourself-hero.webp',
    ogImage: '/images/content/one-file-about-yourself.webp',
    heroImageAlt:
      'A plain-text file named CLAUDE.md — who I am, what I am working on, how I work — the one file my AI reads every session.',
  },
  {
    slug: 'i-tried-to-break-my-friends-ai-site',
    title:
      "I tried to break my friend's AI-built site — and deleted the hole instead of patching it",
    excerpt:
      "Before I let anyone read how I built my friend's ordering site, I had the AI attack it. It found a real hole — the customer's own browser was setting the price. The best fix wasn't a patch. It was a delete.",
    body: `Before I let anyone read about how I built my friend Robert's site, I did something that felt a little paranoid.

I asked the AI to break it.

Not politely. I told it to act like someone trying to abuse the site — steal money, spam the forms, get into anything it shouldn't — and to rank what it found by how bad it was.

Here is what came back.

## The one that actually scared me

The site takes online orders. Real menu, cart, checkout, card payment.

The audit found that the price the customer pays was being decided by the customer's own browser.

Let me say that in plain terms: the amount you got charged came from data the browser sent up. And anything the browser sends, a person can change. So in theory, someone could have set their own price — order eighty dollars of food, pay one.

That is the kind of hole you do not want to find out about after strangers are already using your site.

The fix was to stop trusting the browser. Now the price is calculated on the server, from the real menu and the real order total that comes back from the payment system (Square). The browser doesn't get a vote.

Simple idea, and it is the single most important rule I took from this: never trust a number the browser hands you — especially when the number is money.

### And then I broke checkout

My first version of that fix was too aggressive. It rejected valid orders and broke the checkout flow completely.

I only caught it because I did the boring thing: I placed a real test order and watched it fail, instead of trusting my own note that said "fixed."

That is a lesson I keep relearning. A fix isn't done when you write it. It is done when you run the thing and watch it work.

## The best fix was deleting the feature

There was a second problem, and it was uglier.

The site had an admin area — a private inbox for customer feedback. The audit found that basically any logged-in account could reach it. "Any logged-in user is an admin" is exactly as bad as it sounds.

I could have patched it. Add a real permission check, lock the routes down, test it.

Instead I deleted the whole thing.

I was already rethinking that feedback feature for other reasons. Once I removed it, the admin area had no reason to exist — so it went too. And when the code was gone, the security hole was gone with it. Not patched. Removed.

The change was mostly subtraction: 16 files touched, 19 lines added, about 1,400 deleted.

That reframed how I think about this stuff. The most reliable way to secure a feature is to not have it. Every screen, every route, every form is something someone can poke at. The less there is, the less there is to get wrong.

## The empty room nobody noticed

While I was in there, I found something funny.

The database behind that feedback feature had been dead for about three months. Auto-paused, unrecoverable, quietly offline.

And nothing had broken. Nobody noticed — not Robert, not his customers.

Because the parts he actually uses — the menu, the catering inquiries — never depended on it. (Those run through a separate email service.)

That is the same lesson as my last post, coming from the other direction: I had shipped only the subset he needed, so the dead weight could sit there dead and it did not matter.

## What I would tell myself, starting out

When I was newer, I thought security was something you bolt on at the end, like a lock on a finished house.

It is more useful to treat it as a question you ask *before* you show anyone: what would someone do to this if they wanted to abuse it?

You do not have to be a security expert to ask that. You can make the AI do the first pass.

**Try this today:** take something you have built and paste this in —

> "Act as a security auditor reviewing this app. Assume the user is hostile. List every way someone could abuse it — take money, read data they shouldn't, spam a form, get access they shouldn't have. Rank by severity, most dangerous first."

Then take the worst thing it finds and actually try to do it yourself.

You will learn more from one honest attempt to break your own thing than from a hundred articles about security.

And sometimes the answer isn't a patch. It is a delete.`,
    category: 'Build Breakdown',
    publishDate: '2026-07-09',
    tags: ['ai', 'security', 'shipping', 'case study'],
    heroImage: '/images/apps/samurai-kitchen-2.png',
    heroImageAlt:
      'The Samurai Kitchen ordering site — the one I had the AI attack before writing about it',
  },
  {
    slug: 'food-truck-site-with-ai',
    title:
      "I built my friend's food truck site with AI — here's what actually happened",
    excerpt:
      'I built a full online-ordering system with Square payments for my friend Robert’s food truck — and then shipped something much simpler. The real skill wasn’t building the impressive version. It was knowing what not to ship.',
    body: `I built a full online-ordering system for my friend Robert's food truck.

Menu, cart, checkout flow, Square payments — the whole thing.

And then I didn't ship that version.

The version that actually went live is much simpler: a menu with photos and a catering form that sends inquiries straight to his inbox.

That was the real lesson.

The impressive thing was not building the ordering system. AI helped me move fast enough that the technical build was almost not the bottleneck anymore.

The real design decision was realizing what Robert's business actually needed right now.

He did not need me to force a full ordering platform into his workflow just because I had built one. He needed people to see the food, understand what he offers, and contact him for catering.

So that is what shipped.

The ordering system is still sitting in the repo. It works. It is probably 80% of the way there. But now it is a warm offer for later instead of a cold pitch today.

That distinction matters.

## The timeline

I went back through the git history for this, so this is not me guessing from memory. These are the receipts.

### The first version took about four hours

I started from something called \`create-next-app\`. It is a single command you run in your terminal, and it instantly builds you a blank-but-working website skeleton — all the boring setup files and folders already wired together — so you can skip straight to building the actual pages. (It is tied to a popular website framework called Next.js, but every major framework has its own version of this.)

From that starting point, I had a complete, presentable business site in about four hours and five commits.

It had a homepage, menu highlights, a "why us" section, a rewards call-to-action, a rewards page with a loyalty signup, Open Graph metadata, and a font polish pass.

That was not some ugly prototype. It was already something you could show a real business owner.

That is the part that still feels kind of wild to me.

With AI, the distance between "I have an idea" and "I can show someone a real thing" has collapsed.

### The real build happened over a few evening sessions

That same evening, I started building the more serious version.

In the first session, I got the architecture in place: types, environment setup, responsive header, mobile menu, footer with hours and location, reusable hero, homepage, menu page, category filters, cart state, order page, checkout flow, and success page.

The next morning, I added the rewards page with phone lookup, a locations page, and a catering page with an inquiry form wired to an API endpoint.

That afternoon, I swapped out the placeholder menu for Robert's real menu.

Then I did what I think of as pure UX passes: sticky mobile category filters, consolidating the menu from seven categories down to four, and splitting out protein variants so the menu made more sense.

From \`git init\` to a working ordering platform with real menu data was roughly a day of elapsed time.

Not one uninterrupted day. More like an afternoon for v1, then a few evening sessions for the full platform.

That is the part I wish I'd understood when I was starting out.

You do not have to disappear for six months to build useful software anymore. You can build something real in the gaps of your life if you know how to keep the scope tight.

## The hard part was payments

The Square payments integration was the part I treated differently.

For most of the site, I just built one visible piece at a time. Header. Footer. Hero. Menu. Cart. Checkout.

But payments are not a place where I wanted to freestyle.

The commit history shows the method clearly:

First I made a design spec.

Then I reviewed the spec.

Then I made an implementation plan.

Then I implemented it.

After that, the actual payment integration came together in six commits in about 21 minutes: the hook, the payment section, tokenization, and checkout wiring.

That is why I believe spec-first is not slower.

It feels slower because you are not "coding" yet. But the spec is what makes the implementation fast.

AI is way better when you give it a clear target. If the work is complex, vague, or easy to mess up, the spec is the shortcut.

## Then I pivoted

A few weeks later, I changed the site's focus toward catering.

I updated the nav, hero, catering details, platter information, and form flow. Then I wired the catering form to real email delivery so inquiries land directly in Robert's inbox.

I also changed the menu to display-only.

That is the version that is live now.

And he actually uses it.

That matters more than the fact that I built a bigger version in the repo.

A feature that is impressive but unused is not really a win. A smaller thing that fits into someone's actual business is.

## The method

Looking back, each commit was basically one ask to the AI.

That is probably the simplest way to explain the workflow.

### 1. Start with a generator

Use \`create-next-app\` — the starter command I mentioned earlier.

Do not hand-build the boring setup if a generator can give it to you for free.

The goal is not to prove you know how to configure everything manually. The goal is to get to the useful part as quickly as possible.

### 2. Build one visible piece at a time

Header first.

Then footer.

Then hero.

Then homepage sections.

Then menu.

Then checkout.

I built in the order a visitor would experience the site.

That kept the work grounded. I was not asking AI to "build a food truck website." I was asking for one specific piece at a time.

That is a huge difference.

### 3. Use placeholder data first

I did not start by perfectly modeling the real menu.

I used placeholder data to move fast, then did a dedicated pass later to drop in Robert's real menu.

That kept momentum high.

It is easy to get stuck trying to solve the whole real-world mess up front — I used to do exactly that. Sometimes it is better to build the shape first, then replace the fake data with real data.

### 4. Treat polish as small separate asks

Sticky filters.

Better category names.

Cleaner menu structure.

Protein variants.

Those were not huge rebuilds. They were small passes.

This is one of the best parts of building with AI. Polish gets cheaper when you break it into tiny asks.

### 5. Use specs for the scary parts

I did not spec every single thing.

That would have slowed me down.

But I did spec payments.

That is the balance I like: move fast on normal UI work, slow down on the parts that can break trust, money, data, or security.

### 6. Cut scope at the end

This was the biggest lesson.

Ship what the person actually needs.

Not what makes the project look most impressive.

Not what proves you can build the hardest thing.

Not what sounds best in a portfolio.

What does the business need today?

For Robert, the answer was: food photos, menu, catering form, and email delivery.

So that is what shipped.

## What I would tell someone starting out

You do not need to know the framework perfectly.

You need to know the person you are building for.

That is the part AI cannot replace.

I knew Robert. I knew his food. I knew he needed catering inquiries. I knew people needed to see the menu and pictures. So every ask I made to AI had a real purpose.

That is why the project worked.

If you want to try this, do not start with a giant SaaS idea.

Pick one real person.

Find one real need.

Run \`create-next-app\` (that same starter command).

Ask AI for one section at a time in the order a visitor would see it.

Deploy it on Vercel.

Then cut the scope down to what the person will actually use.

That last part is where the product thinking is.

AI can help you build almost anything now.

The harder skill is knowing what not to ship.`,
    category: 'Build Breakdown',
    publishDate: '2026-07-08',
    tags: ['ai', 'shipping', 'next.js', 'case study'],
    heroImage: '/images/apps/samurai-kitchen-1.webp',
    heroImageAlt:
      'The Samurai Kitchen site that shipped — the version Robert actually uses',
  },
];

export function getContentBySlug(slug: string): ContentEntry | undefined {
  return contentEntries.find((entry) => entry.slug === slug);
}

export function getContentCategories(): string[] {
  return Array.from(new Set(contentEntries.map((entry) => entry.category)));
}
