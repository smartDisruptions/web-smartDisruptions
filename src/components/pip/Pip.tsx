import type { CSSProperties } from 'react';

/**
 * Pip, the Broom & Blade guild mouse — the host of the Broom & Blade Arcade.
 *
 * STUB (base commit): a placeholder with the final interface, so the hall and
 * the machines can place him while his real rig is drawn. The Pip agent
 * replaces everything below the types; the types and the box contract stay.
 *
 * THE BOX CONTRACT (every pose, so a page can place him without looking):
 *  - viewBox 0 0 200 200, drawn at whatever CSS width the caller gives;
 *  - he stands with his feet on y = 188, centred on x = 100;
 *  - `sit`: his seat is on y = 150 (a ledge's top edge), his feet hang below;
 *  - `peek`: the rim he peeks over (a mouse hole, a cabinet top) is y = 170,
 *    and nothing of him is drawn below it.
 */

export type PipPose = 'idle' | 'wave' | 'cheer' | 'peek' | 'point' | 'ticket' | 'sit' | 'hide' | 'bow';
export type PipMood = 'normal' | 'happy' | 'surprised' | 'closed' | 'wink';

export interface PipProps {
  pose?: PipPose;
  mood?: PipMood;
  className?: string;
  style?: CSSProperties;
  /** An accessible name. Without one Pip is decoration (aria-hidden). */
  title?: string;
  /** Mirror him (he faces the reader's left by default, like in the games). */
  flip?: boolean;
  /** Never idles: one still frame (inside a thumbnail, or a crowded scene). */
  still?: boolean;
}

export default function Pip({ pose = 'idle', className, style, title, flip, still }: PipProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={['pip', className].filter(Boolean).join(' ')}
      style={{ ...style, ...(flip ? { scale: '-1 1' } : null) }}
      data-pose={pose}
      data-pip={still ? 'still' : ''}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <ellipse cx="100" cy="150" rx="34" ry="38" fill="#A89582" />
      <circle cx="96" cy="96" r="28" fill="#A89582" />
      <circle cx="74" cy="70" r="16" fill="#E8A6A6" />
      <circle cx="120" cy="70" r="16" fill="#E8A6A6" />
      <rect x="76" y="118" width="44" height="8" rx="4" fill="#E8B24A" />
      <circle cx="86" cy="94" r="4" fill="#1A120B" />
    </svg>
  );
}
