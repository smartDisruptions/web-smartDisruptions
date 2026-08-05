'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  identity,
  roles,
  projects,
  skills,
  education,
  elsewhere,
  disclosure,
} from '@/data/resume';
import { useResumeAsk, SUGGESTED } from '@/components/web-design/useResumeAsk';
import s from './bulletin.module.css';

/** Trial window: the first freelance year through the current season. */
const FIRST_YEAR = 2008;
const LAST_YEAR = 2026;
const SPAN = LAST_YEAR - FIRST_YEAR;

/**
 * The contour survey behind the masthead.
 *
 * Stacked ridgelines — the Palouse read as terrain rather than decoration.
 * Each row is a polyline whose height is a sum of sines, filled with the
 * ground colour so nearer ridges occlude the ones behind. That occlusion is
 * what makes it read as land instead of as a pattern.
 *
 * Deterministic: no Math.random, so the hills are the same hills every load.
 */
function useRidgelines() {
  // The hook owns the ref rather than receiving it: sizing the canvas means
  // writing to el.width/height, and mutating anything derived from a hook
  // argument is off-limits.
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let raf = 0;
    let width = 0;
    let height = 0;

    // `el` is captured once for the effect's lifetime, so nothing re-reads the
    // ref after mount — the cleanup below tears the whole thing down.
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el!.clientWidth;
      height = el!.clientHeight;
      el!.width = Math.floor(width * dpr);
      el!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Layered sines. Coefficients chosen so no two ridges repeat visibly, and
    // weighted toward the long wavelength so the result reads as dunes rather
    // than as ripples — the Palouse is big slow hills, not chop.
    function elevation(x: number, row: number, t: number): number {
      const a = Math.sin(x * 0.0026 + row * 0.55 + t) * 1.35;
      const b = Math.sin(x * 0.0071 - row * 0.31 + t * 1.7) * 0.62;
      const c = Math.sin(x * 0.0169 + row * 0.93 - t * 0.8) * 0.2;
      const d = Math.sin(x * 0.0038 + row * 1.7) * 0.95;
      return a + b + c + d;
    }

    function draw(t: number) {
      if (!width || !height) return;
      ctx!.clearRect(0, 0, width, height);

      const rows = 22;
      const top = height * 0.2;
      const spacing = (height - top) / rows;
      const step = Math.max(3, Math.floor(width / 320));

      for (let r = 0; r < rows; r++) {
        const k = r / rows;
        const baseY = top + r * spacing;
        // Nearer ridges (higher r) get taller relief.
        const amp = spacing * (1.4 + k * 5.2);

        ctx!.beginPath();
        ctx!.moveTo(0, baseY - elevation(0, r, t) * amp);
        for (let x = step; x <= width; x += step) {
          ctx!.lineTo(x, baseY - elevation(x, r, t) * amp);
        }
        ctx!.lineTo(width, height);
        ctx!.lineTo(0, height);
        ctx!.closePath();

        // Each ridge is filled a step lighter than the one behind it. That
        // occlusion is what makes this read as land rather than as a wave
        // pattern — without it the strokes are just scattered wire.
        const lift = Math.round(k * 16);
        ctx!.fillStyle = `rgb(${15 + lift}, ${23 + lift}, ${17 + lift})`;
        ctx!.fill();

        // Lit horizon fades from wheat into survey teal as ridges approach.
        ctx!.strokeStyle =
          k < 0.36
            ? `rgba(223, 196, 106, ${0.95 - k * 1.5})`
            : `rgba(79, 157, 157, ${0.72 - (k - 0.36) * 0.7})`;
        ctx!.lineWidth = k < 0.36 ? 1.4 : 1.1;
        ctx!.stroke();
      }
    }

    function frame(now: number) {
      draw(now * 0.00006);
      raf = requestAnimationFrame(frame);
    }

    resize();
    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return canvas;
}

