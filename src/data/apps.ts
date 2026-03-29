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
    slug: 'cyberpunk-runner',
    name: 'Cyberpunk Runner',
    description:
      'Neon-soaked endless runner with lane-switching, combo multipliers, and a CRT scanline aesthetic.',
    longDescription:
      'An endless runner set on a glowing cyberpunk grid. The player dodges obstacles across three lanes, building combo multipliers for consecutive near-misses and collecting hack charges for a slow-motion ability. A full HUD tracks score, combo streak, velocity, and best run. The visual layer stacks CRT scanlines, a radial vignette, and neon glow effects over a perspective grid that accelerates as the run progresses. Game-over triggers a "FLATLINED" death screen with final stats. Built as a single HTML file with no dependencies — all rendering, input, and game logic in pure JavaScript on an HTML5 Canvas.',
    thumbnailUrl: '/images/apps/cyberpunk-runner-thumbnail.png',
    screenshotUrls: [
      '/images/apps/cyberpunk-runner-1.png',
      '/images/apps/cyberpunk-runner-2.png',
      '/images/apps/cyberpunk-runner-3.png',
    ],
    techStack: ['HTML5 Canvas', 'Vanilla JavaScript', 'CSS3', 'CRT Effects'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Three-lane runner with smooth input and accelerating difficulty curve',
      'Combo multiplier system rewards risk-taking with near-miss scoring',
      'CRT scanline overlay and neon glow create an authentic retro-futuristic atmosphere',
      'Zero-dependency single-file architecture loads instantly on any device',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-cyberpunk-runner.vercel.app',
  },
  {
    slug: 'neon-breakout',
    name: 'Neon Breakout',
    description:
      'Synthwave brick-breaker with boss fights, power-ups, achievements, and procedural audio.',
    longDescription:
      'A feature-rich breakout game wrapped in a synthwave neon aesthetic. Rows of rainbow-colored bricks shatter under a glowing ball while the paddle collects power-ups — multi-ball, wide paddle, laser, and more. Boss fights punctuate level progression with unique attack patterns and health bars. An achievement system tracks milestones, and a procedural Web Audio engine generates sound effects in real time with no audio files. Screen shake, CRT scanline overlays, and particle explosions keep the action visually punchy. The modular JavaScript architecture splits physics, rendering, input, audio, and game state into separate files bundled for production.',
    thumbnailUrl: '/images/apps/neon-breakout-thumbnail.png',
    screenshotUrls: [
      '/images/apps/neon-breakout-1.png',
      '/images/apps/neon-breakout-2.png',
      '/images/apps/neon-breakout-3.png',
    ],
    techStack: ['HTML5 Canvas', 'Vanilla JavaScript', 'CSS3', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Boss fight system with unique attack patterns adds strategic depth beyond classic breakout',
      'Procedural Web Audio engine generates all sound effects with zero external audio files',
      'Power-up system with multi-ball, laser, and paddle upgrades keeps gameplay varied',
      'Modular architecture splits 19 source files into physics, rendering, and game logic layers',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-neon-breakout.vercel.app',
  },
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
