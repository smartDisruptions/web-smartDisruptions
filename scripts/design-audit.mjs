/**
 * Design audit — runs the impeccable anti-pattern detector over every route,
 * desktop and mobile, against a running server.
 *
 * Usage:
 *   npm run build && npm start        # in one terminal
 *   npm run design:audit              # in another
 *
 * Override the target with BASE_URL, e.g.
 *   BASE_URL=https://smartdisruptions.com npm run design:audit
 *
 * The detector needs no API key — the rules are deterministic. Ignores and
 * their reasons live in .impeccable/config.json; the design system it checks
 * against is DESIGN.md. See docs/impeccable.md for the expected baseline.
 */
import { spawn } from 'node:child_process';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VERSION = '3.5.0'; // pinned: a detector that changes under you isn't a check

const ROUTES = [
  '/',
  '/content',
  '/market-storm',
  '/apps',
  '/games',
  '/about',
  '/privacy',
  '/content/what-ai-handed-back',
  '/market-storm/amzn-q2-2026',
];

const VIEWPORTS = [
  { label: 'desktop', size: '1280x800' },
  { label: 'mobile', size: '390x844' },
];

const urls = ROUTES.map((r) => `${BASE}${r}`);

function run(viewport) {
  return new Promise((resolve) => {
    const args = [
      '--yes',
      `impeccable@${VERSION}`,
      'detect',
      '--viewport',
      viewport.size,
      ...urls,
    ];
    console.log(`\n─── ${viewport.label} (${viewport.size}) ───\n`);
    const child = spawn('npx', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Puppeteer refuses to launch as root without these; harmless elsewhere.
        CI: process.env.CI ?? '1',
        NO_PROXY: [process.env.NO_PROXY, 'localhost,127.0.0.1']
          .filter(Boolean)
          .join(','),
      },
    });
    child.on('close', (code) => resolve(code ?? 0));
  });
}

let worst = 0;
for (const viewport of VIEWPORTS) {
  const code = await run(viewport);
  worst = Math.max(worst, code);
}
process.exit(worst);
