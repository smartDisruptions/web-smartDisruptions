import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { App } from '@/data/apps';
import { builtHref } from '@/data/projects';
import Kiru from '@/components/kiru/Kiru';
import { Seal } from '@/components/brand/Kanji';
import { ArrowIcon } from '../Cabinets';
import { MarqueeLights, Medallion } from './art';
import EscapeFX from './EscapeFX';
import { ROOMS, type Room } from './rooms';
import './escape.css';

/**
 * THE ESCAPE ROOMS — the Lantern Theater, on the night market between the
 * front room's cabinets and the stair down to the Broom & Blade Arcade (Josh's
 * call, 2026-10-23). The line-up is ESCAPE_ROOM_SLUGS in src/data/apps.ts.
 *
 * Three parts, all server HTML and CSS:
 *
 *  1. The marquee, in the rain: its bulbs chase (three opacity layers, art.tsx).
 *  2. Each room's stage. Scrolling plays the night of the theft: the curtain
 *     parts on the show, the lights go out, the pearl's glow drifts toward the
 *     dressing-room door and goes out, and the lights come back on an empty
 *     stand. It is a scroll timeline (`view-timeline` on the track, the stage
 *     sticky inside it), so the compositor runs it: opacity and transform on
 *     two pictures and a few layers, no JavaScript. Browsers without scroll
 *     timelines, and reduced motion, get the stage open on the show.
 *  3. The lineup: tap a suspect to hear their alibi in the voice the game
 *     recorded. The one client island, EscapeFX, plays the voices (and wakes
 *     the marquee only while it is on screen, holds it while the page scrolls,
 *     and gives a phone's toolbar the theater's colour).
 *
 * The section's id is a contract: the games link back to /games#escape-rooms.
 */

const vars = (o: Record<string, string | number>) => o as CSSProperties;

function Stage({ room, name }: { room: Room; name: string }) {
  const s = room.stage;
  const pos = vars({
    '--px-p': `${s.pearl.phone[0] * 100}%`,
    '--py-p': `${s.pearl.phone[1] * 100}%`,
    '--dx-p': `${s.drift.phone[0] * 100}%`,
    '--dy-p': `${s.drift.phone[1] * 100}%`,
    '--px-w': `${s.pearl.wide[0] * 100}%`,
    '--py-w': `${s.pearl.wide[1] * 100}%`,
    '--dx-w': `${s.drift.wide[0] * 100}%`,
    '--dy-w': `${s.drift.wide[1] * 100}%`,
  });
  return (
    <div className="er-track">
      <div className="er-stage" style={pos}>
        <div className="er-valance" aria-hidden="true">
          <Medallion className="er-medallion" />
        </div>
        <div className="er-scene">
          <picture>
            <source
              media="(min-width: 48rem)"
              srcSet={s.show.wide}
              width={1600}
              height={900}
            />
            <img
              className="er-shot"
              src={s.show.phone}
              width={800}
              height={900}
              alt={s.alt}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <picture className="er-gone">
            <source
              media="(min-width: 48rem)"
              srcSet={s.gone.wide}
              width={1600}
              height={900}
            />
            <img
              className="er-shot"
              src={s.gone.phone}
              width={800}
              height={900}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </picture>
          <span className="er-dark" aria-hidden="true" />
          <span className="er-glow" aria-hidden="true">
            <span className="er-glow-dot" />
          </span>
          <span className="er-flash" aria-hidden="true" />
          <div className="er-caps" aria-hidden="true">
            {s.captions.map((c, i) => (
              <p key={i} className="er-cap" data-n={i}>
                {c}
              </p>
            ))}
          </div>
        </div>
        <div className="er-curtain" data-side="l" aria-hidden="true" />
        <div className="er-curtain" data-side="r" aria-hidden="true" />
        <div className="er-plaque" aria-hidden="true">
          <span className="er-plaque-kick">Room {room.number}</span>
          <span className="er-plaque-name font-display">{name}</span>
          <span className="er-plaque-hint">Scroll to raise the curtain</span>
        </div>
        <div className="er-foots" aria-hidden="true" />
      </div>
    </div>
  );
}

