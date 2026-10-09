import type { Rich as RichText } from '../content';

/**
 * A content string with its inline markup taken out (glossary terms keep
 * their shown words, citations go), for the few places markup can't render:
 * aria-labels, and the labels a client island folds into a sentence
 * ("Takeoff score"). Everything printed on the page goes through <Rich>
 * instead. Server-side helper; nothing here ships to the browser.
 */
export function plain(text: RichText): string {
  return text
    .replace(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\s][^*]*)\*/g, '$1')
    .replace(/\^\[[\d,]+\]/g, '')
    .replace(/\{(?:unv|ok|fix):([^}]+)\}/g, '$1');
}
