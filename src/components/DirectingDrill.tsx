'use client';

import { useState } from 'react';

/**
 * In-post interactive drill for "You don't get replaced for being slow at AI".
 *
 * Deliberately NOT a quiz about the three skills — it makes the reader perform
 * them: pick real context out of decoys, mark planted errors in fluent-sounding
 * copy, and split a real task across the AI/approve/you line. Scores six skills
 * and prescribes the weakest one.
 *
 * All state is local — nothing is stored or sent anywhere, which the intro says
 * out loud so the reader doesn't have to wonder.
 *
 * On tokens: right/wrong use the bull/bear semantic inks (they encode meaning in
 * the data, per DESIGN.md), never the warm accent, which stays navigational.
 */

type SkillKey =
  | 'context'
  | 'verify'
  | 'delegation'
  | 'systems'
  | 'ownership'
  | 'judgment';

type Score = { got: number; max: number };
type Scores = Record<SkillKey, Score>;

const SKILL_META: Record<SkillKey, { label: string; sub: string }> = {
  context: { label: 'Context', sub: 'feeding it what it needs' },
  verify: { label: 'Verification', sub: 'catching what is wrong' },
  delegation: { label: 'Delegation', sub: 'splitting the work' },
  systems: { label: 'Systems', sub: 'repeating what works' },
  ownership: { label: 'Ownership', sub: 'answering for output' },
  judgment: { label: 'Judgment', sub: 'choosing what to make' },
};

const EMPTY: Scores = {
  context: { got: 0, max: 0 },
  verify: { got: 0, max: 0 },
  delegation: { got: 0, max: 0 },
  systems: { got: 0, max: 0 },
  ownership: { got: 0, max: 0 },
  judgment: { got: 0, max: 0 },
};

const QUESTIONS: {
  skill: SkillKey;
  q: string;
  a: [string, number][];
}[] = [
  {
    skill: 'delegation',
    q: 'Think about the last real work task you handed to AI. What did you actually send?',
    a: [
      ['A one-line request, and I used roughly what came back.', 0],
      ['A one-line request, then several rounds of “no, more like this”.', 1],
      [
        'The request plus the real files, numbers and constraints it needed.',
        2,
      ],
      [
        'I split the job first — decided what it would draft and what I would keep — then briefed it on its part.',
        3,
      ],
    ],
  },
  {
    skill: 'context',
    q: 'Output comes back generic and bland. What is your next move?',
    a: [
      ['Try a different tool or model.', 0],
      ['Reword the request and try again.', 1],
      ['Add who is reading it and what decision they have to make.', 2],
      [
        'Paste in two things I wrote myself that landed well, as the target.',
        3,
      ],
    ],
  },
  {
    skill: 'verify',
    q: 'The last time AI handed you something confidently wrong — how did it get caught?',
    a: [
      ['Someone downstream caught it, not me.', 0],
      ['I do not use it for anything where that would matter.', 1],
      ['Something felt off, so I went back and checked the whole thing.', 2],
      [
        'I know the two or three things it always gets wrong in my work, and I check those first.',
        3,
      ],
    ],
  },
  {
    skill: 'systems',
    q: 'You have now done the same AI-assisted task a dozen times. What exists because of that?',
    a: [
      ['Nothing — I start from scratch each time.', 0],
      ['I scroll back and find an old chat to copy.', 1],
      ['A saved prompt or template I reuse.', 2],
      [
        'A repeatable process: same inputs, same checks, same output shape, every time.',
        3,
      ],
    ],
  },
  {
    skill: 'ownership',
    q: 'AI-assisted work goes out with your name on it and turns out to be wrong. What is true?',
    a: [
      ['I would make sure people knew the tool produced it.', 0],
      ['I will not put my name on anything I did not write myself.', 1],
      ['I would own it, but I could not tell you where it went wrong.', 2],
      [
        'I would own it, and I could point to the exact check of mine that failed.',
        3,
      ],
    ],
  },
  {
    skill: 'judgment',
    q: 'AI just made producing your main output five times cheaper. What changed about the job?',
    a: [
      ['Nothing yet.', 0],
      ['I produce about five times more of it.', 1],
      ['I spend the freed-up time on the parts only I can do.', 2],
      [
        'I got pickier — I make less, but I choose much better what is worth making.',
        3,
      ],
    ],
  },
];

