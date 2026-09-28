export interface App {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  thumbnailUrl: string;
  screenshotUrls: string[];
  techStack: string[];
  category: string;
  status: 'live' | 'beta' | 'development';
  outcomes: string[];
  buildDate: string;
  hasFullBreakdown: boolean;
  buildPlanAvailable: boolean;
  liveUrl?: string;
}

export const apps: App[] = [
  {
    slug: 'samurai-kitchen',
    name: 'Samurai Kitchen',
    description:
      "A food truck's website, where customers order and pay online.",
    longDescription:
      "The ordering site for Samurai Kitchen, a Japanese food truck and catering business, live on its own domain since August 2026. The menu, prices, opening hours and sold-out items all come straight from the owner's Square account — the same system his kiosk runs on — so nothing on the site can go stale. Customers build a cart with the truck's own customisations, pick a pickup time drawn from the live hours, and pay through Square; checkout locks when the truck is closed and stops taking orders half an hour before it shuts. The owner connected his own Square account through OAuth, so no access key ever changed hands, and the catering section takes inquiries for events.",
    thumbnailUrl: '/images/apps/samurai-kitchen-thumbnail.png',
    screenshotUrls: [
      '/images/apps/samurai-kitchen-1.webp',
      '/images/apps/samurai-kitchen-2.png',
      '/images/apps/samurai-kitchen-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Square API',
      'Neon Postgres',
      'Tailwind CSS',
    ],
    category: 'Commerce',
    status: 'live',
    outcomes: [
      "Live since August 2026 — real orders and real payments on the truck's own domain",
      "Menu, prices, hours and sold-outs read live from the owner's Square account, refreshed every minute",
      'Checkout locks outside opening hours and stops 30 minutes before close; scheduled pickups hold until due',
      'Owner connected his own Square account via OAuth — tokens encrypted at rest, renewed automatically',
    ],
    buildDate: '2025-02',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://samuraikitchencatering.com',
  },
  {
    slug: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description:
      'A timer that splits work into short bursts with breaks in between, and keeps a record of what you got done.',
    longDescription:
      'You set a timer, work until it rings, then take a break. This app keeps track of that for you. Attach a task to each session so you can see where the time actually went, and a chart of the last twelve weeks shows which days you worked and which you missed. There are ten badges to unlock and a streak to keep up. You can change how long the work and break periods run, play a background sound, and put the timer full screen so nothing else is on show. After each session you can rate how well it went. Everything stays on your own device, and you can download the lot as a file whenever you want.',
    thumbnailUrl: '/images/apps/pomodoro-thumbnail.png',
    screenshotUrls: [
      '/images/apps/pomodoro-1.png',
      '/images/apps/pomodoro-2.png',
      '/images/apps/pomodoro-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Zustand',
      'shadcn/ui',
    ],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'A chart of the last twelve weeks shows the days you worked and the days you missed, so a pattern is easy to spot.',
      'Ten badges and a running streak give you a reason to come back tomorrow.',
      'You rate each session afterwards, so you can see whether your focus is actually getting better.',
      'A background sound and a full screen mode keep everything else off the screen while the timer runs.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-pomodoro-blush.vercel.app',
  },
  {
    slug: 'spacex-mars',
    name: 'SpaceX Mars Transfer Simulation',
    description:
      'Shows the path a spacecraft takes from Earth to Mars. You can change the settings and watch the trip play out.',
    longDescription:
      'Earth and Mars are only close enough for a trip every couple of years, and the route between them is a long curve rather than a straight line. This shows both. The planets move at their real speeds and distances, worked out from real orbital calculations rather than drawn by hand, so a launch only becomes possible when the two planets line up properly. You can speed the clock up or slow it down, zoom in and out, turn the orbit lines on and off, and click a planet to see where it is and how fast it is going. A log lists every launch, journey and arrival as they happen.',
    thumbnailUrl: '/images/apps/spacex-mars-thumbnail.png',
    screenshotUrls: [
      '/images/apps/spacex-mars-1.png',
      '/images/apps/spacex-mars-2.png',
      '/images/apps/spacex-mars-3.png',
    ],
    techStack: [
      'HTML5 Canvas',
      'Vanilla JavaScript',
      'CSS3',
      'Orbital Mechanics',
    ],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'The planets move at their true speeds and distances, so a launch only becomes possible when they line up, the same as in real life.',
      'You can speed the clock up, slow it down, zoom in and out, and click a planet to see where it is and how fast it is going.',
      'A log lists every launch, every journey and every arrival as they happen.',
      'The planet surfaces are drawn by the page rather than photographed, and it works with a mouse or a finger.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-spacex-mars.vercel.app',
  },
  {
    slug: 'cloth-simulator',
    name: 'Cloth Simulator',
    description:
      'A sheet of cloth you can pull, tear, burn and blow around with wind.',
    longDescription:
      'A piece of cloth hanging on the screen that behaves like real fabric. It is built from a grid of points joined to their neighbours, and everything it does follows from that. It sags under its own weight, swings when you pull it, and rips when you pull too hard. Drag it with the mouse, tear a hole in it, turn the wind on, or set it alight and watch the flames travel along the threads. There are ready made setups to try, including a flag, a curtain, a hammock, a spider web and a cape, and you can switch the material between cotton, silk, denim and chain, which changes how heavy and how stretchy it is.',
    thumbnailUrl: '/images/apps/cloth-simulator-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/cloth-simulator-1.png',
      '/images/apps/cloth-simulator-2.png',
      '/images/apps/cloth-simulator-3.png',
    ],
    techStack: ['HTML5 Canvas', 'Vanilla JavaScript', 'CSS3', 'Physics Engine'],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'The cloth is not an animation. Every point is worked out as you watch, sixty times a second, with no outside code doing the job.',
      'Five things to do to it: grab it, tear it, burn it, pin it, and blow wind at it.',
      'Ready made setups to try: a flag, a curtain, a hammock, a spider web and a cape, each hanging from different points.',
      'Four materials to switch between. Cotton, silk, denim and chain each have their own weight, stiffness and tearing point.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-cloth-simulator.vercel.app',
  },
  {
    slug: 'ai-diary',
    name: 'AI Diary',
    description:
      'A private journal. It tracks your mood over time and has a companion you can talk to about what you wrote.',
    longDescription:
      'Write about your day the way you would in any notebook. The app reads it back and shows you things you would not spot yourself: how your mood moves over the weeks, which subjects keep coming up, and how your writing changes. There is also a companion you can talk to about an entry, and it can pull out the things you said you would do and turn them into a list. Everything you write is kept on your own device rather than on a server.',
    thumbnailUrl: '/images/apps/ai-diary-thumbnail.png',
    screenshotUrls: [
      '/images/apps/ai-diary-1.png',
      '/images/apps/ai-diary-2.png',
      '/images/apps/ai-diary-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'OpenRouter API',
      'Zod',
    ],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'A companion you can talk to about an entry. It can also pull out the things you said you would do and turn them into a list.',
      'A mood line across your entries shows how you have been over weeks, not just today.',
      'It builds a picture of your personality from your writing, using the five traits psychologists commonly measure.',
      'Everything you write is kept on your own device rather than on a server.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-ai-diary.vercel.app',
  },
  {
    slug: 'aureum-snake',
    name: 'AUREUM Snake',
    description:
      'The snake game you already know, in gold and black. Eat, grow, and do not hit anything.',
    longDescription:
      'The snake game you already know, dressed in gold and black. You steer a snake around a board eighteen squares across, eating to grow, and it ends when you run into a wall or into yourself. Catching food without pausing builds a chain that is worth more points, and there are ten ranks to climb across however many games you play. It remembers your best score. There is a pad of arrows on screen for phones, and every sound is made by the game as you play, so nothing extra has to load. The whole thing is one file.',
    thumbnailUrl: '/images/apps/aureum-snake-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/aureum-snake-1.png',
      '/images/apps/aureum-snake-2.png',
      '/images/apps/aureum-snake-3.png',
    ],
    techStack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Eating without a break builds a chain worth more points, so there is a reason to keep moving.',
      'Ten ranks to climb, counted across every game you play rather than just this one.',
      'A pad of arrows on screen means it plays properly on a phone.',
      'Every sound is made by the game as you play, so nothing extra has to load.',
    ],
    buildDate: '2026-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-snake-smoky.vercel.app',
  },
  {
    slug: 'pebble-kart',
    name: 'Pebble Kart',
    description:
      'A kart racing game my son Gabe built himself, using the same AI tools I use.',
    longDescription:
      'This is the one thing on the site I did not build. My son Gabe did. I showed him how to ask an AI for a first working version of a game, and then how to keep asking for changes until it was the game he wanted. He did the rest himself. What he made is a kart race: you drive a kart around a track he designed, and it times your laps.',
    thumbnailUrl: '/images/apps/pebble-kart-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/pebble-kart-1.png',
      '/images/apps/pebble-kart-2.png',
      '/images/apps/pebble-kart-3.png',
    ],
    techStack: ['HTML5', 'TypeScript', 'Canvas', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Gabe built it himself, from the first rough version to the finished one.',
      'The first version that could be played came out of a single request to an AI. Everything after that came from asking for changes.',
      'A kid ran the whole loop on his own: ask, try it, ask again.',
      'You drive a kart around a track he designed, and it times your laps.',
    ],
    buildDate: '2026-05',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://pebble-kart-ten.vercel.app',
  },
  {
    slug: 'field-office',
    name: 'The Pembroke File',
    description:
      'A mystery game. You search a locked filing cabinet, solve five puzzles, and work out who took a diamond.',
    longDescription:
      'A noir mystery you solve by reading the case. The Pembroke Diamond — thirty-four carats — left the Ashford Museum in three minutes of dark, and the insurance investigator who worked the claim vanished, leaving his file locked in a cabinet: five drawers behind a brass dial, a letter lock, an alarm panel, a wire board, and a lever. Every answer is written somewhere in the documents you have already opened, and each drawer turns the case — an inside job, a rehearsed route, a canvass that came back empty, an appraisal that proves the stone was glass. Physical puzzles gate the locks: the museum’s shuffled night-reel plates, the investigator’s reconstruction torn to twelve pieces, a jammed card tray, a sabotaged lamp circuit — and a pencil rubbing that raises the one name he never dared file out of a blank desk pad. Verlet chain physics, synthesized Web Audio, keyboard paths for every puzzle, progress that survives reloads — all in a single HTML file with zero dependencies.',
    thumbnailUrl: '/images/apps/field-office-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/field-office-1.png',
      '/images/apps/field-office-2.png',
      '/images/apps/field-office-3.png',
    ],
    techStack: [
      'HTML5',
      'Canvas',
      'Vanilla JavaScript',
      'Web Audio API',
      'CSS3',
    ],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A five-act mystery where every clue is diegetic — the puzzles are the case artifacts',
      'Sliding-block and 8-puzzle boards generated and difficulty-verified by breadth-first search',
      'A pencil-rubbing canvas where the final name is never drawn — only revealed by shading around it',
      'Zero-dependency single-file build with keyboard access and reduced-motion support throughout',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-field-office.vercel.app',
  },
  {
    slug: 'grove',
    name: 'Grove',
    description:
      'A quiet puzzle game. Put matching tiles together on a honeycomb board and watch them grow into something bigger.',
    longDescription:
      'A slow puzzle game on a honeycomb board. Put two matching tiles next to each other and they join into the next thing up. You start with a seed and work up through twelve stages to a forest and beyond, and the colours of the board change as you climb, from dark soil to late afternoon light to silver. Joining several in a row is worth more. It remembers your best score and the furthest you have reached. It plays on a phone, works with no internet, and is one file.',
    thumbnailUrl: '/images/apps/grove-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/grove-1.png',
      '/images/apps/grove-2.png',
      '/images/apps/grove-3.png',
    ],
    techStack: ['HTML5', 'SVG', 'Vanilla JavaScript', 'CSS3'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Twelve stages to climb, each with its own colours, so the board looks different the further you get.',
      'Joining several tiles in a row is worth more than joining them one at a time.',
      'It remembers your best score and the furthest stage you have reached.',
      'It plays on a phone, works with no internet connection, and is a single file.',
    ],
    buildDate: '2026-04',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-grove.vercel.app',
  },
  {
    slug: 'going-traveling',
    name: 'Going Traveling',
    description:
      'A twelve day plan for a trip to Japan. Two versions of each day to choose between, a budget that changes with the size of your group, and an allergy list you set yourself.',
    longDescription:
      'A plan for twelve days across Tokyo, Hakone and Kyoto, built around a problem every travel plan has: the best thing to do next is usually the thing nearest to where you already are. So every day comes with two complete plans, and the stops in each were picked for being close together. If you want to swap something out, each alternative tells you how many extra minutes of travel it will cost from where that day already has you, before you pick it rather than after. There are 106 places in it, each with a map link and a review link that were checked rather than assumed. The allergy section is yours to set: pick from eleven things you cannot eat and the page rewrites itself around them, down to a card written in Japanese you can hand across a counter. The budget is kept in yen, converts at whatever rate you set, and changes with how many people are going, so travelling alone correctly costs more per person than travelling as a pair. It is one file with 91 photographs inside it, and it works with no internet.',
    thumbnailUrl: '/images/apps/going-traveling-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/going-traveling-1.webp',
      '/images/apps/going-traveling-2.webp',
      '/images/apps/going-traveling-3.webp',
    ],
    techStack: ['HTML5', 'Vanilla JavaScript', 'CSS3', 'SVG', 'Node.js'],
    category: 'Travel',
    status: 'live',
    outcomes: [
      'Pick from eleven things you cannot eat and the whole page rewrites itself around them, down to a card written in Japanese you can hand across a counter.',
      'Every alternative shows how many extra minutes of travel it costs before you choose it, so a bad choice is visible in advance.',
      'All 106 places carry a map link and a review link that were checked, not assumed.',
      'It is one file with 91 photographs inside it, and it needs no internet once it has opened.',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://going-traveling.vercel.app',
  },
  {
    slug: 'broom-blade',
    name: 'Broom & Blade',
    description:
      'Household chores turned into a game. Chores become quests that pay points and gold, and everyone in the family has their own character.',
    longDescription:
      'Built for my household: a candlelit guild hall where the chores hang as parchment quest slips on a board. Completing one pays XP and gold — XP climbs the hero through titles from Dust Squire to Legend of the Loom, gold buys avatar gear in the Armory, and every piece of gear carries a hidden flavor line and origin tale you can only read once you own it. Each family member runs their own hero on the same board; a Tourney Board compares the party on a radar crest and ranked duel bars, and a Skill Grove grows a glowing rune for every chore you master. Sealing a quest takes a held press, not a tap, so a scroll can never claim one by accident. Clear every daily quest and a hooded merchant offers three mystery boxes — a fortune, a gift, or a curse — and every fifth clean-sweep day he bows with a choice: a purse of gold, or a box holding one of thirty relics that cannot be bought, from a booger to Mjölnir. It ships as one HTML file with zero dependencies, installs to the home screen as a PWA, and synthesizes every sound with the Web Audio API.',
    thumbnailUrl: '/images/apps/broom-blade-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/broom-blade-1.webp',
      '/images/apps/broom-blade-2.webp',
      '/images/apps/broom-blade-3.webp',
    ],
    techStack: ['HTML5', 'Vanilla JavaScript', 'CSS3', 'SVG', 'Web Audio API'],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'Chores become quests with XP, gold, titles, and per-chore skill ranks — a full progression loop in a single HTML file',
      'Hold-to-seal completion and a password-gated reset make it safe in a kid\u2019s hands without an approval queue',
      'Every one of 67 items carries hidden flavor text and an origin tale, revealed only once earned',
      'A nightly mystery-box chance and a five-day clean-sweep milestone turn a finished board into a ritual worth keeping',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://broom-blade.vercel.app',
  },
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

/**
 * The Arcade line-up, in cabinet order. Josh's call on the ordering.
 *
 * This lives here rather than in the games page because /apps reads it too —
 * anything in the arcade is deliberately absent from the catalogue, so the two
 * pages must not keep separate lists that can drift apart.
 */
export const ARCADE_SLUGS = [
  'field-office',
  'cloth-simulator',
  'broom-blade',
  'grove',
  'pebble-kart',
  'aureum-snake',
];

/** Projects with a full write-up on /websites, so they skip the catalogue. */
// Slugs that live on /websites as a full write-up and are therefore filtered out
// of the /apps catalogue, so nothing is listed twice.
//
// Emptied 2026-08-26: Samurai Kitchen came off /websites (replaced by the
// Kitsune Kitchen demo), so it returns to the catalogue here rather than
// disappearing from the site altogether — this list is the only thing that was
// hiding it.
export const WEBSITE_SLUGS: string[] = [];

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
