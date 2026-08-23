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
      'Modern restaurant platform with online ordering, Square payments, and a loyalty rewards program.',
    longDescription:
      'A full-service restaurant website replacing an outdated WordPress site with a fast, mobile-first ordering experience. Customers browse a categorized menu with dietary tags, build a cart, and pay securely through Square Web Payments. A built-in loyalty program lets diners earn and redeem points on every order. The catering section offers pre-built platter packages with tiered sizing and pricing. An admin dashboard handles feedback management and configuration — all backed by Supabase for data persistence and Square APIs for payments, catalog, and loyalty.',
    thumbnailUrl: '/images/apps/samurai-kitchen-thumbnail.png',
    screenshotUrls: [
      '/images/apps/samurai-kitchen-1.webp',
      '/images/apps/samurai-kitchen-2.png',
      '/images/apps/samurai-kitchen-3.png',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Square API', 'Supabase', 'Tailwind CSS'],
    category: 'Commerce',
    status: 'live',
    outcomes: [
      'PCI-compliant checkout via Square Web Payments SDK',
      'Loyalty rewards program drives repeat orders with point-based redemptions',
      'Catering packages with tiered pricing expand revenue beyond dine-in',
      'Mobile-first menu browsing with dietary tags and category filtering',
    ],
    buildDate: '2025-02',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://samurai-kitchen-web.vercel.app',
  },
  {
    slug: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description:
      'A full-featured focus timer with analytics, achievements, and task tracking — built to actually improve how you work.',
    longDescription:
      'More than just a countdown clock. This Pomodoro Timer includes a complete productivity suite with session-linked task management, a 12-week activity heatmap, streak tracking, and an XP-based achievement system with 10 unlockable badges. Customizable focus, short break, and long break durations adapt to your workflow, while ambient sound and fullscreen focus mode eliminate distractions. Post-session reflections let you rate focus quality over time. All data persists locally with JSON export for full data ownership.',
    thumbnailUrl: '/images/apps/pomodoro-thumbnail.png',
    screenshotUrls: [
      '/images/apps/pomodoro-1.png',
      '/images/apps/pomodoro-2.png',
      '/images/apps/pomodoro-3.png',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'shadcn/ui'],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      '12-week activity heatmap reveals focus patterns and consistency gaps',
      'Achievement system with 10 badges drives daily engagement and streak-building',
      'Session reflections and analytics enable measurable focus quality improvement',
      'Ambient sound and fullscreen mode reduce context-switching by design',
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
      'Real-time orbital simulation of Earth-Mars Hohmann transfers with interactive controls and mission tracking.',
    longDescription:
      'A physics-accurate visualization of Starship missions between Earth and Mars using Hohmann transfer orbits computed from real Kepler equations. The simulation renders procedurally generated planet textures, calculates launch windows based on true phase angles, and tracks both outbound and return missions in real time. Interactive controls let you adjust simulation speed, toggle orbital trails, pan and zoom the solar system, and click planets for live orbital statistics. A mission log tracks every launch, transit, and arrival across the full simulation timeline.',
    thumbnailUrl: '/images/apps/spacex-mars-thumbnail.png',
    screenshotUrls: [
      '/images/apps/spacex-mars-1.png',
      '/images/apps/spacex-mars-2.png',
      '/images/apps/spacex-mars-3.png',
    ],
    techStack: ['HTML5 Canvas', 'Vanilla JavaScript', 'CSS3', 'Orbital Mechanics'],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'Physically accurate orbital mechanics computed in real astronomical units',
      'Dynamic Hohmann transfer windows calculated from true planetary phase angles',
      'Procedurally generated planet textures with particle-based launch effects',
      'Responsive touch/mouse controls for cross-device interactive exploration',
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
      'Interactive particle-based cloth physics with real-time tearing, wind, burning, and material switching.',
    longDescription:
      'A GPU-friendly 2D cloth simulation built entirely in vanilla JavaScript and HTML5 Canvas. A grid of particles connected by distance constraints forms realistic fabric that responds to gravity, wind, and user interaction. Drag to pull, right-click to tear, press W for gusting wind, or switch to burn mode and watch fire propagate across threads. Multiple preset scenes — flag, curtain, hammock, web, and cape — demonstrate different constraint layouts. Material presets (cotton, silk, denim, chain) adjust stiffness, weight, and tear threshold. All physics run at 60fps with configurable gravity direction and wind strength.',
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
      'Particle-constraint physics engine running at 60fps with no external libraries',
      'Five interactive modes — grab, tear, burn, pin, and wind — for hands-on fabric manipulation',
      'Six preset scenes showcase different constraint topologies and anchor configurations',
      'Material system with adjustable stiffness, weight, and tear thresholds for realistic behavior',
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
      'AI-powered personal journal with mood tracking, personality analysis, and an intelligent companion chat.',
    longDescription:
      'A thoughtful journaling app that combines daily writing with AI-driven insights. Write freely about your day, and the app analyzes your entries to reveal mood patterns, Big Five personality traits, and writing style metrics over time. A companion chat powered by Claude provides reflective conversation and can extract actionable todos from your entries. The mood timeline tracks emotional valence across 90 data points, while the profile page surfaces emotion patterns, vocabulary level, and topic trends. All data persists locally in the browser for complete privacy — no server-side storage of personal content.',
    thumbnailUrl: '/images/apps/ai-diary-thumbnail.png',
    screenshotUrls: [
      '/images/apps/ai-diary-1.png',
      '/images/apps/ai-diary-2.png',
      '/images/apps/ai-diary-3.png',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'OpenRouter API', 'Zod'],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'AI companion chat extracts todos and provides reflective conversation from journal entries',
      'Big Five personality profiling and mood timeline built from cumulative writing analysis',
      'Privacy-first architecture with all personal data stored locally in the browser',
      'Writing style analytics track formality, verbosity, vocabulary, and recurring topics',
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
      'Art Deco snake game with rank progression, chain scoring, and Web Audio sound effects — all in a single HTML file.',
    longDescription:
      'A luxurious take on the classic snake game, wrapped in an Art Deco aesthetic of gold and obsidian. Players guide a serpent across an 18x18 grid, eating food to grow while avoiding collisions. A chain-scoring system rewards consecutive catches, and a rank progression ladder (I through X) tracks mastery across sessions. The entire game — visuals, logic, and synthesized sound effects — ships as a single HTML file with zero dependencies. D-pad touch controls, pause and game-over overlays, persistent high scores via localStorage, and Web Audio API–driven sound design deliver a polished mobile-first experience.',
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
      'Zero-dependency single-file architecture delivers the entire game in one HTML document',
      'Chain-scoring and rank progression (I–X) add strategic depth beyond classic snake',
      'Web Audio API synthesizes eat, level-up, and game-over sounds without any audio assets',
      'Mobile-first D-pad controls with haptic feedback enable smooth touch gameplay',
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
      'A browser-based kart racer my son Gabe built himself with Claude — pebble-powered drifting, lap times, and a course made for joy.',
    longDescription:
      'The one game on this site I did not build — my son Gabe did. I taught him how to use Claude: how to get a first playable prototype from a single prompt, then edit and upgrade it with follow-up prompts. From there he ran the loop himself and made his own kart racer — a pebble-themed kart drifting around a hand-crafted course, with lap timing and responsive arcade controls. Prompt to prototype, then prompt to improve, in the hands of a kid.',
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
      'Built by my son Gabe himself — his own game, from prototype to polish',
      'A first playable version from a single prompt, then upgraded through follow-up prompts',
      'A kid running the full AI-native build loop: prototype, then iterate with prompts',
      'Pebble-themed drifting, lap timing, and arcade controls tuned for pick-up-and-play',
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
      'A stolen-diamond mystery played through a locked filing cabinet — five drawers, five puzzles, and a name that was never filed.',
    longDescription:
      'A noir mystery you solve by actually reading the case. The Pembroke Diamond — thirty-four carats — left the Ashford Museum in three minutes of dark, and the insurance investigator who worked the claim vanished, leaving his file locked in a cabinet: five drawers behind a brass dial, a letter lock, an alarm panel, a wire board, and a lever. Every answer is written somewhere in the documents you have already opened, and each drawer turns the case — an inside job, a rehearsed route, a canvass that came back empty, an appraisal that proves the stone was glass. Physical puzzles gate the locks: the museum’s shuffled night-reel plates, the investigator’s reconstruction torn to twelve pieces, a jammed card tray, a sabotaged lamp circuit — and a pencil rubbing that raises the one name he never dared file out of a blank desk pad. Verlet chain physics, synthesized Web Audio, keyboard paths for every puzzle, progress that survives reloads — all in a single HTML file with zero dependencies.',
    thumbnailUrl: '/images/apps/field-office-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/field-office-1.png',
      '/images/apps/field-office-2.png',
      '/images/apps/field-office-3.png',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API', 'CSS3'],
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
      'A hex-based merging puzzle game with 12 evolving tiers — from seed to eternity — in a single HTML file.',
    longDescription:
      'A meditative tile-merging puzzle played on a hexagonal board. Place matching tiles next to each other and watch them merge through 12 themed tiers — Seed, Sprout, Sapling, Oak, Grove, Forest, Woodland, Wilderness, Kingdom, Realm, Eternity — each with its own palette that progresses from dark earth through golden hour to ethereal moonsilver. Axial hex coordinates, pointy-top SVG rendering, and a forest-dawn aesthetic built with Cormorant Garamond and JetBrains Mono typography. Scores and best tiers persist via localStorage, with combo-based scoring that rewards chain merges. Ships as a single HTML file with zero dependencies — mobile-first, touch-optimized, and playable offline.',
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
      'Zero-dependency single-file architecture delivers the entire game in one HTML document',
      '12-tier progression system with themed palettes creates visual reward across long sessions',
      'Axial hex-coordinate math with SVG rendering enables crisp scaling on any viewport',
      'Mobile-first touch controls with persistent best scores via localStorage',
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
      'A 12-day Japan trip planner with two full day plans to switch between, a budget that scales with your party, and an allergy system you point at your own allergens.',
    longDescription:
      'A planning tool for a twelve-day trip through Tokyo, Hakone and Kyoto, built around the problem every itinerary has: the good options are the ones near where you already are. Every day carries two complete plans whose stops were chosen for proximity, and each swappable option is priced in travel minutes from the plan it is sitting in — so an option that pulls you across the city says so before you pick it, not after. Non-travel days can borrow any plan from any other day in the same city. Underneath sit 106 destinations, each with a map link and a review link verified against an independent geocode rather than guessed. The allergy section is configurable rather than baked in: choose from eleven allergens and the page rewrites itself — where each one sits in Japan\u2019s labelling law, where it hides, every meal format ranked for it, what to order by name, and a bilingual card to hand across a counter. The budget holds anything bought in Japan in yen and converts at a rate you set, scaling by party size, so a solo trip correctly costs more than half a trip for two. It ships as one self-contained HTML file with 91 photographs inlined, and works offline.',
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
      'Configurable allergy system covers 11 allergens against Japan\u2019s 8-mandatory / 20-recommended labelling law, generating a bilingual card from your selection',
      'Every swappable itinerary option is priced in travel minutes from the plan it sits in, so a bad geographic choice is visible before you make it',
      '106 destinations carry map and review links verified against an independent geocode, not assumed',
      'Ships as one self-contained HTML file with 91 photographs inlined \u2014 no network, no dependencies, works offline',
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
      'A chore tracker that plays like an RPG — chores are guild-board quests paying XP and gold, heroes level up and gear up, and a nightly mystery box rewards a clean sweep.',
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

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
