'use client';

import { useState } from 'react';

/**
 * PREVIEW ONLY (November 2026): three candidate stories for the About Me
 * card, beside the one that is live, with a switch to compare them in
 * place. This file is deleted when Josh picks one; the winner becomes BIO
 * in page.tsx. Not for main.
 *
 * Every sentence states something already on the site or in Josh's own
 * record of his history. Nothing here is an invented thought or memory.
 */
const STORIES = [
  {
    id: 'now',
    tab: 'Live now',
    name: 'What the page says today',
    text: [
      'I’ve been teaching myself to build things since 2008, and by day I’m a software engineer at a university.',
      'After hours I build websites, apps and games, and I put them here. A few of the games I made with my son.',
    ],
  },
  {
    id: 'a',
    tab: 'A',
    name: 'The path — how I got here, in order',
    text: [
      'I’ve been teaching myself to build things since 2008. I started with websites for small businesses, and with getting those sites found on Google.',
      'My degree is in psychology, not computer science. Nobody taught me to code. I picked it up by building.',
      'In 2014 I went to work at a university. I started in design and writing. In 2024 I became one of its software engineers.',
      'Around 2023 I started using AI every day, and I’ve been building faster ever since.',
      'Now, after hours, I build websites, apps and games, and I put them here. A few of the games I made with my son.',
    ],
  },
  {
    id: 'b',
    tab: 'B',
    name: 'The honest version — the gaps, and how I work',
    text: [
      'By day I’m a software engineer at a university. I’m also self-taught, and my degree is in psychology.',
      'That leaves gaps. There are things a trained programmer knows that I don’t, and I can’t sit down and write any language from scratch.',
      'What I do have is decent logic and a clear idea of what I want to make. AI does much of the typing. I decide what gets built, how it should feel, and when it’s good enough to show.',
      'I’ve worked this way every day for about three years. After hours I build websites, apps and games, and I put them here. A few of the games I made with my son.',
      'This site is what I’ve learned so far, mistakes included.',
    ],
  },
  {
    id: 'c',
    tab: 'C',
    name: 'The whole person — and why this place exists',
    text: [
      'By day I’m a software engineer at a university. After hours I build websites, apps and games with AI, and I put them here.',
      'I’ve been teaching myself to build since 2008, without a computer science degree. I started by making websites for small businesses.',
      'I’m also a dad. A few of the games here I made with my son. And I’ve trained in martial arts for more than twenty years, and coached for several of them.',
      'This site has one rule: receipts over claims. I don’t only tell you what I built. I show it, and everything is free to try.',
      'When something goes wrong, that goes on the page too.',
    ],
  },
] as const;

type Id = (typeof STORIES)[number]['id'];

const words = (text: readonly string[]) => text.join(' ').split(/\s+/).length;

export default function StoryOptions() {
  const [id, setId] = useState<Id>('a');

  const story = STORIES.find((s) => s.id === id)!;

  return (
    <>
      <div className="ab-pick">
        <p className="ab-pick-k">Preview only &middot; pick a story</p>
        <div className="ab-pick-tabs" role="group" aria-label="Story options">
          {STORIES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="ab-pick-tab"
              aria-pressed={s.id === id}
              onClick={() => setId(s.id)}
            >
              {s.tab}
            </button>
          ))}
        </div>
        <p className="ab-pick-name">
          {story.name} &middot; {words(story.text)} words
        </p>
      </div>

      <div className="ab-body font-read">
        {story.text.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </>
  );
}
