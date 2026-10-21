import Image from 'next/image';
import Link from 'next/link';
import { IconArrowRight, IconExternal } from '@/components/icons';
import { SAMPLES } from './samples';

/**
 * The samples, as panes on a shoji screen: one website per pane, its
 * screenshot set in the paper like a picture, what the made-up business is,
 * its name and one line under it, then the two ways in. "Visit the site"
 * opens the site itself in a new tab, so this page stays where it was;
 * "How I built it" opens its page here, when it has one.
 *
 * The visit link is stretched over the whole pane, so a click anywhere on
 * it, the picture most of all, opens the site, and "How I built it" sits
 * above that. Three across on a desktop; on a tablet each pane lies on its
 * side, picture left; on a phone they stack.
 */
export default function SampleWall() {
  return (
    <section className="bw-samples build-band" aria-labelledby="bw-samples-h">
      <p className="sd-kicker">Samples</p>
      <h2 id="bw-samples-h" className="font-display bw-h2">
        Three made-up businesses, three real websites.
      </h2>
      <p className="bw-samples-lede font-read">
        I invented each business, so you can click through every part of its
        site. Nothing you do on one reaches anybody.
      </p>

      <ul className="bw-shoji bw-samples-list" role="list">
        {SAMPLES.map((s) => (
          <li key={s.key} className="bw-pane bw-sample">
            <div className="bw-sample-pic">
              <Image
                src={s.image}
                alt={s.imageAlt}
                width={s.imageWidth}
                height={s.imageHeight}
                sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 40vw, 92vw"
                loading="lazy"
              />
            </div>
            <div className="bw-sample-text">
              <p className="bw-sample-kind">{s.kind}</p>
              <h3 className="font-display bw-sample-name">{s.name}</h3>
              <p className="font-read bw-sample-sum">{s.summary}</p>
              <p className="bw-sample-links">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  className="bw-sample-go"
                >
                  Visit the site
                  <IconExternal size={15} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                {s.builtHref && (
                  <Link href={s.builtHref} className="bw-sample-how">
                    How I built it
                    <IconArrowRight size={15} />
                  </Link>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
