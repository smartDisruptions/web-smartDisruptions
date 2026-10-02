import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { LEVEL_METAS } from '../levels/meta';
import { levelProgress } from '../storage';
import {
  MODE_NAMES,
  type DashSave,
  type LevelMeta,
  type LevelProgress,
} from '../types';
import { DIFFICULTY_NAMES, DifficultyFace } from './faces';
import { focusInGame } from './focus';
import {
  BackIcon,
  ChevronIcon,
  DiamondIcon,
  ModeIcon,
  PlayIcon,
  ScrollIcon,
  StarIcon,
} from './icons';

const COUNT = LEVEL_METAS.length;

/** What the live region says when a level comes into view. */
export function describeLevel(meta: LevelMeta, p: LevelProgress): string {
  const scrolls = p.scrolls.filter(Boolean).length;
  const parts = [
    `${meta.name}, level ${meta.n} of ${COUNT}.`,
    `${DIFFICULTY_NAMES[meta.difficulty]}, ${meta.stars} stars${p.completed ? ', complete' : ''}.`,
    p.attempts > 0
      ? `Best ${p.best} percent${p.practiceBest > 0 ? `, practice ${p.practiceBest} percent` : ''}.`
      : 'Not played yet.',
  ];
  if (scrolls > 0) parts.push(`${scrolls} of 3 scrolls.`);
  return parts.join(' ');
}

