import Link from 'next/link';
import Kanji from '@/components/brand/Kanji';
import { IconArrowRight } from '@/components/icons';
import { BUILD_ROOMS, type BuildRoom } from './rooms';
import './build-trio.css';

/**
 * The foot of every Build page: the other two rooms, one tap away, and the
 * one you're in marked as here. Server-rendered, no JavaScript; the cards
 * are the site's sd-card material, so they lift and press like every other
 * card.
 */
export default function BuildTrio({ current }: { current: BuildRoom['key'] }) {
  return (
    <nav aria-label="The three Build pages" className="bt-trio">
      <p className="sd-kicker">Three rooms, one dojo</p>
      <ul className="bt-list" role="list">
        {BUILD_ROOMS.map((r) => {
          const here = r.key === current;
          return (
            <li key={r.key}>
              {here ? (
                <span className="bt-card bt-here" aria-current="page">
                  <Kanji char={r.kanji} className="bt-kanji" />
                  <span className="bt-text">
                    <span className="bt-title font-display">{r.title}</span>
                    <span className="bt-line">You&rsquo;re here.</span>
                  </span>
                </span>
              ) : (
                <Link href={r.href} className="sd-card bt-card">
                  <Kanji char={r.kanji} className="bt-kanji" />
                  <span className="bt-text">
                    <span className="bt-title font-display">{r.title}</span>
                    <span className="bt-line">{r.line}</span>
                  </span>
                  <IconArrowRight size={20} className="bt-go" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
