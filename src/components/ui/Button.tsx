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
  // Primary is vermilion with white text in BOTH themes (4.7:1) — the button is
  // an object, like Kiru's headband. A blade-light crosses it on hover.
  primary:
    'sd-btn-primary bg-[#d63a22] text-white shadow-[0_10px_24px_-10px_rgba(214,58,34,.7)] hover:bg-[#c2311b] hover:shadow-[0_16px_34px_-12px_rgba(214,58,34,.8)]',
  // Secondary is an outlined pill on whatever is behind it.
  secondary:
    'border border-[var(--sd-border-strong)] bg-surface/60 text-text-primary hover:border-text-primary hover:bg-surface',
  ghost: 'bg-transparent text-accent hover:bg-fill',
};

const sizeStyles: Record<ButtonSize, string> = {
  // Every size clears a 44px touch target.
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-11 px-5 text-[0.95rem]',
  lg: 'min-h-13 px-7 text-base',
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
    `relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-bold tracking-[0.01em] transition-[background-color,box-shadow,border-color,translate,scale] duration-300 ease-out active:scale-[0.97] ${variantStyles[variant]} ${sizeStyles[size]} ${
      disabled ? 'pointer-events-none opacity-50' : ''
    } ${className}`.trim();

  // Past designs under /archive are plain files with their own scripts, not
  // pages of this app: open them with a full page load, never the router.
  if (href && !disabled && href.startsWith('/archive/')) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    );
  }

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
