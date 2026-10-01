import type { Tone } from '@/data/marketStorm';

/**
 * Market Storm's semantic inks, as class names.
 *
 * These were local to ReportView until the index started showing figures too.
 * A second copy is how a bull turns green on one surface and neutral on
 * another — the maps live here so both read the same table.
 *
 * The colours themselves are the `--sd-bull/bear/warn` tokens and follow the
 * ink flip: dark on washi, bright under the moon, AA in both.
 */
export const toneText: Record<Tone, string> = {
  bull: 'text-bull',
  bear: 'text-bear',
  warn: 'text-warn',
  neutral: 'text-text-primary',
};

export const toneDot: Record<Tone, string> = {
  bull: 'bg-bull',
  bear: 'bg-bear',
  warn: 'bg-warn',
  neutral: 'bg-text-secondary',
};

/**
 * The verdict's shape beside its colour — up, down, caution — so a reader who
 * cannot tell the green from the red still reads the direction. Decorative
 * (aria-hidden wherever it is used); neutral figures carry none.
 */
export const toneGlyph: Record<Tone, string> = {
  bull: '▲',
  bear: '▼',
  warn: '◆',
  neutral: '',
};
