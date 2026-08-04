/**
 * Generate an article's hero and social card.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every post needs images and there was no way to make them. They had been
 * produced by hand, session by session, which meant the one time nobody
 * remembered, an article shipped without any — and nothing caught it, because
 * the frontmatter treated them as optional. A step that only happens when
 * someone remembers is not part of a process.
 *
 * WHAT THE PICTURE IS
 * -------------------
 * The post's central contrast, staged as two panels: what I believed on top,
 * what turned out to be true underneath. The second panel is a saturated field
 * of the colour that names the outcome, so the image says which way the story
 * went before a word is read.
 *
 * That is deliberately not a title template — the headline already carries the
 * words, and a picture that repeats them is worth nothing. It is also
 * deliberately not a photograph: every claim on this site is a receipt, and a
 * generated scene is the opposite of a receipt.
 *
 * THE THREE IMAGES, AND WHY THEY DIFFER
 * -------------------------------------
 *   <slug>-hero.webp        the in-page card, on the dark ground
 *   <slug>-hero-light.webp  the same art re-grounded on paper
 *   <slug>.webp             the social card
 *
 * The hero ships in both themes because the site does. One dark image punched a
 * black slab into the paper theme for every visitor whose OS is set to light —
 * the images were the darkest thing on a warm page and read as holes, not
 * pictures. The social card is dark only: a feed has no theme to match, and the
 * warm charcoal is what reads as this site in a column of white boxes.
 *
 * SIZED FOR THE SMALLEST PLACE IT APPEARS
 * ---------------------------------------
 * The binding constraint is the Field Notes grid, where the hero renders about
 * 500px wide — roughly 40% of the source. Type is set so the phrases still read
 * at that size, which is why there are few words and they are large. An earlier
 * version set 20px value text inside a card occupying a fifth of the frame: it
 * was legible in the file and illegible everywhere it was actually used.
 *
 * NO NEW DEPENDENCIES
 * -------------------
 * Headless Chrome renders AND encodes it — given a `.webp` output path it
 * writes real WebP, so nothing has to convert anything. (macOS `sips` lists
 * webp in `--formats` but can only read it; asking it to write one fails with
 * "Can't write format".) Adding a browser automation library to a content repo
 * to draw some rectangles is a poor trade.
 *
 * USAGE
 *   node scripts/make-hero.mjs <slug> [spec.json] [--force]
 *
 * With no spec it derives a plain card from the post's own frontmatter, which
 * wastes the image. A spec is how you get a good one:
 *
 *   {
 *     "tone": "bad",
 *     "before": { "label": "WHAT MY DASHBOARD SAID", "text": "Published" },
 *     "after":  { "label": "WHAT THE URL SAID", "text": "404",
 *                 "detail": "52 passing tests · 0 caught it" },
 *     "headline": [
 *       { "t": "My dashboard said " },
 *       { "t": "published.", "tone": "good" },
 *       { "t": " The URL said " },
 *       { "t": "404.", "tone": "bad" }
 *     ],
 *     "alt": "One sentence describing the image for someone who can't see it."
 *   }
 *
 * `tone` picks the field colour of the second panel and defaults to `bad`,
 * because the contrast this site publishes is usually a correction. Every tone
 * is an on-token value from DESIGN.md — there are no colours here the design
 * system has not already cleared.
 *
 * An existing hero is never replaced unless `--force` is passed: a real
 * screenshot or photograph beats anything drawn here.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const POSTS = 'src/content/posts';
const OUT = 'public/images/content';
const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fonts');
const W = 1200;
const H = 630;

/**
 * Both themes, mirroring the `--sd-*` tokens in globals.css. Dark is not a
 * darkened light: the ground is a warm charcoal and the surface lifts one
 * visible step above it, the same relationship paper has to its cards.
 */
