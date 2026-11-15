/**
 * The music videos on /videos, newest first. Each is a song written and sung
 * by ElevenLabs Music from lyrics, and a film made to it. The page, the
 * sitemap and the search index all read this list.
 *
 * The files live in public/videos/<slug>/: film.mp4 (1080p H.264, faststart,
 * so it plays while it downloads), poster.webp (the frame shown before play)
 * and captions.vtt (the lyrics, timed from the song's own word timestamps).
 */
export type VideoStep = { title: string; body: string };
export type LyricSection = { label: string; hook?: boolean; lines: string[] };

export type Video = {
  slug: string;
  title: string;
  /** One line under the title. */
  line: string;
  /** A short paragraph: what it's about. */
  about: string;
  /** ISO date it was made. */
  date: string;
  /** Running time, as shown and in seconds. */
  length: string;
  seconds: number;
  /** What it cost to make, in plain words. */
  cost: string;
  facts: string[];
  steps: VideoStep[];
  lyrics: LyricSection[];
};

const CHORUS_LIGHT = [
  'So I keep the light on, after everybody’s sleeping',
  'Keep the light on, got a family I’m keeping',
  'One more lesson, one more try',
  'I’ll learn it all before the morning light',
  'I keep the light on, keep the light on',
  'For you, for you',
];

const CHORUS_LEARN = [
  'Learn, unlearn, learn again',
  'The world won’t wait but it’s not the end',
  'Bend like the river, don’t break, just bend',
  'Learn, unlearn, learn again',
  'New tools, new rules, same heart, same hands',
  'Stay curious, that’s the plan',
  'Nobody’s got it all figured out, my friend',
  'So learn, unlearn, learn again',
];

