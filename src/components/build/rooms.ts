/**
 * The three Build rooms — one list, read by the home doors, the /learn
 * sections, the trio strip at the foot of each Build page, and anything else
 * that names them, so a name or a line changes in one place. (The /learn
 * sections write their own lines, in the words of each page's header.)
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
    line: 'Fast, clean sites that fit any screen.',
    kanji: '網',
    kanjiMeans: 'net, web',
    source: 'websites',
  },
  {
    href: '/build-apps',
    key: 'apps',
    title: 'Build Apps',
    line: 'Apps that make life easier or more fun.',
    kanji: '器',
    kanjiMeans: 'vessel, instrument',
    source: 'apps',
  },
  {
    href: '/build-games',
    key: 'games',
    title: 'Build Games',
    line: 'Custom games, any way you like.',
    kanji: '戯',
    kanjiMeans: 'play',
    source: 'games',
  },
];

export function buildRoom(key: BuildRoom['key']): BuildRoom {
  return BUILD_ROOMS.find((r) => r.key === key)!;
}
