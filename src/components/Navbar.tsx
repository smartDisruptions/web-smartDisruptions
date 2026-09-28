'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/content', label: 'Writing' },
  { href: '/market-storm', label: 'Market Storm' },
  { href: '/built', label: 'What I Built' },
  { href: '/games', label: 'Arcade' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-[1.7rem] text-text-primary">
          <span className="nb-hl">Smart Disruptions</span>
        </Link>

        {/* Right side: links (desktop) + theme toggle + hamburger (mobile) */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Desktop links */}
          <ul className="hidden items-center gap-6 lg:flex" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-display text-xl transition-colors ${
                    isActive(link.href)
                      ? 'text-[var(--sd-pen-ink)] underline decoration-[var(--sd-pen)] decoration-2 underline-offset-4'
                      : 'text-accent hover:text-accent-hover'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={`block h-0.5 w-6 bg-text-primary transition-transform ${
                mobileMenuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-text-primary transition-opacity ${
                mobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-text-primary transition-transform ${
                mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border lg:hidden">
          <ul className="flex flex-col gap-2 px-4 py-4" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-display block rounded-md px-3 py-2 text-2xl transition-colors ${
                    isActive(link.href)
                      ? 'text-[var(--sd-pen-ink)]'
                      : 'text-accent hover:bg-fill'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