export const videos: Video[] = [
  {
    slug: 'keep-the-light-on',
    title: 'Keep the Light On',
    line: 'A dad, a desk lamp, and a job that keeps getting easier for the machines.',
    about:
      'He learned to code in 2023. Then the models started finishing his lines, then his files, then the whole design. So after his son is asleep he switches the lamp on and learns. He builds something he’s proud of, and the comments call it slop. He keeps going anyway, for the two people down the hall.',
    date: '2026-11-15',
    length: '2:54',
    seconds: 174,
    cost: 'About $1.40 for the paintings and the animation, plus one song.',
    facts: [
      '25 paintings',
      '22 animated clips',
      '50 shots',
      'Every cut on the beat',
    ],
    steps: [
      {
        title: 'The song came first.',
        body: 'ElevenLabs Music wrote and sang it from the lyrics. It came back at exactly 80 beats per minute, with a timestamp for every sung word.',
      },
      {
        title: 'One sheet for the whole family.',
        body: 'The dad, the mom and the son were painted once, side by side. Every scene after that was painted with that sheet as its reference, so they stay the same three foxes in all 25 paintings. Six scenes were refused by the image model’s own filter and had to be repainted from another angle.',
      },
      {
        title: 'Each painting got one stage direction.',
        body: 'An image-to-video model (it takes a still picture and returns a few seconds of it moving) was handed a painting and a line like “the tower wobbles and falls, the little fox laughs”. A clip cost two to five cents, and all 22 were used.',
      },
      {
        title: 'Drawn on threes.',
        body: 'The clips come back small and soft. A second model redraws each frame sharp, and each drawing is then held for three frames, the way hand-drawn animation is shot. The camera still moves on every frame.',
      },
      {
        title: 'His screen is live code.',
        body: 'Everything on his monitor is drawn by a program, timed to the word being sung: the code that finishes itself, the bars climbing past the line marked “my job”, the three comments.',
      },
      {
        title: 'Cut to the beat.',
        body: 'Every cut lands on the beat. The lamp clicks on the word “on”. The seasons change outside the same window, and the lyrics are typed like comments in his editor.',
      },
    ],
    lyrics: [
      {
        label: 'Verse 1',
        lines: [
          'Twenty twenty-three, I learned to write code',
          'Late nights, hello world, a brand new road',
          'Got the job, got the badge, felt the door swing wide',
          'Told my wife “we made it,” with our kid by my side',
          'Then a chat box started finishing my lines',
          'First a function, then a file, then the whole design',
          'Every few months there’s a smarter one',
          'Doing in a minute what took me a month',
          'ChatGPT, Anthropic, they don’t sleep, they don’t tire',
          'Every update’s reaching one rung higher',
          'I read the release notes like weather reports',
          'Storm rolling in, and I’m still on the shore',
        ],
      },
      { label: 'Chorus', hook: true, lines: CHORUS_LIGHT },
      {
        label: 'Verse 2',
        lines: [
          'Clock out at five, then the real shift starts',
          'Dinner, bath time, glow-in-the-dark stars',
          'We build a tower out of blocks on the floor',
          'He laughs when it falls, says “Daddy, one more”',
          'I read him his story, I turn out his light',
          'Then walk down the hall to my desk for the night',
          'Prompts and agents, tabs and docs',
          'Teaching myself while I’m watching the clock',
          '’Cause the math in my head never lets me rest',
          'Rent, food, shoes, what if I’m next',
          'If I don’t learn this fast, if I fall behind',
          'How do I look my family in the eye',
        ],
      },
      {
        label: 'Bridge',
        lines: [
          'Now I can build things I never could before',
          'A game, a little world, I open up the door',
          'I post it up and wait, then the comments drop',
          '“It’s slop.” “Just slop.” “AI slop.”',
          'Nobody claps, nobody stays',
          'One little window in a great big wave',
          'But down the hall there’s a night-light on',
          'And a small voice saying “Dad, you made that one?”',
        ],
      },
      {
        label: 'Last chorus',
        hook: true,
        lines: [
          'So I keep the light on, let ’em call it what they want',
          'Keep the light on, for my wife and for my son',
          'One more lesson, one more try',
          'I’m still here in the morning light',
          'I keep the light on, keep the light on',
          'For you, for you',
        ],
      },
    ],
  },
  {
    slug: 'learn-again',
    title: 'Learn Again',
    line: 'The next five years of work, as one unbroken zoom through 24 paintings.',
    about:
      'A lofi forecast: the jobs that fade quietly, the ones that don’t, and the one skill that outlasts both. The camera dives through a screen in every scene into the next, without a cut, then rewinds the whole way home.',
    date: '2026-11-15',
    length: '2:48',
    seconds: 168,
    cost: 'About $1 of paintings, plus one song.',
    facts: [
      '24 paintings',
      'One unbroken shot',
      '23 dives',
      'Every dive on a bar line',
    ],
    steps: [
      {
        title: 'The song came first.',
        body: 'ElevenLabs Music composed it from a section-by-section plan and the lyrics. It came back at exactly 80 beats per minute, with a timestamp for every sung word.',
      },
      {
        title: 'Every painting hides a green screen.',
        body: 'Each scene was painted with one flat green rectangle in it: a monitor, a billboard, a train window, a picture frame.',
      },
      {
        title: 'The next painting goes inside it.',
        body: 'Code cuts out the green, finds its four corners, and maps the next painting into that shape in perspective. Repeat 23 times and you have one image nested 23 levels deep.',
      },
      {
        title: 'The paintings have depth.',
        body: 'A depth model estimates how far away every pixel is, so the chair in front slides past the city behind it when the camera drifts.',
      },
      {
        title: 'The camera follows the beat.',
        body: 'Each dive lands on a bar line. Lamps and screens glow on the kick, the frame nudges on the snare, and each lyric appears on the frame it is sung.',
      },
      {
        title: 'Then it rewinds.',
        body: 'In the last chorus the camera pulls back out through all 23 worlds, one per beat, to the desk where it started. The night turns to morning.',
      },
    ],
    lyrics: [
      {
        label: 'Verse 1',
        lines: [
          'Monday morning, same desk, same screen',
          'Inbox answers itself, know what I mean',
          'No pink slips, no alarms, no scene',
          'Just an empty chair where a job had been',
          'They don’t fire you, they just don’t replace',
          'Quiet cuts, slow fade, no trace',
          'First rung of the ladder went missing somehow',
          'Kids at the bottom asking, where do we start now',
          'It takes the tasks first, piece by piece',
          'Three used to do it, now it’s one with a team',
          'Of machines that never sleep or eat',
          'Five years coming, feel it under your feet',
        ],
      },
      { label: 'Chorus', hook: true, lines: CHORUS_LEARN },
      {
        label: 'Verse 2',
        lines: [
          'Plumber’s still booked and the nurse on call',
          'Hands in the real world don’t fade at all',
          'Trust is a thing that a model can’t sign',
          'Somebody’s name’s gotta go on the line',
          'So be the one who can brief the machine',
          'Check what comes back and know what it means',
          'Taste is the edge and judgment’s the key',
          'Ask better questions, that’s the new degree',
          'Don’t mourn the task, go find the need',
          'Teach what you learn, plant it like a seed',
          'One person now with a crew in the cloud',
          'Small can be mighty, say it out loud',
        ],
      },
      {
        label: 'Bridge',
        lines: [
          'Nobody knows how fast this goes',
          'Hold each other close',
          'We’ve done this before, every time it turned',
          'We adapt, we learn',
        ],
      },
    ],
  },
];

export const videoHref = (v: Video) => `/videos#${v.slug}`;
export const videoFile = (
  v: Video,
  name: 'film.mp4' | 'poster.webp' | 'captions.vtt'
) => `/videos/${v.slug}/${name}`;
