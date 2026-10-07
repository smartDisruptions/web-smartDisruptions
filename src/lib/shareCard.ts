import type { Metadata } from 'next';

/**
 * The site's share card: src/app/opengraph-image.tsx (and twitter-image.tsx),
 * Kiru's head on the night skyline.
 *
 * A page that sets its own `openGraph` replaces the root's wholesale, image
 * included, so it has to name the card again or a shared link renders with
 * no picture (/market-storm did, until October 2026). A page that sets none
 * keeps the card but also the root's `og:url`, which is the home page:
 * Facebook and LinkedIn treat that as the link, so a shared /learn opened
 * the home page. `shareMeta` gives a page both: its own title, words and
 * address, and the site card. /kiru spells the same thing out by hand.
 */
export const SITE_CARD = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'SmartDisruptions — building real things with AI, in public',
};

export function shareMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** The page's own path, e.g. '/learn' (made absolute by metadataBase). */
  path: string;
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'SmartDisruptions',
      type: 'website',
      locale: 'en_US',
      images: [SITE_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ ...SITE_CARD, url: '/twitter-image' }],
    },
  };
}
