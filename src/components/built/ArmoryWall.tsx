import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Seal } from '@/components/brand/Kanji';
import ArmoryWallIsland from './ArmoryWallIsland';
import { sizeOf } from './media';

export type WallItem = {
  key: string;
  name: string;
  /** Small label over the name: what the thing is. */
  kind: string;
  href: string;
  external?: boolean;
  src: string;
  /** The brush kanji on the back of the plaque. */
  mark: string;
};

/**
 * Everything on one wall: a ring of plaques in CSS 3D.
 *
 * All of it is server markup and pure CSS — each plaque is placed with
 * rotateY(i × 360°/n) translateZ(r), the ring turns by one custom property
 * (--spin), and the shading of a plaque turning away is CSS trig on its own
 * angle. Before the behaviour loads (and if it never does) this is already a
 * ring of real links in tab order.
 *
 * Under reduced motion the same plaques lie flat in a grid (built.css).
 */
export default function ArmoryWall({
  items,
  label,
}: {
  items: WallItem[];
  label: string;
}) {
  return (
    <div
      className="bt-wall"
      data-wall
      style={{ '--n': items.length } as CSSProperties}
    >
      <div className="bt-wall-stage">
        <ul className="bt-ring" role="list" aria-label={label}>
          {items.map((item, i) => {
            const [w, h] = sizeOf(item.src);
            // Name first in the DOM, so a screen reader hears it first; the
            // label sits above it visually (CSS order).
            const face = (
              <>
                <span className="bt-panel-shot">
                  <Image
                    src={item.src}
                    alt=""
                    width={w}
                    height={h}
                    sizes="(max-width: 639px) 158px, 236px"
                    loading="lazy"
                    draggable={false}
                  />
                </span>
                <span className="bt-panel-cap">
                  <span className="bt-panel-name">{item.name}</span>
                  <span className="bt-panel-kind">{item.kind}</span>
                </span>
              </>
            );
            return (
              <li
                key={item.key}
                className="bt-panel"
                style={{ '--i': i } as CSSProperties}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bt-panel-face"
                    draggable={false}
                  >
                    {face}
                    <span className="bt-sr"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="bt-panel-face"
                    draggable={false}
                  >
                    {face}
                  </Link>
                )}
                <div className="bt-panel-back" aria-hidden="true">
                  <Seal char={item.mark} />
                  <span>{item.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <ArmoryWallIsland count={items.length} first={items[0]?.name ?? ''} />
    </div>
  );
}
