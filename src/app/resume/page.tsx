import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import {
  CopyLensLink,
  LensSync,
  PrintButton,
} from '@/components/resume/ResumeActions';
import { evidenceFor, skillGroups, type ResolvedEvidence } from '@/data/skills';
import {
  CASE_STUDIES,
  CONTACT,
  EXPERIENCE,
  LENSES,
  LOOKING_FOR,
  LOOP,
  lensesFor,
  resumeTotals,
} from '@/data/resume';
import { shareMeta } from '@/lib/shareCard';
import './resume.css';

const TITLE = 'Résumé — SmartDisruptions';
const DESCRIPTION =
  'A software builder who directs AI to do the building. Every skill on this page links to something running that shows it.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/resume' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/resume' }),
};

/**
 * Résumé (/resume) — for someone deciding whether to hire me (技, *waza*,
 * technique).
 *
 * Built in November 2026 on the skills list /about-me used to carry
 * (src/data/skills.ts), which kept its rule: a skill is only here if there's
 * something a stranger can open that shows it. This page adds a "hiring
 * for…" lens, four case studies with the call I made in each, and a PDF.
 *
 * The lens is radio buttons filtered by CSS `:has()`, so it works with no
 * JavaScript. ResumeActions adds the URL sync (/resume?for=ai), so a link
 * can be sent already narrowed to one job, and the print button.
 *
 * Contact and what I'm looking for are `null` in src/data/resume.ts until
 * Josh fills them in. Until then previews show a note and production leaves
 * the section off.
 *
 * Styles: ./resume.css (rs-).
 */

const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

const KIND: Record<ResolvedEvidence['kind'], string> = {
  app: 'App',
  game: 'Game',
  article: 'Article',
  site: 'Live',
  code: 'Code',
};

function EvidenceLink({ e }: { e: ResolvedEvidence }) {
  const body = (
    <>
      <span className="rs-kind">{KIND[e.kind]}</span>
      <span className="rs-ev-label">{e.label}</span>
      {e.detail ? <span className="rs-ev-detail">{e.detail}</span> : null}
    </>
  );
  return e.internal ? (
    <Link href={e.href} className="rs-ev">
      {body}
    </Link>
  ) : (
    <a
      href={e.href}
      className="rs-ev"
      target="_blank"
      rel="noopener noreferrer"
    >
      {body}
    </a>
  );
}

/**
 * The lens rules, generated from LENSES so a new lens can't be forgotten in
 * the stylesheet: when a lens is checked, anything tagged with lenses that
 * don't include it is hidden, and that lens's pitch and count show.
 */
const LENS_CSS = LENSES.map(
  (
    l
  ) => `.rs-page:has(#rs-lens-${l.id}:checked) [data-lens]:not([data-lens~="${l.id}"]){display:none}
.rs-page:has(#rs-lens-${l.id}:checked) [data-for="${l.id}"]{display:block}
.rs-page:has(#rs-lens-${l.id}:checked) [data-for="all"]{display:none}`
).join('\n');

