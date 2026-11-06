import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { PrintButton } from '@/components/resume/ResumeActions';
import {
  CAPABILITIES,
  CONTACT,
  EXPERIENCE,
  FEATURED,
  GALLERY,
  HOW_I_BUILD,
  LOOKING_FOR,
  SKILLS,
  resumeTotals,
  type WorkKind,
} from '@/data/resume';
import { shareMeta } from '@/lib/shareCard';
import './resume.css';

const TITLE = 'Résumé — SmartDisruptions';
const DESCRIPTION =
  'Describe it, and I’ll build it with AI and ship it. Online payments, databases, dashboards, games and brand websites, all live and open to try.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/resume' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/resume' }),
};

/**
 * Résumé (/resume) — a portfolio first, a résumé underneath (技, *waza*).
 *
 * Rebuilt 2026-11-06 after Josh read the first version (a list of 22 skill
 * names, each opening onto a long story) and said it didn't look or feel
 * like a résumé. This one answers what a hiring manager asks, in order:
 * what can you build, show me, how much range, can I trust how you build
 * with AI, and then the usual facts. The data and the reasoning are in
 * src/data/resume.ts.
 *
 * The gallery filter is radio buttons and `:has()` rules, so it works with
 * no JavaScript. The only script is the PDF button (ResumeActions). The
 * print stylesheet turns the page into a plain résumé with every link
 * written out.
 *
 * Styles: ./resume.css (rs-).
 */

const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

