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
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
