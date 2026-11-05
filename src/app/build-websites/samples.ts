import { projectSample, type Sample } from '@/components/build/samples';

/**
 * The samples on /build-websites: websites I built for businesses that do
 * not exist, so every button on them can be tried and nothing reaches
 * anyone. Drawn as panes on a shoji wall, in this order.
 *
 * Gilt & Lather's site is served from public/demo/gilt-and-lather (built in
 * the vault's Tools/gilt-and-lather; see the rewrite in next.config.ts). It
 * has had a project page since 2026-11-05, like the other two.
 */
export const SAMPLES: Sample[] = [
  projectSample('gilt-and-lather', {
    kind: 'Barbershop',
    goLabel: 'Visit the site',
  }),
  projectSample('moonbowl', { kind: 'Ramen truck', goLabel: 'Visit the site' }),
  projectSample('voltic', { kind: 'Energy drink', goLabel: 'Visit the site' }),
];