const CHIPS: { t: string; good: boolean; why: string }[] = [
  {
    t: 'What actually happened this week — the real events, numbers and slipped dates',
    good: true,
    why: 'Facts it cannot possibly know. This is the whole ballgame: context is information, not instruction.',
  },
  {
    t: 'Tell it to be professional and concise',
    good: false,
    why: 'An adjective, not context. Style words nudge tone; they cannot invent the substance that was missing.',
  },
  {
    t: 'An update you wrote three months ago that landed well',
    good: true,
    why: 'A sample of “good” beats any description of good. Showing outperforms telling, every time.',
  },
  {
    t: 'Who reads it, and the one decision they need to make after reading',
    good: true,
    why: 'Purpose and audience change the whole shape of the output. Most of us never say either.',
  },
  {
    t: 'Tell it to act as an experienced project manager',
    good: false,
    why: 'Roleplay was an early-days trick. Current models already write like a competent PM — what they lack is your project.',
  },
  {
    t: "The company's founding year and mission statement",
    good: false,
    why: 'The convincing decoy. Real background, completely irrelevant to this week. Volume is not context.',
  },
  {
    t: 'Ask it to use bullet points',
    good: false,
    why: 'Formatting. Fine to specify, but it fixes appearance, not the emptiness underneath.',
  },
  {
    t: 'Mention that you are in a hurry',
    good: false,
    why: 'Tells it nothing usable. Urgency is a fact about you, not about the work.',
  },
];

// The proof paragraph. Error spans are the ones with `kind` — each is a
// different failure mode, because "AI gets things wrong" is not one skill.
const PROOF: { t: string; kind?: string; why?: string }[] = [
  { t: 'Our Q3 renewal rate came in at 87%, up from 81% in Q2. ' },
  {
    t: 'That puts us well ahead of the industry benchmark of 74% set by the 2024 Gartner Retention Index',
    kind: 'invented source',
    why: 'A source that does not exist, cited with a year and a proper name. Fabrications arrive dressed as the most authoritative sentence in the paragraph — which is exactly why they survive review.',
  },
  { t: '. The gain ' },
  {
    t: 'was driven by the new onboarding flow, which every customer on the platform has now adopted',
    kind: 'asserted cause',
    why: 'Two failures in one clause: a correlation restated as a cause, and an absolute (“every customer”) that is almost never true. Watch for because and all — that is where guesses get promoted to facts.',
  },
  {
    t: '. With 240 new accounts against 96 churned, net growth was 156 for the quarter, ',
  },
  {
    t: 'roughly 12% month over month',
    kind: 'no denominator',
    why: 'A percentage needs a base, and no base appears anywhere above. A quarterly total also cannot be restated as a monthly rate without one. Any number you cannot recompute from what is on the page is unverified.',
  },
  {
    t: '. Renewals remain our largest single driver of revenue retention, and the onboarding change is worth continued investment.',
  },
];

const LANES: { key: string; label: string }[] = [
  { key: 'runs', label: 'AI runs it' },
  { key: 'drafts', label: 'AI drafts it' },
  { key: 'you', label: 'You do it' },
];

const TASKS: { t: string; a: string; why: string }[] = [
  {
    t: "Pull last quarter's numbers out of six spreadsheets into one clean table",
    a: 'runs',
    why: 'Mechanical, checkable, and boring. Hand it over completely — then spot-check two rows against the source.',
  },
  {
    t: 'Decide which three results leadership actually needs to see',
    a: 'you',
    why: 'The judgment the whole deck rests on. It needs what is political, what is contested, and what you promised last quarter — none of which is in the data.',
  },
  {
    t: 'Turn the chosen results into first-draft slide copy',
    a: 'drafts',
    why: 'Classic first-draft work: fast to produce, fast for you to fix. The draft is worth having even when half of it is wrong.',
  },
  {
    t: 'Tell your boss the launch slipped, and why',
    a: 'you',
    why: 'Delivering bad news is a trust transaction. Outsourcing it does not save time, it spends credibility.',
  },
  {
    t: 'Reformat 40 slides to the new brand template',
    a: 'runs',
    why: 'Rule-following at volume with an obvious right answer. If you are still doing this by hand, that is the hour AI is meant to buy back.',
  },
  {
    t: 'Write the risks section',
    a: 'drafts',
    why: 'Good at generating the list, bad at knowing which risk is real here. Take the draft, cut two-thirds, add the one it could not know.',
  },
];

