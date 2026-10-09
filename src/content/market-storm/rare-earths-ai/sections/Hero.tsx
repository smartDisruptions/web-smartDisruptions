import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import { CHAPTERS, HERO } from '../content';
import { Rich } from '../ui';

/** STUB — owned by the hero builder. The opening: title, elements, the short answer, contents. */
export default function Hero() {
  return (
    <>
      <header className="re-wrap" style={{ paddingTop: '1.5rem' }}>
        <Link href="/market-storm">← Market Storm</Link>
        <p className="sd-kicker">{HERO.eyebrow}</p>
        <h1 id="re-title" className="font-display">
          {HERO.title}
        </h1>
        <ul aria-label={HERO.elementsLabel}>
          {HERO.elements.map((e) => (
            <li key={e.sym}>
              {e.z} {e.sym} {e.name}
              {e.heavy ? ' (heavy)' : ''}
            </li>
          ))}
        </ul>
        <p>{HERO.elNote}</p>
        <p className="font-read">{HERO.lede}</p>
        <ul>
          {HERO.readout.map((r) => (
            <li key={r.k}>
              <strong>{r.k}</strong> {r.v}
            </li>
          ))}
        </ul>
        <div aria-hidden="true" style={{ width: 140 }}>
          <Kiru pose="storm" />
        </div>
      </header>
      <section className="re-wrap" aria-labelledby="re-answer-t">
        <h2 id="re-answer-t">{HERO.answer.title}</h2>
        {HERO.answer.picks.map((p) => (
          <div key={p.name}>
            <p>{p.role}</p>
            <h3>{p.name}</h3>
            <p>
              <Rich text={p.text} />
            </p>
          </div>
        ))}
        <p>{HERO.answer.disclaimer}</p>
      </section>
      <nav className="re-wrap" aria-label={HERO.contentsLabel}>
        <p className="sd-kicker">{HERO.contentsLabel}</p>
        <ol>
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`}>{c.toc}</a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
