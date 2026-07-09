import Link from 'next/link';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/content', label: 'Writing' },
  { href: '/apps', label: 'Builds' },
  { href: '/games', label: 'Arcade' },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {/* Column 1: Brand */}
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-accent">SmartDisruptions</p>
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
        <div className="mt-10 border-t border-black/10 pt-6 text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} SmartDisruptions. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
