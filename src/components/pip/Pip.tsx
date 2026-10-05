import type { CSSProperties } from 'react';
import { PIP_DEFS, POSES, pipMarkup } from './art';
import './pip.css';

/**
 * Pip, the Broom & Blade guild mouse — the host of the Broom & Blade Arcade,
 * the way Kiru hosts the rest of the site. Same mouse as in the games (grey-
 * brown fur, cream belly, big pink ears, a gold scarf, a long tail), turned
 * three-quarters so he has two eyes to act with.
 *
 * Pure SVG, rendered on the server: a few KB of markup per mouse and no
 * JavaScript of his own. The drawing is in ./art.ts, the styles and idle
 * loops in ./pip.css. His loops run only while SiteFX marks him `data-live`
 * (on screen, motion allowed), they pause while the page scrolls, and his
 * eyes follow the pointer through --lx/--ly, exactly like Kiru's.
 *
 * Pip is an OBJECT like the hall he hosts: the same colours in both themes.
 *
 * THE BOX CONTRACT (every pose, so a page can place him without looking):
 *  - viewBox 0 0 200 200, drawn at whatever CSS width the caller gives;
 *  - he stands with his feet on y = 188 (the outer edge of their outline),
 *    centred on x = 100; `cheer` is mid-hop above that line, his shadow on it;
 *  - `sit`: his seat is on y = 150 (a ledge's top edge), his feet hang below;
 *  - `peek`: the rim he peeks over (a mouse hole, a cabinet top) is y = 170,
 *    and nothing of him is drawn below it, in any frame of any loop.
 *  Nothing is drawn outside the box in any frame, except the `sit` tail's
 *  curl, which hangs to y = 198.
 */

export type PipPose =
  | 'idle'
  | 'wave'
  | 'cheer'
  | 'peek'
  | 'point'
  | 'ticket'
  | 'sit'
  | 'hide'
  | 'bow';
export type PipMood = 'normal' | 'happy' | 'surprised' | 'closed' | 'wink';

export interface PipProps {
  pose?: PipPose;
  /** Overrides the pose's own expression. */
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

/**
 * Shared paint (the soft shading gradients) for every Pip on a page, rendered
 * ONCE by the page that shows him (the hall renders it at the top of the
 * room). Optional: without it each fill falls back to its flat colour.
 * Zero-sized rather than display:none, because a gradient inside a
 * display:none SVG doesn't paint in every browser.
 */
export function PipDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs
        dangerouslySetInnerHTML={{ __html: PIP_DEFS }}
        suppressHydrationWarning
      />
    </svg>
  );
}

export default function Pip({
  pose = 'idle',
  mood,
  className,
  style,
  title,
  flip,
  still,
}: PipProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className ? `pip ${className}` : 'pip'}
      style={flip ? { ...style, scale: '-1 1' } : style}
      data-pip={still ? 'still' : pose}
      // where his eyes sit, so SiteFX aims his gaze from the right height
      data-eye={(POSES[pose] ?? POSES.idle).eye}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: pipMarkup(pose, mood, flip) }}
      suppressHydrationWarning
    />
  );
}