const PLANS: Record<
  SkillKey,
  { head: string; body: string; plan: [string, string][] }
> = {
  context: {
    head: 'Your weak point is context, and it is the cheapest one to fix',
    body: 'You are asking well and feeding it almost nothing. Everything you send is competing with a model that has never seen your project, your customer, or your last good draft. The fix is not better phrasing — it is volume of real material.',
    plan: [
      [
        'Week 1',
        'Before every request, paste in three times more background than feels necessary. Real documents, real numbers, real constraints.',
      ],
      [
        'Week 2',
        'Build a standing brief — one file with your role, your projects, your standards — and open every session with it.',
      ],
      [
        'Week 3',
        'Start attaching two samples of your own good work to anything that needs your voice.',
      ],
      [
        'Week 4',
        'Teach one colleague the difference between context and instructions. Fastest way to find out you actually know it.',
      ],
    ],
  },
  verify: {
    head: 'Your weak point is verification — the one that actually costs people their footing',
    body: 'If you cannot reliably separate correct from merely fluent, you are not supervising the output, you are forwarding it. That is the role an organisation eventually notices it does not need. The good news: this is where the expertise you already have becomes the asset.',
    plan: [
      [
        'Week 1',
        'Write down the three things AI most often gets wrong in your specific job. Check those first, every time.',
      ],
      [
        'Week 2',
        'Recompute every number and open every citation. Nothing unverifiable goes out with your name on it.',
      ],
      [
        'Week 3',
        'Deliberately ask it something you know cold, and study how the wrongness looked. That is the pattern you are training on.',
      ],
      [
        'Week 4',
        'Keep going deeper in your actual craft. Verification is domain expertise wearing a new hat.',
      ],
    ],
  },
  delegation: {
    head: 'Your weak point is splitting the work',
    body: 'You are handing over whole tasks or none of them. The leverage is in the seam: mechanical parts go over completely, judgment parts never do, and most real work is a mix that has to be cut apart before anything gets sent.',
    plan: [
      [
        'Week 1',
        'Before sending anything, write the job out in steps and label each one: runs it, drafts it, or you do it.',
      ],
      [
        'Week 2',
        'Brief it like a capable new hire — the goal, the constraints, what done looks like. Never one line.',
      ],
      [
        'Week 3',
        'Push back three times on every draft before you accept it, exactly as you would with a junior colleague.',
      ],
      [
        'Week 4',
        'Keep every relationship task — bad news, negotiation, credit, blame — on your side of the line permanently.',
      ],
    ],
  },
  systems: {
    head: 'Your weak point is systems — you are winning the same battle repeatedly',
    body: 'Your individual sessions are fine. But nothing compounds, because nothing gets saved. The people who pull ahead are not better at any single conversation — they turned the ones that worked into a process that runs the same way every time.',
    plan: [
      [
        'Week 1',
        'Track what you did more than three times this week. That list is your build queue.',
      ],
      [
        'Week 2',
        'Take the top one and write a reusable prompt for it, with the context slots already in place.',
      ],
      [
        'Week 3',
        'Add the checks to that process — what you verify, in what order — so quality stops depending on your mood.',
      ],
      [
        'Week 4',
        'Hand it to a colleague. If it works without you narrating it, it is a system.',
      ],
    ],
  },
  ownership: {
    head: 'Your weak point is ownership',
    body: 'You are either hiding behind the tool or hiding from it, and both cost the same thing. Every organisation needs a human who holds the keys, the money and the final yes. That role is durable precisely because a model cannot occupy it.',
    plan: [
      [
        'Week 1',
        'Say plainly how you work. “I drafted this with AI and I checked it” — out loud, once, to your team.',
      ],
      [
        'Week 2',
        'Define your sign-off bar in writing: what you personally verify before anything ships.',
      ],
      [
        'Week 3',
        'When something goes wrong, name which of your checks failed, not which tool produced it.',
      ],
      [
        'Week 4',
        'Volunteer to be the person your team routes AI questions to. Accountability is a position you take, not one you are given.',
      ],
    ],
  },
  judgment: {
    head: 'Your weak point is judgment — you got faster without getting pickier',
    body: 'Producing just got cheap, so producing stopped being where your value sits. If the only thing that changed is that more work comes out of you, you optimised the part of the job that no longer needs defending.',
    plan: [
      [
        'Week 1',
        'For everything you make this week, write one line: who is this for, and what changes if it exists?',
      ],
      [
        'Week 2',
        'Kill one thing you would normally produce out of habit. Notice whether anyone asks for it.',
      ],
      [
        'Week 3',
        'Spend the hour AI saved you on the highest-judgment thing on your list, not on more output.',
      ],
      [
        'Week 4',
        'Ask the person you report to which of your outputs they actually use. Adjust to that answer.',
      ],
    ],
  },
};

