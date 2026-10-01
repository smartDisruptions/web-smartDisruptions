import Link from 'next/link';
import { featuredReport, marketStormReports } from '@/data/marketStorm';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { formatDate } from '@/lib/format';

const TONE: Record<string, string> = {
  bull: 'text-[#4ade80]',
  bear: 'text-[#f87171]',
  warn: 'text-[#f2b483]',
  neutral: 'text-[#dfe3fb]',
};

/**
 * Market Storm's standing thesis as a storm panel: always night (an object
 * region, light text in both themes), lightning that strikes every few
 * seconds in pure CSS, Kiru under his umbrella. The full WebGL storm lives on
 * the section's own page; this one costs no JavaScript.
 */
export default function StormTeaser() {
  const r = featuredReport() ?? marketStormReports[0];
  if (!r) return null;
  const kpis = r.kpis.slice(0, 3);

  return (
    <section aria-labelledby="hm-storm" className="mx-auto max-w-6xl px-5 pt-24 sm:px-6 sm:pt-32">
      <Link href={`/market-storm/${r.slug}`} className="sd-card hm-storm sd-reveal group block">
        <span className="hm-storm-sky" aria-hidden />
        <svg className="hm-storm-bolt" viewBox="0 0 120 300" aria-hidden>
          <path d="M70 0 L30 130 L62 130 L22 300 L100 105 L64 105 L96 0 Z" />
        </svg>
        <span className="hm-storm-rain" aria-hidden />
        <Kanji char="嵐" className="hm-storm-kanji" />
        <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-bold tracking-[0.16em] text-[#ffb59f] uppercase">
              Market Storm · the standing thesis · {formatDate(r.publishDate)}
            </p>
            <h2 id="hm-storm" className="font-display mt-4 text-3xl leading-tight text-[#f3f4ff] sm:text-[2.6rem]">
              {r.title}
            </h2>
            <p className="font-read mt-4 text-[1.05rem] leading-relaxed text-[#c3c8e6]">{r.excerpt}</p>
            <ul className="mt-6 flex flex-wrap gap-2.5" role="list">
              {kpis.map((k) => (
                <li key={k.label} className="rounded-xl border border-white/12 bg-white/[.06] px-3.5 py-2.5 backdrop-blur-sm">
                  <span className={`block text-lg font-extrabold ${TONE[k.tone ?? 'neutral']}`}>{k.value}</span>
                  <span className="block text-[0.72rem] text-[#a9aecc]">{k.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d63a22] px-5 py-3 text-sm font-bold text-white transition-transform group-hover:translate-x-1">
              Read the thesis <span aria-hidden>→</span>
            </p>
            <p className="mt-4 text-xs text-[#8f95b8]">Research, not advice.</p>
          </div>
          <Kiru pose="storm" className="mx-auto h-56 w-auto sm:h-64" />
        </div>
      </Link>
    </section>
  );
}
