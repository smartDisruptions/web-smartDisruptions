interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = '',
  hover = false,
  style,
}: CardProps) {
  return (
    <div
      className={`nb-polaroid rounded-[3px] p-6 ${
        hover
          ? 'transition-all hover:-translate-y-1 hover:shadow-[0_22px_34px_-16px_var(--sd-card-shadow)]'
          : ''
      } ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