const THEMES = {
  dark: {
    bg: '#14100c',
    surface: '#241d15',
    text: '#f4efe5',
    dim: '#b7ad9d',
    accent: '#f4834b',
    rule: 'rgba(245, 239, 227, 0.14)',
  },
  light: {
    bg: '#f4efe4',
    surface: '#fdfbf6',
    text: '#1a1714',
    dim: '#6b6560',
    accent: '#c2410c',
    rule: 'rgba(26, 23, 20, 0.10)',
  },
};

/**
 * The field colours: the *ink* values from DESIGN.md, not the arcade brights.
 * The brights are cleared for decorative fills only and this panel carries
 * text. Every value below clears AA against the paper-toned foreground, and
 * the field does not change with the theme — only the ground around it does.
 */
const FIELD_FG = '#f9f5ec';
const TONES = {
  bad: '#b91c1c', // bear ink
  good: '#166534', // bull ink
  warn: '#92400e', // warn ink / badge-secondary
  info: '#1d4ed8', // arcade blue ink
  accent: '#c2410c', // the one warm accent
};

/** On the dark social card the headline spans use the flipped bright inks. */
const HEADLINE_INK = {
  bad: '#f87171',
  good: '#4ade80',
  warn: '#f2b483',
  info: '#60a5fa',
  accent: '#f4834b',
};

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const [slug, specPath] = argv.filter((a) => a !== '--force');

if (!slug) {
  console.error('usage: node scripts/make-hero.mjs <slug> [spec.json] [--force]');
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME} — needed to render the card.`);
  process.exit(1);
}

const postPath = path.join(POSTS, `${slug}.md`);
if (!existsSync(postPath)) {
  console.error(`No such article: ${postPath}`);
  process.exit(1);
}

/** Frontmatter only — enough to title the card, without the app's parser. */
function frontmatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end === -1) return {};
  const out = {};
  for (const line of text.slice(4, end).split('\n')) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const raw = readFileSync(postPath, 'utf8');
const fm = frontmatter(raw);
const spec = specPath ? JSON.parse(readFileSync(specPath, 'utf8')) : {};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * The site's own faces, embedded from disk. next/font fetches these at build
 * time into .next, which this script cannot see, so they are vendored beside
 * it — otherwise Chrome silently falls back to Georgia and the cards go out in
 * a serif the site never uses. Both are the latin variable subsets, so one file
 * covers every weight, and Fraunces keeps its optical-size axis.
 */
function fontFace(family, file) {
  const p = path.join(FONT_DIR, file);
  if (!existsSync(p)) {
    console.warn(`  ! scripts/fonts/${file} missing — falling back to a system face`);
    return '';
  }
  return `@font-face{font-family:'${family}';font-weight:100 900;font-style:normal;
    font-display:block;src:url('file://${p}') format('woff2')}`;
}

const FONTS = fontFace('Fraunces', 'fraunces.woff2') + fontFace('InterCard', 'inter.woff2');
const DISPLAY = `Fraunces, Georgia, 'Times New Roman', serif`;
const SANS = `InterCard, system-ui, -apple-system, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, Menlo, monospace`;

/**
 * Shrink a long phrase rather than let it wrap into a paragraph. A panel is a
 * place for a clause, not a sentence; when the clause runs long the type steps
 * down instead of the layout growing a fourth line.
 */
function fitSize(text, max, min, budget) {
  const n = String(text ?? '').length;
  if (n <= budget) return max;
  return Math.max(min, Math.round(max * Math.sqrt(budget / n)));
}

/**
 * Accept the current spec shape, and fold the older `rows` shape into it so
 * specs written before the redesign still render.
 */
function readPanels() {
  if (spec.before || spec.after) {
    return {
      before: spec.before ?? { label: 'BEFORE', text: fm.title ?? slug },
      after: spec.after ?? { label: 'AFTER', text: '' },
      tone: spec.tone ?? spec.after?.tone ?? 'bad',
    };
  }
  if (Array.isArray(spec.rows) && spec.rows.length) {
    const [a, b] = spec.rows;
    return {
      before: { label: a.label, text: a.value },
      after: b ? { label: b.label, text: b.value } : { label: '', text: '' },
      tone: spec.tone ?? b?.tone ?? 'bad',
    };
  }
  return {
    before: { label: (fm.category ?? 'Article').toUpperCase(), text: fm.title ?? slug },
    after: { label: '', text: '' },
    tone: spec.tone ?? 'accent',
  };
}

const { before, after, tone } = readPanels();
const field = TONES[tone] ?? TONES.bad;
const headline = spec.headline ?? [{ t: fm.title ?? slug }];

const RESET = `*{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;-webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility}`;

/**
 * The hero. Full bleed, two panels, no inner card: the article already frames
 * it in a bordered figure, and a card inside a card is one border too many.
 */
function heroHtml(theme) {
  const t = THEMES[theme];
  return `<!doctype html><meta charset="utf-8"><style>${FONTS}${RESET}
  body{display:flex;flex-direction:column;background:${t.bg};font-family:${SANS}}
  .panel{display:flex;flex-direction:column;justify-content:center;
    gap:20px;padding:0 68px}
  .a{flex:0 0 282px;background:${t.surface};border-bottom:1px solid ${t.rule}}
  .b{flex:1 1 auto;background:${field}}
  .label{font-family:${MONO};font-size:21px;font-weight:500;letter-spacing:.15em;
    text-transform:uppercase}
  .a .label{color:${t.dim}}
  .b .label{color:rgba(249,245,236,.82)}
  .phrase{font-family:${DISPLAY};font-weight:600;line-height:1.08;
    letter-spacing:-.015em}
  .a .phrase{color:${t.text};font-size:${fitSize(before.text, 60, 40, 30)}px}
  .b .phrase{color:${FIELD_FG};font-size:${fitSize(after.text, 60, 40, 30)}px}
  .detail{font-family:${MONO};font-size:20px;color:rgba(249,245,236,.78);
    letter-spacing:.02em}
