import { Fragment, type CSSProperties } from 'react';
import Link from 'next/link';
import Kanji, { Seal } from '@/components/brand/Kanji';
import Device from '@/components/built/Device';
import { IconArrowRight, IconExternal } from '@/components/icons';
import { frameFor, hostOf, markFor } from '@/components/built/media';
import { WORK_IDS, inWords, pad, projects } from '@/components/about/work/data';
import type { Project } from '@/data/projects';
import WorkProjectsIsland from './WorkProjectsIsland';
import './projects.css';

/**
 * The four projects on /about (#projects): an emaki (絵巻), a picture scroll
 * that unrolls sideways as you scroll down the page.
 *
 * WHAT YOU SEE: the section pins, and a long washi hand-scroll unrolls from
 * right to left between two wooden rollers, one scene per project. Each
 * scene is the project itself in a CSS device (a laptop for the website,
 * and a tablet beside it for Broom & Blade's game), with its number, name,
 * one line about it, a button straight to each part, and a link to the page
 * that describes it. Gold mist (suyari-gasumi, the clouds that divide the
 * scenes of a real emaki) sweeps across between scenes, faster than the
 * paper; each scene's brush kanji drifts behind it, slower. Four seals above
 * the scroll stamp themselves as each scene comes to rest, and each is a
 * link to its scene. At night it is the same scroll under the moon: indigo
 * lacquer, gold, moonlight. Kiru sits this room out: he has just peeked
 * through the noren above, and he is on the rack in the next room (one Kiru
 * per room, and never the same gag twice in a row).
 *
 * HOW (all CSS, no JavaScript per frame): the scroll is a tall runway with a
 * view timeline (--wk-pj). Every layer — the paper, the scenes, the mist,
 * the rollers, the seals — is a sticky grid item in the same cell of the
 * runway, so they pin together and let go together, and each moves on that
 * one timeline (projects.css lays out the steps). The scenes are children of
 * the runway rather than of one sliding track for one reason: the markers.
 * A seal is a plain link to a zero-size marker placed in the runway at the
 * scroll offset where its scene comes to rest, so a seal works without
 * JavaScript; and because each marker sits right before its scene in the
 * document, the next Tab after a jump lands in that scene. A marker inside a
 * transformed track or a sticky box would move with it, and the link would
 * go nowhere.
 *
 * Inside a scene the words come before the devices in the document (the
 * grid puts the devices first on screen). That is for the compositor: the
 * devices move, and anything painted after a moving layer that might overlap
 * it has to become a layer of its own. With the devices painted last,
 * nothing does. The paper and the kanji are one layer each for the same
 * reason (.wk-pj-base): one sheet of washi behind all four scenes, and one
 * row of kanji drawn with <use> from each scene's own glyph, so no glyph is
 * shipped twice.
 *
 * The one island (./WorkProjectsIsland, behaviour in ./follow.ts, loaded as
 * the section nears the screen) handles keyboard focus: when Tab reaches a
 * link in a scene that is off to the side, it scrolls the page to that
 * scene's marker.
 *
 * STILL: under reduced motion, without scroll timelines (Firefox), or on a
 * short screen (a phone on its side), the same markup is a still scroll: the
 * scenes stacked top to bottom between a roller at each end, mist between
 * them, every picture and link in place. Nothing waits on an animation.
 *
 * Only for four: the steps are written for four scenes (the section is "the
 * four I'd show you first"). Any other count renders the still scroll.
 */

const BTN_BASE =
  'relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-5 text-[0.95rem] font-bold tracking-[0.01em] transition-[background-color,box-shadow,border-color,translate,scale] duration-300 ease-out active:scale-[0.97]';
