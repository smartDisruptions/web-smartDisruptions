type BadgeVariant = 'default' | 'accent' | 'secondary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-black/[0.05] text-text-secondary',
  accent: 'bg-accent/10 text-accent',
  secondary: 'bg-accent-secondary/10 text-accent-secondary',
};

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
