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
  primary: 'bg-accent text-background hover:opacity-90',
  secondary:
    'bg-transparent border border-accent text-accent hover:bg-accent/10',
  ghost: 'bg-transparent text-text-primary hover:bg-white/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
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
    `inline-flex items-center justify-center rounded-lg font-medium transition-all ${variantStyles[variant]} ${sizeStyles[size]} ${
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
