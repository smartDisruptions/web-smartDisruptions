import type { CSSProperties } from 'react';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';

/**
 * The tiny website inside the shoji browser: a made-up dojo's home page, with
 * a nav, a hero with Kiru in it, three cards and a footer.
 *
 * It renders twice, once per look, from the SAME markup, so the two copies
 * wrap and reflow identically and the brush wipe between them lines up to the
 * pixel:
 *   - `ship`   the finished design: colour, type, Kiru.
 *   - `sketch` the wireframe: the same text, made transparent, with a
 *              hand-drawn squiggle painted under every line it would have
 *              filled; picture boxes get the wireframe X. Its `code` look is
 *              the same copy with each box named by its HTML tag.
 *
 * Every size in it is in em, and its em is 16 *virtual* pixels (websites.css
 * sets the font size from the stage width), so its container queries are real
 * breakpoints: phone below 35em (560px), tablet below 50em (800px), desktop
 * above. Nothing here is a real control: it's a picture of a website, and the
 * whole view is aria-hidden by the browser around it.
 */

type Look = 'sketch' | 'ship';

/**
 * The cards' icons are plain 24px shapes, the way a real site's would be: a
 * brush kanji is ~3 KB of path that shrinks to a smudge at this scale.
 */
const CARDS = [
  {
    // A crescent moon.
    icon: 'M15.6 2.6a9.6 9.6 0 1 0 5.9 16.3A8 8 0 0 1 15.6 2.6z',
    title: 'Stealth',
    line: 'Move without a sound.',
  },
  {
    // A bolt.
    icon: 'M13.8 1.8 4.2 13.6h6.3L9.4 22.2l10.4-12.6h-6.4z',
    title: 'Speed',
    line: 'Light feet, fast pages.',
  },
  {
    // A shuriken, with its hole.
    icon: 'M12 1.4l2.5 8.1 8.1 2.5-8.1 2.5-2.5 8.1-2.5-8.1L1.4 12l8.1-2.5zM12 10.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 1 0 0-3.4z',
    title: 'Focus',
    line: 'One clean cut beats ten.',
  },
] as const;

/** Stagger index for the sketch's draw-in (websites.css, .bw-pop). */
const at = (i: number) => ({ '--i': i }) as CSSProperties;

/** A line of text: real words in the finished site, a squiggle in the sketch. */
function T({ children }: { children: string }) {
  return <span className="bw-t">{children}</span>;
}

/** The HTML tag a box would be, shown only in the Code view. */
function Tag({ name }: { name: string }) {
  return <i className="bw-tag">{`<${name}>`}</i>;
}

export default function MiniSite({ look }: { look: Look }) {
  const sketch = look === 'sketch';
  return (
    <div className="bw-site" data-look={look}>
      <div className="bw-s-nav bw-pop" style={at(0)}>
        <span className="bw-s-logo">
          <span className="bw-s-seal bw-box">
            {!sketch && <Kanji char="道" className="bw-s-seal-k" />}
          </span>
          <span className="bw-s-name">
            <T>Kiru’s Dojo</T>
          </span>
        </span>
        <span className="bw-s-links">
          <span className="bw-s-l1">
            <T>Classes</T>
          </span>
          <span className="bw-s-l2">
            <T>Schedule</T>
          </span>
          <span className="bw-s-l3">
            <T>About</T>
          </span>
        </span>
        <span className="bw-s-join bw-box">
          <T>Join</T>
        </span>
        <span className="bw-s-menu">
          <i />
          <i />
          <i />
        </span>
        {sketch && <Tag name="nav" />}
      </div>

      <div className="bw-s-hero">
        <div className="bw-s-copy">
          <div className="bw-s-kicker bw-pop" style={at(1)}>
            <T>Night classes</T>
          </div>
          <div className="bw-s-h1 bw-pop" style={at(2)}>
            <T>Train like a shadow.</T>
            {sketch && <Tag name="h1" />}
          </div>
          <div className="bw-s-p bw-pop" style={at(3)}>
            <T>Small classes. Sharp cuts. No hype.</T>
            {sketch && <Tag name="p" />}
          </div>
          <span className="bw-s-btns bw-pop" style={at(4)}>
            <span className="bw-s-btn bw-box">
              <T>Book a class</T>
              {sketch && <Tag name="a" />}
            </span>
            <span className="bw-s-btn2 bw-box">
              <T>See the schedule</T>
            </span>
          </span>
        </div>
        <div className="bw-s-art bw-pop" style={at(5)}>
          {sketch ? (
            <Tag name="img" />
          ) : (
            <>
              <span className="bw-s-orb" />
              <span className="bw-s-floor" />
              <Kiru pose="build" className="bw-s-kiru" />
            </>
          )}
        </div>
      </div>

      <div className="bw-s-cards">
        {CARDS.map((c, i) => (
          <div
            key={c.title}
            className="bw-s-card bw-box bw-pop"
            style={at(6 + i)}
          >
            <span className="bw-s-icon">
              {!sketch && (
                <svg viewBox="0 0 24 24" className="bw-s-icon-k">
                  <path d={c.icon} fillRule="evenodd" />
                </svg>
              )}
            </span>
            <span className="bw-s-ctext">
              <span className="bw-s-ct">
                <T>{c.title}</T>
              </span>
              <span className="bw-s-cp">
                <T>{c.line}</T>
              </span>
            </span>
            {sketch && <Tag name="article" />}
          </div>
        ))}
      </div>

      <div className="bw-s-foot bw-pop" style={at(9)}>
        <span>
          <T>© Kiru’s Dojo</T>
        </span>
        <span className="bw-s-flinks">
          <T>Classes</T> <T>Contact</T>
        </span>
        {sketch && <Tag name="footer" />}
      </div>
    </div>
  );
}
