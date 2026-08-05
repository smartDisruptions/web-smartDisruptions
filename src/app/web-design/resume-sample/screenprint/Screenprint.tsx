'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import s from './screenprint.module.css';

/** Registration cross, drawn rather than pictured. */
function RegMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <circle cx="13" cy="13" r="7" />
      <path d="M13 0v26M0 13h26" />
    </svg>
  );
}

const PASS_INK = [s.passCardCyan, s.passCardAmber, s.passCardScarlet, s.passCardInk];
const PASS_COLOR = ['var(--cyan)', 'var(--amber)', 'var(--scarlet)', 'var(--ink-dim)'];

export default function Screenprint({
  modelEnabled,
}: {
  modelEnabled: boolean;
}) {
  // Starts slightly out of true, not at 0. In perfect register the colour
  // passes hide exactly behind the key and the first viewport shows a plain
  // black wordmark — the mechanism has to be visible on arrival, not only
  // after someone finds the slider.
  const [drift, setDrift] = useState(7);
  const ask = useResumeAsk(modelEnabled);

  // Offsets are in `em`, not px: the wordmark ranges from 48px to 144px, and a
  // fixed pixel misregistration that reads as a delicate ghost on desktop
  // reads as mud on a phone. In em it stays the same misprint at every width.
  const offset = (i: number) => ({
    transform: `translate(${(drift * i * 0.006).toFixed(4)}em, ${(
      drift *
      i *
      0.0034
    ).toFixed(4)}em)`,
  });

  return (
    <div className={s.world}>
      <div className={s.shell}>
        <RegMark className={`${s.regMark} ${s.regTL}`} />
        <RegMark className={`${s.regMark} ${s.regTR}`} />

        {/* ── Masthead ─────────────────────────────────────────────── */}
        <header className={s.masthead}>
          <div className={s.runLine}>
            <span>Four-colour run</span>
            <span>Edition of one</span>
            <span>The Palouse</span>
          </div>

          <div className={s.pressBed}>
            <h1
              className={`${s.pass} ${s.passStacked} ${s.passCyan}`}
              style={offset(3)}
              aria-hidden="true"
            >
              {identity.name}
            </h1>
            <p
              className={`${s.pass} ${s.passStacked} ${s.passAmber}`}
              style={offset(2)}
              aria-hidden="true"
            >
              {identity.name}
            </p>
            <p
              className={`${s.pass} ${s.passStacked} ${s.passScarlet}`}
              style={offset(1)}
              aria-hidden="true"
            >
              {identity.name}
            </p>
            {/* The readable pass. The three above are the ink; this is the key. */}
            <p className={s.pass} style={{ color: 'var(--ink)' }}>
              {identity.name}
            </p>
          </div>

          <p className={s.role}>{identity.role}</p>

          <p className={s.standfirst}>
            Three roles at one university, pulled one pass at a time over
            eighteen years. Where they overlap is the person. Pull them out of
            register and you can see each one on its own.
          </p>

          <div className={s.press}>
            <label className={s.pressLabel} htmlFor="registration">
              Registration
            </label>
            <p className={s.pressHint}>
              Drag to take the passes out of true. This is the misprint every
              screenprinter is trying to avoid — and the only way to see what
              each layer was carrying.
            </p>
            <input
              id="registration"
              className={s.slider}
              type="range"
              min={0}
              max={24}
              step={1}
              value={drift}
              onChange={(e) => setDrift(Number(e.target.value))}
            />
            <p className={s.pressReadout}>
              {drift === 0
                ? 'In register — one image'
                : `Out by ${drift}px — ghosting on every pass`}
            </p>
          </div>
        </header>

        {/* ── The passes ───────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="passes-heading">
          <h2 id="passes-heading" className={s.sectionTitle}>
            The passes
          </h2>
          <p className={s.lede}>
            Each role is one colour laid over the last. Read top to bottom and
            you are watching a designer become an engineer without ever leaving
            the building.
          </p>

          <div className={s.passList}>
            {roles.map((r, i) => (
              <article
                key={`${r.org}-${r.title}`}
                className={`${s.passCard} ${PASS_INK[i % PASS_INK.length]}`}
              >
                <div className={s.passHead}>
                  <span
                    className={s.passNo}
                    style={{ color: PASS_COLOR[i % PASS_COLOR.length] }}
                  >
                    Pass {i + 1} of {roles.length}
                  </span>
                  <span className={s.passYears}>
                    {r.start}–{r.end}
                  </span>
                  <h3 className={s.passTitle}>{r.title}</h3>
                </div>
                <p className={s.passOrg}>{r.org}</p>

                <ul className={s.passNotes}>
                  {r.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>

                {r.stack && (
                  <div className={s.chips}>
                    {r.stack.map((t) => (
                      <span key={t} className={s.chip}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── The run ──────────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="run-heading">
          <h2 id="run-heading" className={s.sectionTitle}>
            The run
          </h2>
          <p className={s.lede}>
            Things that came off the press and went out the door. Each one has a
            link, a commit, or a client who used it.
          </p>

          <div className={s.run}>
            {projects.map((p) => (
              <article key={p.name} className={s.runItem}>
                <div>
                  <h3 className={s.runName}>
                    {p.href ? (
                      <a href={p.href} target="_blank" rel="noreferrer">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </h3>
                  <p className={s.runKind}>{p.kind}</p>
                </div>
                <div>
                  <p className={s.runResult}>{p.result}</p>
                  <p className={s.runDetail}>{p.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Proof pull (live model) ──────────────────────────────── */}
        <section className={s.section} aria-labelledby="proof-heading">
          <h2 id="proof-heading" className={s.sectionTitle}>
            Pull a proof
          </h2>
          <p className={s.lede}>
            A proof is the test print you pull before committing the run. Ask
            this one a question — a model reads the record above and answers
            from it, and nothing else.{' '}
            {modelEnabled ? '' : 'Not connected on this deployment.'}
          </p>

          <div className={s.proof}>
            <form
              className={s.askRow}
              onSubmit={(e) => {
                e.preventDefault();
                void ask.ask();
              }}
            >
              <label htmlFor="print-ask" className="sr-only">
                Ask a question about this record
              </label>
              <input
                id="print-ask"
                className={s.askInput}
                value={ask.question}
                onChange={(e) => ask.setQuestion(e.target.value)}
                placeholder="What did he replace at the university?"
                maxLength={300}
                disabled={ask.status === 'asking'}
              />
              <button
                type="submit"
                className={s.askButton}
                disabled={ask.status === 'asking' || !ask.question.trim()}
              >
                {ask.status === 'asking' ? 'Pulling' : 'Pull'}
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
                The live model isn&rsquo;t connected here, so there is no real
                answer to pull. It won&rsquo;t print a fake one.
              </p>
            )}

            {ask.asked && (
              <div className={s.pulled} aria-live="polite">
                <p className={s.pulledQ}>Proof — {ask.asked}</p>
                {ask.status === 'asking' && (
                  <span className={s.wet} aria-label="Pulling the proof">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
                {ask.status === 'answered' && (
                  <p className={s.pulledA}>{ask.answer}</p>
                )}
                {ask.status === 'error' && (
                  <p className={s.pulledError}>{ask.error}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Colophon ─────────────────────────────────────────────── */}
        <section className={s.section} aria-labelledby="colophon-heading">
          <h2 id="colophon-heading" className={s.sectionTitle}>
            Colophon
          </h2>

          <div className={s.colophon}>
            <div className={s.colBlock}>
              <h3>Training</h3>
              <p>
                <strong>
                  {education.degree}, {education.school}.
                </strong>{' '}
                {education.note}
              </p>
            </div>

            {skills.map((g) => (
              <div key={g.group} className={s.colBlock}>
                <h3>{g.group}</h3>
                <p>{g.items.join(' · ')}</p>
              </div>
            ))}

            {elsewhere.map((e) => (
              <div key={e.label} className={s.colBlock}>
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