const ORDER: SkillKey[] = [
  'context',
  'verify',
  'delegation',
  'systems',
  'ownership',
  'judgment',
];

const STATIONS = [
  'Brief',
  'Diagnostic',
  'Context',
  'Proofing',
  'Splitting',
  'Verdict',
];

const eyebrow =
  'font-mono text-xs font-medium uppercase tracking-[0.08em] text-text-secondary';

export default function DirectingDrill() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Scores>(EMPTY);

  const [qi, setQi] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [chipsGraded, setChipsGraded] = useState(false);
  const [marks, setMarks] = useState<number[]>([]);
  const [proofGraded, setProofGraded] = useState(false);
  const [lanes, setLanes] = useState<Record<number, string>>({});
  const [tasksGraded, setTasksGraded] = useState(false);

  function award(skill: SkillKey, got: number, max: number) {
    setScores((s) => ({
      ...s,
      [skill]: { got: s[skill].got + got, max: s[skill].max + max },
    }));
  }

  function reset() {
    setScores(EMPTY);
    setQi(0);
    setPicks([]);
    setChipsGraded(false);
    setMarks([]);
    setProofGraded(false);
    setLanes({});
    setTasksGraded(false);
    setStep(0);
  }

  const chipHits = picks.filter((i) => CHIPS[i].good).length;
  const errIdx = PROOF.map((p, i) => (p.kind ? i : -1)).filter((i) => i >= 0);
  const proofHits = marks.filter((i) => PROOF[i].kind).length;
  const proofFalse = marks.filter((i) => !PROOF[i].kind).length;
  const taskHits = TASKS.filter((t, i) => lanes[i] === t.a).length;

  return (
    <section
      aria-label="Interactive drill"
      className="not-prose my-14 overflow-hidden rounded-xl border border-border bg-surface"
    >
      {/* Station rail */}
      <div className="flex gap-1.5 border-b border-border bg-surface-elevated px-6 py-4">
        {STATIONS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1.5">
            <div
              className={`h-[3px] rounded-full ${i <= step ? 'bg-accent' : 'bg-border'}`}
            />
            <span
              className={`hidden truncate font-mono text-[10px] uppercase tracking-[0.08em] sm:block ${
                i === step ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {/* ---------- 0. BRIEF ---------- */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <span className={eyebrow}>The brief · about 10 minutes</span>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
              Three drills, not a quiz
            </h3>
            <p className="text-text-primary/85">
              Six questions about what you actually did last week, then three
              drills that make you do the thing rather than read about it: pick
              real context out of decoys, mark the planted errors in a report
              that reads perfectly, and split a real task.
            </p>
            <p className="text-sm text-text-secondary">
              Nothing is saved and nothing is sent anywhere — it all stays in
              this browser tab.
            </p>
            <div>
              <button
                onClick={() => setStep(1)}
                className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
              >
                Begin
              </button>
            </div>
          </div>
        )}

        {/* ---------- 1. DIAGNOSTIC ---------- */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <span className={eyebrow}>
              Question {qi + 1} of {QUESTIONS.length}
            </span>
            <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-text-primary">
              {QUESTIONS[qi].q}
            </h3>
            <div className="flex flex-col gap-2">
              {QUESTIONS[qi].a.map(([text, val], i) => (
                <button
                  key={i}
                  onClick={() => {
                    award(QUESTIONS[qi].skill, val, 3);
                    if (qi + 1 < QUESTIONS.length) setQi(qi + 1);
                    else setStep(2);
                  }}
                  className="flex items-baseline gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-3.5 text-left text-text-primary transition-colors hover:border-accent hover:bg-fill"
                >
                  <span className="font-mono text-[11px] text-text-secondary">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-text-secondary">
              Answer as you actually behaved last week, not as you intend to
              behave next week.
            </p>
          </div>
        )}

        {/* ---------- 2. CONTEXT ---------- */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <span className={eyebrow}>Drill 1 · Context</span>
            <h3 className="font-display text-xl font-semibold tracking-tight text-text-primary">
              You sent this. It came back generic.
            </h3>
            <p className="rounded-lg border-l-2 border-text-secondary bg-fill px-4 py-3 font-mono text-sm text-text-secondary">
              Write a project update email for my team.
            </p>
            <p className="text-text-primary/85">
              Eight things you could add. Pick the <strong>three</strong> that
              would most improve what comes back.
            </p>
            <div className="flex flex-col gap-2">
              {CHIPS.map((c, i) => {
                const on = picks.includes(i);
                let tone = 'border-border bg-surface-elevated';
                let tag = '';
                if (chipsGraded) {
                  if (on && c.good) {
                    tone = 'border-bull bg-bull-soft';
                    tag = 'counts';
                  } else if (!on && c.good) {
                    tone = 'border-bull border-dashed';
                    tag = 'missed';
                  } else if (on && !c.good) {
                    tone = 'border-bear bg-bear-soft';
                    tag = 'noise';
                  }
                } else if (on) {
                  tone = 'border-accent bg-fill';
                }
                return (
                  <button
                    key={i}
                    disabled={chipsGraded}
                    onClick={() =>
                      setPicks((p) =>
                        p.includes(i)
                          ? p.filter((x) => x !== i)
                          : p.length < 3
                            ? [...p, i]
                            : p
                      )
                    }
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-text-primary transition-colors ${tone} ${
                      chipsGraded ? '' : 'hover:border-accent'
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 flex-none place-items-center rounded-sm border text-[10px] leading-none ${
                        on
                          ? 'border-accent bg-accent text-background'
                          : 'border-text-secondary text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span>{c.t}</span>
                    {tag && (
                      <span
                        className={`ml-auto flex-none font-mono text-[10px] uppercase tracking-[0.08em] ${
                          tag === 'noise' ? 'text-bear' : 'text-bull'
                        }`}
                      >
                        {tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {!chipsGraded ? (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={picks.length !== 3}
                  onClick={() => {
                    setChipsGraded(true);
                    award('context', chipHits, 3);
                  }}
                  className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Check my picks
                </button>
                <span className="font-mono text-xs text-text-secondary">
                  {picks.length} of 3 selected
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {CHIPS.map((c, i) =>
                    picks.includes(i) || c.good ? (
                      <div
                        key={i}
                        className={`border-l-2 pl-4 text-[0.95rem] leading-relaxed text-text-secondary ${
                          c.good ? 'border-bull' : 'border-bear'
                        }`}
                      >
                        <span
                          className={`mr-2 font-mono text-[10px] uppercase tracking-[0.08em] ${
                            c.good ? 'text-bull' : 'text-bear'
                          }`}
                        >
                          {c.good ? 'context' : 'not context'}
                        </span>
                        <strong className="text-text-primary">{c.t}</strong> —{' '}
                        {c.why}
                      </div>
                    ) : null
                  )}
                </div>
                <div>
                  <button
                    onClick={() => setStep(3)}
                    className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
                  >
                    Next drill — {chipHits} of 3 found
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- 3. PROOFING ---------- */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <span className={eyebrow}>Drill 2 · Proofing</span>
            <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-text-primary">
              Your AI wrote this quarterly summary. Three things in it are
              wrong.
            </h3>
            <p className="text-text-primary/85">
              It reads clean, which is the problem. Click the phrases you would
              not sign your name to. Over-flagging counts against you — marking
              everything is not judgment.
            </p>
            <p className="rounded-lg border border-border bg-surface-elevated px-5 py-4 leading-loose text-text-primary">
              {PROOF.map((part, i) => {
                const on = marks.includes(i);
                let cls = 'border-b border-dotted border-text-secondary';
                if (proofGraded) {
                  if (part.kind && on)
                    cls =
                      'bg-bull-soft border-b-2 border-bull line-through decoration-bull decoration-2';
                  else if (part.kind && !on)
                    cls = 'bg-bear-soft border-b-2 border-bear';
                  else if (on) cls = 'border-b-2 border-bear opacity-60';
                  else cls = '';
                } else if (on) {
                  cls = 'bg-fill border-b-2 border-accent';
                }
                return (
                  <button
                    key={i}
                    disabled={proofGraded}
                    onClick={() =>
                      setMarks((m) =>
                        m.includes(i) ? m.filter((x) => x !== i) : [...m, i]
                      )
                    }
                    className={`inline text-left ${cls} ${
                      proofGraded ? '' : 'hover:bg-fill'
                    }`}
                  >
                    {part.t}
                  </button>
                );
              })}
            </p>
            {!proofGraded ? (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    setProofGraded(true);
                    award(
                      'verify',
                      Math.max(0, proofHits - Math.min(proofFalse, 2)),
                      3
                    );
                  }}
                  className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
                >
                  Check my marks
                </button>
                <span className="font-mono text-xs text-text-secondary">
                  {marks.length} marked
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {errIdx.map((i) => {
                    const caught = marks.includes(i);
                    return (
                      <div
                        key={i}
                        className={`border-l-2 pl-4 text-[0.95rem] leading-relaxed text-text-secondary ${
                          caught ? 'border-bull' : 'border-bear'
                        }`}
                      >
                        <span
                          className={`mr-2 font-mono text-[10px] uppercase tracking-[0.08em] ${
                            caught ? 'text-bull' : 'text-bear'
                          }`}
                        >
                          {PROOF[i].kind}
                        </span>
                        <strong className="text-text-primary">
                          {caught ? 'Caught it.' : 'Missed.'}
                        </strong>{' '}
                        {PROOF[i].why}
                      </div>
                    );
                  })}
                  {proofFalse > 0 && (
                    <div className="border-l-2 border-bear pl-4 text-[0.95rem] leading-relaxed text-text-secondary">
                      <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.08em] text-bear">
                        over-flag
                      </span>
                      <strong className="text-text-primary">
                        {proofFalse} clean phrase
                        {proofFalse > 1 ? 's' : ''} marked.
                      </strong>{' '}
                      Suspicion is not verification. Flag everything and you
                      have stopped adding judgment and started adding delay —
                      and people quietly route around you.
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => setStep(4)}
                    className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
                  >
                    Next drill — {proofHits} of 3 found
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- 4. SPLITTING ---------- */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <span className={eyebrow}>Drill 3 · Splitting</span>
            <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-text-primary">
              Task on your desk: prepare the quarterly business review
            </h3>
            <p className="text-text-primary/85">
              Send each piece where it belongs. <strong>Runs it</strong> means
              you take the output as-is. <strong>Drafts it</strong> means you
              edit and approve. <strong>You do it</strong> means handing it over
              would cost you something.
            </p>
            <div className="flex flex-col gap-3">
              {TASKS.map((t, i) => {
                const right = tasksGraded && lanes[i] === t.a;
                const wrong = tasksGraded && lanes[i] !== t.a;
                return (
                  <div
                    key={i}
                    className={`flex flex-col gap-3 rounded-lg border px-4 py-3.5 ${
                      right
                        ? 'border-bull bg-bull-soft'
                        : wrong
                          ? 'border-bear bg-bear-soft'
                          : 'border-border bg-surface-elevated'
                    }`}
                  >
                    <span className="text-text-primary">{t.t}</span>
                    <div className="flex flex-wrap gap-2">
                      {LANES.map((l) => {
                        const on = lanes[i] === l.key;
                        const isAnswer = tasksGraded && l.key === t.a;
                        return (
                          <button
                            key={l.key}
                            disabled={tasksGraded}
                            onClick={() =>
                              setLanes((s) => ({ ...s, [i]: l.key }))
                            }
                            className={`rounded-md border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
                              on
                                ? 'border-accent bg-accent text-background'
                                : isAnswer
                                  ? 'border-dashed border-bull text-bull'
                                  : 'border-border text-text-secondary hover:border-accent hover:text-text-primary'
                            }`}
                          >
                            {l.label}
                          </button>
                        );
                      })}
                    </div>
                    {tasksGraded && (
                      <p
                        className={`text-sm leading-relaxed ${right ? 'text-bull' : 'text-bear'}`}
                      >
                        {right
                          ? '✓ '
                          : `→ ${LANES.find((l) => l.key === t.a)?.label}. `}
                        <span className="text-text-secondary">{t.why}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {!tasksGraded ? (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  disabled={Object.keys(lanes).length !== TASKS.length}
                  onClick={() => {
                    setTasksGraded(true);
                    award('delegation', taskHits, TASKS.length);
                  }}
                  className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Check my split
                </button>
                <span className="font-mono text-xs text-text-secondary">
                  {Object.keys(lanes).length} of {TASKS.length} sorted
                </span>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setStep(5)}
                  className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
                >
                  See the verdict — {taskHits} of {TASKS.length} placed
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------- 5. VERDICT ---------- */}
        {step === 5 && <Verdict scores={scores} onReset={reset} />}
      </div>
    </section>
  );
}

function Verdict({ scores, onReset }: { scores: Scores; onReset: () => void }) {
  const pct = (k: SkillKey) =>
    scores[k].max ? Math.round((100 * scores[k].got) / scores[k].max) : 0;

  let weakest: SkillKey = ORDER[0];
  ORDER.forEach((k) => {
    if (pct(k) < pct(weakest)) weakest = k;
  });

  const total = ORDER.reduce((n, k) => n + scores[k].got, 0);
  const totalMax = ORDER.reduce((n, k) => n + scores[k].max, 0);
  const overall = totalMax ? Math.round((100 * total) / totalMax) : 0;

  const headline =
    overall >= 80
      ? 'You are directing it'
      : overall >= 55
        ? 'You are using it. You are not yet directing it.'
        : 'You are still competing with it';

  const p = PLANS[weakest];

  return (
    <div className="flex flex-col gap-6">
      <span className={eyebrow}>The verdict</span>
      <h3 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
        {headline}
      </h3>

      <div className="flex flex-col border-t border-border">
        {ORDER.map((k) => {
          const v = pct(k);
          const weak = k === weakest;
          return (
            <div
              key={k}
              className="grid grid-cols-[1fr_auto_2.5rem] items-center gap-4 border-b border-border py-3"
            >
              <div>
                <span className="font-semibold text-text-primary">
                  {SKILL_META[k].label}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                  {SKILL_META[k].sub}
                </span>
              </div>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-fill sm:w-28">
                <div
                  className={`h-full ${weak ? 'bg-bear' : 'bg-accent'}`}
                  style={{ width: `${Math.max(v, 3)}%` }}
                />
              </div>
              <span
                className={`text-right font-mono text-sm [font-variant-numeric:tabular-nums] ${
                  weak ? 'text-bear' : 'text-text-primary'
                }`}
              >
                {v}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border-l-2 border-accent bg-fill px-5 py-4">
        <h4 className="font-display text-lg font-semibold tracking-tight text-text-primary">
          {p.head}
        </h4>
        <p className="text-text-primary/85">{p.body}</p>
      </div>

      <div>
        <span className={eyebrow}>Your next 30 days</span>
        <div className="mt-3 flex flex-col border-t border-border">
          {p.plan.map(([when, what]) => (
            <div
              key={when}
              className="flex gap-4 border-b border-border py-3 text-text-primary/85"
            >
              <span className="w-16 flex-none font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                {when}
              </span>
              <p className="leading-relaxed">{what}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="self-start rounded-lg border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
      >
        Run it again
      </button>
    </div>
  );
}
