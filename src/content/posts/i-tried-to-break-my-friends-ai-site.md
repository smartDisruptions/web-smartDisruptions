---
title: I tried to break my friend's AI-built site — and deleted the hole instead of patching it
slug: i-tried-to-break-my-friends-ai-site
excerpt: Before I let anyone read how I built my friend's ordering site, I had the AI attack it. It found a real hole — the customer's own browser was setting the price. The best fix wasn't a patch. It was a delete.
category: Build Breakdown
publishDate: 2026-07-09
tags: [ai, security, shipping, case study]
status: published
channels:
  - name: linkedin
    status: done
    note: "Before I published a post about a site I built for my friend Robert, I asked the AI to attack it.\n\nNot politely. I told it to act like someone trying to abuse the site — steal money, spam the forms, get in where it shouldn't — and rank what it found, worst first.\n\nThe worst one: the price the customer paid was being decided by the customer's own browser. Anything a browser sends up, a person can change. In theory, order eighty dollars of food, pay one.\n\nThe fix was to work the price out on the server instead, from the real menu and the real total from Square. My first version of that fix was too aggressive and broke checkout completely. I only caught it because I placed a real test order and watched it fail, instead of trusting my own note that said fixed.\n\nThe second finding was uglier: an admin area any logged-in account could reach. I could have patched it. I deleted the feature instead — 19 lines added, about 1,400 deleted. Not patched. Removed.\n\nWorth doing today: ask your AI to review something you built as a hostile user, ranked worst first. Then take the worst thing it finds and try it yourself.\n\nThe full write-up is in the comments."
    comment: "The whole audit is here, including the database behind that deleted feature — dead for about three months, and nobody had noticed: https://www.smartdisruptions.com/content/i-tried-to-break-my-friends-ai-site"
  - name: substack
    status: planned
    note: "I had the AI attack a site I built before I wrote about it publicly. Assume the user is hostile, list every way to abuse this, rank it worst first.\n\nTwo of what came back were real holes. The price the customer paid was coming from their own browser, which means a person could have set their own price. And an admin area that treated any logged-in account as an admin.\n\nI fixed the first one on the server. The second I deleted — the whole feature, 19 lines added and about 1,400 removed. It reframed something for me: the most reliable way to secure a feature is to not have it. Every screen and form is one more thing someone can poke at.\n\nYou don't have to be a security expert to ask what someone would do to your thing if they wanted to abuse it. The AI can do the first pass.\n\nhttps://www.smartdisruptions.com/content/i-tried-to-break-my-friends-ai-site"
  - name: x
    status: planned
    note: "1/ Before I published a post about a site I built for a friend, I asked the AI to attack it. Assume the user is hostile, list every way someone could abuse this, rank it worst first. Two of what came back were real holes.\n\n2/ The bad one: the price the customer paid was being decided by the customer's own browser. Anything the browser sends up, a person can change. In theory, order eighty dollars of food and pay one.\n\n3/ The fix was to stop trusting the browser — work the total out on the server, from the real menu and the real number Square sends back. My first version of that fix was too aggressive and broke checkout completely.\n\n4/ I only caught that because I placed a real test order and watched it fail, instead of trusting my own note that said fixed. A fix isn't done when you write it. It's done when you run the thing and watch it work.\n\n5/ Second hole: an admin area any logged-in account could reach. I could have patched it. I deleted the feature instead. 16 files touched, 19 lines added, about 1,400 deleted. The hole went with the code.\n\n6/ What I kept from it: the most reliable way to secure a feature is to not have it. Every screen, every route, every form is one more thing someone can poke at. Sometimes the answer isn't a patch. It's a delete."
    comment: "Full write-up, including the database behind that deleted feature that had been dead about three months without anyone noticing: https://www.smartdisruptions.com/content/i-tried-to-break-my-friends-ai-site"
heroImage: /images/apps/samurai-kitchen-2.png
heroImageAlt: The Samurai Kitchen ordering site — the one I had the AI attack before writing about it
ogImage: /images/content/i-tried-to-break-my-friends-ai-site.webp
---
Before I let anyone read about how I built my friend Robert's site, I did something that felt a little paranoid.

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

And sometimes the answer isn't a patch. It is a delete.