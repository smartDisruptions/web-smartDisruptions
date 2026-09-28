import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Primary is a sticky-note yellow with dark ink in BOTH themes — a sticky
  // note is an object, not a themed surface. Secondary is plain paper.
  primary:
    'border-2 border-[var(--sd-sticky-ink)] bg-[var(--sd-sticky)] text-[var(--sd-sticky-ink)] hover:-rotate-1 hover:scale-[1.03]',
  secondary:
    'border-2 border-text-primary bg-surface text-text-primary hover:bg-[var(--sd-hl)]',
  ghost: 'border-2 border-transparent bg-transparent text-accent hover:bg-fill',
};

const sizeStyles: Record<ButtonSize, string> = {
  // Handwriting needs more size than a sans to read at a glance, and every
  // size clears a 44px touch target.
  sm: 'min-h-11 px-4 py-1 text-lg',
  md: 'min-h-11 px-5 py-1.5 text-xl',
  lg: 'min-h-12 px-7 py-2 text-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  href,
  disabled = false,
}: ButtonProps) {
  const base =
    `nb-wobble font-display inline-flex items-center justify-center transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${
      disabled ? 'pointer-events-none opacity-50' : ''
    } ${className}`.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