function Bar({
  label,
  value,
  kind,
}: {
  label: string;
  value: number;
  kind: 'normal' | 'practice';
}) {
  return (
    <div className="rr-bar" data-kind={kind}>
      <span>{label}</span>
      <span className="rr-bar-val">{value}%</span>
      <span className="rr-bar-track" aria-hidden="true">
        <span className="rr-bar-fill" style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

function LevelCard({ meta, p }: { meta: LevelMeta; p: LevelProgress }) {
  const kept = p.scrolls.filter(Boolean).length;
  return (
    <article
      className="rr-card"
      data-d={meta.difficulty}
      data-done={p.completed ? '' : undefined}
    >
      <div className="rr-card-head">
        <DifficultyFace difficulty={meta.difficulty} />
        <div className="rr-card-id">
          <p className="rr-card-n">Level {meta.n}</p>
          <h4 className="rr-card-title font-display">{meta.name}</h4>
          <div className="rr-card-meta">
            <span className="rr-diff">{DIFFICULTY_NAMES[meta.difficulty]}</span>
            <span className="rr-card-stars">
              <StarIcon filled={p.completed} />
              {meta.stars}
              <span className="sr-only">
                {' '}
                stars{p.completed ? ', earned' : ''}
              </span>
            </span>
          </div>
        </div>
        <p className="rr-card-scrolls">
          {p.scrolls.map((got, i) => (
            <ScrollIcon key={i} got={got} />
          ))}
          <span className="sr-only">{kept} of 3 secret scrolls found</span>
        </p>
      </div>
      <p className="rr-card-tag">{meta.tagline}</p>
      <ul className="rr-modes" aria-label="Ways to move">
        {meta.modes.map((m) => (
          <li key={m} title={MODE_NAMES[m]}>
            <ModeIcon mode={m} />
            <span className="rr-mode-name">{MODE_NAMES[m]}</span>
          </li>
        ))}
      </ul>
      <div className="rr-bars">
        <Bar label="Normal" value={p.best} kind="normal" />
        <Bar label="Practice" value={p.practiceBest} kind="practice" />
      </div>
      <p className="rr-card-foot">
        {p.attempts > 0
          ? `${p.attempts.toLocaleString('en-US')} ${p.attempts === 1 ? 'attempt' : 'attempts'} · ${p.jumps.toLocaleString('en-US')} jumps`
          : 'Not played yet'}
      </p>
    </article>
  );
}

/**
 * Choose a level: a carousel of the six. One card at a time on a phone,
 * with the neighbours peeking in on wider screens. Arrows, a swipe, ← and →
 * (wrapping round), Home and End; the Play button keeps focus throughout, so
 * Enter plays whichever level is showing.
 */
export default function LevelSelect({
  index,
  save,
  onIndex,
  onPlay,
  onBack,
  say,
}: {
  index: number;
  save: DashSave;
  onIndex: (i: number) => void;
  onPlay: (practice: boolean) => void;
  onBack: () => void;
  say: (text: string) => void;
}) {
  const playRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    dx: number;
    on: boolean;
  } | null>(null);
  const meta = LEVEL_METAS[index];

  useEffect(() => {
    focusInGame(playRef.current);
  }, []);

  const go = (i: number) => {
    const next = ((i % COUNT) + COUNT) % COUNT;
    if (next === index) return;
    onIndex(next);
    const m = LEVEL_METAS[next];
    say(describeLevel(m, levelProgress(save, m.id)));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        go(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        go(index + 1);
        break;
      case 'Home':
        e.preventDefault();
        go(0);
        break;
      case 'End':
        e.preventDefault();
        go(COUNT - 1);
        break;
      case 'Escape':
        e.preventDefault();
        onBack();
        break;
      case 'Enter':
        // Buttons handle their own Enter; anywhere else, Enter plays.
        if (!(e.target instanceof HTMLButtonElement)) {
          e.preventDefault();
          onPlay(false);
        }
        break;
    }
  };

  // A horizontal swipe changes level; the cards follow the finger meanwhile.
  // Vertical drags are left to the page (touch-action: pan-y).
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      on: false,
    };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || d.id !== e.pointerId || !track) return;
    const dx = e.clientX - d.x;
    if (!d.on) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
      d.on = true;
      track.dataset.drag = '';
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* not capturable: the swipe still works */
      }
    }
    d.dx = dx;
    track.style.setProperty('--drag', `${dx}px`);
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.on || !track) return;
    delete track.dataset.drag;
    track.style.setProperty('--drag', '0px');
    const w = viewRef.current?.clientWidth ?? 320;
    const far = Math.min(70, w * 0.16);
    if (e.type === 'pointerup' && d.dx <= -far) go(index + 1);
    else if (e.type === 'pointerup' && d.dx >= far) go(index - 1);
  };

  return (
    <div
      className="rr-lv"
      role="group"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
    >
      <div className="rr-topbar">
        <button
          type="button"
          className="rr-icon"
          onClick={onBack}
          aria-label="Back to the title"
          title="Back (Esc)"
        >
          <BackIcon />
        </button>
        <h3 id={titleId} className="rr-topbar-title">
          Levels
          <span className="rr-topbar-count">
            {' '}
            {index + 1}/{COUNT}
          </span>
        </h3>
        <ol className="rr-dots" aria-hidden="true">
          {LEVEL_METAS.map((m, i) => (
            <li
              key={m.id}
              data-on={i === index ? '' : undefined}
              data-done={save.levels[m.id]?.completed ? '' : undefined}
            />
          ))}
        </ol>
      </div>

      <div
        ref={viewRef}
        className="rr-lv-view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <ol
          ref={trackRef}
          className="rr-lv-track"
          style={{ '--i': index } as CSSProperties}
        >
          {LEVEL_METAS.map((m, i) => (
            <li
              key={m.id}
              className="rr-slide"
              data-on={i === index ? '' : undefined}
            >
              <div inert={i !== index}>
                <LevelCard meta={m} p={levelProgress(save, m.id)} />
              </div>
              {i !== index && (
                // A neighbour peeking in: a click brings it to the middle.
                // Keyboard users have the arrows, so this stays out of the
                // tab order and out of the accessibility tree.
                <button
                  type="button"
                  className="rr-slide-hit"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => go(i)}
                />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="rr-lv-actions">
        <button
          type="button"
          className="rr-icon rr-arrow"
          data-dir="prev"
          onClick={() => go(index - 1)}
          aria-label="Previous level"
          title="Previous level (←)"
        >
          <ChevronIcon dir="left" />
        </button>
        <button
          ref={playRef}
          type="button"
          className="rr-start"
          onClick={() => onPlay(false)}
        >
          <PlayIcon />
          Play<span className="sr-only"> {meta.name}</span>
        </button>
        <button
          type="button"
          className="rr-btn"
          data-tube="green"
          onClick={() => onPlay(true)}
        >
          <DiamondIcon />
          Practice<span className="sr-only"> {meta.name}</span>
        </button>
        <button
          type="button"
          className="rr-icon rr-arrow"
          data-dir="next"
          onClick={() => go(index + 1)}
          aria-label="Next level"
          title="Next level (→)"
        >
          <ChevronIcon dir="right" />
        </button>
      </div>
    </div>
  );
}
