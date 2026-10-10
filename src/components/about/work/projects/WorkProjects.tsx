import Link from 'next/link';
import { WORK_IDS, projects } from '@/components/about/work/data';

/** STUB — the four projects. Replaced by the projects builder. */
export default function WorkProjects() {
  return (
    <section
      id={WORK_IDS.projects}
      aria-labelledby="wk-projects-h"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24 sm:px-6"
    >
      <p className="sd-kicker">Live, with receipts</p>
      <h2
        id="wk-projects-h"
        className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl"
      >
        The four I&rsquo;d show you first
      </h2>
      <ul className="mt-8 grid gap-4" role="list">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/built/${p.slug}`}>{p.name}</Link> — {p.summary}
          </li>
        ))}
      </ul>
    </section>
  );
}
