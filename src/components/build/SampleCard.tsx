import Image from 'next/image';
import Link from 'next/link';
import { IconArrowRight, IconExternal } from '@/components/icons';
import type { Sample } from './samples';
import './build-samples.css';

/**
 * One sample on a Build page: its picture, what it is, its name and a line,
 * then the two ways in. The room draws the frame around it (a shoji pane, a
 * level slot, a place on a shelf) by giving its list item the class bs-card,
 * and this fills it.
 *
 * The link to the thing itself is stretched over the whole card, so a click
 * anywhere on it, the picture most of all, opens it in a new tab. "How I
 * built it" sits above that and opens its page here. Three across on a
 * desktop; on a tablet each card lies on its side, picture left; on a phone
 * they stack (build-samples.css).
 */
const ONE = '(min-width: 64rem) 22rem, (min-width: 40rem) 40vw, 92vw';
const PANEL = '(min-width: 64rem) 7.5rem, (min-width: 40rem) 14vw, 31vw';

export default function SampleCard({ sample: s }: { sample: Sample }) {
  const panels = s.pictures.length > 1;
  return (
    <>
      <div className={panels ? 'bs-pic bs-pic-panels' : 'bs-pic'}>
        {s.pictures.map((p) => (
          <Image
            key={p.src}
            src={p.src}
            alt={p.alt}
            width={p.width}
            height={p.height}
            sizes={panels ? PANEL : ONE}
            loading="lazy"
          />
        ))}
      </div>
      <div className="bs-text">
        <p className="bs-kind">{s.kind}</p>
        <h3 className="font-display bs-name">{s.name}</h3>
        <p className="font-read bs-sum">{s.summary}</p>
        <p className="bs-links">
          <a href={s.href} target="_blank" rel="noopener" className="bs-go">
            {s.goLabel}
            <IconExternal size={15} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          {s.builtHref && (
            <Link href={s.builtHref} className="bs-how">
              How I built it
              <IconArrowRight size={15} />
            </Link>
          )}
        </p>
      </div>
    </>
  );
}