function Lineup({ room, game }: { room: Room; game: App }) {
  return (
    <div className="er-lineup" data-er-lineup="">
      <div className="er-lineup-head">
        <p className="er-kick">The lineup · 9:55 PM</p>
        <h4 className="er-h4 font-display">Who took it?</h4>
        <p className="er-lead font-read">
          Three suspects told three stories on stage. Tap one to hear it in
          their own voice.
        </p>
      </div>
      <div className="er-wall" role="group" aria-label="The suspects">
        <span className="er-scale" aria-hidden="true">
          <i>7 ft</i>
          <i>6 ft</i>
          <i>5 ft</i>
          <i>4 ft</i>
        </span>
        {room.suspects.map((p) => (
          <button
            key={p.id}
            type="button"
            className="er-who"
            data-who={p.id}
            data-voice={p.voice}
            aria-pressed="false"
            aria-label={`${p.name}, ${p.role}: hear the alibi`}
            style={vars({ '--ink': p.ink })}
          >
            <span className="er-spot" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element -- a cutout drawn by the game, sized by its column */}
            <img
              className="er-who-img"
              src={p.img}
              width={p.w}
              height={p.h}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="er-plate" aria-hidden="true">
              <b>{p.name}</b>
              <small>{p.role}</small>
            </span>
            <span className="er-wave" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </button>
        ))}
      </div>
      <div className="er-said" aria-live="polite">
        <p className="er-prompt">Tap a suspect to hear their alibi.</p>
        {room.suspects.map((p) => (
          <p
            key={p.id}
            className="er-quote"
            data-for={p.id}
            style={vars({ '--ink': p.ink })}
          >
            <b>{p.name}</b>
            <span className="font-read">&ldquo;{p.quote}&rdquo;</span>
          </p>
        ))}
      </div>
      <p className="er-verdict">
        <span>{room.verdict}</span>{' '}
        {game.liveUrl && (
          <a className="er-link" href={game.liveUrl}>
            Find out who
            <ArrowIcon />
          </a>
        )}
      </p>
    </div>
  );
}

function RoomCard({ game }: { game: App }) {
  const room = ROOMS[game.slug];
  if (!room) return null;
  const titleId = `er-${game.slug}`;
  return (
    <article className="er-room" aria-labelledby={titleId}>
      <Stage room={room} name={game.name} />
      <div className="er-bill">
        <div className="er-bill-text">
          <p className="er-kick">
            Room {room.number} · {room.kicker}
          </p>
          <h3 id={titleId} className="er-name font-display">
            {game.name}
          </h3>
          <p className="er-tag font-read">{room.tagline}</p>
          <p className="er-blurb">{room.blurb}</p>
        </div>
        <div className="er-bill-side">
          <dl className="er-facts">
            {room.facts.map((f) => (
              <div key={f.label} className="er-fact">
                <dt>{f.label}</dt>
                <dd className="font-display">{f.n}</dd>
              </div>
            ))}
          </dl>
          <div className="er-deck">
            {game.liveUrl && (
              <a className="er-ticket" href={game.liveUrl}>
                <span className="er-ticket-kick">Admit one</span>
                <span className="er-ticket-go">
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    fill="currentColor"
                  >
                    <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
                  </svg>
                  Play
                </span>
                <span className="er-ticket-free">Free · in your browser</span>
                <span className="sr-only">: {game.name}</span>
              </a>
            )}
            <Link
              className="er-more"
              href={`${builtHref(game.slug)}?from=escape`}
            >
              Details
              <span className="sr-only"> about {game.name}</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
      <Lineup room={room} game={game} />
    </article>
  );
}

export default function EscapeRooms({ rooms }: { rooms: App[] }) {
  if (rooms.length === 0) return null;
  const first = rooms[0];
  return (
    <section id="escape-rooms" className="er" aria-labelledby="er-title">
      <EscapeFX />
      <header className="er-front">
        <div className="er-rain" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="er-marquee">
          <MarqueeLights />
          <div className="er-marquee-in">
            <p className="er-house">
              <span aria-hidden="true">★</span> The Lantern Theater{' '}
              <span aria-hidden="true">★</span>
            </p>
            <h2 id="er-title" className="er-title font-display">
              Escape Rooms
            </h2>
            <p className="er-now">
              <span className="er-now-kick">Now playing</span>
              <span className="er-now-name font-display">{first.name}</span>
            </p>
          </div>
        </div>
        <div className="er-front-foot">
          <Seal char="探" className="er-seal" />
          <p className="er-intro font-read">
            You&apos;re locked in until dawn. Search the room, open the locks
            with what you find, and name the thief before the sun comes up.
            Every clue is something you can pick up.
          </p>
          <Kiru pose="shh" still className="er-kiru" />
        </div>
      </header>
      <div className="er-rooms">
        {rooms.map((g) => (
          <RoomCard key={g.slug} game={g} />
        ))}
      </div>
    </section>
  );
}
