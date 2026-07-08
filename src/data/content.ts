export interface ContentEntry {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishDate: string;
  tags: string[];
}

export const contentEntries: ContentEntry[] = [
  {
    slug: 'food-truck-site-with-ai',
    title: "I built my best friend's food truck site with AI — here's exactly how",
    excerpt:
      'I built a full online-ordering system with Square payments for my friend Robert’s food truck — and then didn’t ship it. The real design decision was shipping the subset his business actually needed. Here’s the timeline, the method, and the parts worth copying.',
    body: `## The honest version

I built a full online-ordering system for my best friend Robert's food truck — menu, cart, Square payments, the works. And then I **didn't ship it**.

What went live is a menu with photos and a catering form that drops inquiries straight into his inbox. That's what his business actually needed. The ordering system is sitting in the repo, working, about 80% of the way to launch — a warm offer for later, not a cold pitch.

Shipping *the subset the business actually needed* was the real design decision. Here's exactly how the whole thing came together — timeline, method, and the parts I'd tell a beginner to copy.

## The timeline (these are receipts, not memory)

I reconstructed this from the git history, so every claim here is a commit, not a vibe.

### v1 in about four hours

Starting from \`create-next-app\`, I had a complete, presentable business site in roughly four hours and five commits: a homepage with menu highlights, a "why us" section and a rewards call-to-action, a rewards page with loyalty signup and a stamp card, Open Graph metadata, and a font polish pass. Not a prototype — something you could hand to a customer.

### The real build, over a few evening sessions

That same evening I started the serious version. Inside the first session: project architecture, types, environment setup, a responsive header with a mobile menu, a footer with hours and location, a reusable hero, a full homepage, a menu page with **category filters and cart state**, and an order page with a **full checkout flow and success page**.

The next morning: a rewards page with phone lookup, a locations page, and a catering page with an inquiry form wired to an API endpoint. That afternoon I swapped my placeholder menu for Robert's real menu, then ran pure UX passes — a sticky mobile category filter, consolidating seven menu categories down to four, splitting protein variants.

From \`git init\` to a working ordering platform with real menu data was roughly a day of elapsed time — an afternoon for v1, the platform itself across a few evening sessions.

### The hard part — payments — done the disciplined way

The commit log literally shows the method. For the Square Web Payments integration it went: a **design spec** → **address spec-review feedback** → an **implementation plan** → then six implementation commits in **21 minutes** (the hook, the payment section, tokenization wired into checkout).

Spec-first isn't slower. The spec is *why* the implementation took 21 minutes.

### Then the pivot

A few weeks later I repointed the site toward catering — nav, hero, platter details — and wired the catering form to real email delivery so inquiries land in Robert's inbox directly. I made the menu display-only. That's the shape that's live today, and he uses it every day.

## The method, in six moves

Each commit was basically one ask to the AI. The sequence teaches itself:

1. **Scaffold with a generator.** \`create-next-app\`. Don't hand-build what a generator gives you for free.
2. **One visible piece per ask.** Header, then footer, then hero, then homepage sections, then menu, then checkout — build in the order a visitor would see it.
3. **Real data as its own step.** Placeholder data first to move fast, then a dedicated pass to drop in the real business's menu.
4. **Polish as small, separate asks.** Sticky filters, category renames — polish is cheap when each change is one ask.
5. **Spec-first only for the genuinely hard part.** For payments: spec, review, plan, implement. Everywhere else, just ask.
6. **Cut scope at the end.** Ship what the person needs. Keep the rest in the repo as a future offer.

## If you're just starting

You don't need to know the framework. You need to know the *person*. I knew Robert needed catering inquiries in his inbox and food photos on a page — every ask I made was one visible piece of that.

**Try this today:** pick one real person with one real need. Run \`create-next-app\`, then ask AI for one section at a time, in the order a visitor would see them. Deploy free on Vercel the same day. Don't add features the person didn't ask for — build those later, as an offer.`,
    category: 'Build Breakdown',
    publishDate: '2026-07-08',
    tags: ['ai', 'shipping', 'next.js', 'case study'],
  },
];

export function getContentBySlug(slug: string): ContentEntry | undefined {
  return contentEntries.find((entry) => entry.slug === slug);
}

export function getContentCategories(): string[] {
  return Array.from(new Set(contentEntries.map((entry) => entry.category)));
}
