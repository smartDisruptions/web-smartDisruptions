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
    <h2 className="font-display mb-4 mt-12 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
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
    <p className="mb-5 text-lg leading-8 text-text-primary/85">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 ml-5 list-disc space-y-2 text-lg text-text-primary/85">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 ml-5 list-decimal space-y-3 text-lg text-text-primary/85">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-8">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-text-primary/90">{children}</em>
  ),
  code: ({ children }) => (
    <code className="rounded bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-accent-hover">
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
  blockquote: ({ children }) => (
    <blockquote className="my-7 rounded-lg bg-fill px-5 py-4 text-lg text-text-primary/90 [&>p]:mb-0">
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
