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
    slug: 'review-funnel',
    name: 'Review Funnel',
    description:
      'Automated review collection and display system for local businesses.',
    longDescription:
      'A complete review management platform that automates the process of collecting, filtering, and displaying customer reviews. The system routes satisfied customers to public review platforms while capturing private feedback from dissatisfied ones — turning every interaction into a growth opportunity.',
    thumbnailUrl: '/images/apps/review-funnel-thumb.png',
    screenshotUrls: [
      '/images/apps/review-funnel-1.png',
      '/images/apps/review-funnel-2.png',
      '/images/apps/review-funnel-3.png',
    ],
    techStack: ['Next.js', 'Supabase', 'AI', 'Tailwind CSS'],
    category: 'Marketing',
    status: 'live',
    outcomes: [
      'Increased average Google rating from 3.8 to 4.6 stars',
      'Automated 90% of review follow-up workflows',
      'Reduced negative public reviews by 60%',
    ],
    buildDate: '2025-01',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
  },
  {
    slug: 'samurai-kitchen',
    name: 'Samurai Kitchen',
    description:
      'Restaurant website with online ordering and menu management.',
    longDescription:
      'A modern restaurant platform featuring a dynamic menu system, online ordering with real-time availability, and an integrated loyalty program. Built to replace an outdated WordPress site and bring the entire customer experience under one fast, mobile-first application.',
    thumbnailUrl: '/images/apps/samurai-kitchen-thumb.png',
    screenshotUrls: [
      '/images/apps/samurai-kitchen-1.png',
      '/images/apps/samurai-kitchen-2.png',
      '/images/apps/samurai-kitchen-3.png',
    ],
    techStack: ['React', 'Node.js', 'Stripe', 'Square API'],
    category: 'Commerce',
    status: 'live',
    outcomes: [
      'Online orders increased 40% in first month',
      'Menu update time reduced from hours to minutes',
      'Mobile traffic conversion improved by 25%',
    ],
    buildDate: '2025-02',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
  },
  {
    slug: 'smart-crm',
    name: 'Smart CRM',
    description:
      'Lightweight CRM for tracking leads and client interactions.',
    longDescription:
      'A purpose-built CRM designed for small teams who need lead tracking without enterprise complexity. Features AI-powered lead scoring, automated follow-up reminders, and a clean pipeline view — all without the bloat of traditional CRM software.',
    thumbnailUrl: '/images/apps/smart-crm-thumb.png',
    screenshotUrls: [
      '/images/apps/smart-crm-1.png',
      '/images/apps/smart-crm-2.png',
      '/images/apps/smart-crm-3.png',
    ],
    techStack: ['TypeScript', 'PostgreSQL', 'REST API', 'Tailwind CSS'],
    category: 'Productivity',
    status: 'beta',
    outcomes: [
      'Lead response time cut from 24 hours to under 2 hours',
      'Pipeline visibility improved deal close rate by 15%',
      'Eliminated 3 separate spreadsheet tracking systems',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
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
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
