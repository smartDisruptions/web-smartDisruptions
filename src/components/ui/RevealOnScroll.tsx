interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Rises into place as it scrolls into view. No JavaScript: `.sd-reveal` is a
 * scroll-driven CSS animation (animation-timeline: view()), so it runs on the
 * compositor and costs nothing to hydrate. Browsers without scroll timelines
 * simply show the content. This used to be a client component with an
 * IntersectionObserver per instance.
 */
export default function RevealOnScroll({ children, className = '' }: RevealOnScrollProps) {
  return <div className={`sd-reveal ${className}`.trim()}>{children}</div>;
}
