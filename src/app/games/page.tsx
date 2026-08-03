'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apps, type App } from '@/data/apps';
import { SectionContainer, Card } from '@/components/ui';

// The Arcade is an explicit, curated line-up — Pebble Kart (built for Gabe)
// leads, then the rest of the playable builds. The games keep their own /apps
// categories; this list just defines what shows in the cabinet, and its order.
const ARCADE_GAME_SLUGS = ['pebble-kart', 'flappy-bird', 'grove', 'aureum-snake', 'cloth-simulator'];

const games: App[] = ARCADE_GAME_SLUGS.map((slug) =>
  apps.find((app) => app.slug === slug),
).filter((app): app is App => app !== undefined);

const platforms = Array.from(
  new Set(
    games.flatMap((g) =>
      g.techStack.filter((t) =>
        ['HTML5', 'PixiJS', 'Vanilla JavaScript', 'SVG', 'Web Audio API'].includes(t),
      ),
    ),
  ),
);

// Bold primary palette — red as star, yellow + blue as supporting cast.
// Bright versions are for DECORATIVE fills only (ribbons, glows, LEDs,
// confetti, on-dark marquee) where contrast doesn't apply.
const RED = '#ef4444';
const YELLOW = '#facc15';
const BLUE = '#3b82f6';
const RIBBONS = [RED, YELLOW, BLUE];

// Ink variants — used anywhere the color is TEXT or a chip. Theme-aware via
// CSS vars (globals.css): on the light "Paper" background these are dark inks
// (the bright arcade colors fail WCAG AA — bright yellow is 1.5:1); in dark
// mode they flip to the bright neon, which pops on the dark cabinet. Both
// clear AA in their own theme.
const RED_INK = 'var(--arcade-red-ink)';
const YELLOW_INK = 'var(--arcade-yellow-ink)';
const BLUE_INK = 'var(--arcade-blue-ink)';
const RIBBONS_INK = [RED_INK, YELLOW_INK, BLUE_INK];

const MARQUEE_ITEMS = [
  'NOW PLAYING',
  ...games.map((g) => g.name.toUpperCase()),
  'INSERT COIN',
  'HIGH SCORE',
  'PLAYER ONE READY',
];

