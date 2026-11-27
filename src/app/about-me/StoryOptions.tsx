'use client';

import { useState } from 'react';

/**
 * PREVIEW ONLY (November 2026): candidate stories for the About Me card,
 * beside the one that is live, with a switch to compare them in place.
 * Round three: Josh picked A (the path, in order) and named the AI skills
 * he wants it to carry: organizing data for AI, MCP and tools, multi-agent
 * work, architecture and full-stack building, data extraction, and taking
 * software apart.
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
      id: 's1',
      tab: 'New 1',
      name: 'The path, then the six skills, one by one',
      text: [
        ...START,
        'Around 2023 I started using AI every day. Three years later, these are the things I do best with it.',
        [
          'Organizing knowledge so AI can use it.',
          'I keep my notes, projects and decisions in one linked library with a map at the front, so Claude can find what it needs in a couple of steps.',
        ],
        [
          'Giving AI tools.',
          'Through MCP, a standard way to plug tools into an AI, I connect Claude to databases, hosting, code and more. Then it can do the work itself, not only tell me how.',
        ],
        [
          'Running teams of AI agents.',
          'Four to ten at once, each with one job, all building to one written set of rules.',
        ],
        [
          'Designing the whole system.',
          'Front to back: the pages you see, the database behind them, logins and card payments. I decide how the parts fit before anything gets built.',
        ],
        [
          'Pulling data out of messy places.',
          'I turned 953 of a food truck’s orders into a ranked plan of what to try next.',
        ],
        [
          'Taking software apart to see how it works.',
          'Then I build my own version. I rebuilt one of my apps from nothing but the copy running online, because its source code was gone.',
        ],
        'Put together, that means I can build almost anything digital with Claude: websites, apps, games, even films. It’s all on this site, and a few of the games I made with my son.',
      ],
    },
    {
      id: 's2',
      tab: 'New 2',
      name: 'The path, then how the skills fit together',
      text: [
        ...START,
        'Around 2023 I started using AI every day. What I’ve learned since is how to set an AI up to do far more than answer questions.',
        'It starts with what the AI can read. I organize my notes, data and projects into one linked library, so Claude can find what it needs fast.',
        'Next come tools. Using MCP, a standard way to plug tools into an AI, I connect Claude to databases, hosting, code and payment systems. Each tool is one more thing it can do on its own.',
        'Then I scale it up. I run four to ten AI agents at once, each with one job, all working from one written plan.',
        'I design the whole system myself, from the screen you tap to the database behind it. I pull data out of wherever it lives. And when I want to know how a piece of software works, I take it apart and build my own.',
        `The result: with Claude I can build almost anything digital. A food truck’s online ordering with real card payments. My university’s Net Price Calculator. ${games} games. It’s all here, and a few of the games I made with my son.`,
      ],
    },
    {
      id: 's3',
      tab: 'New 3',
      name: 'The path, short, with the skills packed in',
      text: [
        'I’ve been teaching myself to build things since 2008. My degree is in psychology, not computer science, so I learned by building: first websites for small businesses, then software at a university, where I’m an engineer today.',
        'Around 2023 I started using AI every day. Today I can build almost anything digital with Claude.',
        'I do it by setting the AI up well. I organize data so it can read it. I plug in tools through MCP so it can act. I run teams of AI agents on one written plan. And I design the full system, from the page you see to the database behind it.',
        'I also pull data out of messy sources, and I take software apart to learn how it works, then build my own.',
        `That’s how a food truck got online ordering with real card payments, how my university got its Net Price Calculator, and how this site got ${games} games. A few of them I made with my son.`,
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
  const [id, setId] = useState<string>('s1');
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
