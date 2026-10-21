import {
  pic,
  projectSample,
  type Sample,
} from '@/components/build/samples';

/**
 * The samples on /build-websites: websites I built for businesses that do
 * not exist, so every button on them can be tried and nothing reaches
 * anyone. Drawn as panes on a shoji wall, in this order.
 *
 * Gilt & Lather has no project page, so its entry is written out here, and
 * the site itself is served from public/demo/gilt-and-lather (built in the
 * vault's Tools/gilt-and-lather; see the rewrite in next.config.ts).
 */
export const SAMPLES: Sample[] = [
  {
    key: 'gilt-and-lather',
    name: 'Gilt & Lather Barber Co.',
    kind: 'Barbershop',
    summary:
      'A website for a barbershop that does not exist, built to get people booked.',
    href: '/demo/gilt-and-lather',
    goLabel: 'Visit the site',
    pictures: [
      pic(
        '/images/websites/gilt-and-lather.webp',
        'The Gilt & Lather Barber Co. website. Classic cuts, hot towels, done right, in gold letters beside a barber lifting a steaming hot towel.'
      ),
    ],
  },
  projectSample('moonbowl', { kind: 'Ramen truck', goLabel: 'Visit the site' }),
  projectSample('voltic', { kind: 'Energy drink', goLabel: 'Visit the site' }),
];
