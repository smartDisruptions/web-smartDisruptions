import type { ReactNode } from 'react';
import { S12 } from './content';

/**
 * A glossary word in running text. Placeholder: a dotted underline with the
 * definition as a title. (Owned by the end-matter builder, who may replace it
 * with a richer popover.)
 */
export default function Term({ term, children }: { term: string; children: ReactNode }) {
  const def = S12.glossary.find((g) => g.term.toLowerCase() === term.toLowerCase())?.def;
  return (
    <span className="re-term" title={def}>
      {children}
    </span>
  );
}