export default function ResumePage() {
  const totals = resumeTotals();
  const showContact = Boolean(CONTACT) || !IS_PRODUCTION;

  return (
    <div className="rs-page">
      <style>{LENS_CSS}</style>
      <LensSync />

      {/* ── The top: who, what, the numbers ───────────────────────────── */}
      <header className="rs-head">
        <Kanji char="技" draw className="sd-watermark rs-mark" />
        <h1 className="rs-name font-display">Josh</h1>
        <p className="rs-role">
          Software builder. I direct AI to build it, and I decide what ships.
        </p>
        <p className="rs-lead font-read">
          By day I’m a software engineer at a university. After hours I’ve put{' '}
          {totals.things} websites, apps and games online, almost all of them
          built by directing Claude: I write the spec, run the agents, check
          what comes back against the real thing, and decide what goes live.
          Every claim on this page links to something you can open.
        </p>

        <ul role="list" className="rs-stats">
          <li>
            <strong>{totals.things}</strong> things online
          </li>
          <li>
            <strong>{totals.games}</strong> games in the Arcade
          </li>
          <li>
            <strong>{totals.skills}</strong> skills, each with receipts
          </li>
        </ul>

        <div className="rs-actions">
          {CONTACT ? (
            <a href="#contact" className="rs-cta sd-btn-primary">
              Get in touch
            </a>
          ) : null}
          <a href="#skills" className="rs-ghost">
            See the skills
          </a>
          <PrintButton />
        </div>

        <Kiru pose="build" className="rs-kiru" />
      </header>

      {/* ── How I actually build ──────────────────────────────────────── */}
      <section className="rs-sec" aria-labelledby="rs-how">
        <h2 id="rs-how" className="rs-h2 font-display sd-brush-under">
          How I actually build
        </h2>
        <div className="rs-prose font-read">
          <p>
            Claude writes most of my code. I write the spec, direct the agents,
            read every change, test it against the live thing and decide what
            ships. I own the result, bugs included.
          </p>
          <p>
            If you need algorithms written from memory on a whiteboard, that
            isn’t me. If you need a messy problem taken to a shipped, tested
            product, the rest of this page is what that looks like.
          </p>
        </div>
        <ol className="rs-loop">
          {LOOP.map((s, i) => (
            <li key={s.step}>
              <span className="rs-loop-n" aria-hidden>
                {i + 1}
              </span>
              <span className="rs-loop-step">{s.step}</span>
              <span className="rs-loop-line">{s.line}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Selected work ─────────────────────────────────────────────── */}
      <section className="rs-sec" aria-labelledby="rs-work">
        <h2 id="rs-work" className="rs-h2 font-display sd-brush-under">
          Selected work
        </h2>
        <ul role="list" className="rs-cases">
          {CASE_STUDIES.map((c) => (
            <li key={c.id} className="rs-case">
              <p className="rs-case-k">{c.kicker}</p>
              <h3 className="rs-case-t">{c.title}</h3>
              <p className="rs-case-what">{c.what}</p>
              <p className="rs-case-call">
                <span className="rs-case-call-k">My call</span>
                {c.call}
              </p>
              <ul role="list" className="rs-evs">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <EvidenceLink
                      e={{ ...l, internal: l.href.startsWith('/') }}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Skills, with receipts, through a lens ─────────────────────── */}
      <section id="skills" className="rs-sec" aria-labelledby="rs-skills">
        <h2 id="rs-skills" className="rs-h2 font-display sd-brush-under">
          Skills, with receipts
        </h2>

        <fieldset className="rs-lens">
          <legend className="rs-lens-legend">Hiring for</legend>
          <div className="rs-lens-opts">
            <input
              type="radio"
              name="rs-lens"
              id="rs-lens-all"
              value="all"
              defaultChecked
            />
            <label htmlFor="rs-lens-all">Everything</label>
            {LENSES.map((l) => (
              <span key={l.id} className="contents">
                <input
                  type="radio"
                  name="rs-lens"
                  id={`rs-lens-${l.id}`}
                  value={l.id}
                />
                <label htmlFor={`rs-lens-${l.id}`}>{l.name}</label>
              </span>
            ))}
          </div>
        </fieldset>

        <div className="rs-lens-note">
          <p className="rs-pitch" data-for="all">
            Every skill I can back with something running. Pick the job you’re
            hiring for to narrow it.
          </p>
          {LENSES.map((l) => (
            <p key={l.id} className="rs-pitch rs-pitch-l" data-for={l.id}>
              {l.pitch}{' '}
              <span className="rs-count">{l.skills.length} skills.</span>
            </p>
          ))}
          <CopyLensLink />
        </div>

        {skillGroups.map((g) => {
          const groupLenses = Array.from(
            new Set(g.skills.flatMap((s) => lensesFor(s.id)))
          );
          return (
            <div
              key={g.id}
              className="rs-group"
              data-lens={groupLenses.join(' ')}
            >
              <h3 className="rs-group-h">{g.name}</h3>
              <ul role="list" className="rs-skills">
                {g.skills.map((s) => {
                  const ev = evidenceFor(s);
                  return (
                    <li key={s.id} data-lens={lensesFor(s.id).join(' ')}>
                      <details className="rs-skill">
                        <summary>
                          <span className="rs-skill-name">{s.name}</span>
                          <span className="rs-skill-plain">{s.plain}</span>
                          <span className="rs-skill-n">
                            {ev.length}{' '}
                            {ev.length === 1 ? 'receipt' : 'receipts'}
                          </span>
                        </summary>
                        <div className="rs-skill-body">
                          <p className="font-read">{s.used}</p>
                          <ul role="list" className="rs-evs">
                            {ev.map((e) => (
                              <li key={e.href}>
                                <EvidenceLink e={e} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ── Experience ────────────────────────────────────────────────── */}
      <section className="rs-sec" aria-labelledby="rs-exp">
        <h2 id="rs-exp" className="rs-h2 font-display sd-brush-under">
          Experience
        </h2>
        <ol className="rs-exp">
          {EXPERIENCE.map((x) => (
            <li key={x.when + x.role}>
              <span className="rs-exp-when">{x.when}</span>
              <span className="rs-exp-role">
                {x.role}
                {x.where ? (
                  <span className="rs-exp-where"> · {x.where}</span>
                ) : null}
              </span>
              <span className="rs-exp-line">{x.line}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      {showContact ? (
        <section
          id="contact"
          className="rs-sec rs-contact"
          aria-labelledby="rs-talk"
        >
          <h2 id="rs-talk" className="rs-h2 font-display sd-brush-under">
            Let’s talk
          </h2>
          {LOOKING_FOR ? <p className="font-read">{LOOKING_FOR}</p> : null}
          {CONTACT ? (
            <a href={CONTACT.href} className="rs-cta sd-btn-primary">
              {CONTACT.label}
            </a>
          ) : (
            <p className="rs-slot">
              Preview only: how to reach Josh and what he’s looking for go here.
              Set <code>CONTACT</code> and <code>LOOKING_FOR</code> in{' '}
              <code>src/data/resume.ts</code>. Production leaves this section
              off until they’re set.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
