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
      '/images/apps/samurai-kitchen-1.png',
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
    thumbnailUrl: '/images/apps/cloth-simulator-thumbnail.png',
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
    slug: 'attack-in-space',
    name: 'Attack in Space',
    description:
      'A 3D space shooter with procedural audio, combo multipliers, and a custom ECS game engine built on Three.js.',
    longDescription:
      'A vertical-scrolling space shooter built from scratch on a custom Entity Component System engine powered by Three.js. The player pilots a ship through waves of enemies, collecting power-ups and building combo multipliers for high scores. Boss fights with unique attack patterns punctuate level progression. A procedural Web Audio synthesizer generates all sound effects and background music in real time — no audio files needed. The glass-panel HUD displays score, combo streak, shield status, weapon level, and bomb count with a cyberpunk-inspired neon aesthetic. The modular architecture separates physics, rendering, AI, spawning, and audio into independent ECS systems for clean game logic.',
    thumbnailUrl: '/images/apps/attack-in-space-thumbnail.png',
    screenshotUrls: [
      '/images/apps/attack-in-space-1.png',
      '/images/apps/attack-in-space-2.png',
    ],
    techStack: ['Three.js', 'Vite', 'Vanilla JavaScript', 'Web Audio API', 'ECS Architecture'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Custom Entity Component System engine enables modular game logic with clean separation of concerns',
      'Procedural Web Audio synthesizer generates all sound effects and music with zero audio files',
      'Boss fight system with unique attack patterns adds strategic depth beyond wave-based shooters',
      'Glass-panel HUD with cyberpunk neon aesthetic provides clear gameplay feedback at a glance',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-attack-in-space.vercel.app',
  },
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