</style>
<div class="panel a">
  ${before.label ? `<div class="label">${esc(before.label)}</div>` : ''}
  <div class="phrase">${esc(before.text)}</div>
</div>
<div class="panel b">
  ${after.label ? `<div class="label">${esc(after.label)}</div>` : ''}
  <div class="phrase">${esc(after.text)}</div>
  ${after.detail ? `<div class="detail">${esc(after.detail)}</div>` : ''}
</div>`;
}

/** The social card: headline, the evidence beneath it, then the domain. */
function ogHtml() {
  const t = THEMES.dark;
  const chars = headline.map((h) => h.t).join('').length;
  return `<!doctype html><meta charset="utf-8"><style>${FONTS}${RESET}
  body{display:flex;flex-direction:column;background:${t.bg};font-family:${SANS}}
  /* The flex centring lives on the wrapper, never on the heading: an h1 that
     is itself a flex container turns each coloured span into a flex item and
     the sentence comes apart into separate boxes. */
  .head{flex:1 1 auto;display:flex;align-items:center;padding:0 68px}
  h1{font-family:${DISPLAY};font-weight:600;line-height:1.08;letter-spacing:-.015em;
    color:${t.text};font-size:${fitSize('x'.repeat(chars), 58, 38, 62)}px}
  .evidence{flex:0 0 194px;display:flex}
  .cell{flex:1 1 0;display:flex;flex-direction:column;justify-content:center;
    gap:13px;padding:0 44px;min-width:0}
  .one{background:${t.surface}}
  .two{background:${field}}
  .label{font-family:${MONO};font-size:16px;font-weight:500;letter-spacing:.15em;
    text-transform:uppercase}
  .one .label{color:${t.dim}}
  .two .label{color:rgba(249,245,236,.82)}
  .val{font-family:${DISPLAY};font-weight:600;font-size:31px;line-height:1.15;
    letter-spacing:-.01em;overflow:hidden;display:-webkit-box;
    -webkit-line-clamp:2;-webkit-box-orient:vertical}
  .one .val{color:${t.text}}
  .two .val{color:${FIELD_FG}}
  footer{flex:0 0 82px;display:flex;align-items:center;justify-content:space-between;
    padding:0 68px;font-size:19px;font-weight:600;color:${t.text}}
  .cat{font-family:${MONO};font-size:15px;font-weight:500;letter-spacing:.15em;
    text-transform:uppercase;color:${t.accent}}
