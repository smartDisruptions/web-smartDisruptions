type BadgeVariant = 'default' | 'accent' | 'secondary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-fill text-text-secondary',
  // Darker ink on the light tint so small badge text clears WCAG AA.
  accent: 'bg-accent/10 text-accent-hover',
  secondary: 'bg-pen/10 text-[var(--sd-badge-secondary)]',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.72rem] font-bold tracking-wide ${variantStyles[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
