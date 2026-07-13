export interface ContentEntry {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishDate: string;
  tags: string[];
  heroImage?: string;
  heroImageAlt?: string;
}

export const contentEntries: ContentEntry[] = [
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

So I started putting things in it. How I like to work — direct, ship fast, show me the simpler path. What I was building. Little corrections I was tired of repeating.

And every session got sharper. The AI stopped handing me generic advice and started building on what I'd actually told it. I wasn't reminding it who I was anymore; it already knew, because I'd written it down once in a place it always looks.

That was the whole lesson, and it was smaller than I expected: the useful move isn't hoping the AI remembers me. It's writing down who I am, on purpose, in a file I own.

## Then I got carried away (on purpose)

Filling in that one file taught me how much leverage was sitting there — so I went further and built a whole second brain out of the idea: linked notes on every project I've shipped, the skills I'm working on, decisions I've made and why. One map file at the front points to the rest, one line per note.

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

The thing I'm still figuring out: making that memory follow me everywhere without me lifting a finger — same context at my desk, on my phone, in a browser, in whatever tool I happen to open — so I never introduce myself to my own AI again.

That's the next hill I'm climbing, and I'll write up how it goes. But the part that already changed how I work was embarrassingly simple: I wrote down who I am, once, in a file I control — and stopped making the AI guess.`,
    category: 'Working With AI',
    publishDate: '2026-07-13',
    tags: ['ai', 'workflow', 'memory', 'productivity'],
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
