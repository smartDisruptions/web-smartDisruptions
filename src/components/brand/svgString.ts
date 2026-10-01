import type { ReactNode, ReactElement } from 'react';
import { isValidElement, Fragment } from 'react';

/**
 * Serialises a tree of SVG JSX to a markup string, for use with
 * dangerouslySetInnerHTML.
 *
 * Why: the site's art (Kiru, the scenery, the glyphs) is static decoration,
 * often a dozen ninjas and hundreds of paths on one page. Rendered as JSX,
 * every path is a React element in the RSC payload and a fiber React must
 * build and hydrate on a phone. As one string per <svg>, the payload carries
 * a single value and React never descends into it. Same pixels, a fraction of
 * the main-thread work.
 *
 * Handles exactly what the art uses: intrinsic SVG elements, plain function
 * components without hooks (called directly), fragments, arrays, strings and
 * numbers. Output follows the browser's own serialisation (explicit closing
 * tags, double-quoted attributes) so hydration sees the same markup.
 */

// Attributes SVG keeps in camelCase; everything else camelCase → kebab-case.
const KEEP = new Set([
  'viewBox',
  'preserveAspectRatio',
  'gradientUnits',
  'gradientTransform',
  'clipPathUnits',
  'patternUnits',
  'keySplines',
  'keyTimes',
  'attributeName',
  'repeatCount',
  'calcMode',
  'pathLength',
  'stdDeviation',
  'baseFrequency',
  'numOctaves',
]);

const attrName = (k: string) =>
  k === 'className' ? 'class' : KEEP.has(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function styleString(style: Record<string, string | number>): string {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k.startsWith('--') ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`)
    .join(';');
}

export function svgString(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string') return esc(node);
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(svgString).join('');
  if (!isValidElement(node)) return '';

  const el = node as ReactElement<Record<string, unknown>>;
  if (el.type === Fragment) return svgString(el.props.children as ReactNode);
  if (typeof el.type === 'function') {
    return svgString((el.type as (p: Record<string, unknown>) => ReactNode)(el.props));
  }
  if (typeof el.type !== 'string') return '';

  const { children, style, ...rest } = el.props as { children?: ReactNode; style?: Record<string, string | number> };
  let attrs = '';
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === false || k === 'key') continue;
    attrs += ` ${attrName(k)}="${esc(String(v))}"`;
  }
  if (style) {
    const s = styleString(style);
    if (s) attrs += ` style="${esc(s)}"`;
  }
  return `<${el.type}${attrs}>${svgString(children)}</${el.type}>`;
}
