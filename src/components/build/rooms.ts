/**
 * The three Build rooms — one list, read by the home doors, the home
 * sections, the trio strip at the foot of each Build page, and anything else
 * that names them, so a name or a line changes in one place.
 *
 * `source` is the page's email list (SubscribeForm / /api/subscribe).
 */
export type BuildRoom = {
  href: '/build-websites' | '/build-apps' | '/build-games';
  key: 'websites' | 'apps' | 'games';
  title: string;
  line: string;
  /** The room's brush kanji (src/components/brand/glyphs.ts). */
  kanji: '網' | '器' | '戯';
  /** What the kanji means, for the curious (never the only label). */
  kanjiMeans: string;
  source: 'websites' | 'apps' | 'games';
};

export const BUILD_ROOMS: BuildRoom[] = [
  {
    href: '/build-websites',
    key: 'websites',
    title: 'Build Websites',
    line: 'Real sites, from a blank page to a live address.',
    kanji: '網',
    kanjiMeans: 'net, web',
    source: 'websites',
  },
  {
    href: '/build-apps',
    key: 'apps',
    title: 'Build Apps',
    line: 'Useful tools that do one job well.',
    kanji: '器',
    kanjiMeans: 'vessel, instrument',
    source: 'apps',
  },
  {
    href: '/build-games',
    key: 'games',
    title: 'Build Games',
    line: 'Small games you can actually play.',
    kanji: '戯',
    kanjiMeans: 'play',
    source: 'games',
  },
];

export function buildRoom(key: BuildRoom['key']): BuildRoom {
  return BUILD_ROOMS.find((r) => r.key === key)!;
}
