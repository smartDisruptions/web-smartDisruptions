import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import './writing/article.css';

// Shared long-form renderer for article/report bodies. Extends the original
// content-post markdown map with GFM support (tables, strikethrough) and a few
// block elements the Market Storm reports use — blockquote callouts, tables,
// horizontal rules — all styled through the --sd-* tokens so both themes and
// the design auditor stay happy. Used by /content and /market-storm.
//
// The look lives in components/writing/article.css (prefix wr-), in the
// `components` cascade layer, so a caller's utility classes still override it.
const components: Components = {
  h2: ({ children }) => (
    <h2 className="wr-h2 font-display sd-brush-under">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="wr-h3">{children}</h3>,
  h4: ({ children }) => <h4 className="wr-h4">{children}</h4>,
  p: ({ children }) => <p className="wr-p">{children}</p>,
  ul: ({ children }) => <ul className="wr-ul">{children}</ul>,
  ol: ({ children, start }) => (
    <ol className="wr-ol" start={start}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="wr-li">{children}</li>,
  strong: ({ children }) => (
    // Bold is the highlighter. Posts bold the one line worth keeping, which
    // is exactly what a highlighter is for.
    <strong className="wr-strong sd-hl">{children}</strong>
  ),
  em: ({ children }) => <em className="wr-em">{children}</em>,
  // Inline code. Inside a fenced block the same element is restyled by
  // `.wr-pre .wr-code`, so a code block never wears the inline chip.
  code: ({ children, className }) => (
    <code className={`wr-code ${className ?? ''}`.trim()}>{children}</code>
  ),
  pre: ({ children }) => <pre className="wr-pre">{children}</pre>,
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="wr-a"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, title }) =>
    typeof src === 'string' ? (
      <img
        src={src}
        alt={alt ?? ''}
        title={title}
        loading="lazy"
        decoding="async"
        className="wr-img"
      />
    ) : null,
  // A quote is an ink card held between vermilion corner brackets, 「 」.
  // Quotes here run to sixty words (Josh's own prompts, a report's caveats),
  // so they stay in the reading face, not a display or handwritten one.
  blockquote: ({ children }) => (
    <blockquote className="wr-quote">{children}</blockquote>
  ),
  hr: () => <hr className="wr-hr" />,
  // GFM tables — wrapped so a wide table scrolls inside its own box and the
  // page body never scrolls sideways. Numbers get tabular figures. No frame
  // border (a bordered wrapper reads as "cramped" when the table sits flush);
  // the header tint + row rules define the table instead.
  table: ({ children }) => (
    <div className="wr-table-wrap">
      <table className="wr-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="wr-thead">{children}</thead>,
  th: ({ children, style }) => (
    <th scope="col" style={style} className="wr-th">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="wr-td">
      {children}
    </td>
  ),
};

export default function ArticleBody({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`wr-prose ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
