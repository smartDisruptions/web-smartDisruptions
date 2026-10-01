interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

/** A surface. With `hover` it is a pressable card (lift, sheen, press-in). */
export default function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      className={`${hover ? 'sd-card' : 'sd-print'} p-6 ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
