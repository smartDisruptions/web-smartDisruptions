import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import Button from '@/components/ui/Button';
import { IconSearch } from '@/components/icons';
import { SmokeBomb, OpenSearch } from './kiru/SmokeBomb';
import { SMOKE_CSS, NOT_FOUND_CSS } from './kiru/smoke-css';

/**
 * The 404 page. Kiru used a smoke bomb: he's there for a beat, the bomb goes
 * off, and the cloud sits where the page should have been. Tap it and he's
 * back (the only JavaScript here is that tap, ./kiru/SmokeBomb.tsx). 消 —
 * "vanish" — is the page kanji, lettered beside the bang like a comic's sound
 * effect. Three ways out: home, the writing, and search (the same palette the
 * header opens). Styles: ./kiru/smoke-css.ts.
 */
export default function NotFound() {
  return (
    <div className="nf">
      {/* Inline, hoisted styles: see ./kiru/smoke-css.ts for why not a .css import. */}
      <style href="sd-smoke" precedence="medium">
        {SMOKE_CSS}
      </style>
      <style href="sd-not-found" precedence="medium">
        {NOT_FOUND_CSS}
      </style>
      <Kanji char="消" className="sd-watermark nf-mark" />
      <div className="nf-inner">
        <SmokeBomb
          size="clamp(12.5rem, 56vw, 16.5rem)"
          sfx={<Kanji char="消" draw className="kv-sfx" />}
        >
          <Kiru pose="wave" />
        </SmokeBomb>

        <p className="sd-kicker nf-kicker">404 &middot; Page not found</p>
        <h1 className="nf-h1 font-display">This page used a smoke bomb.</h1>
        <p className="nf-sub font-read">
          Whatever was here has vanished &mdash; or it was never here. These
          still work:
        </p>

        <div className="nf-ways">
          <Button href="/" size="lg">
            &larr; Back to the front
          </Button>
          <Button href="/content" variant="secondary" size="lg">
            Read the writing
          </Button>
          <OpenSearch>
            <IconSearch size={18} />
            Search the site
          </OpenSearch>
        </div>
      </div>
    </div>
  );
}