// The same two looks as components/ui/Button. Button can't open a new tab,
// and every part lives somewhere else (another site, or a past design of
// this one), so these are plain anchors wearing its classes.
const BTN_PRIMARY = `${BTN_BASE} sd-btn-primary bg-[#d63a22] text-white shadow-[0_10px_24px_-10px_rgba(214,58,34,.7)] hover:bg-[#c2311b] hover:shadow-[0_16px_34px_-12px_rgba(214,58,34,.8)]`;
const BTN_SECONDARY = `${BTN_BASE} border border-[var(--sd-border-strong)] bg-surface/60 text-text-primary hover:border-text-primary hover:bg-surface`;

/** A scene's marker: what its seal links to, and the hash a jump leaves in the address bar. */
const markerId = (slug: string) => `${WORK_IDS.projects}-${slug}`;
/** A scene's brush kanji, which the moving scroll's kanji row draws with <use>. */
const glyphId = (slug: string) => `wk-pj-glyph-${slug}`;

/** One scene of the scroll: the devices on the paper, and the words. */
function Scene({ project, k }: { project: Project; k: number }) {
  // The project's own picture is the website; a part with a different
  // picture (Broom & Blade's game) gets a second device beside it.
  const side = project.parts.find((part) => part.image !== project.image);
  const nameId = `wk-pj-name-${project.slug}`;

  return (
    <article
      className="wk-pj-scene"
      aria-labelledby={nameId}
      data-flip={k % 2 === 1 || undefined}
      style={{ '--k': k } as CSSProperties}
    >
      <div className="wk-pj-paper" aria-hidden="true" />
      <svg
        className="wk-pj-mark"
        viewBox="0 0 1000 1000"
        aria-hidden="true"
        focusable="false"
      >
        <g id={glyphId(project.slug)}>
          <Kanji char={markFor(project.slug)} />
        </g>
      </svg>

      <div className="wk-pj-in">
        <div className="wk-pj-copy">
          <div className="wk-pj-head">
            <span className="wk-pj-num font-display" aria-hidden="true">
              {pad(k + 1)}
            </span>
            <p className="sd-kicker wk-pj-eyebrow">{project.eyebrow}</p>
            <h3 id={nameId} className="wk-pj-name font-display">
              {project.name}
            </h3>
          </div>
          <p className="wk-pj-sum font-read">{project.summary}</p>

          {/* Straight to each part — the game, the website — and then the
              page that describes them. Each name carries the project's after
              the words you see, so a screen reader's list of links tells the
              four scenes' "What is built into it" apart. */}
          <div className="wk-pj-acts">
            {project.parts.map((part, pi) => (
              <a
                key={part.heading}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
                className={pi === 0 ? BTN_PRIMARY : BTN_SECONDARY}
              >
                {part.linkLabel}
                <span className="sr-only">, {project.name}</span>
                <IconExternal size={16} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
          <Link href={`/built/${project.slug}`} className="wk-pj-more">
            What is built into it
            <span className="sr-only">, {project.name}</span>
            <IconArrowRight size={18} />
          </Link>
        </div>

        {/* The devices are a link to the project's page, for a tap or a
            click. The keyboard gets the same page from "What is built into
            it" above, so this one stays out of the Tab order; its name is
            the screenshots' own alt text.

            No view-transition name here (unlike the ema and the games): a
            named element whose ancestors move on this scroll's timeline
            stops Chrome capturing the page for a view transition (141,
            measured: every navigation from /about, a nav tab included, froze
            for the browser's full 4 s timeout whenever the emaki's animations
            were live, and the morph itself never played). */}
        <Link
          href={`/built/${project.slug}`}
          className="wk-pj-stage"
          tabIndex={-1}
        >
          <span className="wk-pj-devs" data-pair={side ? '' : undefined}>
            <span className="wk-pj-ground" aria-hidden="true" />
            <Device
              frame="laptop"
              src={project.image}
              alt={project.imageAlt}
              sizes="(min-width: 1024px) 560px, 72vw"
              className="wk-pj-main"
            />
            {side && (
              <Device
                frame={frameFor(side.image, side.kind)}
                src={side.image}
                alt={side.imageAlt}
                url={hostOf(side.href)}
                sizes="(min-width: 1024px) 250px, 32vw"
                className="wk-pj-side"
              />
            )}
          </span>
        </Link>
      </div>
    </article>
  );
}

/**
 * The seals: one per scene, each a link to its scene's marker. On the moving
 * scroll they are its progress too, stamping themselves as each scene comes
 * to rest; on the still scroll they are its contents.
 */
function Rail() {
  return (
    <nav className="wk-pj-rail" aria-label="Jump to a project">
      <ol className="wk-pj-seals" role="list">
        {projects.map((p, k) => (
          <li key={p.slug} style={{ '--k': k } as CSSProperties}>
            <a href={`#${markerId(p.slug)}`} className="wk-pj-seal">
              <span className="wk-pj-ghost" aria-hidden="true">
                {pad(k + 1)}
              </span>
              <Seal char={markFor(p.slug)} className="wk-pj-stamp" />
              <span className="wk-pj-seal-name">{p.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Behind the scenes on the moving scroll: one sheet of washi as long as all
 * four, and one row of their kanji, drifting slower than the paper. On the
 * still scroll each scene paints its own paper and kanji, and this is not
 * shown.
 */
function Base() {
  return (
    <div className="wk-pj-base" aria-hidden="true">
      <div className="wk-pj-sheet" />
      <div className="wk-pj-glyphs">
        <div className="wk-pj-glyphrow">
          {projects.map((p, k) => (
            <svg
              key={p.slug}
              className="wk-pj-glyph"
              viewBox="0 0 1000 1000"
              focusable="false"
              data-flip={k % 2 === 1 || undefined}
              style={{ '--k': k } as CSSProperties}
            >
              <use href={`#${glyphId(p.slug)}`} />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Everything in front of the paper, none of it pressable: the gold mist that
 * crosses between scenes, the light on the paper, and the two rollers. On
 * the still scroll this is the top roller.
 */
function Fore() {
  return (
    <div className="wk-pj-fore" aria-hidden="true">
      <div className="wk-pj-mistwin">
        <div className="wk-pj-mist">
          {projects.slice(1).map((p, j) => (
            <span
              key={p.slug}
              className="wk-pj-veil"
              style={{ '--j': j } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <div className="wk-pj-light" />
      <div className="wk-pj-jiku wk-pj-jiku-l">
        <span className="wk-pj-roll" />
      </div>
      <div className="wk-pj-jiku wk-pj-jiku-r">
        <span className="wk-pj-cover" />
        <span className="wk-pj-roll" />
      </div>
    </div>
  );
}

export default function WorkProjects() {
  const emaki = projects.length === 4;
  return (
    <section
      id={WORK_IDS.projects}
      aria-labelledby="wk-pj-h"
      className={`wk-pj${emaki ? ' wk-pj-emaki' : ''}`}
    >
      <div className="mx-auto max-w-6xl px-5 pt-24 sm:px-6 sm:pt-32">
        <p className="sd-kicker">Live, with receipts</p>
        <h2
          id="wk-pj-h"
          className="font-display sd-brush-under mt-3 text-4xl text-text-primary sm:text-5xl"
        >
          {/* A literal ’, not &rsquo;: this Next's compiler drops the space
              before a line of JSX text that holds an entity when it follows
              an expression, which printed "fourI’d". */}
          The {inWords(projects.length)} I’d show you first
        </h2>
        <p className="font-read mt-5 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
          All {inWords(projects.length)} are online right now. Each one has a
          button that takes you straight to it, and a page about what is built
          into it.
        </p>
      </div>

      <div className="wk-pj-run">
        <Rail />
        <Base />
        {projects.map((project, k) => (
          <Fragment key={project.slug}>
            <span
              id={markerId(project.slug)}
              className="wk-pj-at"
              style={{ '--k': k } as CSSProperties}
            />
            <Scene project={project} k={k} />
          </Fragment>
        ))}
        <Fore />
      </div>

      <WorkProjectsIsland />
    </section>
  );
}
