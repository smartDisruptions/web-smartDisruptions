import type { ReactNode, SVGProps } from 'react';
import { svgString } from './svgString';

/**
 * An <svg> whose contents are static art: rendered as one markup string, so
 * React neither ships its paths as elements nor hydrates them. See
 * svgString.ts. Use it for decoration that never changes after render.
 */
export default function StaticSvg({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return <svg {...props} dangerouslySetInnerHTML={{ __html: svgString(children) }} suppressHydrationWarning />;
}
