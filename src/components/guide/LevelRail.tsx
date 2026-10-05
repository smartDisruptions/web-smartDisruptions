'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Kanji from '@/components/brand/Kanji';
import type { Level } from './copy';

/**
 * The level rail on wide screens: six stops down the left edge, the one
 * you're reading lit, the line between them filled to it. One
 * IntersectionObserver, nothing per scroll frame; the fill is a transform.
 * Without JavaScript it is still a list of anchor links.
 */
export default function LevelRail({ levels }: { levels: Level[] }) {
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const sections = levels
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = sections.indexOf(e.target as HTMLElement);
          if (i !== -1) setCurrent(i);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [levels]);

  const fill = current < 0 ? 0 : current / Math.max(1, levels.length - 1);

  return (
    <nav
      className="gd-rail"
      aria-label="Levels on this page"
      data-on={current >= 0 ? 'true' : 'false'}
      style={{ '--gd-fill': fill } as CSSProperties}
    >
      <span className="gd-rail-line" aria-hidden>
        <span className="gd-rail-fill" />
      </span>
      <ol>
        {levels.map((l, i) => (
          <li key={l.id}>
            <a
              href={`#${l.id}`}
              className="gd-rail-stop"
              data-state={
                i < current ? 'done' : i === current ? 'here' : 'ahead'
              }
              aria-current={i === current ? 'location' : undefined}
            >
              <span className="gd-rail-node" aria-hidden>
                <Kanji char={l.kanji} />
              </span>
              <span className="gd-rail-label">
                <span className="gd-rail-n">Level {l.n}</span>
                {l.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
