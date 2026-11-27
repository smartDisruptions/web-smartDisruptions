'use client';

import { useState } from 'react';

/**
 * PREVIEW ONLY (November 2026): candidate stories for the About Me card,
 * beside the one that is live, with a switch to compare them in place.
 * Round two: Josh picked A (the path, in order) and asked for more built
 * like it that say more about his AI skills and what he has done with them.
 * This file is deleted when he picks one; the winner becomes BIO in
 * page.tsx. Not for main.
 *
 * Every sentence states something the site already says (most of the AI
 * claims are on /resume) or that is in Josh's own record of his history.
 * Nothing here is an invented thought or memory.
 *
 * A paragraph is a string, or [lead, rest] where the lead is set bold.
 */
type Para = string | readonly [string, string];

const START: Para[] = [
  'I’ve been teaching myself to build things since 2008. I started with websites for small businesses, and with getting those sites found on Google.',
  'My degree is in psychology, not computer science. Nobody taught me to code. I picked it up by building.',
  'In 2014 I went to work at a university. I started in design and writing. In 2024 I became one of its software engineers.',
];

const stories = (games: number) =>
  [
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
      name: 'The path — the one you picked, unchanged',
      text: [
        ...START,
        'Around 2023 I started using AI every day, and I’ve been building faster ever since.',
        'Now, after hours, I build websites, apps and games, and I put them here. A few of the games I made with my son.',
      ],
    },
    {
      id: 'a1',
      tab: 'A1',
      name: 'The path, then how I work with AI',
      text: [
        ...START,
        'Around 2023 I started using AI every day. Three years on, it’s the main skill I’ve built.',
        'I don’t use one AI as a helper. I run a team of them. Four to ten AI agents work at once, and each has one job: some build, one looks for what’s weak, one tests, and one reviews the code.',
        'Before they start, I write one set of rules that all of them build to. That’s how ten of them built a 3D running game in a single session.',
        'Claude writes most of the code. I decide what gets built, I read every change, and nothing goes live until I say so.',
        'After hours I build websites, apps and games this way, and I put them here. A few of the games I made with my son.',
      ],
    },
    {
      id: 'a2',
      tab: 'A2',
      name: 'The path, then the proof',
      text: [
        ...START,
        'Around 2023 I started using AI every day. Here’s what three years of that has let me build.',
        'A real food truck takes card payments through a site I built. Its menu, prices and stock come straight from the till.',
        'I built my university’s Net Price Calculator, the tool families use to see what college will cost them.',
        `I’ve made ${games} browser games, and short films drawn entirely in code.`,
        'And I built a research team of fourteen AI agents. Some dig into a question from different angles. The rest try to prove them wrong.',
        'I didn’t write most of that code. Claude did. My job is to decide what gets built, check every change, and say when it’s good enough to show.',
        'It’s all on this site. A few of the games I made with my son.',
      ],
    },
    {
      id: 'a3',
      tab: 'A3',
      name: 'The path, short, with the skill up front',
      text: [
        'I’ve been teaching myself to build things since 2008. My degree is in psychology, not computer science, so I learned by building: first websites for small businesses, then software at a university, where I’m an engineer today.',
        'Around 2023 I started using AI every day. Building with it is now what I do best.',
        'Here’s what that means. I write down exactly what I want, in a way that can be tested. I hand the work to a team of AI agents. Then I check what comes back by using it, measuring it, and trying to break it.',
        `That’s how a food truck got online ordering with real card payments, how my university got its Net Price Calculator, and how this site got ${games} games.`,
        'After hours I keep building, and I put it all here. A few of the games I made with my son.',
      ],
    },
    {
      id: 'a4',
      tab: 'A4',
      name: 'The path, then the five skills, one by one',
      text: [
        ...START,
        'Around 2023 I started using AI every day. Three years later, these are the skills I’ve built.',
        [
          'Saying exactly what I want.',
          '“Make it fast” is a wish. “Runs smoothly on an old phone” is something I can test.',
        ],
        [
          'Running a team.',
          'I direct four to ten AI agents at once. Each has one job, and all of them work from one written set of rules.',
        ],
        [
          'Checking the work.',
          'I open the real thing and try it, not the report that says it’s done. For research, I have some agents try to disprove what the others found.',
        ],
        [
          'Measuring before deciding.',
          'When one of my games felt too hard, I measured how hard before I changed anything.',
        ],
        [
          'Knowing what to cut.',
          'I once had ten designs for one kind of image. I kept four.',
        ],
        'The AI does most of the typing. The judgment is mine. Everything I’ve made this way is on this site, and a few of the games I made with my son.',
      ],
    },
  ] as const satisfies readonly {
    id: string;
    tab: string;
    name: string;
    text: readonly Para[];
  }[];

const flat = (p: Para) => (typeof p === 'string' ? p : `${p[0]} ${p[1]}`);
const words = (text: readonly Para[]) =>
  text.map(flat).join(' ').split(/\s+/).length;

export default function StoryOptions({ games }: { games: number }) {
  const all = stories(games);
  const [id, setId] = useState<string>('a1');
  const story = all.find((s) => s.id === id)!;

  return (
    <>
      <div className="ab-pick">
        <p className="ab-pick-k">Preview only &middot; pick a story</p>
        <div className="ab-pick-tabs" role="group" aria-label="Story options">
          {all.map((s) => (
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
        {story.text.map((p: Para) =>
          typeof p === 'string' ? (
            <p key={p}>{p}</p>
          ) : (
            <p key={p[0]}>
              <strong>{p[0]}</strong> {p[1]}
            </p>
          )
        )}
      </div>
    </>
  );
}
