import Image from 'next/image';
import type { CSSProperties } from 'react';
import { sizeOf, type FrameKind } from './media';

/**
 * A screenshot inside a device — a laptop, a browser window, a tablet or a
 * phone. The devices are drawn in CSS (src/app/built/built.css, `bt-dev`),
 * not images: a bezel is a padded box, a hinge is a gradient, and every
 * measurement is in container units, so one frame reads right at 120px in the
 * ring and at 700px in a page hero.
 *
 * A device is an OBJECT, like Kiru or a paper slip: the same colours in both
 * themes, with a moonlit rim at night so it does not sink into the dark.
 *
 * The screen takes the picture's own shape when it is near the device's
 * natural one, so a screenshot is shown whole. Outside that range it keeps
 * the device's shape and the picture is cropped from the top, where an app's
 * name and controls usually are.
 */

const RANGE: Record<FrameKind, [number, number]> = {
  laptop: [1.6, 1.6],
  browser: [1.3, 2.1],
  tablet: [1.3, 1.6],
  'tablet-tall': [0.66, 0.8],
  phone: [0.45, 0.6],
};

function screenRatio(frame: FrameKind, w: number, h: number): string {
  const [lo, hi] = RANGE[frame];
  const r = w / h;
  if (r >= lo && r <= hi) return `${w} / ${h}`;
  return String(Math.min(hi, Math.max(lo, r)));
}

export default function Device({
  frame,
  src,
  alt,
  url,
  sizes,
  priority = false,
  eager = false,
  className = '',
  style,
}: {
  frame: FrameKind;
  src: string;
  alt: string;
  /** Host shown in a browser window's address bar. Decorative. */
  url?: string;
  sizes: string;
  /** The page's LCP image: fetched first, never lazy. Use once per page. */
  priority?: boolean;
  /** Above the fold but not the LCP: load now, at normal priority. */
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const [w, h] = sizeOf(src);
  const ratio = screenRatio(frame, w, h);

  const shot = (
    <div className="bt-screen" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={sizes}
        className="bt-shot"
        draggable={false}
        {...(priority
          ? { loading: 'eager' as const, fetchPriority: 'high' as const }
          : { loading: eager ? ('eager' as const) : ('lazy' as const) })}
        decoding="async"
      />
    </div>
  );

  if (frame === 'laptop') {
    return (
      <div className={`bt-dev bt-laptop ${className}`} style={style}>
        <div className="bt-body">{shot}</div>
        <div className="bt-deck" aria-hidden="true" />
      </div>
    );
  }

  if (frame === 'browser') {
    return (
      <div className={`bt-dev bt-browser ${className}`} style={style}>
        <div className="bt-body">
          <div className="bt-bar" aria-hidden="true">
            <span className="bt-dots">
              <i />
              <i />
              <i />
            </span>
            {url && (
              <span className="bt-url">
                <svg viewBox="0 0 12 12" focusable="false">
                  <path d="M3.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="2.5" y="5.2" width="7" height="5" rx="1.2" fill="currentColor" />
                </svg>
                <span>{url}</span>
              </span>
            )}
          </div>
          {shot}
        </div>
      </div>
    );
  }

  return (
    <div className={`bt-dev bt-${frame} ${className}`} style={style}>
      <div className="bt-body">
        {shot}
        {frame === 'phone' && <span className="bt-island" aria-hidden="true" />}
      </div>
    </div>
  );
}
