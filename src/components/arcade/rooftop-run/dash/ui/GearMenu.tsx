import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { MAX_SCROLLS, MAX_STARS } from '../storage';
import type { KiruSkin } from '../types';
import { KiruHead } from './faces';
import { focusInGame } from './focus';
import {
  BANDS,
  TRAILS,
  bandFor,
  bandUnlocked,
  trailFor,
  trailUnlocked,
  type BandGear,
  type TrailGear,
} from './gear';
import { BackIcon, LockIcon, ScrollIcon, StarIcon, TrailIcon } from './icons';

type Tab = 'band' | 'trail';

/**
 * Kiru's gear: headbands earned with stars, trails earned with scrolls. Two
 * tabs, so each set fits a phone's screen at full tap size. A choice goes
 * onto the running Kiru behind the menu at once, and onto the preview head.
 */
export default function GearMenu({
  stars,
  scrolls,
  skin,
  onSkin,
  onBack,
  say,
}: {
  stars: number;
  scrolls: number;
  skin: KiruSkin;
  onSkin: (skin: KiruSkin) => void;
  onBack: () => void;
  say: (text: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('band');
  const [hint, setHint] = useState('');
  const id = useId();
  const tabRefs = {
    band: useRef<HTMLButtonElement>(null),
    trail: useRef<HTMLButtonElement>(null),
  };
  const pickedRef = useRef<HTMLButtonElement>(null);
  const band = bandFor(skin.band) ?? BANDS[0];
  const trail = trailFor(skin.trail) ?? TRAILS[0];

  useEffect(() => {
    focusInGame(pickedRef.current);
  }, []);

  const lockedLine = (name: string, need: number, have: number, unit: string) =>
    `${name} unlocks at ${need} ${unit}. You have ${have}.`;

  const pickBand = (b: BandGear) => {
    if (!bandUnlocked(b, stars)) {
      const line = lockedLine(b.name, b.stars, stars, 'stars');
      setHint(line);
      say(line);
      return;
    }
    setHint('');
    if (b.color === skin.band) return;
    onSkin({ ...skin, band: b.color });
    say(`${b.name} headband on.`);
  };
  const pickTrail = (t: TrailGear) => {
    if (!trailUnlocked(t, scrolls)) {
      const line = lockedLine(t.name, t.scrolls, scrolls, 'scrolls');
      setHint(line);
      say(line);
      return;
    }
    setHint('');
    if (t.id === skin.trail) return;
    onSkin({ ...skin, trail: t.id });
    say(t.id === 'none' ? 'No trail.' : `${t.name} trail on.`);
  };

  const showTab = (t: Tab, focus: boolean) => {
    setTab(t);
    setHint('');
    if (focus) tabRefs[t].current?.focus();
  };
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      showTab(tab === 'band' ? 'trail' : 'band', true);
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      onBack();
    }
  };

  const tabButton = (t: Tab, label: string) => (
    <button
      ref={tabRefs[t]}
      type="button"
      role="tab"
      id={`${id}-${t}`}
      className="rr-tab"
      aria-selected={tab === t}
      aria-controls={`${id}-panel`}
      tabIndex={tab === t ? 0 : -1}
      onClick={() => showTab(t, false)}
      onKeyDown={onTabKey}
    >
      {label}
    </button>
  );

  return (
    <div
      className="rr-gear"
      role="group"
      aria-label="Gear"
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
        <div className="rr-tabs" role="tablist" aria-label="Gear">
          {tabButton('band', 'Headband')}
          {tabButton('trail', 'Trail')}
        </div>
      </div>

      <div className="rr-gear-body">
        <div className="rr-gear-preview" aria-hidden="true">
          <KiruHead mood="smile" band={skin.band} className="rr-gear-head" />
          {skin.trail !== 'none' && (
            <span className="rr-gear-trail">
              <TrailIcon trail={skin.trail} />
            </span>
          )}
          <p className="rr-gear-now">
            {band.name}
            <br />
            {trail.name}
          </p>
        </div>

        <div
          className="rr-gear-panel"
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-${tab}`}
          data-tab={tab}
        >
          <ul className="rr-swatches">
            {tab === 'band'
              ? BANDS.map((b) => {
                  const open = bandUnlocked(b, stars);
                  const on = b.color === skin.band;
                  return (
                    <li key={b.id}>
                      <button
                        ref={on ? pickedRef : undefined}
                        type="button"
                        className="rr-swatch"
                        style={{ '--sw': b.color } as CSSProperties}
                        aria-pressed={on}
                        aria-disabled={open ? undefined : true}
                        aria-label={
                          open
                            ? `${b.name} headband`
                            : `${b.name} headband, locked: unlocks at ${b.stars} stars`
                        }
                        title={open ? b.name : `${b.name}: ${b.stars} stars`}
                        onClick={() => pickBand(b)}
                      >
                        {!open && (
                          <>
                            <LockIcon />
                            <span className="rr-swatch-req" aria-hidden="true">
                              {b.stars}★
                            </span>
                          </>
                        )}
                      </button>
                    </li>
                  );
                })
              : TRAILS.map((t) => {
                  const open = trailUnlocked(t, scrolls);
                  const on = t.id === skin.trail;
                  return (
                    <li key={t.id}>
                      <button
                        ref={on ? pickedRef : undefined}
                        type="button"
                        className="rr-swatch"
                        data-trail={t.id}
                        aria-pressed={on}
                        aria-disabled={open ? undefined : true}
                        aria-label={
                          open
                            ? t.id === 'none'
                              ? 'No trail'
                              : `${t.name} trail`
                            : `${t.name} trail, locked: unlocks at ${t.scrolls} ${t.scrolls === 1 ? 'scroll' : 'scrolls'}`
                        }
                        title={
                          open
                            ? t.name
                            : `${t.name}: ${t.scrolls} ${t.scrolls === 1 ? 'scroll' : 'scrolls'}`
                        }
                        onClick={() => pickTrail(t)}
                      >
                        {open ? (
                          <TrailIcon trail={t.id} />
                        ) : (
                          <>
                            <LockIcon />
                            <span className="rr-swatch-req" aria-hidden="true">
                              {t.scrolls}
                              <ScrollIcon got />
                            </span>
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
          </ul>
          <p className="rr-gear-hint">
            {hint ||
              (tab === 'band'
                ? 'Stars from finished levels unlock headbands.'
                : 'Secret scrolls unlock trails. They count on a finished run.')}
          </p>
        </div>
      </div>

      <p className="rr-tally rr-gear-tally">
        <span>
          <StarIcon filled />
          <span>
            {stars}
            <span className="rr-of">/{MAX_STARS}</span>
          </span>
          <span className="sr-only"> stars</span>
        </span>
        <span>
          <ScrollIcon got />
          <span>
            {scrolls}
            <span className="rr-of">/{MAX_SCROLLS}</span>
          </span>
          <span className="sr-only"> secret scrolls</span>
        </span>
      </p>
    </div>
  );
}
