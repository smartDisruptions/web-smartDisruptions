/**
 * Minimal YAML-subset frontmatter parser + serializer.
 *
 * Deliberately not a YAML dependency: this repo keeps its dependency list
 * short (see the impeccable install, which shells out rather than vendoring),
 * and post frontmatter only needs a small, fully-specified grammar. Anything
 * outside that grammar should fail loudly rather than be half-understood.
 *
 * Supported:
 *   key: scalar                 strings (quoted or bare), numbers, booleans, null
 *   key: [a, b, c]              inline arrays of scalars
 *   key:                        block list of objects, 2-space indented:
 *     - name: linkedin
 *       status: planned
 *
 * Not supported (throws): nested maps beyond the one block-list level, anchors,
 * multi-line scalars, comments inside values. Long prose belongs in the body.
 */

export type Scalar = string | number | boolean | null;
export type FMValue = Scalar | Scalar[] | Record<string, Scalar>[];
export type Frontmatter = Record<string, FMValue>;

const DELIM = '---';

function parseScalar(raw: string): Scalar {
  const v = raw.trim();
  if (v === '') return '';
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length > 1) ||
    (v.startsWith("'") && v.endsWith("'") && v.length > 1)
  ) {
    const inner = v.slice(1, -1);
    // Only double quotes carry escapes, matching YAML.
    return v[0] === '"'
      ? inner.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      : inner;
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

// Split on commas that are not inside quotes.
function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\' && quote === '"') {
        cur += c + (s[++i] ?? '');
        continue;
      }
      if (c === quote) quote = null;
      cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim() !== '') out.push(cur);
  return out;
}

function parseInlineArray(raw: string): Scalar[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (inner === '') return [];
  return splitTopLevel(inner).map(parseScalar);
}

/** Split a `key: value` line, respecting quotes in the value. */
function splitKey(line: string): [string, string] | null {
  const m = /^([A-Za-z_][A-Za-z0-9_-]*):(.*)$/.exec(line);
  if (!m) return null;
  return [m[1], m[2]];
}

export function parseFrontmatter(source: string): {
  data: Frontmatter;
  body: string;
} {
  const text = source.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith(DELIM + '\n')) return { data: {}, body: text };

  const end = text.indexOf('\n' + DELIM, DELIM.length);
  if (end === -1) throw new Error('Frontmatter opened but never closed');

  const block = text.slice(DELIM.length + 1, end);
  const afterDelim = end + 1 + DELIM.length;
  const body = text.slice(afterDelim).replace(/^[^\n]*\n?/, '');

  const data: Frontmatter = {};
  const lines = block.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      throw new Error(`Unexpected indentation at frontmatter line ${i + 1}`);
    }

    const kv = splitKey(line);
    if (!kv) throw new Error(`Malformed frontmatter line ${i + 1}: ${line}`);
    const [key, rest] = kv;
    const value = rest.trim();

    if (value.startsWith('[')) {
      if (!value.endsWith(']')) {
        throw new Error(`Unterminated inline array for "${key}"`);
      }
      data[key] = parseInlineArray(value);
      continue;
    }

    if (value !== '') {
      data[key] = parseScalar(value);
      continue;
    }

    // Empty value: either an empty key or a block list of objects beneath it.
    const objects: Record<string, Scalar>[] = [];
    let cur: Record<string, Scalar> | null = null;
    let j = i + 1;
    for (; j < lines.length; j++) {
      const l = lines[j];
      if (l.trim() === '') continue;
      if (!/^\s/.test(l)) break; // back to top level

      const itemMatch = /^\s+-\s+(.*)$/.exec(l);
      if (itemMatch) {
        cur = {};
        objects.push(cur);
        const inner = splitKey(itemMatch[1].trim());
        if (!inner) throw new Error(`Malformed list item at line ${j + 1}`);
        cur[inner[0]] = parseScalar(inner[1]);
        continue;
      }
      const inner = splitKey(l.trim());
      if (!inner || !cur) {
        throw new Error(`Malformed nested frontmatter at line ${j + 1}: ${l}`);
      }
      cur[inner[0]] = parseScalar(inner[1]);
    }
    data[key] = objects;
    i = j - 1;
  }

  return { data, body };
}

const NEEDS_QUOTES = /^[\s>|@`&*!%#{}[\],]|[:#]\s|^-\s|^$|\s$|\n/;
// Inside `[a, b]` a comma or bracket is structural, so any item containing one
// must be quoted or it silently splits into extra items on the way back in.
const NEEDS_QUOTES_INLINE = /[,[\]]/;

function dumpScalar(v: Scalar, inline = false): string {
  if (v === null) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  // Quote anything that could be re-read as another type or break the grammar.
  if (
    NEEDS_QUOTES.test(v) ||
    (inline && NEEDS_QUOTES_INLINE.test(v)) ||
    ['true', 'false', 'null', '~'].includes(v) ||
    /^-?\d+(\.\d+)?$/.test(v)
  ) {
    return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return v;
}

export function stringifyFrontmatter(data: Frontmatter, body: string): string {
  const lines: string[] = [DELIM];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        lines.push(`${key}:`);
        for (const obj of value as Record<string, Scalar>[]) {
          const entries = Object.entries(obj);
          entries.forEach(([k, v], idx) => {
            lines.push(`${idx === 0 ? '  - ' : '    '}${k}: ${dumpScalar(v)}`);
          });
        }
      } else {
        lines.push(
          `${key}: [${(value as Scalar[]).map((v) => dumpScalar(v, true)).join(', ')}]`
        );
      }
    } else {
      lines.push(`${key}: ${dumpScalar(value)}`);
    }
  }
  lines.push(DELIM, '');
  return lines.join('\n') + body.replace(/^\n+/, '');
}
