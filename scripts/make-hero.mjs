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
 * The post's central contrast — what I believed against what turned out to be
 * true — drawn as evidence rather than as a title card. The headline already
 * carries the words; a picture that repeats them is worth nothing. And never a
 * photograph: every claim on this site is a receipt, and a generated scene is
 * the opposite of a receipt.
 *
 * THREE TEMPLATES, AND WHY THE SPEC PICKS ONE
 * -------------------------------------------
 *   split     two panels, the second a saturated field. The default.
 *   count     one block per unit, filled for the ones that broke.
 *   console   the run that produced the finding, as a log.
 *
 * **The template is derived from the spec's shape, never named in it.** A spec
 * carrying `count` renders Count; one carrying `log` renders Console; anything
 * else renders Split. That is deliberate and it is the whole design: the only
 * question an author has to answer is *what evidence does this post have*, which
 * is a fact about the article. "Which template looks nicer here" is a taste call,
 * and taste calls do not survive a pipeline where three articles get written in
 * the same two minutes — they degrade quietly, and a wrong treatment reads worse
 * than a plain one.
 *
 * So: does the post carry a countable finding small enough to draw? Record it as
 * `count`. Is the evidence literally machine output? Record it as `log`. Neither?
 * Then it is a Split, and that is not a fallback — it is the majority case.
 *
 * THE SOCIAL CARD DOES NOT VARY
 * -----------------------------
 * One design, always, whichever template the hero used. The two images are doing
 * different jobs: the hero lives on an index where variety is the point, and the
 * social card lives in a feed where being recognisable is. Varying the thing that
 * appears next to other people's posts trades away the only cheap recognition
 * this site gets.
 *
 * THE THREE FILES
 * ---------------
 *   <slug>-hero.webp        the in-page and grid card, dark theme
 *   <slug>-hero-light.webp  the same art re-grounded on paper
 *   <slug>.webp             the social card
 *
 * The hero ships in both themes because the site does. One dark image punched a
 * black slab into the paper theme for every visitor whose OS is set to light.
 *
 * SIZED FOR THE SMALLEST PLACE IT APPEARS
 * ---------------------------------------
 * The binding constraint is the Field Notes grid, where a hero renders about
 * 500px wide — roughly 40% of the source. Type is set so the phrases still read
 * at that size, which is why there are few words and they are large.
 *
 * NO NEW DEPENDENCIES
 * -------------------
 * Headless Chrome renders AND encodes it — given a `.webp` output path it writes
 * real WebP, so nothing has to convert anything.
 *
 * USAGE
 *   node scripts/make-hero.mjs <slug> scripts/heroes/<slug>.json [--force]
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

/** Above this many units the blocks stop being countable at a glance. */
const MAX_BLOCKS = 12;

/**
 * Both themes, mirroring the `--sd-*` tokens in globals.css. Dark is not a
 * darkened light: the ground is a warm charcoal and the surface lifts one
 * visible step above it, the same relationship paper has to its cards.
 */
const THEMES = {
  dark: {
    bg: '#14100c',
    surface: '#241d15',
    lift: '#302619',
    text: '#f4efe5',
    dim: '#b7ad9d',
    accent: '#f4834b',
    rule: 'rgba(245, 239, 227, 0.14)',
    hair: 'rgba(245, 239, 227, 0.30)',
  },
  light: {
    bg: '#f4efe4',
    surface: '#fdfbf6',
    lift: '#ece5d7',
    text: '#1a1714',
    dim: '#6b6560',
    accent: '#c2410c',
    rule: 'rgba(26, 23, 20, 0.10)',
    hair: 'rgba(26, 23, 20, 0.26)',
  },
};

/**
 * Tone drives every coloured thing in an image. The `field` values are the ink
 * colours from DESIGN.md — text-safe, so paper-toned type clears AA on top of
 * them. The `bright` values are the dark-theme flips, used where the colour is
 * carrying meaning as ink (a chip, a figure) on the charcoal ground.
 *
 * The field colour does not change with the theme; only the ground around it
 * does. That is what keeps a post's image recognisably the same picture in both.
 */
