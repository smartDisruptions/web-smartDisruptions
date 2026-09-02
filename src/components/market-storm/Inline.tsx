import ReactMarkdown from 'react-markdown';

/**
 * Inline markdown — bold, italic, code and links, with no block wrapper.
 *
 * Lives in its own file because two surfaces need it and a second copy is how
 * a bolded figure ends up styled one way in the body and another in the
 * takeaways.
 */
export default function Inline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => (
          <strong className="font-semibold text-text-primary">
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="rounded bg-fill px-1 py-0.5 font-mono text-[0.85em] text-accent-hover">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