</style>
<div class="head"><h1>${headline
    .map((h) =>
      h.tone && HEADLINE_INK[h.tone]
        ? `<span style="color:${HEADLINE_INK[h.tone]}">${esc(h.t)}</span>`
        : esc(h.t),
    )
    .join('')}</h1></div>
<div class="evidence">
  <div class="cell one">
    ${before.label ? `<div class="label">${esc(before.label)}</div>` : ''}
    <div class="val">${esc(before.text)}</div>
  </div>
  <div class="cell two">
    ${after.label ? `<div class="label">${esc(after.label)}</div>` : ''}
    <div class="val">${esc(after.text)}</div>
  </div>
</div>
<footer>
  <span>smartdisruptions.com</span>
  <span class="cat">${esc(fm.category ?? '')}</span>
</footer>`;
}

const tmp = mkdtempSync(path.join(tmpdir(), 'hero-'));
function render(html, outWebp) {
  const htmlPath = path.join(tmp, 'card.html');
  writeFileSync(htmlPath, html);
  // Chrome picks the encoder from the output extension, so this writes WebP
  // directly — no separate conversion step and nothing else to install. The
  // virtual-time budget lets the embedded faces load before the shot; without
  // it the screenshot can beat the @font-face and go out in the fallback.
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--virtual-time-budget=3000',
      '--allow-file-access-from-files',
      `--screenshot=${outWebp}`,
      `--window-size=${W},${H}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore' },
  );
  if (!existsSync(outWebp)) throw new Error(`Chrome did not write ${outWebp}`);
}

// A post may already have a hero that is not generated — an app screenshot, a
// real photograph. Those are better than anything drawn here, so never replace
// one by accident: --force is how you say you meant it.
const hasHero = /^heroImage:/m.test(raw);
const heroOut = path.join(OUT, `${slug}-hero.webp`);
const heroLightOut = path.join(OUT, `${slug}-hero-light.webp`);
const ogOut = path.join(OUT, `${slug}.webp`);

let wroteHero = false;
if (hasHero && !force) {
  console.log('  hero already set — social card only (--force to replace it)');
} else {
  render(heroHtml('dark'), heroOut);
  render(heroHtml('light'), heroLightOut);
  wroteHero = true;
  console.log(`  ${heroOut}`);
  console.log(`  ${heroLightOut}`);
}
render(ogHtml(), ogOut);
console.log(`  ${ogOut}`);
rmSync(tmp, { recursive: true, force: true });

// Wire them into the article. Writing the frontmatter is the point: an image
// nobody referenced is the same as no image.
let text = raw;
const setKey = (key, value) => {
  const line = `${key}: ${/[:#"']/.test(value) ? JSON.stringify(value) : value}`;
  const re = new RegExp(`^${key}:.*$`, 'm');
  if (re.test(text)) {
    text = text.replace(re, line);
  } else {
    // Frontmatter ends at the first closing fence; append just above it.
    const end = text.indexOf('\n---', 4);
    text = text.slice(0, end) + `\n${line}` + text.slice(end);
  }
};

if (wroteHero) {
  setKey('heroImage', `/images/content/${slug}-hero.webp`);
  setKey('heroImageLight', `/images/content/${slug}-hero-light.webp`);
  if (spec.alt) setKey('heroImageAlt', spec.alt);
}
setKey('ogImage', `/images/content/${slug}.webp`);

if (text !== raw) {
  writeFileSync(postPath, text);
  console.log(`  updated frontmatter in ${postPath}`);
}
