'use client';

import Link from 'next/link';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { useEffect, useState } from 'react';
import KiruMark from '@/components/brand/KiruMark';
import ThemeToggle from '@/components/ThemeToggle';
import { IconSearch } from '@/components/icons';
import { NAV, isActive, direction, sectionOf } from './nav';

/**
 * The top bar. Desktop: the full section nav, with a vermilion brush stroke
 * under the current section that glides to the next one (it carries a
 * view-transition-name, so the browser animates it between pages). Phone:
 * logo, search, theme and an avatar to About — the sections live in the tab
 * bar — and the bar tucks away while you scroll down, like a native app.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const section = sectionOf(useSelectedLayoutSegment());
  // Hidden is remembered per page, so a new page always starts with the bar
  // showing — without resetting state in an effect.
  const [hiddenOn, setHiddenOn] = useState<string | null>(null);
  const hidden = hiddenOn === pathname;

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        if (Math.abs(delta) > 6) {
          setHiddenOn(delta > 0 && y > 120 ? pathname : null);
          last = y;
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <header
      className="sd-glass sticky top-0 z-50 border-b border-border transition-transform duration-300 ease-out data-[hidden=true]:-translate-y-full lg:data-[hidden=true]:translate-y-0"
      data-hidden={hidden}
      style={{ viewTransitionName: 'sd-header', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
      >
        <Link
          href="/"
          prefetch={pathname === '/' ? false : undefined}
          className="group flex min-w-0 items-center gap-2.5"
          aria-label="Smart Disruptions — home"
          transitionTypes={direction(pathname, '/')}
        >
          <KiruMark className="h-9 w-9 shrink-0 transition-transform duration-500 ease-out group-hover:-rotate-12 group-hover:scale-110" />
          {/* The wordmark scales with the phone's width so it fits whole
              beside the three buttons from 340px up, instead of truncating. */}
          <span className="font-display truncate text-[length:clamp(11.5px,calc(10vw_-_22.5px),1.05rem)] leading-none text-text-primary max-[339px]:hidden sm:text-[1.15rem]">
            Smart Disruptions
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex" role="list">
          {NAV.map((item) => {
            const active = isActive(section, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={pathname === item.href ? false : undefined}
                  transitionTypes={direction(pathname, item.href)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative block rounded-full px-2.5 py-2 text-[0.92rem] font-semibold whitespace-nowrap transition-colors xl:px-3.5 ${
                    active
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:bg-fill hover:text-text-primary'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2.5 -bottom-0.5 h-[5px] rounded-full bg-pen xl:inset-x-3"
                      style={{
                        viewTransitionName: 'sd-nav-ink',
                        WebkitMask:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 14'%3E%3Cpath d='M2 9.5C14 5 30 3.2 52 3.6 76 4 98 5.4 118 3c-6 4.8-24 7.8-48 8.4C44 12 20 12.5 2 9.5z'/%3E%3C/svg%3E\") center / 100% 100% no-repeat",
                        mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 14'%3E%3Cpath d='M2 9.5C14 5 30 3.2 52 3.6 76 4 98 5.4 118 3c-6 4.8-24 7.8-48 8.4C44 12 20 12.5 2 9.5z'/%3E%3C/svg%3E\") center / 100% 100% no-repeat",
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('sd:palette'))}
            className="group flex h-10 items-center gap-2 rounded-full border border-border px-2.5 text-text-secondary transition-colors hover:border-[var(--sd-border-strong)] hover:text-text-primary sm:px-3"
            aria-label="Search the site"
          >
            <IconSearch size={19} />
            <span className="hidden text-sm sm:inline">Search</span>
            <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-sans text-[0.7rem] text-text-secondary xl:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <Link
            href="/about"
            prefetch={pathname === '/about' ? false : undefined}
            aria-label="About Josh"
            aria-current={isActive(section, '/about') ? 'page' : undefined}
            className={`ml-0.5 block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 transition-[box-shadow,transform] duration-300 hover:scale-105 lg:hidden ${
              isActive(section, '/about') ? 'ring-pen' : 'ring-border'
            }`}
          >
            <img src="/images/josh.webp" alt="" width={36} height={36} className="h-full w-full object-cover" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