const FIELD_FG = '#f9f5ec';
const TONES = {
  bad: { field: '#b91c1c', bright: '#f87171' },
  good: { field: '#166534', bright: '#4ade80' },
  warn: { field: '#92400e', bright: '#f2b483' },
  info: { field: '#1d4ed8', bright: '#60a5fa' },
  accent: { field: '#c2410c', bright: '#f4834b' },
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
 * time into .next, which this script cannot see, so they are vendored beside it
 * — otherwise Chrome silently falls back to Georgia and the cards go out in a
 * serif the site never uses.
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

const RESET = `*{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;-webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility}`;
const doc = (css, body) =>
  `<!doctype html><meta charset="utf-8"><style>${FONTS}${RESET}${css}</style>${body}`;

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

const before = spec.before ?? {
  label: (fm.category ?? 'Article').toUpperCase(),
  text: fm.title ?? slug,
};
const after = spec.after ?? { label: '', text: '' };
const tone = TONES[spec.tone] ? spec.tone : 'bad';
const T = TONES[tone];
const headline = spec.headline ?? [{ t: fm.title ?? slug }];

/**
 * Which template. Derived, never declared — see the header. A `count` too large
 * to draw falls back to Split rather than rendering forty unreadable slivers,
 * and says so, because a silent downgrade is how a rule stops being one.
 */
function chooseTemplate() {
  if (spec.count) {
    if (spec.count.of > MAX_BLOCKS) {
      console.warn(
        `  ! count.of is ${spec.count.of} (max ${MAX_BLOCKS} reads at card size) — rendering split`,
      );
      return 'split';
    }
    return 'count';
  }
  if (spec.log?.lines?.length) return 'console';
  return 'split';
}

/* SPLIT — two full-bleed panels, the second a saturated field. No inner card:
   the article already frames the hero in a bordered figure, and a card inside a
   card is one border too many. */
function split(k) {
  const t = THEMES[k];
  return doc(
    `body{display:flex;flex-direction:column;background:${t.bg};font-family:${SANS}}
     .p{display:flex;flex-direction:column;justify-content:center;gap:20px;padding:0 68px}
     .a{flex:0 0 282px;background:${t.surface};border-bottom:1px solid ${t.rule}}
     .b{flex:1 1 auto;background:${T.field}}
     .l{font-family:${MONO};font-size:21px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase}
     .a .l{color:${t.dim}} .b .l{color:rgba(249,245,236,.82)}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.08;letter-spacing:-.015em}
     .a .h{color:${t.text};font-size:${fitSize(before.text, 60, 40, 30)}px}
     .b .h{color:${FIELD_FG};font-size:${fitSize(after.text, 60, 40, 30)}px}
     .d{font-family:${MONO};font-size:20px;color:rgba(249,245,236,.78);letter-spacing:.02em}`,
    `<div class="p a">
       ${before.label ? `<div class="l">${esc(before.label)}</div>` : ''}
       <div class="h">${esc(before.text)}</div>
     </div>
     <div class="p b">
       ${after.label ? `<div class="l">${esc(after.label)}</div>` : ''}
       <div class="h">${esc(after.text)}</div>
       ${after.detail ? `<div class="d">${esc(after.detail)}</div>` : ''}
     </div>`,
  );
}

/* COUNT — the figure made geometry: one block per unit, filled for the ones
   that broke. The blocks are a fill, not text, so the bright ink is cleared for
   them on the dark ground; they are also the only element in any of the three
   templates that does not depend on type rendering to be read. */
function countCard(k) {
  const t = THEMES[k];
  const c = spec.count;
  const fill = k === 'dark' ? T.bright : T.field;
  const blocks = Array.from({ length: c.of }, (_, i) =>
    i < c.hit
      ? `<span style="background:${fill};flex:1;border-radius:4px"></span>`
      : `<span style="border:2px solid ${t.hair};flex:1;border-radius:4px"></span>`,
  ).join('');
  return doc(
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:38px;padding:0 74px}
     .l{font-family:${MONO};font-size:21px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase;color:${t.dim}}
     .blocks{display:flex;gap:14px;height:130px}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.06;letter-spacing:-.02em;
       color:${t.text};font-size:${fitSize(c.verdict, 64, 44, 26)}px}
     .h em{font-style:normal;color:${k === 'dark' ? T.bright : T.field}}
     .d{font-family:${MONO};font-size:20px;letter-spacing:.04em;color:${t.dim}}`,
    `<div class="l">${esc(c.of)} ${esc(c.unit)}</div>
     <div class="blocks">${blocks}</div>
     <div class="h"><em>${esc(c.hit)} of ${esc(c.of)}</em> ${esc(c.verdict)}</div>
     ${c.detail ? `<div class="d">${esc(c.detail)}</div>` : ''}`,
  );
}

/* CONSOLE — the run that produced the finding. Severity chips carry the colour,
   which is the one place in the system where a bright ink is unambiguously
   encoding state rather than decorating. */
function logCard(k) {
  const t = THEMES[k];
  const l = spec.log;
  const ink = (name) => {
    const tn = TONES[name] ?? T;
    return k === 'dark' ? tn.bright : tn.field;
  };
  const lines = l.lines
    .map(
      (ln) => `
      <div class="line">
        <span class="chip" style="color:${ink(ln.tone)};border-color:${ink(ln.tone)}">${esc(ln.chip)}</span>
        <span class="txt${ln.muted ? ' muted' : ''}">${esc(ln.text)}</span>
      </div>`,
    )
    .join('');
  return doc(
    `body{background:${t.bg};font-family:${MONO};padding:76px 60px}
     .win{height:100%;background:${t.surface};border:1px solid ${t.rule};border-radius:12px;
       overflow:hidden;display:flex;flex-direction:column}
     .bar{display:flex;align-items:center;gap:10px;padding:16px 22px;background:${t.lift};
       border-bottom:1px solid ${t.rule}}
     .dot{width:12px;height:12px;border-radius:50%;background:${t.rule}}
     .name{margin-left:8px;font-size:17px;color:${t.dim};letter-spacing:.06em}
     .body{flex:1;padding:26px 30px;display:flex;flex-direction:column;gap:20px;
       justify-content:center}
     .line{display:flex;align-items:center;gap:18px}
     .chip{border:1px solid;border-radius:3px;padding:3px 10px;font-size:17px;
       font-weight:600;letter-spacing:.1em;white-space:nowrap}
     .txt{font-size:25px;color:${t.text};letter-spacing:-.01em}
     .muted{color:${t.dim}}
     .sum{font-family:${DISPLAY};font-weight:600;letter-spacing:-.015em;
       color:${k === 'dark' ? T.bright : T.field};padding-top:20px;
       border-top:1px solid ${t.rule};font-size:${fitSize(l.summary, 42, 30, 30)}px}`,
    `<div class="win">
       <div class="bar">
         <span class="dot"></span><span class="dot"></span><span class="dot"></span>
         <span class="name">${esc(l.name)}</span>
       </div>
       <div class="body">
         ${lines}
         ${l.summary ? `<div class="sum">${esc(l.summary)}</div>` : ''}
       </div>
     </div>`,
  );
}

const TEMPLATES = { split, count: countCard, console: logCard };

/** The social card. One design for every template — see the header. */
function ogHtml() {
  const t = THEMES.dark;
  const chars = headline.map((h) => h.t).join('').length;
  return doc(
    `body{display:flex;flex-direction:column;background:${t.bg};font-family:${SANS}}
     .head{flex:1 1 auto;display:flex;align-items:center;padding:0 68px}
     h1{font-family:${DISPLAY};font-weight:600;line-height:1.08;letter-spacing:-.015em;
       color:${t.text};font-size:${fitSize('x'.repeat(chars), 58, 38, 62)}px}
     .evidence{flex:0 0 194px;display:flex}
     .cell{flex:1 1 0;display:flex;flex-direction:column;justify-content:center;gap:13px;
       padding:0 44px;min-width:0}
     .one{background:${t.surface}} .two{background:${T.field}}
     .l{font-family:${MONO};font-size:16px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase}
     .one .l{color:${t.dim}} .two .l{color:rgba(249,245,236,.82)}
     .v{font-family:${DISPLAY};font-weight:600;font-size:31px;line-height:1.15;
       letter-spacing:-.01em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;
       -webkit-box-orient:vertical}
     .one .v{color:${t.text}} .two .v{color:${FIELD_FG}}
     footer{flex:0 0 82px;display:flex;align-items:center;justify-content:space-between;
       padding:0 68px;font-size:19px;font-weight:600;color:${t.text}}
     .cat{font-family:${MONO};font-size:15px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase;color:${t.accent}}`,
    `<div class="head"><h1>${headline
      .map((h) =>
        h.tone && TONES[h.tone]
          ? `<span style="color:${TONES[h.tone].bright}">${esc(h.t)}</span>`
          : esc(h.t),
      )
      .join('')}</h1></div>
     <div class="evidence">
       <div class="cell one">
         ${before.label ? `<div class="l">${esc(before.label)}</div>` : ''}
         <div class="v">${esc(before.text)}</div>
       </div>
       <div class="cell two">
         ${after.label ? `<div class="l">${esc(after.label)}</div>` : ''}
         <div class="v">${esc(after.text)}</div>
       </div>
     </div>
     <footer>
       <span>smartdisruptions.com</span>
       <span class="cat">${esc(fm.category ?? '')}</span>
     </footer>`,
  );
}

const tmp = mkdtempSync(path.join(tmpdir(), 'hero-'));
function render(html, outWebp) {
  const htmlPath = path.join(tmp, 'card.html');
  writeFileSync(htmlPath, html);
  // Chrome picks the encoder from the output extension, so this writes WebP
  // directly. The virtual-time budget lets the embedded faces load before the
  // shot; without it the screenshot can beat the @font-face.
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
// real photograph. Those beat anything drawn here, so never replace one by
// accident: --force is how you say you meant it.
const hasHero = /^heroImage:/m.test(raw);
const heroOut = path.join(OUT, `${slug}-hero.webp`);
const heroLightOut = path.join(OUT, `${slug}-hero-light.webp`);
const ogOut = path.join(OUT, `${slug}.webp`);

let wroteHero = false;
if (hasHero && !force) {
  console.log('  hero already set — social card only (--force to replace it)');
} else {
  const template = chooseTemplate();
  const draw = TEMPLATES[template];
  render(draw('dark'), heroOut);
  render(draw('light'), heroLightOut);
  wroteHero = true;
  console.log(`  template: ${template}`);
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
