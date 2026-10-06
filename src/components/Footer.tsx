import Link from 'next/link';
import Skyline from '@/components/brand/Skyline';
import KiruMark from '@/components/brand/KiruMark';
import Kiru from '@/components/kiru/Kiru';
import { Seal, Vertical } from '@/components/brand/Kanji';
import { NAV } from '@/components/nav/nav';

/**
 * The page ends in the town at night: the skyline's near layer becomes the
 * footer's ground, so the footer is always sumi ink — light text in both
 * themes. Kiru keeps watch from the torii.
 */
export default function Footer() {
  return (
    <footer
      className="sd-defer relative mt-16 text-[#eceefa]"
      style={{ containIntrinsicSize: 'auto 560px' }}
    >
      <Skyline className="h-[clamp(120px,15.28vw,340px)]">
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="xMidYMax slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <Kiru pose="sit" x={279} y={51} width={64} height={64} />
        </svg>
      </Skyline>
      <div style={{ background: 'var(--sky-near)' }} className="-mt-px">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-6 pb-14 sm:px-6 md:grid-cols-[1.4fr_1fr_auto] md:pt-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <KiruMark className="h-11 w-11" />
              <span className="font-display text-xl">Smart Disruptions</span>
            </Link>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-[#b4b8d2]">
              I build real things with AI and write up exactly how — so
              it&apos;s usable for people who feel behind, stuck, or
              underpowered.
            </p>
          </div>

          <div>
            <h2 className="text-[0.7rem] font-bold tracking-[0.16em] text-[#8f95b8] uppercase">
              Explore
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5" role="list">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-[0.95rem] font-semibold text-[#dfe3fb] transition-colors hover:text-[#ff8166]"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              {/* Market Storm left the nav for a section of the Writing page.
                  Every report still lives in its archive, linked from here so
                  it stays one tap from any page. "Market Storm archive" wrapped
                  to two lines in this column at every width; the page it opens
                  says it is the archive. */}
              <li>
                <Link
                  href="/market-storm"
                  className="text-[0.95rem] font-semibold text-[#dfe3fb] transition-colors hover:text-[#ff8166]"
                >
                  Market Storm
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[0.95rem] font-semibold text-[#dfe3fb] transition-colors hover:text-[#ff8166]"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-4 max-md:hidden">
            <Vertical
              text="スマート・ディスラプションズ"
              className="h-[230px] w-[22px] text-[#3a4170]"
            />
            <Seal char="忍" className="w-12" />
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-[#8f95b8] sm:px-6">
            <span>
              &copy; {new Date().getFullYear()} Smart Disruptions · Josh Escusa
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden>Kiru keeps watch.</span>
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-[#ff8166]"
              >
                Privacy
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
