import SampleCard from '@/components/build/SampleCard';
import { SAMPLES } from './samples';

/**
 * The samples, as panes on a shoji screen: one website per pane, the card
 * (SampleCard) laid on the washi. The wall's wood and paper are in
 * ./websites.css (bw-shoji, bw-pane).
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

      <ul className="bs-list bw-shoji" role="list">
        {SAMPLES.map((s) => (
          <li key={s.key} className="bs-card bw-pane">
            <SampleCard sample={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}
