import Link from 'next/link';
import Kanji from '@/components/brand/Kanji';
import SwitchFX from './SwitchFX';
import './switch.css';

export type AboutSide = 'work' | 'person';

const SIDES = [
  { id: 'work', href: '/about', label: 'The work', kanji: '場' },
  { id: 'person', href: '/about-me', label: 'The person', kanji: '私' },
] as const;

/**
 * The fusuma: About's two pages as a pair of sliding paper doors in a
 * lacquer frame. The door (washi, with its pull) stands over the page you
 * are on; tap the other side and it slides across while the page follows,
 * the person to the right of the work.
 *
 * Two real links in a nav, so a keyboard, a screen reader and a browser
 * without JavaScript all get the same switch. SwitchFX only adds the slide:
 * the door moves the moment you tap, and for that one navigation the door
 * and its labels carry view-transition names, so they glide across while
 * the page under them slides in the door's direction (the root layout maps
 * the nav-forward / nav-back types to sd-fwd / sd-back).
 *
 * Used at the top of /about and /about-me. Styles: ./switch.css (au-fsm-).
 */
export default function AboutSwitch({ current }: { current: AboutSide }) {
  return (
    <div className="au-fsm-wrap">
      <nav className="au-fsm" aria-label="About pages" data-on={current}>
        <span className="au-fsm-door" aria-hidden>
          <i className="au-fsm-pull au-fsm-pull-l" />
          <i className="au-fsm-pull au-fsm-pull-r" />
        </span>
        {SIDES.map((side) => {
          const here = side.id === current;
          return (
            <Link
              key={side.id}
              href={side.href}
              data-id={side.id}
              className="au-fsm-tab"
              aria-current={here ? 'page' : undefined}
              prefetch={here ? false : undefined}
              transitionTypes={
                here
                  ? undefined
                  : [side.id === 'person' ? 'nav-forward' : 'nav-back']
              }
            >
              <Kanji char={side.kanji} className="au-fsm-k" />
              <span>{side.label}</span>
            </Link>
          );
        })}
        <SwitchFX />
      </nav>
    </div>
  );
}
