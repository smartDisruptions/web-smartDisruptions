import type { Metadata } from 'next';
import Link from 'next/link';
import Kanji from '@/components/brand/Kanji';
import { IconArrowRight } from '@/components/icons';
import { DRAFTS } from './copy';

export const metadata: Metadata = {
  title: 'About, four ways — drafts',
};

export default function DraftsIndex() {
  return (
    <div className="adx-page">
      <p className="sd-kicker">Design exploration &middot; About</p>
      <h1 className="adx-h1 font-display">About, four ways.</h1>
      <p className="adx-lede font-read">
        Same words in all four: a brief about me, a note that I build with
        Claude, and the way into the Arcade, the Writing and Learn. Only the
        design changes.
      </p>
      <ol className="adx-list" role="list">
        {DRAFTS.map((d) => (
          <li key={d.slug}>
            <Link href={`/about-drafts/${d.slug}`} className="adx-item sd-card">
              <Kanji char={d.kanji} className="adx-item-k" />
              <span className="adx-item-txt">
                <span className="adx-item-n">Draft {d.n}</span>
                <span className="adx-item-name font-display">{d.name}</span>
                <span className="adx-item-pitch">{d.pitch}</span>
              </span>
              <IconArrowRight className="adx-item-go" size={20} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
