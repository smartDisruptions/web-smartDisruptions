import Link from 'next/link';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/apps', label: 'Apps' },
  { href: '/system', label: 'System' },
  { href: '/content', label: 'Content' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Column 1: Brand */}
          <div>
            <p className="text-lg font-bold text-accent">SmartDisruptions</p>
            <p className="mt-2 text-sm text-text-secondary">
              AI-built web applications — a proof engine for what&apos;s
              possible when AI drives development.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
              Quick Links
            </h3>
            <ul className="mt-3 flex flex-col gap-2" role="list">
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

          {/* Column 3: Get the System */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
              Get the System
            </h3>
            <p className="mt-3 text-sm text-text-secondary">
              The full system behind these apps will be available soon.
            </p>
            <span className="mt-3 inline-block rounded-full bg-accent-secondary/20 px-4 py-1.5 text-xs font-semibold text-accent-secondary">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} SmartDisruptions. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
