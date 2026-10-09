import type { ReactNode } from 'react';
import Kanji from '@/components/brand/Kanji';
import { LABELS, type Rich as RichText } from './content';
import Term from './term';

/*
 * The article's shared building blocks. Server components only: nothing in
 * this file ships JavaScript. Every section is built from these so the page
 * reads as one piece, whichever hand drew which chapter.
 */

const TOKEN =
  /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\^\[[\d,]+\]|\{(?:unv|ok|fix):[^}]+\}|\[\[[^\]]+\]\])/g;

/**
 * Inline markup from content.ts → React. See the header of content.ts for
 * the grammar. Never retype copy in a component: pass the string here.
 */
export function Rich({ text }: { text: RichText }) {
  const parts = text.split(TOKEN).filter((p) => p !== '');
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          // Bold may carry its own marks (a citation, a glossary term).
          return (
            <strong key={i}>
              <Rich text={p.slice(2, -2)} />
            </strong>
          );
        }
        if (p.startsWith('^[')) {
          return <Cite key={i} n={p.slice(2, -1).split(',').map(Number)} />;
        }
        if (p.startsWith('{') && p.endsWith('}')) {
          const [kind, ...rest] = p.slice(1, -1).split(':');
          return (
            <Flag key={i} kind={kind as 'unv' | 'ok' | 'fix'}>
              {rest.join(':')}
            </Flag>
          );
        }
        if (p.startsWith('[[') && p.endsWith(']]')) {
          // [[shown words|Glossary term]] or [[Glossary term]]
          const [shown, term] = p.slice(2, -2).split('|');
          return (
            <Term key={i} term={term ?? shown}>
              {shown}
            </Term>
          );
        }
        if (p.length > 2 && p.startsWith('*') && p.endsWith('*')) {
          return <em key={i}>{p.slice(1, -1)}</em>;
        }
        return p;
      })}
    </>
  );
}

/** Citation numbers, linking down to the numbered source list. */
export function Cite({ n }: { n: number[] }) {
  return (
    <sup className="re-cite">
      {n.map((x, i) => (
        <a
          key={x}
          href={`#src-${x}`}
          aria-label={`Source ${x}`}
          className="re-cite-a"
        >
          {i > 0 ? ' ' : ''}
          {x}
        </a>
      ))}
    </sup>
  );
}

/** A small status flag: ok (green), unv (amber, unconfirmed), fix (red). */
export function Flag({
  kind,
  children,
}: {
  kind: 'ok' | 'unv' | 'fix';
  children: ReactNode;
}) {
  return <span className={`re-flag is-${kind}`}>{children}</span>;
}

/**
 * A numbered chapter. The header (number, kanji, eyebrow, title) is fixed so
 * every chapter opens the same way; the body is whatever the chapter needs.
 */
export function Chapter({
  chapter,
  glyph,
  className,
  children,
}: {
  chapter: { id: string; n: number; eyebrow: string; title: string };
  glyph?: string;
  className?: string;
  children: ReactNode;
}) {
  const { id, n, eyebrow, title } = chapter;
  return (
    <section
      id={id}
      className={`re-ch${className ? ` ${className}` : ''}`}
      aria-labelledby={`${id}-t`}
      data-chapter={n}
    >
      <header className="re-ch-head">
        <span className="re-ch-n" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
        {glyph && (
          <span className="re-ch-glyph" aria-hidden="true">
            <Kanji char={glyph} className="h-full w-full" />
          </span>
        )}
        <p className="sd-kicker re-ch-kick">{eyebrow}</p>
        <h2 id={`${id}-t`} className="font-display re-ch-title">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

/** "Short version": the chapter's verdict, one strip. */
export function Verdict({ text }: { text: RichText }) {
  return (
    <div className="re-verdict sd-reveal">
      <p className="re-verdict-k">{LABELS.shortVersion}</p>
      <p className="font-read re-verdict-t">
        <Rich text={text} />
      </p>
    </div>
  );
}

/** "What we found": the chapter's findings. */
export function Findings({
  items,
  label = LABELS.whatWeFound,
}: {
  items: RichText[];
  label?: string;
}) {
  return (
    <div className="re-found">
      <p className="re-found-k">{label}</p>
      <ul className="font-read re-found-list" role="list">
        {items.map((t, i) => (
          <li key={i} className="sd-reveal">
            <Rich text={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Why it matters:" — the chapter's last word. */
export function Why({ text }: { text: RichText }) {
  return (
    <p className="font-read re-why sd-reveal">
      <strong>{LABELS.whyItMatters}</strong> <Rich text={text} />
    </p>
  );
}

/** A figure on its own card: title, a line under it, the picture, the source. */
export function Fig({
  title,
  sub,
  source,
  children,
  className,
  id,
}: {
  title: RichText;
  sub?: RichText;
  source?: RichText;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <figure id={id} className={`re-fig sd-reveal${className ? ` ${className}` : ''}`}>
      <h3 className="re-fig-title">
        <Rich text={title} />
      </h3>
      {sub && (
        <p className="re-fig-sub">
          <Rich text={sub} />
        </p>
      )}
      <div className="re-fig-body">{children}</div>
      {source && (
        <figcaption className="re-fig-src">
          <Rich text={source} />
        </figcaption>
      )}
    </figure>
  );
}

/** A plain data table. Cells may be strings (Rich) or nodes. */
export function Table({
  head,
  rows,
  numeric = [],
  caption,
}: {
  head: readonly string[];
  rows: ReactNode[][];
  numeric?: number[];
  caption?: string;
}) {
  return (
    <div className="re-tbl-wrap">
      <table className="re-tbl">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className={numeric.includes(i) ? 'is-num' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} className={numeric.includes(ci) ? 'is-num' : undefined}>
                  {typeof c === 'string' ? <Rich text={c} /> : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "Show as a table": the numbers behind a chart, one click away. */
export function TableDetails({
  summary = LABELS.showTable,
  ...table
}: {
  summary?: string;
  head: readonly string[];
  rows: ReactNode[][];
  numeric?: number[];
  caption?: string;
}) {
  return (
    <details className="re-details">
      <summary>{summary}</summary>
      <Table {...table} />
    </details>
  );
}
