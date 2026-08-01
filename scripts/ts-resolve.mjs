/**
 * Resolve hook so the node-run scripts can import the app's TypeScript modules
 * directly. The app uses bundler-style extensionless imports and the `@/` alias,
 * both of which raw Node ESM does not resolve. Node strips the types itself;
 * this only fixes specifier resolution. Test/script use only.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SRC = path.join(process.cwd(), 'src');

export async function resolve(specifier, context, next) {
  let spec = specifier;

  if (spec.startsWith('@/')) {
    spec = pathToFileURL(path.join(SRC, spec.slice(2))).href;
  }

  const relative = spec.startsWith('.') || spec.startsWith('file:');
  if (relative && !/\.[a-z]+$/i.test(spec)) {
    const base = spec.startsWith('file:')
      ? fileURLToPath(spec)
      : path.resolve(path.dirname(fileURLToPath(context.parentURL)), spec);
    for (const ext of ['.ts', '.tsx', '.mjs', '.js']) {
      if (existsSync(base + ext)) return next(pathToFileURL(base + ext).href, context);
    }
  }

  return next(spec, context);
}
