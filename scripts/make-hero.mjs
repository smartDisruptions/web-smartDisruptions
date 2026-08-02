/**
 * Generate an article's hero and social card.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every post needs two images and there was no way to make them. They had been
 * produced by hand, session by session, which meant the one time nobody
 * remembered, an article shipped without any — and nothing caught it, because
 * the frontmatter treated them as optional. A step that only happens when
 * someone remembers is not part of a process.
 *
 * THE TWO IMAGES, AND WHY THEY DIFFER
 * -----------------------------------
 *   <slug>-hero.webp   the card alone, centred. Sits at the top of the article,
 *                      under a headline the page already renders — so repeating
 *                      the title inside it would say everything twice.
 *   <slug>.webp        the social card. Nobody sees the page's headline when
 *                      this is what got shared, so it carries its own: eyebrow,
 *                      serif headline, the same card, and the domain.
 *
 * The card is a small UI mock of the post's central contrast — what I believed
 * next to what was true. That is deliberately not a generic title template: the
 * image is worth making because it carries the argument, and a template would
 * only carry the words that are already in the headline.
 *
 * NO NEW DEPENDENCIES
 * -------------------
 * Headless Chrome renders AND encodes it — given a `.webp` output path it
 * writes real WebP, so nothing has to convert anything. (macOS `sips` lists
 * webp in `--formats` but can only read it; asking it to write one fails with
 * "Can't write format".) Adding a browser automation library to a content repo
 * to draw two rectangles is a poor trade.
 *
 * USAGE
 *   node scripts/make-hero.mjs <slug> [spec.json]
 *
 * With no spec it derives a plain card from the post's own frontmatter. A spec
 * is how you get a good one:
 *
 *   {
 *     "headline": [
 *       { "t": "My dashboard said " },
 *       { "t": "published.", "tone": "good" },
 *       { "t": " The URL said " },
 *       { "t": "404.", "tone": "bad" }
 *     ],
 *     "rows": [
 *       { "label": "WHAT MY DASHBOARD SAID", "value": "You don't get replaced…",
 *         "badge": "PUBLISHED", "tone": "good" },
 *       { "label": "WHAT THE URL SAID", "value": "/content/you-dont…",
 *         "badge": "404", "tone": "bad" }
 *     ],
 *     "alt": "One sentence describing the image for someone who can't see it."
 *   }
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const POSTS = 'src/content/posts';
const OUT = 'public/images/content';
const W = 1200;
const H = 630;

const T = {
  bg: '#14100c',
  surface: '#241d15',
  border: 'rgba(245, 239, 227, 0.22)',
  text: '#f4efe5',
  dim: '#b7ad9d',
  accent: '#f4834b',
  good: '#5ed99a',
  bad: '#f87171',
};

const [slug, specPath] = process.argv.slice(2);
if (!slug) {
  console.error('usage: node scripts/make-hero.mjs <slug> [spec.json]');
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

const toneColor = (tone) =>
  tone === 'good' ? T.good : tone === 'bad' ? T.bad : T.dim;

const headline = spec.headline ?? [{ t: fm.title ?? slug }];
const rows =
  spec.rows ??
  [{ label: (fm.category ?? 'Article').toUpperCase(), value: fm.title ?? slug }];

const cardHtml = `
<div class="card">
  ${rows
    .map(
      (r, i) => `
    <div class="row${i ? ' sep' : ''}">
      <div class="label">${esc(r.label)}</div>
      <div class="line">
        <span class="value">${esc(r.value)}</span>
        ${
          r.badge
            ? `<span class="badge" style="color:${toneColor(r.tone)};border-color:${toneColor(r.tone)}">${esc(r.badge)}</span>`
            : ''
        }
      </div>
    </div>`,
    )
    .join('')}
</div>`;

const base = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;background:${T.bg};
    font-family:Inter,system-ui,-apple-system,'Helvetica Neue',sans-serif;
    -webkit-font-smoothing:antialiased}
  .card{background:${T.surface};border:1px solid ${T.border};border-radius:16px;
    padding:26px 30px;display:flex;flex-direction:column;gap:18px}
  .row{display:flex;flex-direction:column;gap:10px}
  .sep{border-top:1px solid ${T.border};padding-top:18px}
  .label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;
    letter-spacing:.14em;text-transform:uppercase;color:${T.dim}}
  .line{display:flex;align-items:center;justify-content:space-between;gap:20px}
  .value{color:${T.text};font-size:20px;white-space:nowrap;overflow:hidden;
    text-overflow:ellipsis}
  .badge{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;
    font-weight:600;letter-spacing:.08em;border:1px solid;border-radius:999px;
    padding:5px 13px;white-space:nowrap}
`;

const heroHtml = `<!doctype html><meta charset="utf-8"><style>${base}
  body{display:flex;align-items:center;justify-content:center}
  .card{width:600px}
</style>${cardHtml}`;

const ogHtml = `<!doctype html><meta charset="utf-8"><style>${base}
  body{display:grid;grid-template-columns:1fr 1fr;align-items:center;
    gap:40px;padding:0 70px}
  .eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:17px;
    font-weight:700;letter-spacing:.16em;text-transform:uppercase;
    color:${T.accent};margin-bottom:26px}
  h1{font-family:Fraunces,Georgia,'Times New Roman',serif;font-size:56px;
    line-height:1.06;font-weight:600;color:${T.text};letter-spacing:-.01em}
  .domain{margin-top:30px;font-size:19px;font-weight:600;color:${T.text}}
  .card{width:100%}
  .value{font-size:17px}
  .label{font-size:12px}
  .badge{font-size:12px}
</style>
<div>
  <div class="eyebrow">${esc(fm.category ?? '')}</div>
  <h1>${headline
    .map((h) =>
      h.tone
        ? `<span style="color:${toneColor(h.tone)}">${esc(h.t)}</span>`
        : esc(h.t),
    )
    .join('')}</h1>
  <div class="domain">smartdisruptions.com</div>
</div>
${cardHtml}`;

const tmp = mkdtempSync(path.join(tmpdir(), 'hero-'));
function render(html, outWebp) {
  const htmlPath = path.join(tmp, 'card.html');
  writeFileSync(htmlPath, html);
  // Chrome picks the encoder from the output extension, so this writes WebP
  // directly — no separate conversion step and nothing else to install.
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--screenshot=${outWebp}`,
      `--window-size=${W},${H}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'ignore' },
  );
  if (!existsSync(outWebp)) {
    throw new Error(`Chrome did not write ${outWebp}`);
  }
}

// A post may already have a hero that is not generated — an app screenshot, a
// real photograph. Those are better than anything drawn here, so never replace
// one: generate only what is actually missing.
const hasHero = /^heroImage:/m.test(raw);
const heroOut = path.join(OUT, `${slug}-hero.webp`);
const ogOut = path.join(OUT, `${slug}.webp`);

if (hasHero) {
  console.log(`  hero already set — generating the social card only`);
} else {
  render(heroHtml, heroOut);
  console.log(`  ${heroOut}`);
}
render(ogHtml, ogOut);
console.log(`  ${ogOut}`);
rmSync(tmp, { recursive: true, force: true });

// Wire them into the article, unless they are already there. Writing the
// frontmatter is the point: an image nobody referenced is the same as no image.
const alt =
  spec.alt ??
  `A card contrasting ${rows.map((r) => r.label.toLowerCase()).join(' with ')}.`;
// Add only the keys that are missing. All-or-nothing would skip the social card
// for any post that already had a hero — which is exactly the pair of published
// posts that turned out to have no card at all.
const add = [];
if (!hasHero) {
  add.push(`heroImage: /images/content/${slug}-hero.webp`);
}
if (!/^heroImageAlt:/m.test(raw)) add.push(`heroImageAlt: ${alt}`);
if (!/^ogImage:/m.test(raw)) add.push(`ogImage: /images/content/${slug}.webp`);

if (add.length) {
  const end = raw.indexOf('\n---', 4);
  writeFileSync(postPath, raw.slice(0, end) + '\n' + add.join('\n') + raw.slice(end));
  console.log(`  wired into ${postPath}: ${add.map((a) => a.split(':')[0]).join(', ')}`);
} else {
  console.log(`  ${postPath} already complete — left alone`);
}
