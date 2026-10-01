/**
 * Kiru's head as a mark — the logo, the favicon, the app icon. The full rig
 * (components/kiru/Kiru.tsx) is too detailed under ~48px; this is the same
 * face reduced to what survives at 16px: hood, headband, plate, eyes.
 */
export default function KiruMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        d="M47 23c7-4 11-2 15-6-1 6-6 9-12 9 5 1 8 4 12 3-4 4-10 4-15 1z"
        fill="#bd3019"
      />
      <ellipse cx="31" cy="34" rx="26" ry="24" fill="#252d56" />
      <path d="M5 30 Q31 14 57 30" stroke="#e8432a" strokeWidth="7" fill="none" />
      <rect x="25" y="17.5" width="12" height="7" rx="1.6" fill="#cfd5e2" />
      <path d="M32.4 18.6 29 21.7h2.3l-1.4 1.9 3.8-3.2h-2.3z" fill="#e8432a" />
      <path
        d="M12 33c9-4.6 29-4.6 38 0 3.2 1.6 3.2 7.6 0 9.2-9 4.6-29 4.6-38 0-3.2-1.6-3.2-7.6 0-9.2Z"
        fill="#f6d0a8"
      />
      <ellipse cx="23.5" cy="37.6" rx="4" ry="4.6" fill="#fff" />
      <ellipse cx="38.5" cy="37.6" rx="4" ry="4.6" fill="#fff" />
      <circle cx="24.3" cy="38.3" r="2.6" fill="#13152a" />
      <circle cx="39.3" cy="38.3" r="2.6" fill="#13152a" />
      <path d="M18.5 31.6l8 2M43.5 31.6l-8 2" stroke="#13152a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
