import type { Tone } from '@/data/marketStorm';

/**
 * Market Storm's semantic inks, as class names.
 *
 * These were local to ReportView until the index started showing figures too.
 * A second copy is how a bull turns green on one surface and neutral on
 * another — the maps live here so both read the same table.
 *
 * The colours themselves are the `--sd-bull/bear/warn` tokens and follow the
 * ink flip: dark on paper, bright on the charcoal ground, AA in both.
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
