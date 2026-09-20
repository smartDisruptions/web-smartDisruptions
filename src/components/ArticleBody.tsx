import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

// Shared long-form renderer for article/report bodies. Extends the original
// content-post markdown map with GFM support (tables, strikethrough) and a few
// block elements the Market Storm reports use — blockquote callouts, tables,
// horizontal rules — all styled through the --sd-* tokens so both themes and
// the design auditor stay happy. Used by /content and /market-storm.
const components: Components = {
  h2: ({ children }) => (
    <h2 className="font-display nb-underline mb-5 mt-14 text-[2rem] text-text-primary sm:text-[2.35rem]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-9 text-lg font-semibold text-text-primary">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-7 text-base font-semibold text-text-primary">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="font-read mb-5 text-[1.0625rem] leading-[1.8] text-text-primary/90 sm:text-lg sm:leading-8">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="font-read mb-5 ml-5 list-disc space-y-2 text-[1.0625rem] text-text-primary/90 marker:text-[var(--sd-pen)] sm:text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="font-read mb-5 ml-5 list-decimal space-y-3 text-[1.0625rem] text-text-primary/90 marker:font-bold marker:text-[var(--sd-pen-ink)] sm:text-lg">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-8">{children}</li>,
  strong: ({ children }) => (
    // Bold is the highlighter. Posts bold the one line worth keeping, which
    // is exactly what a highlighter is for.
    <strong className="nb-hl font-bold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-text-primary/90">{children}</em>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-text-primary">
      {children}
    </code>
  ),
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="text-accent underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    );
  },
  // A quote is an index card clipped into the page — ruled margin, reading
  // face. Not a sticky note: quotes here run to sixty words (Josh's own
  // prompts, a report's caveats), and that much handwriting is unreadable.
  blockquote: ({ children }) => (
    <blockquote className="nb-index-card my-8 py-4 pr-5 pl-11 [&>p]:mb-0 [&>p+p]:mt-3">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-t border-border" />,
  // GFM tables — wrapped so a wide table scrolls inside its own box and the
  // page body never scrolls sideways. Numbers get tabular figures. No frame
  // border (a bordered wrapper reads as "cramped" when the table sits flush);
  // the header tint + row rules define the table instead.
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-xl">
      <table className="w-full border-collapse text-left text-sm [font-variant-numeric:tabular-nums]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-elevated">{children}</thead>
  ),
  th: ({ children, style }) => (
    <th
      scope="col"
      style={style}
      className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary"
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      style={style}
      className="border-b border-border px-4 py-3 align-top text-text-primary/85"
    >
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
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
