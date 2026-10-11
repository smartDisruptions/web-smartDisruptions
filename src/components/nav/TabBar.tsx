'use client';

import Link from 'next/link';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import {
  IconHome,
  IconWriting,
  IconLearn,
  IconArcade,
} from '@/components/icons';
import { NAV, isActive, direction, sectionOf } from './nav';

const ICONS: Record<string, (p: { size?: number }) => React.ReactElement> = {
  '/': IconHome,
  '/content': IconWriting,
  '/learn': IconLearn,
  '/games': IconArcade,
};

/**
 * About's tab is Josh's photo, the way an app's last tab is its profile:
 * ringed in vermilion while you're on it. It used to be the avatar in the
 * top bar, before About had a tab. Lazy, so a desktop (where this bar is
 * hidden) never fetches it.
 */
function Avatar({ active }: { active: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the same 12 KB pre-sized webp the About pages use
    <img
      src="/images/josh.webp"
      alt=""
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      className={`block h-6 w-6 rounded-full object-cover ring-2 transition-[box-shadow] duration-300 ${
        active ? 'ring-pen' : 'ring-border'
      }`}
    />
  );
}

/**
 * The phone tab bar — the site's sections where a thumb can reach them. The
 * vermilion pill behind the current tab has a view-transition-name, so when
 * the page changes the browser slides it to the new tab. A short vibration
 * confirms the tap on phones that support it (Android; iOS ignores it).
 */
export default function TabBar() {
  const pathname = usePathname();
  const section = sectionOf(useSelectedLayoutSegment());
  return (
    <nav
      aria-label="Sections"
      className="sd-glass sd-glass-dense fixed inset-x-0 bottom-0 z-50 border-t border-border lg:hidden"
      style={{
        viewTransitionName: 'sd-tabbar',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <ul
        className="mx-auto grid h-[64px] max-w-lg grid-cols-5 px-1.5"
        role="list"
      >
        {NAV.filter((n) => n.tab).map((item) => {
          const active = isActive(section, item.href);
          const Icon = ICONS[item.href];
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                prefetch={pathname === item.href ? false : undefined}
                transitionTypes={direction(pathname, item.href)}
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  if (!active) navigator.vibrate?.(8);
                }}
                className={`relative flex h-full flex-col items-center justify-center gap-1 text-[0.66rem] font-semibold tracking-wide transition-colors active:scale-95 ${
                  active ? 'text-pen-ink' : 'text-text-secondary'
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-[7px] h-8 w-14 rounded-full bg-pen/15"
                    style={{ viewTransitionName: 'sd-tab-pill' }}
                  />
                )}
                <span className="relative">
                  {Icon ? <Icon size={23} /> : <Avatar active={active} />}
                </span>
                <span className="relative">{item.short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
