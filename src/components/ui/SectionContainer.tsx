interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function SectionContainer({ children, className = '', id }: SectionContainerProps) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 ${className}`.trim()}>
      {children}
    </section>
  );
}
