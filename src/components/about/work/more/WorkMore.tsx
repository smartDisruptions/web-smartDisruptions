import Link from 'next/link';
import { WORK_IDS, catalogue } from '@/components/about/work/data';

/** STUB — everything else. Replaced by the "everything else" builder. */
export default function WorkMore() {
  return (
    <section
      id={WORK_IDS.more}
      aria-labelledby="wk-more-h"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24 sm:px-6"
    >
      <h2
        id="wk-more-h"
        className="font-display sd-brush-under text-4xl sm:text-5xl"
      >
        Everything else
      </h2>
      <ul className="mt-8 grid gap-4" role="list">
        {catalogue.map((c) => (
          <li key={c.key}>
            <Link href={c.detailHref ?? c.liveUrl ?? '/about'}>{c.name}</Link> —{' '}
            {c.description}
          </li>
        ))}
      </ul>
    </section>
  );
}
