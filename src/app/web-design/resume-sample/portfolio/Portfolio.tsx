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
import s from './portfolio.module.css';

/** Scroll-triggered reveal — the convention, done so it never hides content. */
function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer to lean on: reveal on the next tick rather than leaving the
    // section stuck at opacity 0. Deferred so it isn't a synchronous setState
    // inside the effect body. `prefers-reduced-motion` needs no branch here —
    // the stylesheet already forces .reveal fully visible under it.
    if (typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setShown(true));
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${s.reveal} ${shown ? s.revealed : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default function Portfolio({
  modelEnabled,
}: {
  modelEnabled: boolean;
}) {
  const ask = useResumeAsk(modelEnabled);

  return (
    <div className={s.world}>
      <div className={s.shell}>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <header className={s.hero}>
          <p className={s.available}>
            <span className={s.dot} aria-hidden="true" />
            Building with AI, in public
          </p>

          <h1 className={s.name}>{identity.name}</h1>
          <p className={s.roleLine}>{identity.role}</p>
          <p className={s.summary}>{identity.summary}</p>

          <div className={s.heroActions}>
            <a
              className={s.buttonPrimary}
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              Get in touch
            </a>
            <a className={s.buttonGhost} href="#work">
              See the work
            </a>
          </div>
        </header>

        {/* ── Experience ───────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="experience-heading">
          <Reveal>
            <h2 id="experience-heading" className={s.sectionTitle}>
              Experience
            </h2>
            <p className={s.sectionLede}>
              Eighteen years, newest first — from freelance web work through
              design and communications into enterprise engineering.
            </p>
          </Reveal>

          <div className={s.timeline}>
            {roles.map((r) => (
              <Reveal key={`${r.org}-${r.title}`}>
                <article className={s.entry}>
                  <span
                    className={`${s.entryDot} ${
                      r.years[1] === null ? s.entryDotCurrent : ''
                    }`}
                    aria-hidden="true"
                  />
                  <p className={s.entryYears}>
                    {r.start} — {r.end}
                  </p>
                  <h3 className={s.entryTitle}>{r.title}</h3>
                  <p className={s.entryOrg}>{r.org}</p>

                  <ul className={s.entryNotes}>
                    {r.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>

                  {r.stack && (
                    <div className={s.tags}>
                      {r.stack.map((t) => (
                        <span key={t} className={s.tag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Work ─────────────────────────────────────────────────── */}
        <section className={s.section} id="work" aria-labelledby="work-heading">
          <Reveal>
            <h2 id="work-heading" className={s.sectionTitle}>
              Selected work
            </h2>
            <p className={s.sectionLede}>
              Each of these shipped. Where there is a live URL, it is linked.
            </p>
          </Reveal>

          <div className={s.grid}>
            {projects.map((p) => (
              <Reveal key={p.name}>
                <article className={s.card}>
                  <span className={s.cardKind}>{p.kind}</span>
                  <h3 className={s.cardName}>
                    {p.href ? (
                      <a href={p.href} target="_blank" rel="noreferrer">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </h3>
                  <p className={s.cardResult}>{p.result}</p>
                  <p className={s.cardDetail}>{p.detail}</p>
                  {p.href && (
                    <a
                      className={s.cardLink}
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit site →
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Skills ───────────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="skills-heading">
          <Reveal>
            <h2 id="skills-heading" className={s.sectionTitle}>
              Skills &amp; background
            </h2>
            <p className={s.sectionLede}>
              {education.degree}, {education.school}. {education.note}
            </p>
          </Reveal>

          <Reveal>
            <div className={s.skillGrid}>
              {skills.map((g) => (
                <div key={g.group} className={s.skillGroup}>
                  <h3>{g.group}</h3>
                  <div className={s.skillItems}>
                    {g.items.map((i) => (
                      <span key={i} className={s.tag}>
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {elsewhere.map((e) => (
                <div key={e.label} className={s.skillGroup}>
                  <h3>{e.label}</h3>
                  <p className={s.cardDetail} style={{ marginTop: 0 }}>
                    {e.detail}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Ask ──────────────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="ask-heading">
          <Reveal>
            <h2 id="ask-heading" className={s.sectionTitle}>
              Ask about my background
            </h2>
            <p className={s.sectionLede}>
              A model reads this résumé and answers from it — and only from it.
              If something isn&rsquo;t on the page, it will tell you so rather
              than guess.
            </p>
          </Reveal>

          <Reveal>
            <div className={s.ask}>
              <form
                className={s.askRow}
                onSubmit={(e) => {
                  e.preventDefault();
                  void ask.ask();
                }}
              >
                <label htmlFor="portfolio-ask" className="sr-only">
                  Ask a question about this résumé
                </label>
                <input
                  id="portfolio-ask"
                  className={s.askInput}
                  value={ask.question}
                  onChange={(e) => ask.setQuestion(e.target.value)}
                  placeholder="Ask anything about my experience…"
                  maxLength={300}
                  disabled={ask.status === 'asking'}
                />
                <button
                  type="submit"
                  className={s.askButton}
                  disabled={ask.status === 'asking' || !ask.question.trim()}
                >
                  {ask.status === 'asking' ? 'Thinking…' : 'Ask'}
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
                  The live model isn&rsquo;t connected on this deployment, so
                  this panel has nothing real to answer with — and it
                  won&rsquo;t fake one.
                </p>
              )}

              {ask.asked && (
                <div className={s.thread} aria-live="polite">
                  <p className={s.threadQ}>{ask.asked}</p>
                  {ask.status === 'asking' && (
                    <span className={s.typing} aria-label="Thinking">
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                  {ask.status === 'answered' && (
                    <p className={s.threadA}>{ask.answer}</p>
                  )}
                  {ask.status === 'error' && (
                    <p className={s.threadError}>{ask.error}</p>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </section>

        <footer className={s.footer}>
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
        </footer>
      </div>
    </div>
  );
}
