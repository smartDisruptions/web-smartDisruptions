/**
 * Small pure helpers shared by the companies chapters' server sections and
 * their islands (no 'use client': a server component can call these).
 */

/**
 * A content string as plain words, for places that can't hold a link or a
 * button: the face of a tile is itself a button, so a citation or a glossary
 * term can't nest inside it; decoration that is aria-hidden mustn't hold
 * anything focusable either. (The same words render in full, through Rich,
 * wherever they are the reading copy.)
 */
export const plain = (s: string) =>
  s
    .replace(/\^\[[\d,]+\]/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\s][^*]*)\*/g, '$1')
    .replace(/\{(?:unv|ok|fix):([^}]+)\}/g, '$1')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1');

/**
 * Roughly how wide a ticker sets in the display face, in ems (digits are
 * narrow, M and W wide), so its symbol can be sized to fill its tile.
 */
export const symbolEms = (t: string) =>
  Math.max(
    2.5,
    [...t].reduce(
      (a, c) => a + (/\d/.test(c) ? 0.68 : /[MW]/.test(c) ? 0.92 : 0.84),
      0
    )
  );
