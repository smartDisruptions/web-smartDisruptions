'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isArtifactRoute } from '@/lib/chrome';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/content', label: 'Writing' },
  { href: '/market-storm', label: 'Market Storm' },
  { href: '/apps', label: 'Apps' },
  { href: '/games', label: 'Arcade' },
  { href: '/web-design', label: 'Web Design' },
];

export default function Footer() {
  const pathname = usePathname();

  // Matches Navbar: artifacts carry their own way back, not the site's.
  if (isArtifactRoute(pathname)) return null;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {/* Column 1: Brand */}
          <div className="text-center sm:text-left">
            <p className="font-display text-xl font-semibold text-accent">
              SmartDisruptions
            </p>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              I build real things with AI and write up exactly how — so it&apos;s
              usable for people who feel behind, stuck, or underpowered.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center sm:text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
              Explore
            </h2>
            <ul className="mt-3 flex flex-col items-center gap-2 sm:items-start" role="list">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} SmartDisruptions. All rights
          reserved. &middot;{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition-colors hover:text-accent"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