export default function Arcade() {
  const [activePlatform, setActivePlatform] = useState<string | null>(null);

  const filtered = activePlatform
    ? games.filter((g) => g.techStack.includes(activePlatform))
    : games;

  return (
    <div className="relative overflow-hidden">
      {/* Red scanline overlay for arcade feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(239,68,68,0.05)_0px,rgba(239,68,68,0.05)_1px,transparent_1px,transparent_3px)]"
      />
      {/* Confetti dots — yellow + blue spots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(${YELLOW} 1.5px, transparent 1.5px), radial-gradient(${BLUE} 1.5px, transparent 1.5px)`,
          backgroundSize: '80px 80px, 110px 110px',
          backgroundPosition: '0 0, 40px 55px',
        }}
      />

      <SectionContainer className="relative py-20">
        {/* Page Header */}
        <div className="text-center">
          <p
            className="font-mono-accent text-sm uppercase tracking-[0.3em]"
            style={{ color: RED_INK }}
          >
            ★ Player One ★
          </p>
          <h1 className="font-mono-accent mt-3 text-4xl font-black uppercase tracking-tight sm:text-6xl">
            <span
              className="bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(239,68,68,0.35)]"
              style={{
                backgroundImage: `linear-gradient(90deg, ${RED_INK} 0%, ${RED_INK} 35%, ${YELLOW_INK} 65%, ${BLUE_INK} 100%)`,
              }}
            >
              Arcade
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            A cabinet of hand-built games — pixels, physics, and chain-scored
            chaos. Insert coin. Press start.
          </p>

          {/* Arcade-style stats row — red / yellow / blue */}
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3 sm:gap-6">
            <Stat
              label="Games"
              value={String(games.length).padStart(2, '0')}
              color={RED}
              ink={RED_INK}
            />
            <Stat
              label="Live"
              value={String(games.filter((g) => g.status === 'live').length).padStart(2, '0')}
              color={YELLOW}
              ink={YELLOW_INK}
            />
            <Stat label="Credits" value="∞" color={BLUE} ink={BLUE_INK} />
          </div>
        </div>

        {/* Platform Filter */}
        {platforms.length > 1 && (
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <FilterPill
              active={activePlatform === null}
              onClick={() => setActivePlatform(null)}
            >
              All Worlds
            </FilterPill>
            {platforms.map((p) => (
              <FilterPill
                key={p}
                active={activePlatform === p}
                onClick={() => setActivePlatform(p)}
              >
                {p}
              </FilterPill>
            ))}
          </div>
        )}

        {/* Marquee strip */}
        <Marquee />

        {/* Game Grid */}
        {filtered.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((game, idx) => {
              const ribbon = RIBBONS[idx % RIBBONS.length];
              const ribbonInk = RIBBONS_INK[idx % RIBBONS_INK.length];
              return (
                <Card
                  key={game.slug}
                  hover={false}
                  className="group relative flex h-full flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{
                    border: `1px solid ${ribbon}40`,
                    boxShadow: `0 4px 14px rgba(0,0,0,0.25)`,
                  }}
                >
                  {/* Top ribbon — alternating R/Y/B per slot */}
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl transition-all duration-300 group-hover:h-1.5"
                    style={{
                      backgroundColor: ribbon,
                      boxShadow: `0 0 12px ${ribbon}99`,
                    }}
                  />

                  {/* Slot number */}
                  <span
                    className="font-mono-accent absolute right-4 top-4 z-20 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                    style={{
                      color: ribbonInk,
                      border: `1px solid ${ribbon}55`,
                    }}
                  >
                    #{String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* CRT cabinet frame */}
                  <CRTScreen
                    href={`/apps/${game.slug}?from=arcade`}
                    src={game.thumbnailUrl}
                    alt={`${game.name} screenshot`}
                    accent={ribbon}
                    priority={idx === 0}
                  />

                  {/* Name + Status */}
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/apps/${game.slug}?from=arcade`}
                      className="font-mono-accent text-lg font-black uppercase tracking-wide text-text-primary transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.color = ribbonInk)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                    >
                      {game.name}
                    </Link>
                    <StatusBadge status={game.status} />
                  </div>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-sm text-text-secondary">
                    {game.description}
                  </p>

                  {/* Tech tags — cycle R/Y/B */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {game.techStack.map((t, i) => {
                      const tagColor = RIBBONS[i % RIBBONS.length];
                      const tagInk = RIBBONS_INK[i % RIBBONS_INK.length];
                      return (
                        <span
                          key={t}
                          className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: `${tagColor}1A`,
                            color: tagInk,
                            border: `1px solid ${tagColor}40`,
                          }}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>

                  {/* Link hints */}
                  <div className="mt-4 flex items-center gap-4">
                    <Link
                      href={`/apps/${game.slug}?from=arcade`}
                      className="font-mono-accent text-sm font-black uppercase tracking-wider transition-colors"
                      style={{ color: RED_INK }}
                    >
                      ▶ Details
                    </Link>
                    {game.liveUrl && (
                      <a
                        href={game.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-accent text-sm font-black uppercase tracking-wider transition-colors"
                        style={{ color: BLUE_INK }}
                      >
                        ◉ Press Start
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="mt-20 text-center">
            <p className="font-mono-accent text-lg uppercase tracking-widest text-text-secondary">
              No games in this world. Insert another coin.
            </p>
          </div>
        )}

        {/* Footer arcade strip */}
        <div
          className="mt-20 border-t pt-6 text-center"
          style={{ borderColor: `${RED}33` }}
        >
          <p className="font-mono-accent text-xs uppercase tracking-[0.4em] text-text-secondary/70">
            <span style={{ color: RED_INK }}>──</span>{' '}
            <span style={{ color: YELLOW_INK }}>High Score Table</span>{' '}
            <span style={{ color: BLUE_INK }}>— Cabinet #1 —</span>{' '}
            <span style={{ color: RED_INK }}>──</span>
          </p>
          <p className="mt-3 text-xs text-text-secondary/60">
            ❤️ Built for Gabe.
          </p>
        </div>
      </SectionContainer>
    </div>
  );
}

function CRTScreen({
  href,
  src,
  alt,
  accent,
  priority = false,
}: {
  href: string;
  src: string;
  alt: string;
  accent: string;
  priority?: boolean;
}) {
  return (
    <Link href={href} className="group/screen relative block">
      {/* Cabinet bezel */}
      <div
        className="relative overflow-hidden rounded-xl bg-black p-2 transition-shadow duration-300"
        style={{
          boxShadow: `inset 0 0 0 2px rgba(0,0,0,0.7), 0 6px 18px rgba(0,0,0,0.5), 0 0 0 1px ${accent}33`,
        }}
      >
        {/* Top-bezel LED indicators */}
        <span
          aria-hidden
          className="led-pulse absolute left-3 top-3 z-10 block h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: RED,
            boxShadow: `0 0 6px ${RED}cc`,
          }}
        />
        <span
          aria-hidden
          className="absolute right-3 top-3 z-10 block h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: '#34d399',
            boxShadow: '0 0 6px rgba(52,211,153,0.8)',
          }}
        />

        {/* Screen */}
        <div className="relative overflow-hidden rounded-md">
          <img
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            src={src}
            alt={alt}
            className="h-44 w-full object-cover transition-transform duration-500 ease-out group-hover/screen:scale-110"
          />

          {/* Screen scanlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-multiply"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* Vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          {/* Screen glare */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 35%)',
            }}
          />

          {/* INSERT COIN hover reveal */}
          <div
            className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 pb-2 pt-6 text-center transition-transform duration-300 ease-out group-hover/screen:translate-y-0"
            aria-hidden
          >
            <span
              className="font-mono-accent text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: accent, textShadow: `0 0 8px ${accent}88` }}
            >
              ↗ Insert Coin
            </span>
          </div>
        </div>

        {/* Bottom-bezel speaker grille hint */}
        <div
          aria-hidden
          className="mt-1.5 flex h-1 items-center justify-center gap-1 opacity-60"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="block h-0.5 w-2 rounded-full bg-white/15"
            />
          ))}
        </div>
      </div>
    </Link>
  );
}

// How fast the marquee actually travels. The duration is derived from the
// measured strip width rather than hardcoded, so adding a game changes how long
// the loop takes and never how fast it reads.
const MARQUEE_SPEED_PX_PER_SEC = 30;

function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const firstSegment = segmentRef.current;
    if (!track || !firstSegment) return;

    const syncDuration = () => {
      const width = firstSegment.getBoundingClientRect().width;
      if (width > 0) {
        track.style.setProperty(
          '--games-marquee-duration',
          `${width / MARQUEE_SPEED_PX_PER_SEC}s`,
        );
      }
    };

    syncDuration();
    // The strip is text, so its width moves under us — a web font swapping in
    // after first paint is enough to change it. Re-measure instead of trusting
    // the first reading.
    const observer = new ResizeObserver(syncDuration);
    observer.observe(firstSegment);
    return () => observer.disconnect();
  }, []);

  const segment = (key: string, ref?: React.Ref<HTMLDivElement>) => (
    <div key={key} ref={ref} className="flex shrink-0 items-center">
      {MARQUEE_ITEMS.map((t, i) => (
        <span
          key={`${key}-${i}`}
          className="font-mono-accent flex shrink-0 items-center px-6 text-sm font-black uppercase tracking-[0.3em]"
          style={{ color: RIBBONS[i % RIBBONS.length] }}
        >
          ▸ {t}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="games-marquee mt-10 overflow-hidden border-y bg-black/75 py-3"
      style={{ borderColor: `${RED}40` }}
      aria-hidden
    >
      <div ref={trackRef} className="games-marquee-track">
        {segment('a', segmentRef)}
        {segment('b')}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  ink,
}: {
  label: string;
  value: string;
  color: string;
  ink: string;
}) {
  return (
    <div
      className="rounded-xl bg-surface/60 px-3 py-3 sm:px-4"
      style={{
        border: `1px solid ${color}33`,
        boxShadow: `0 0 16px ${color}1A`,
      }}
    >
      <p className="font-mono-accent text-[10px] uppercase tracking-[0.25em] text-text-secondary">
        {label}
      </p>
      <p
        className="font-mono-accent mt-1 text-2xl font-black sm:text-3xl"
        style={{ color: ink }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: 'live' | 'beta' | 'development' }) {
  const color = status === 'live' ? YELLOW : status === 'beta' ? BLUE : RED;
  const ink =
    status === 'live' ? YELLOW_INK : status === 'beta' ? BLUE_INK : RED_INK;
  const label = status === 'live' ? 'PLAY' : status.toUpperCase();
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-black"
      style={{
        backgroundColor: `${color}1A`,
        color: ink,
        border: `1px solid ${color}55`,
      }}
    >
      {label}
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="font-mono-accent rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors"
      style={
        active
          ? {
              backgroundColor: RED,
              color: '#0a0a0a',
              border: `1px solid ${RED}`,
              boxShadow: `0 0 18px ${RED}66`,
            }
          : {
              backgroundColor: 'transparent',
              color: 'var(--sd-text-secondary)',
              border: `1px solid ${RED}55`,
            }
      }
    >
      {children}
    </button>
  );
}
