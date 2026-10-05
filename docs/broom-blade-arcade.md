# The Broom & Blade Arcade

The last room on `/games`, above the archive's door (Josh's call, 2026-10-05): the
five machines of Broom & Blade's games room, hosted by Pip the guild mouse. Below
the neon market the page goes downstairs into the guild hall's cellar, and the
page's theme turns from neon to firelight.

## Where things are

| What | Where |
|---|---|
| The line-up, in machine order | `BROOM_BLADE_ARCADE_SLUGS` in `src/data/apps.ts` (part of `GAME_SLUGS`) |
| The room: stair, sign, ceiling, floor, the archive's door | `src/app/games/guild/GuildHall.tsx`, `guild.css`, `art.tsx`, `scene.ts` |
| The room's loops (generated) | `src/app/games/guild/loops.css` from `scripts/build-guild-loops.mjs` |
| The sign's lettering (generated, Alegreya SC baked to paths) | `src/app/games/guild/lettering.ts` from `scripts/build-guild-lettering.mjs` |
| Scroll hold, liveness, the phone toolbar colour | `src/app/games/guild/HallFX.tsx` |
| Pip's mouse hole ("OW! Not me!") | `src/app/games/guild/MouseHole.tsx` |
| The five machines | `src/app/games/guild/GuildMachines.tsx`, `machines.css`, `machines/*` |
| Pip | `src/components/pip/Pip.tsx`, `art.ts`, `pip.css` (liveness and gaze in `SiteFX.tsx`) |
| The games | `public/games/<slug>/index.html`, served at `/games/<slug>` (rewrites in `next.config.ts`) |
| Their pictures | `public/images/apps/<slug>-{cabinet,thumbnail,1,2,3}.webp`, `<slug>-og.jpg` |

## The games are copies

The source of truth for each game is Josh's vault: `Tools/broom-blade/{hoop-quest,
ring-toss,whack-a-dust-bunny,milk-bottle}/` and `Tools/kid-volt/`. The site's copy is
rewritten for free play, so **never copy a vault file over the site's wholesale**:

- the share head (canonical, Open Graph, Twitter, app tags);
- a way back to `/games#broom-blade-arcade` on the title and results screens;
- no tickets, gold, purse or payout: the HUD's GOLD panel shows the best score on
  this device instead (the hall's booth still needs its gold and `postMessage`);
- on wide screens the booth stands in a static cellar (CSS/SVG, no per-frame cost);
- Whack-a-Dust-Bunny and Hoop Quest, Ring Toss and Milk Bottle Knockdown cache their
  static scenery and glows instead of redrawing them every frame.

To bring a gameplay change across, port it into the site's copy by hand.

`/games` reads each game's best from localStorage (same origin): `hoopquest-best-pts3`,
`ringtoss-best`, `whack-best` and `milkbottle-best` are points; `kidvolt.best` is the
fastest knockout in fight-clock seconds (lower is better, shown as m:ss). Keep the keys.

## 60 fps: rules that were measured, not guessed

All of these came from CDP traces at 4x CPU in Chromium 141.

1. **Every CSS loop iteration wakes the main thread.** React listens for
   `animationiteration` at its root, so each loop boundary costs a frame, and every
   main frame restyles every running animation on the page. So the room's loops all
   run on one shared 16 s clock with no per-element delays (fast moves are beats
   inside the long keyframes), and Pip's do too.
2. **Any running loop costs a style pass on every scrolling frame**, and inside an SVG
   a layout. So the room's loops pause while the page scrolls (`data-hold`, from the
   first scroll event to `scrollend`), and Pip's do (through SiteFX). Scroll-driven
   animations are never held; they are the scrolling.
3. **Chrome won't composite `translate`, `scale` or `rotate` on any SVG element**, the
   root included, and two opacity animations on one element can't composite either.
   Every moving part of the machines rides an HTML box.
4. **The neon market's loops stop while they are off screen** (`MarketFX.tsx` marks
   regions `data-off`). They had been keeping the main thread busy ~47 times a second
   with the reader down in the room.
5. **The room renders on approach** (`content-visibility: auto` on its four big
   blocks, with measured placeholder heights). Rendering it at load took /games'
   blocking time on a throttled phone from 258 ms to 686 ms. Nothing in those blocks
   may paint outside its box, or the containment will clip it.

At rest with the room on screen, the page now does no style, layout or paint work at
all. Kiru's headband tails are SMIL, which never composites: wherever he is on screen
(the top of the page, the stair), they cost a main frame every vsync. That is
site-wide and older than this room.
