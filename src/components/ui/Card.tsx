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
      className={`rounded-2xl border border-black/10 bg-surface p-6 ${
        hover
          ? 'transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_10px_30px_-12px_rgba(26,23,20,0.18)]'
          : ''
      } ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
