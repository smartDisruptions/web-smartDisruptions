/**
 * Every video on /videos: the music videos, the short films drawn in code and
 * the game trailers. One list, so the page can sort it three ways: by kind, by
 * the Claude model that made it, and by what it is about.
 *
 * It is a benchmark as well as a library. Each video names the model that made
 * it, read from that work's own commits, so a viewer can pick a model and see
 * what it made. A new video is one new entry here; a new model or topic is one
 * new line in `makers` or `topics`.
 *
 * Each video's files live in its `dir` under public/:
 *   film.mp4      H.264 with faststart, so it plays while it downloads
 *   lite.mp4      a lighter copy (about 1 Mbps) for phones and slow
 *                 connections, where film.mp4 is heavier than that
 *   poster.webp   1280x720, the frame on the screen before play
 *   thumb.webp     640x360, the same frame for the library and for phones
 *   captions.vtt  the lyrics, timed (music videos only)
 * `node scripts/video-assets.mjs` makes the two stills and prints a `tint`.
 */
export type VideoStep = { title: string; body: string };
export type LyricSection = { label: string; hook?: boolean; lines: string[] };

/** What kind of video it is. The kanji is the stamp on its card. */
export const kinds = [
  {
    id: 'music-video',
    label: 'Music videos',
    short: 'Music',
    one: 'Music video',
    kanji: '拍',
  },
  {
    id: 'code-film',
    label: 'Code films',
    short: 'Films',
    one: 'Code film',
    kanji: '光',
  },
  {
    id: 'game-trailer',
    label: 'Game trailers',
    short: 'Trailers',
    one: 'Game trailer',
    kanji: '遊',
  },
] as const;
export type KindId = (typeof kinds)[number]['id'];

/** The Claude model that made it. Newest model first. */
export const makers = [
  { id: 'fable-5-2', name: 'Claude Fable 5.2', short: 'Fable 5.2' },
  { id: 'opus-5-5', name: 'Claude Opus 5.5', short: 'Opus 5.5' },
] as const;
export type MakerId = (typeof makers)[number]['id'];

/** What it is about. `say` is how it reads inside the finder's sentence. */
export const topics = [
  { id: 'science', label: 'Science', say: 'science' },
  { id: 'nature', label: 'Nature', say: 'nature' },
  { id: 'rhythm', label: 'Rhythm', say: 'rhythm' },
  { id: 'stories', label: 'Stories', say: 'stories' },
  { id: 'work', label: 'Work and AI', say: 'work and AI' },
  { id: 'games', label: 'Games', say: 'games' },
] as const;
export type TopicId = (typeof topics)[number]['id'];

