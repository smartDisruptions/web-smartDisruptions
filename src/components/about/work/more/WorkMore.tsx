import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Glyph, GlyphSeal } from '@/components/about/work/glyphs';
import Kiru from '@/components/kiru/Kiru';
import { IconArrowRight, IconExternal } from '@/components/icons';
import { markFor, shotTransition, sizeOf } from '@/components/built/media';
import { getAppBySlug } from '@/data/apps';
import {
  WORK_IDS,
  catalogue,
  type CatalogueEntry,
} from '@/components/about/work/data';
import './more.css';

/**
 * EVERYTHING ELSE (#more) — the rest of the work, hung as ema on a rack.
 *
 * At a shrine, an ema (絵馬) is a small wooden plaque with a picture painted
 * on one face, hung by a cord on a long wooden rack beside everybody else's.
 * Here each build that isn't one of the four is one: its screenshot painted
 * on the face inside a thin ink line, its name brushed under the picture,
 * its brush kanji stamped across the corner as a seal. On a desktop the seven
 * hang from rails of three, websites first; on a tablet from rails of
 * two; on a phone they slide past on a swipe rail. What each one is, and the
 * two ways in (how I built it, and the thing itself), sit under its plaque
 * as plain text, so nothing waits on a hover.
 *
 * MOTION is CSS only (./more.css): each plaque swings into place on its cord
 * as the rack scrolls into view (a scroll timeline), sways like a hung thing
 * when the pointer finds it or a finger presses it (a transition on a
 * springy linear() curve), and on a phone rocks a little as the rail slides
 * it past. All of it is rotation, on the compositor, behind reduced motion,
 * and the rack is complete without any of it. Nothing loops but Kiru, who
 * sits on the beam swinging his feet, and only while he is on screen.
 *
 * The picture opens the thing's own page through the "How I built it" link,
 * stretched over the plaque, so the plaque is one target and no link sits
 * inside another (a thing without a page of its own would open the thing
 * itself). A picture with a page carries the same view-transition name as
 * that page's hero, so opening it carries the picture across instead of
 * cutting to it.
 *
 * A tall screenshot (AI Diary's are 1024×1520) cannot fill a wide plaque
 * without losing most of itself, but three of them side by side make almost
 * exactly the plaque's 2:1 window. So a tall thing shows three of its
 * screens as panels: for AI Diary, the journal, the companion and the mood
 * chart its description talks about.
 */

/**
 * How each plaque hangs: its cord (px), the angle it comes to rest at, and the
 * way it swings (data-swing picks the side its swing-in starts from). Set by
 * hand: render has to be deterministic, and plaques at exactly the same
 * height and angle look printed, not hung. The longest cord is
 * --wk-mr-cord-max in ./more.css.
 */
const HANG = [
  { cord: 30, rest: -1.4, dir: 1 },
  { cord: 40, rest: 1.1, dir: -1 },
  { cord: 24, rest: -0.6, dir: 1 },
  { cord: 34, rest: 1.6, dir: -1 },
  { cord: 26, rest: -1.0, dir: 1 },
  { cord: 38, rest: 0.7, dir: -1 },
] as const;

const tall = (src: string) => {
  const [w, h] = sizeOf(src);
  return w / h < 0.95;
};

/**
 * The pictures painted on a plaque: the thumbnail alone, or for a tall one
 * the thumbnail and two more tall screenshots of the same app. The first
 * screenshot is usually the thumbnail under another name (AI Diary's are the
 * same file), so the two after the thumbnail are the last two. Short of
 * three, the thumbnail is shown alone, cropped from the top.
 */
function picturesFor(item: CatalogueEntry): string[] {
  if (!tall(item.thumbnail)) return [item.thumbnail];
  const shots = (getAppBySlug(item.key)?.screenshotUrls ?? []).filter(
    (s) => s !== item.thumbnail && tall(s)
  );
  const panels = [item.thumbnail, ...shots.slice(-2)];
  return panels.length === 3 ? panels : [item.thumbnail];
}

const statusLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Ema({ item, i }: { item: CatalogueEntry; i: number }) {
  const hang = HANG[i % HANG.length];
  const pics = picturesFor(item);
  const vars = {
    '--wk-mr-i': i,
    '--wk-mr-cord': `${hang.cord}px`,
    '--wk-mr-rest': `${hang.rest}deg`,
    '--wk-mr-dir': hang.dir,
  } as CSSProperties;

  return (
    <li
      className="wk-mr-item"
      style={vars}
      data-swing={hang.dir === 1 ? 'l' : 'r'}
    >
      {/* This slot's length of the rack: the beam, the rail, and a post
          where a row ends. Drawn per slot, so the slots in a row join into
          one rack however many share it. */}
      <span className="wk-mr-beam" aria-hidden="true" />
      {i === 0 && <Kiru pose="sit" className="wk-mr-kiru" />}

      {/* The pendulum: the cord and the plaque swing as one, from the rail. */}
      <div className="wk-mr-hang">
        <div className="wk-mr-swing">
          <div className="wk-mr-board">
            <div className="wk-mr-face">
              <h3 className="wk-mr-name font-display">{item.name}</h3>
              <div className="wk-mr-pic">
                {pics.map((src, j) => {
                  const [w, h] = sizeOf(src);
                  return (
                    <span
                      key={src}
                      className="wk-mr-panel"
                      // The first panel is the picture the thing's own page
                      // opens on, so it is the one that travels there.
                      style={
                        j === 0 && item.detailHref
                          ? shotTransition(item.key)
                          : undefined
                      }
                    >
                      <Image
                        src={src}
                        alt={
                          pics.length > 1
                            ? `${item.name} screenshot ${j + 1} of ${pics.length}`
                            : `${item.name} screenshot`
                        }
                        width={w}
                        height={h}
                        sizes={
                          pics.length > 1
                            ? '(min-width: 1024px) 70px, (min-width: 640px) 78px, (min-width: 420px) 80px, calc(20vw - 6px)'
                            : '(min-width: 1024px) 214px, (min-width: 640px) 238px, (min-width: 420px) 244px, calc(62vw - 17px)'
                        }
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </span>
                  );
                })}
              </div>
              <GlyphSeal char={markFor(item.key)} className="wk-mr-seal" />
              <span className="wk-mr-hole" aria-hidden="true" />
            </div>
          </div>
          <span className="wk-mr-cord" aria-hidden="true" />
        </div>
      </div>

      <div className="wk-mr-text">
        <p className="wk-mr-kind">
          {item.category}
          <span className="sr-only">,</span>
          <span className="wk-mr-dot" aria-hidden="true" />
          {statusLabel(item.status)}
        </p>
        <p className="wk-mr-desc">{item.description}</p>
        {item.tech.length > 0 && (
          <p className="wk-mr-tech">
            <span className="sr-only">Built with </span>
            {item.tech.map((t, j) => (
              <span key={t} className="wk-mr-tag">
                {t}
                {j < item.tech.length - 1 && (
                  <span className="sr-only">, </span>
                )}
              </span>
            ))}
          </p>
        )}
        {/* Whichever link carries wk-mr-open also covers the plaque above
            it (its ::after), so the picture opens the same place. Each name
            carries the thing's after the words you see, so a screen reader's
            list of links tells the "Try it"s apart. */}
        <div className="wk-mr-acts">
          {item.detailHref && (
            <Link
              href={item.detailHref}
              prefetch={false}
              className="wk-mr-act wk-mr-open"
            >
              <span className="wk-mr-act-in">
                How I built it
                <span className="sr-only">, {item.name}</span>
                <IconArrowRight size={18} />
              </span>
            </Link>
          )}
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`wk-mr-act${item.detailHref ? '' : ' wk-mr-open'}`}
            >
              <span className="wk-mr-act-in">
                {item.liveLabel ?? 'Try it'}
                <span className="sr-only">, {item.name}</span>
                <IconExternal size={16} />
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export default function WorkMore() {
  return (
    <section id={WORK_IDS.more} aria-labelledby="wk-mr-h" className="wk-mr">
      {/* A paper lantern hung from the top of the room: unlit paper by day,
          lit at night, when its light is the band's. */}
      <span className="wk-mr-lantern" aria-hidden="true">
        <span className="wk-mr-lantern-body">
          <Glyph char="光" />
        </span>
      </span>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="sd-reveal">
          <p className="sd-kicker">More builds</p>
          <h2
            id="wk-mr-h"
            className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl"
          >
            Everything else
          </h2>
          <p className="font-read mt-5 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
            The rest of what I’ve built: websites first, then apps. All of it is
            online.
          </p>
        </div>

        <div className="wk-mr-rack">
          <ul className="wk-mr-row" role="list" aria-label="More builds">
            {catalogue.map((item, i) => (
              <Ema key={item.key} item={item} i={i} />
            ))}
          </ul>
          {/* How far along the rail you are: phones only (./more.css). */}
          <div className="wk-mr-meter" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
