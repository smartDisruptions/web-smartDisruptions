'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/apps', label: 'Apps' },
  { href: '/system', label: 'System' },
  { href: '/content', label: 'Content' },
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
      className="sticky top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-accent"
        >
          SmartDisruptions
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 md:hidden">
          <ul className="flex flex-col gap-2 px-4 py-4" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
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
