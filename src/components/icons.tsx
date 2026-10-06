import type { SVGProps } from 'react';

/**
 * The site's line icons. Drawn for this site on a 24px grid, 1.8px stroke,
 * round joins — one family, so the tab bar and the header read as a set.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Torii gate — home. */
export const IconHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 5.8c3.2 1 15.8 1 19 0" />
    <path d="M4.5 9.5h15" />
    <path d="M7 7v14M17 7v14" />
    <path d="M12 6.8v2.7" />
  </Icon>
);

/** A scroll with writing on it — the notes. */
export const IconWriting = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4h11v13.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 17.5V17h11.5" />
    <path d="M7 4a2.5 2.5 0 0 0-2.5 2.5V17" />
    <path d="M9.5 8.5h5.5M9.5 12h5.5" />
  </Icon>
);

/** An open book — Learn. Pages only, no lines, so it never reads as a
    second Writing scroll beside it in the tab bar. */
export const IconLearn = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6.4c3.5-.9 6.6-.4 9 1.5 2.4-1.9 5.5-2.4 9-1.5v11.7c-3.5-.9-6.6-.4-9 1.5-2.4-1.9-5.5-2.4-9-1.5z" />
    <path d="M12 7.9v11.7" />
  </Icon>
);

/** Lightning — Market Storm. Left the tab bar when Market Storm moved into
    Writing; still exported for the section to use. */
export const IconStorm = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 2.5 5 13.5h6.5L10 21.5l9-11.5h-6.5z" />
  </Icon>
);

/** Hammer — what I built. */
export const IconBuilt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12.4 4.6 19.4 11.6 16.6 14.4 9.6 7.4Z" />
    <path d="M3.8 20.2 12.6 11.4" />
  </Icon>
);

/** Gamepad — the Arcade. */
export const IconArcade = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17.3 6H6.7a4 4 0 0 0-3.9 3.2l-1 5.6A2.9 2.9 0 0 0 4.6 18.3c.8 0 1.6-.3 2.2-.9L8.4 16h7.2l1.6 1.4c.6.6 1.4.9 2.2.9a2.9 2.9 0 0 0 2.8-3.5l-1-5.6A4 4 0 0 0 17.3 6Z" />
    <path d="M7.5 9.5v3M6 11h3" />
    <path d="M15.5 10.2h.01M17.5 12h.01" strokeWidth={2.6} />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const IconExternal = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.4-3.6 4.2-5.3 7.5-5.3s6.1 1.7 7.5 5.3" />
  </Icon>
);