export default function Bulletin({ modelEnabled }: { modelEnabled: boolean }) {
  const canvasRef = useRidgelines();

  const [plot, setPlot] = useState(0);
  const selected = projects[plot];

  const ask = useResumeAsk(modelEnabled);

  return (
    <div className={s.world}>
      <canvas ref={canvasRef} className={s.terrain} aria-hidden="true" />
      <div className={s.terrainVeil} aria-hidden="true" />

      <div className={s.shell}>
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className={s.masthead}>
          <div className={s.plate}>
            <div className={s.plateHead}>
              <span className={s.issuer}>Variety Trial Bulletin</span>
              <span className={s.issue}>No. 1 · The Palouse</span>
            </div>

            <h1 className={s.title}>{identity.name}</h1>
            <p className={s.subject}>{identity.role}</p>

            <p className={s.standfirst}>
              A performance record under measured conditions. Eighteen seasons,
              six plots, one variety — reported as it actually yielded, including
              the years it did not.
            </p>

            <div className={s.plateFoot}>
              <div className={s.stat}>
                <span className={s.statLabel}>Seasons</span>
                <span className={s.statValue}>{SPAN}</span>
              </div>
              <div className={s.stat}>
                <span className={s.statLabel}>Plots</span>
                <span className={s.statValue}>
                  {String(projects.length).padStart(2, '0')}
                </span>
              </div>
              <div className={s.stat}>
                <span className={s.statLabel}>Station</span>
                <span className={s.statValue}>Moscow · Pullman</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Plot map ─────────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="plots-heading">
          <div className={s.sectionHead}>
            <h2 id="plots-heading" className={s.sectionTitle}>
              Plot map
            </h2>
            <span className={s.sectionNote}>Select a plot to read it</span>
          </div>

          <p className={s.lede}>
            Six plots, each one a thing that shipped and can be checked. The bar
            under each is its yield against the best season on record.
          </p>

          <div className={s.plots}>
            {projects.map((p, i) => (
              <button
                key={p.name}
                type="button"
                className={`${s.plot} ${i === plot ? s.plotActive : ''}`}
                onClick={() => setPlot(i)}
                aria-pressed={i === plot}
              >
                <span className={s.plotId}>
                  PLOT {String(i + 1).padStart(2, '0')} · {p.status.toUpperCase()}
                </span>
                <p className={s.plotName}>{p.name}</p>
                <p className={s.plotKind}>{p.kind}</p>
                <span className={s.plotYield} aria-hidden="true">
                  <span
                    className={s.plotYieldFill}
                    style={{ transform: `scaleX(${p.yield / 100})` }}
                  />
                </span>
                <span className={s.plotYieldValue}>
                  yield {p.yield}/100
                </span>
              </button>
            ))}
          </div>

          <div className={s.reading} aria-live="polite">
            <span className={s.readingHead}>
              Reading · Plot {String(plot + 1).padStart(2, '0')} ·{' '}
              {selected.name}
            </span>
            <p className={s.readingResult}>{selected.result}</p>
            <p className={s.readingDetail}>{selected.detail}</p>
            {selected.href && (
              <a
                className={s.readingLink}
                href={selected.href}
                target="_blank"
                rel="noreferrer"
              >
                Inspect the plot →
              </a>
            )}
          </div>
        </section>

        {/* ── Season record ────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="seasons-heading">
          <div className={s.sectionHead}>
            <h2 id="seasons-heading" className={s.sectionTitle}>
              Season record
            </h2>
            <span className={s.sectionNote}>
              {FIRST_YEAR}–{LAST_YEAR}
            </span>
          </div>

          <div className={s.seasons}>
            <div className={s.axis} aria-hidden="true">
              <span>{FIRST_YEAR}</span>
              <span>2014</span>
              <span>2020</span>
              <span>{LAST_YEAR}</span>
            </div>

            {roles.map((r, i) => {
              const start = r.years[0];
              const end = r.years[1] ?? LAST_YEAR;
              const left = ((start - FIRST_YEAR) / SPAN) * 100;
              const width = Math.max(((end - start) / SPAN) * 100, 2);
              const current = r.years[1] === null;

              return (
                <article key={`${r.org}-${r.title}`} className={s.season}>
                  <div
                    className={s.seasonBar}
                    aria-hidden="true"
                    title={`${r.start}–${r.end}`}
                  >
                    <span
                      className={`${s.seasonBarFill} ${
                        current ? s.seasonBarCurrent : ''
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        animationDelay: `${i * 90}ms`,
                      }}
                    />
                  </div>

                  <div className={s.seasonHead}>
                    <h3 className={s.seasonTitle}>{r.title}</h3>
                    <span className={s.seasonOrg}>{r.org}</span>
                    <span className={s.seasonYears}>
                      {r.start}–{r.end}
                    </span>
                  </div>

                  <ul className={s.seasonNotes}>
                    {r.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>

                  {r.stack && (
                    <div className={s.stack}>
                      {r.stack.map((t) => (
                        <span key={t} className={s.chip}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Field notebook (live model) ──────────────────────────── */}
        <section className={s.section} aria-labelledby="notebook-heading">
          <div className={s.sectionHead}>
            <h2 id="notebook-heading" className={s.sectionTitle}>
              Field notebook
            </h2>
            <span className={s.sectionNote}>
              {modelEnabled ? 'Live · answers from this record only' : 'Offline'}
            </span>
          </div>

          <p className={s.lede}>
            Ask the record a question. A model reads the same bulletin you just
            did and answers from it — and only from it.
          </p>

          <div className={s.notebook}>
            <form
              className={s.askRow}
              onSubmit={(e) => {
                e.preventDefault();
                void ask.ask();
              }}
            >
              <label htmlFor="bulletin-ask" className="sr-only">
                Ask a question about this record
              </label>
              <input
                id="bulletin-ask"
                className={s.askInput}
                value={ask.question}
                onChange={(e) => ask.setQuestion(e.target.value)}
                placeholder="What did he build for a real client?"
                maxLength={300}
                disabled={ask.status === 'asking'}
              />
              <button
                type="submit"
                className={s.askButton}
                disabled={ask.status === 'asking' || !ask.question.trim()}
              >
                {ask.status === 'asking' ? 'Reading' : 'Ask'}
              </button>
            </form>

            <div className={s.suggests}>
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={s.suggest}
                  onClick={() => void ask.ask(q)}
                  disabled={ask.status === 'asking'}
                >
                  {q}
                </button>
              ))}
            </div>

            {!modelEnabled && (
              <p className={s.offline}>
                The live model isn&rsquo;t connected on this deployment, so this
                panel has nothing real to answer with. It won&rsquo;t fake one —
                a canned reply dressed up as a live model is exactly the thing
                this site is about not doing.
              </p>
            )}

            {ask.asked && (
              <div className={s.entry} aria-live="polite">
                <p className={s.entryQ}>ENTRY · {ask.asked}</p>
                {ask.status === 'asking' && (
                  <span className={s.pending} aria-label="Reading the record">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
                {ask.status === 'answered' && (
                  <p className={s.entryA}>{ask.answer}</p>
                )}
                {ask.status === 'error' && (
                  <p className={s.entryError}>{ask.error}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Colophon ─────────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="colophon-heading">
          <div className={s.sectionHead}>
            <h2 id="colophon-heading" className={s.sectionTitle}>
              Method &amp; notes
            </h2>
          </div>

          <div className={s.colophon}>
            <div className={s.colophonBlock}>
              <h3>Training</h3>
              <p>
                <strong>
                  {education.degree}, {education.school}.
                </strong>{' '}
                {education.note}
              </p>
            </div>

            {skills.map((g) => (
              <div key={g.group} className={s.colophonBlock}>
                <h3>{g.group}</h3>
                <p>{g.items.join(' · ')}</p>
              </div>
            ))}

            {elsewhere.map((e) => (
              <div key={e.label} className={s.colophonBlock}>
                <h3>{e.label}</h3>
                <p>{e.detail}</p>
              </div>
            ))}
          </div>

          <div className={s.footer}>
            <a
              className={s.footerLink}
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              {identity.linkedinLabel}
            </a>
            <Link className={s.footerLink} href="/web-design/resume-sample">
              ← All four samples
            </Link>
            <p className={s.disclosure}>{disclosure}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