export type Video = {
  slug: string;
  kind: KindId;
  title: string;
  /** One line: what happens. */
  line: string;
  /** A short paragraph: what it's about, or what to notice. All of it true. */
  about: string;
  /** ISO date it was made. */
  date: string;
  /** Running time in seconds (may be fractional; shown as whole seconds). */
  seconds: number;
  maker: MakerId;
  topics: TopicId[];
  /** The public folder that holds its files. */
  dir: string;
  /** True when the folder has captions.vtt. */
  captions?: boolean;
  /** True when the folder has lite.mp4, a lighter copy (about 1 Mbps) that
      phones and slow connections play instead. */
  lite?: boolean;
  /** Two colours from its poster: the light it throws on the room. */
  tint: [string, string];
  facts: string[];
  /** What it cost to make, in plain words. */
  cost: string;
  steps: VideoStep[];
  lyrics?: LyricSection[];
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

/** How Opus 5.5's six films were made. They share one answer. */
const OPUS_FILM_STEPS: VideoStep[] = [
  {
    title: 'Opus 5.5 chose the films.',
    body: 'It picked every subject and every look, then gave each film to its own agent. All the work is in git, and every commit is co-authored by Claude Opus 5.5.',
  },
  {
    title: 'Code draws every frame.',
    body: 'Each shot is a small program that runs on the graphics chip (a shader) and works out the colour of every pixel. Every frame is drawn 4 to 16 times over and blended, which gives soft motion blur and clean edges.',
  },
  {
    title: 'The music is code too.',
    body: 'Every score is synthesized in the browser, note by note, on the same clock as the picture. There are no samples and no recordings.',
  },
  {
    title: 'Two notes from me.',
    body: 'I asked for the fox’s leap to be redrawn. Then 186,282 cut away about a second after each key sentence, so all six were re-cut to hold every line for about a second plus 0.3 seconds a word, checked by a script that reads each film the way a viewer does.',
  },
];
const FILM_COST =
  'Nothing. No image or video model was used, and no API credits were spent.';
const film = (style: string) => [
  style,
  'Every frame drawn by code',
  'Score synthesized in code',
  'No camera, no footage',
];

/** How the three game trailers were made. They share one answer too. */
const TRAILER_STEPS: VideoStep[] = [
  {
    title: 'The game was filmed frame by frame.',
    body: 'Each game ran with no window, on a clock the script controls, and was filmed at 120 game frames a second with real inputs. Every shot came with a note marking the exact frame each hit lands on, read from the game’s own code.',
  },
  {
    title: 'Every big hit is pinned to a beat.',
    body: 'A cut is a beat grid plus clips. A hit is pinned to a beat, and the footage speeds up or slows down smoothly around it.',
  },
  {
    title: 'One program draws every frame.',
    body: 'A single page draws each frame from its number alone: the footage, the transitions (a blade slash, ink, a burn, a shatter) and the lens effects. Five browser pages rendered it side by side on the graphics chip.',
  },
  {
    title: 'The sound is the game’s own.',
    body: 'The music is the game’s own track and the hits are the game’s own sounds, placed on the frames they belong to, with whooshes and drums from my sound library on the cuts. The drum hits in each song were measured, and the song was moved a few thousandths of a second so the cuts sit on them.',
  },
];
const TRAILER_COST =
  'Nothing new. The games, their music and their sounds already existed.';

/** In the order the library shows them when nothing is sorted. */
export const videos: Video[] = [
  {
    slug: 'keep-the-light-on',
    kind: 'music-video',
    title: 'Keep the Light On',
    line: 'A dad, a desk lamp, and a job that keeps getting easier for the machines.',
    about:
      'He learned to code in 2023. Then the models started finishing his lines, then his files, then the whole design. So after his son is asleep he switches the lamp on and learns. He builds something he’s proud of, and the comments call it slop. He keeps going anyway, for the two people down the hall.',
    date: '2026-11-15',
    seconds: 174,
    maker: 'fable-5-2',
    topics: ['stories', 'work'],
    dir: '/videos/keep-the-light-on',
    lite: true,
    captions: true,
    tint: ['#4ba0d2', '#d2834b'],
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
    slug: 'speed-of-light',
    kind: 'code-film',
    title: '186,282',
    line: 'One red photon crosses ever-larger distances until the numbers say it: everything you see is the past.',
    about:
      'A title sequence on a 16 × 9 grid. The Moon shot runs in real time and to scale, so the light takes the true 1.28 seconds to cross, and the score is tuned so one note sits at exactly 186.282 Hz.',
    date: '2026-11-15',
    seconds: 108,
    maker: 'opus-5-5',
    topics: ['science'],
    dir: '/films/opus-5-5/speed-of-light',
    tint: ['#e2412a', '#7f8aa8'],
    cost: FILM_COST,
    facts: film('Swiss graphic'),
    steps: OPUS_FILM_STEPS,
  },
  {
    slug: 'kiru',
    kind: 'game-trailer',
    title: 'Kiru',
    line: 'A perfect dodge in slow motion, then fire, ice and lightning, cut to the game’s battle theme.',
    about:
      'The drop, the crowd, Kage, and all three ultimates. Look for the blade that cuts the frame in two, and the giant bolt landing on the song’s last note.',
    date: '2026-11-15',
    seconds: 20.4,
    maker: 'fable-5-2',
    topics: ['games'],
    dir: '/videos/kiru',
    lite: true,
    tint: ['#4b5cd2', '#e63845'],
    cost: TRAILER_COST,
    facts: [
      'Real gameplay',
      'Music: Ashen Shrine, the game’s battle theme',
      '168 beats a minute',
      '60 frames a second',
    ],
    steps: TRAILER_STEPS,
  },
  {
    slug: 'fox-and-the-moon',
    kind: 'code-film',
    title: 'The Fox and the Moon',
    line: 'A young fox who can’t sleep spends a year trying to catch the moon in a mountain lake.',
    about:
      'Brush and ink on rice paper that is generated too. The moon is never painted: it is always the bare paper the brush went around.',
    date: '2026-11-15',
    seconds: 88,
    maker: 'opus-5-5',
    topics: ['stories', 'nature'],
    dir: '/films/opus-5-5/fox-and-the-moon',
    tint: ['#cba052', '#8d98b3'],
    cost: FILM_COST,
    facts: film('Ink and wash'),
    steps: OPUS_FILM_STEPS,
  },
  {
    slug: 'learn-again',
    kind: 'music-video',
    title: 'Learn Again',
    line: 'The next five years of work, as one unbroken zoom through 24 paintings.',
    about:
      'A lofi forecast: the jobs that fade quietly, the ones that don’t, and the one skill that outlasts both. The camera dives through a screen in every scene into the next, without a cut, then rewinds the whole way home.',
    date: '2026-11-15',
    seconds: 168,
    maker: 'fable-5-2',
    topics: ['work'],
    dir: '/videos/learn-again',
    lite: true,
    captions: true,
    tint: ['#de8340', '#4b9bd2'],
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
  {
    slug: 'escapement',
    kind: 'code-film',
    title: 'Escapement',
    line: 'A blueprint draws itself to show how a mechanical watch keeps time, eight ticks a second.',
    about:
      'The mainspring winds, the gear train carries the energy, and the escapement lets it out in equal steps while the balance swings back and forth four times a second.',
    date: '2026-11-15',
    seconds: 96,
    maker: 'opus-5-5',
    topics: ['science'],
    dir: '/films/opus-5-5/escapement',
    tint: ['#368ce8', '#473fdf'],
    cost: FILM_COST,
    facts: film('Living blueprint'),
    steps: OPUS_FILM_STEPS,
  },
  {
    slug: 'tether-ball',
    kind: 'game-trailer',
    title: 'Tether Ball: King of the Pole',
    line: 'The new kid crosses the yard to take the pole from three legends.',
    about:
      'VS slams on the drop, then a rally, the specials and the three legends, and the rope winds up. The lyrics land word by word, and the ball hits the pole on the last “pole”.',
    date: '2026-11-15',
    seconds: 20.9,
    maker: 'fable-5-2',
    topics: ['games'],
    dir: '/videos/tether-ball',
    lite: true,
    tint: ['#e7eb33', '#86e23c'],
    cost: TRAILER_COST,
    facts: [
      'Real gameplay',
      'Music: the game’s own song',
      '92 beats a minute',
      '60 frames a second',
    ],
    steps: TRAILER_STEPS,
  },
  {
    slug: 'three-against-four',
    kind: 'code-film',
    title: 'Three Against Four',
    line: 'Every shape is an instrument, and the screen is the score.',
    about:
      'Red, yellow and blue on warm paper. The red circle plays three notes a bar, the blue square four and the yellow triangle five; they only meet on the bar line, and every cut lands on one of those shared beats.',
    date: '2026-11-15',
    seconds: 69,
    maker: 'opus-5-5',
    topics: ['rhythm'],
    dir: '/films/opus-5-5/three-against-four',
    tint: ['#3377ea', '#e2412a'],
    cost: FILM_COST,
    facts: film('Bauhaus visual music'),
    steps: OPUS_FILM_STEPS,
  },
  {
    slug: 'one-drop',
    kind: 'code-film',
    title: 'One Drop',
    line: 'A whole living world, glowing in the dark inside one drop of pond water.',
    about:
      'Glass diatoms, rolling Volvox with daughter colonies inside, a rotifer whose crown spins like a wheel, and a water flea whose heart you can watch beating.',
    date: '2026-11-15',
    seconds: 81,
    maker: 'opus-5-5',
    topics: ['science', 'nature'],
    dir: '/films/opus-5-5/one-drop',
    tint: ['#d2a44b', '#4bd2c4'],
    cost: FILM_COST,
    facts: film('Darkfield microscope'),
    steps: OPUS_FILM_STEPS,
  },
  {
    slug: 'serious-slap-champion',
    kind: 'game-trailer',
    title: 'Serious Slap Champion',
    line: 'A slapping contest from the first “No.” to the trophy, with every slap on a beat.',
    about:
      '“No.” He slaps you. Your first big hit, everyone hits back, the arena, the champion knocks you out, then the last slap and the trophy. The music goes muffled when you get slapped, and stops dead before the final blow.',
    date: '2026-11-15',
    seconds: 21,
    maker: 'fable-5-2',
    topics: ['games'],
    dir: '/videos/serious-slap-champion',
    lite: true,
    tint: ['#f32b33', '#e98d35'],
    cost: TRAILER_COST,
    facts: [
      'Real gameplay',
      'Music: the game’s lo-fi koto beat',
      '80 beats a minute',
      '60 frames a second',
    ],
    steps: TRAILER_STEPS,
  },
  {
    slug: 'rose-window',
    kind: 'code-film',
    title: 'Rose Window',
    line: 'A tree’s whole year, told in one window by a single day’s sun.',
    about:
      'Dawn is spring, noon is summer, the afternoon is autumn and dusk is winter. Then the camera pulls back into the stone nave as the window’s colours slide across the floor.',
    date: '2026-11-15',
    seconds: 77.5,
    maker: 'opus-5-5',
    topics: ['nature'],
    dir: '/films/opus-5-5/rose-window',
    tint: ['#ec7b31', '#5141dd'],
    cost: FILM_COST,
    facts: film('Stained glass'),
    steps: OPUS_FILM_STEPS,
  },
];

export const videoHref = (v: Video) => `/videos#${v.slug}`;
export const videoFile = (
  v: Video,
  name: 'film.mp4' | 'lite.mp4' | 'poster.webp' | 'thumb.webp' | 'captions.vtt'
) => `${v.dir}/${name}`;

export const kindOf = (v: Video) => kinds.find((k) => k.id === v.kind)!;
export const makerOf = (v: Video) => makers.find((m) => m.id === v.maker)!;

/** "1:48" (whole seconds: a film can run 77.5 s) */
export const runTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** "8 min 39 s", for a total. */
export const longTime = (s: number) => {
  const t = Math.round(s);
  return t < 60 ? `${t} s` : `${Math.floor(t / 60)} min ${t % 60} s`;
};
