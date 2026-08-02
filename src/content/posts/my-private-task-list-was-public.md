---
title: I was about to publish an article about my dashboard. First I checked whether it was safe.
slug: my-private-task-list-was-public
excerpt: I'd written a post about a tool I built. Before publishing it, I stopped to check whether anything it touched could be broken into — and found my own task list, personal items included, readable by anyone with the URL. The cause was a free-tier default that works the opposite way most people assume.
category: Working With AI
publishDate: 2026-08-02
tags: [security, deployment, verification, shipping]
status: staged
channels: []
heroImage: /images/content/my-private-task-list-was-public-hero.webp
heroImageAlt: A card contrasting what I assumed was private — my task list — with what the URL actually returned: 200 OK, 17,798 bytes, 43 tasks, public.
ogImage: /images/content/my-private-task-list-was-public.webp
---
I'd built a small dashboard for this site and written a post about it. The post was done. I was about to hit publish.

Then a thought stopped me: I'm about to point an audience at a tool that can commit to my repositories. Can anyone break into it?

I almost skipped it. The post was finished, and checking felt like homework.

I checked. Within about twenty minutes I found my own task list — the real one, personal items included — sitting on the open internet, readable by anyone who typed the URL.

Nobody had read it. I found it by looking, not because something went wrong.

## What I actually found

I keep a little kanban board for tasks. It's a single page, deployed so it works on my phone. Its data lives in one file next to it.

I requested that file the way a stranger would. No password, no session, nothing.

It answered. **200 OK. 17,798 bytes. 43 tasks.**

Not a test fixture. My actual list — work items, half-finished ideas, and personal things I'd never have chosen to publish.

The board itself was fine. The app was fine. The *data file sitting beside it* was being served like any other public file, the same as an image or a stylesheet.

## The cause is a default that works backwards

I host on Vercel's free tier. It has a setting called deployment protection, and mine was **on**. I'd have told you my stuff was protected.

Here's what it actually does. Every push builds a *preview* — a temporary copy at its own URL, for checking work before it goes live. Protection locks those down. Anyone hitting a preview has to log into my account first.

**It exempts production.** The main URL — the one you'd actually share, the one that stays put — is deliberately left open.

That's sensible for a public website. It's the whole point of a website.

But my kanban board's "production" URL was that same kind of address. So the free tier was carefully protecting the temporary URLs nobody knows about, and leaving open the one I use every day.

The setting was on. It just didn't mean what I assumed.

I'd also been quietly relying on the URL being obscure. That doesn't hold either. Every site with HTTPS gets its certificate recorded in a public log — Certificate Transparency, a system designed so anyone can audit which certificates exist. You can search those logs. "Nobody will guess it" was never protection; it was just a thing I hadn't examined.

## The first fix took a minute, and wasn't the good one

My instinct was to design the proper solution.

I did the dumb thing first instead: I stopped shipping the file. One line, telling the deploy to skip it.

Live in about sixty seconds. The board kept working — it was already written to shrug and carry on if the file was missing, so it just stopped importing new tasks.

That's the move I'd want back if I lost everything else here. **The first fix should be the fastest reversible one, not the best one.** The good fix took another hour. The leak was closed while I built it.

## The proper fix was free, and better than the paid one

Vercel sells the setting I wanted: protect everything, including production. It's a paid upgrade.

Before paying I checked the documentation, and found something better.

Vercel supports *middleware* — a small piece of code that runs on every single request before anything gets served. I'd assumed it needed a full application framework. It doesn't. It works even for a plain HTML page with no build step.

So instead of paying to protect the *deployment*, I put a password gate in front of the *app*. About a hundred lines. The page and the data file now sit behind the same check, and anything I add to that folder later is covered automatically instead of by me remembering.

Free, and stronger — because the protection now travels with the app rather than depending on a hosting setting I'd already misread once.

I built it to fail in a specific direction. Every rejection path returns an explicit "no." Only a verified session is allowed through to the files. If the pass-through part ever breaks, the board goes blank. **It can't quietly start serving my data.** An outage I'd notice beats a leak I wouldn't.

Same reason there's no default password. If the secrets aren't configured, it refuses everyone — including me.

## The part I'd argue for hardest

I didn't put the data back right away.

Previews are locked, which meant I couldn't test the new gate from outside until it was live. So shipping the gate and the data together would have meant betting my task list on code I'd never watched work.

Instead: ship the gate with the file still withheld. Worst case, a board loads unprotected with nothing sensitive on it.

Then I asked the live site for the data file and watched it answer with the login page instead of the file.

*Then* I put the data back.

**A gate you haven't watched turn someone away is a belief, not a control.** Twenty-four tests said it worked. Tests are written by the same person who wrote the bug.

## The ending I didn't plan

I finished, wrote it up, and felt done.

The next day I built an unrelated tool — something to tidy my backlog of article ideas. Part of its job is checking whether old notes are still true.

It checked a note that said I'd removed an old admin panel from this site. It compared that against the live site.

The live site disagreed. The panel was still there.

I *had* removed it. The change went to the wrong branch — merged into my staging line, never promoted to production. So the thing I'd deleted was still being served, a day after I'd audited everything and pronounced it clean.

It was password-protected, and nothing got in. But it was a second door I believed didn't exist.

Here's why my audit missed it. I made a list of *apps I'd deployed* and checked each one. That list was reasonable, and the panel wasn't on it — it wasn't an app, it was a page inside the site I was writing the article about.

**The list you check decides what you're able to find.** "Every app I've deployed" and "every address every app answers on" are different lists, and only the second one would have caught it.

What caught it wasn't more care. It was a tool whose entire job is re-checking whether things I'd written down were still true.

## Try this today

Fifteen minutes, no tools:

1. **List every URL you've ever deployed.** Old experiments, weekend projects, that thing you made for one friend. The forgotten ones are the point.
2. **Open each one in a private window.** No saved logins — that's what a stranger sees.
3. **Then guess at data.** Add `/data.json`, `/config.json`, `/.env`, `/backup.zip` to the address. Try whatever filename your app actually uses.
4. **Read your host's protection setting properly.** Don't read the name. Find out which URLs it covers, and check the one you actually use.

If something answers that shouldn't, the fastest reversible fix beats the right one. Stop serving it, *then* work out the proper solution.

## What I'd tell myself two years ago

I used to think security was a thing you did after you got good — a later problem, for people with real users.

The uncomfortable version is that publishing *is* the moment. A URL nobody knows about and a URL in a post read by strangers are not the same thing, even though nothing about the code changed.

The audit only happened because I was about to publish. That's the part I'd keep.

And I'd add the thing I learned the next day: check the claim, not the memory. I *remembered* removing that panel. I'd have sworn to it. The site was the only thing that actually knew.