function Go({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

const KINDS: { id: 'all' | WorkKind; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'Website', label: 'Websites' },
  { id: 'App', label: 'Apps' },
  { id: 'Game', label: 'Games' },
];

/** Generated from KINDS, so a new kind can't be forgotten in the stylesheet. */
const FILTER_CSS = KINDS.filter((k) => k.id !== 'all')
  .map(
    (k) =>
      `.rs-page:has(#rs-f-${k.id}:checked) .rs-work[data-kind]:not([data-kind="${k.id}"]){display:none}`
  )
  .join('\n');

export default function ResumePage() {
  const totals = resumeTotals();
  const showContact = Boolean(CONTACT) || !IS_PRODUCTION;
  const count = (id: string) =>
    id === 'all' ? GALLERY.length : GALLERY.filter((w) => w.kind === id).length;

  return (
    <div className="rs-page">
      <style>{FILTER_CSS}</style>

      {/* ── Who, and the claim ────────────────────────────────────────── */}
      <header className="rs-head">
        <Kanji char="技" draw className="sd-watermark rs-mark" />
        <h1 className="rs-name font-display">Josh</h1>
        <p className="rs-role">Software builder</p>
        <p className="rs-claim font-display">
          Describe it, and I’ll build it with AI and ship it.
        </p>
        <p className="rs-lead font-read">
          Everything on this page is live, so open any of it: a food truck
          taking real card payments, a family app on a shared database, a data
          dashboard, {totals.games} playable games and the websites around them.
        </p>

        <ul role="list" className="rs-stats">
          <li>
            <strong>1</strong> business taking real payments
          </li>
          <li>
            <strong>{totals.live}</strong> apps and games live
          </li>
          <li>
            <strong>{totals.websites}</strong> websites
          </li>
        </ul>

        <div className="rs-actions">
          {CONTACT ? (
            <a href="#contact" className="rs-cta sd-btn-primary">
              Get in touch
            </a>
          ) : null}
          <a href="#work" className="rs-ghost">
            See the work
          </a>
          <PrintButton />
        </div>

        <Kiru pose="build" className="rs-kiru" />
      </header>

      {/* ── 1. What I can build ───────────────────────────────────────── */}
      <section className="rs-sec" aria-labelledby="rs-can">
        <h2 id="rs-can" className="rs-h2 font-display sd-brush-under">
          What I can build
        </h2>
        <ul role="list" className="rs-caps">
          {CAPABILITIES.map((c) => (
            <li key={c.id} className="rs-cap">
              <h3 className="rs-cap-t">{c.title}</h3>
              <p className="rs-cap-line">{c.line}</p>
              <ul role="list" className="rs-cap-proof">
                {c.proof.map((p) => (
                  <li key={p.href}>
                    <Go href={p.href} className="rs-chip">
                      {p.label} <span aria-hidden>→</span>
                    </Go>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 2. Featured work ──────────────────────────────────────────── */}
      <section id="work" className="rs-sec" aria-labelledby="rs-feat">
        <h2 id="rs-feat" className="rs-h2 font-display sd-brush-under">
          Featured work
        </h2>
        <div className="rs-feats">
          {FEATURED.map((f, i) => (
            <article
              key={f.id}
              className="rs-feat"
              aria-labelledby={`rs-f-${f.id}`}
            >
              <Go href={f.links[0].href} className="rs-feat-shot">
                <Image
                  src={f.image}
                  alt={f.imageAlt}
                  width={f.imageWidth}
                  height={f.imageHeight}
                  sizes="(min-width: 60rem) 26rem, 100vw"
                  priority={i === 0}
                />
              </Go>
              <div className="rs-feat-body">
                <p className="rs-feat-k">{f.context}</p>
                <h3 id={`rs-f-${f.id}`} className="rs-feat-t">
                  {f.title}
                </h3>
                <p className="rs-feat-problem">{f.problem}</p>
                <p className="rs-label">What I built</p>
                <ul className="rs-built">
                  {f.built.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="rs-feat-result">
                  <span className="rs-label">Result</span>
                  {f.result}
                </p>
                <ul role="list" className="rs-stack" aria-label="Built with">
                  {f.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <div className="rs-feat-links">
                  {f.links.map((l, j) => (
                    <Go
                      key={l.href}
                      href={l.href}
                      className={j === 0 ? 'rs-btn' : 'rs-link'}
                    >
                      {l.label}
                    </Go>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 3. Everything else, live ──────────────────────────────────── */}
      <section className="rs-sec" aria-labelledby="rs-more">
        <h2 id="rs-more" className="rs-h2 font-display sd-brush-under">
          More work, all live
        </h2>
        <p className="rs-sub">Click any of it. It all runs in your browser.</p>

        <fieldset className="rs-filter">
          <legend className="rs-sr">Show</legend>
          {KINDS.map((k) => (
            <span key={k.id} className="contents">
              <input
                type="radio"
                name="rs-filter"
                id={`rs-f-${k.id}`}
                value={k.id}
                defaultChecked={k.id === 'all'}
              />
              <label htmlFor={`rs-f-${k.id}`}>
                {k.label} <span className="rs-filter-n">{count(k.id)}</span>
              </label>
            </span>
          ))}
        </fieldset>

        <ul role="list" className="rs-gallery">
          {GALLERY.map((w) => (
            <li key={w.id} className="rs-work" data-kind={w.kind}>
              <Go href={w.href} className="rs-work-main">
                <span className="rs-work-shot">
                  <Image
                    src={w.image}
                    alt=""
                    width={600}
                    height={315}
                    sizes="(min-width: 64rem) 20rem, 50vw"
                  />
                </span>
                <span className="rs-work-text">
                  <span className="rs-work-kind">{w.kind}</span>
                  <span className="rs-work-name">{w.name}</span>
                  <span className="rs-work-line">{w.line}</span>
                </span>
              </Go>
              {w.more ? (
                <Link href={w.more} className="rs-work-more">
                  How it’s built<span className="rs-sr"> ({w.name})</span>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 4. How I build with AI ────────────────────────────────────── */}
      <section className="rs-sec" aria-labelledby="rs-how">
        <h2 id="rs-how" className="rs-h2 font-display sd-brush-under">
          How I build with AI
        </h2>
        <ol className="rs-how">
          {HOW_I_BUILD.map((h, i) => (
            <li key={h.title}>
              <span className="rs-how-n" aria-hidden>
                {i + 1}
              </span>
              <span className="rs-how-t">{h.title}</span>
              <span className="rs-how-line">
                {h.line}
                {h.proof ? (
                  <>
                    {' '}
                    <Go href={h.proof.href} className="rs-inline">
                      {h.proof.label}
                    </Go>
                  </>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 5. The résumé ─────────────────────────────────────────────── */}
      <section className="rs-sec rs-cv" aria-labelledby="rs-exp">
        <div>
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
                <ul className="rs-exp-points">
                  {x.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 id="rs-skills" className="rs-h2 font-display sd-brush-under">
            Skills
          </h2>
          <dl className="rs-skills">
            {SKILLS.map((g) => (
              <div key={g.group}>
                <dt>{g.group}</dt>
                <dd>
                  <ul role="list" className="rs-stack">
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
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
