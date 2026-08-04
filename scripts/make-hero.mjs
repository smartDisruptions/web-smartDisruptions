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
 * THE TEMPLATES, AND WHY THE SPEC PICKS ONE
 * -----------------------------------------
 *   evidence key   template   the picture
 *   —              split      two panels, the second a saturated field
 *   count          count      one block per unit, filled for the ones that broke
 *   log            console    the run that produced the finding
 *   record         receipt    a ledger of findings, verdict stamped across it
 *   statement      field      one colour, one sentence reversed out of it
 *
 * **The template is derived from the spec's shape, never named in it.** Each
 * template owns one evidence key; carrying that key is what selects it. There is
 * no `template` field and adding one would be a mistake: it would hand an author
 * a taste call where they currently have only a fact to record.
 *
 * The single question is *what evidence does this post have*, which is a fact
 * about the article. "Which template looks nicer here" is taste, and taste does
 * not survive a pipeline where three articles get written in the same two
 * minutes — it degrades quietly, and a wrong treatment reads worse than a plain
 * one. No evidence key at all means Split, which is the majority case rather
 * than a fallback.
 *
 * Exactly one key may be present. Two is an authoring mistake and throws, rather
 * than being resolved by a precedence table: a post has one central piece of
 * evidence, and if two of these look right then the spec has not yet decided
 * what the article is about.
 *
 * See REGISTRY below for how to add a sixth.
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
 * The template registry.
 *
 * Each entry owns one **evidence key**. If the spec carries that key, that
 * template renders. Nothing else selects: there is no `template` field in a
 * spec, and adding one would give an author a taste call to make where they
 * currently only have a fact to record.
 *
 * ADDING A TEMPLATE
 * -----------------
 * Append an entry with a `key` no other template claims, a `render(theme)`, and
 * optionally a `check` returning a string when the data cannot be drawn. Then
 * document the key in AGENTS.md. Nothing else in this file changes — that is the
 * whole point of the registry, and the reason a sixth costs what the fifth did.
 *
 * The new template's key has to be a genuinely different *shape of evidence*,
 * not a mood. `count` is a tally, `log` is machine output, `record` is a ledger
 * of findings, `statement` is a single sentence. If a proposed template would
 * read from the same keys as an existing one, it is a restyle of that template,
 * not a new one, and the honest move is to change the existing renderer.
 *
 * `split` is last and claims no key: it is what renders when a post carries no
 * special evidence, which is the majority case rather than a fallback.
 */
const REGISTRY = [
  {
    name: 'count',
    key: 'count',
    render: (k) => countCard(k),
    check: (c) =>
      c.of > MAX_BLOCKS
        ? `count.of is ${c.of}; above ${MAX_BLOCKS} the blocks stop being countable at a glance`
        : null,
  },
  {
    name: 'console',
    key: 'log',
    render: (k) => logCard(k),
    check: (l) => (l.lines?.length ? null : 'log.lines is empty'),
  },
  {
    name: 'receipt',
    key: 'record',
    render: (k) => receiptCard(k),
    check: (r) => (r.rows?.length ? null : 'record.rows is empty'),
  },
  {
    name: 'field',
    key: 'statement',
    render: (k) => fieldCard(k),
    check: (s) => (s.loud ? null : 'statement.loud is required — it is the line that carries'),
  },
  { name: 'split', key: null, render: (k) => split(k) },
];

/**
 * Which template. Exactly one evidence key may be present.
 *
 * Two keys is an authoring mistake, not a precedence puzzle, so it throws rather
 * than silently ranking them: a post has one central piece of evidence, and if
 * two look right the spec has not decided what the article is actually about.
 * Unusable data for an otherwise-valid key falls back to split and says why —
 * a silent downgrade is how a rule stops being one.
 */
function chooseTemplate() {
  const claimed = REGISTRY.filter((t) => t.key && spec[t.key] != null);

  if (claimed.length > 1) {
    // An authoring mistake, not a crash: say what is wrong and how to fix it,
    // and don't bury it under a stack trace nobody needs.
    const keys = claimed.map((t) => `${t.key} (renders ${t.name})`).join(', ');
    console.error(`\nThis spec carries ${claimed.length} evidence keys: ${keys}.`);
    console.error('A hero shows one piece of evidence, so only one key may be present.');
    console.error('Keep the one the post is actually about and delete the rest.\n');
    process.exit(1);
  }

  const picked = claimed[0];
  if (!picked) return REGISTRY.find((t) => t.name === 'split');

  const problem = picked.check?.(spec[picked.key]);
  if (problem) {
    console.warn(`  ! ${problem} — rendering split instead`);
    return REGISTRY.find((t) => t.name === 'split');
  }
  return picked;
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

/* RECEIPT — a ledger of findings with the verdict stamped across it. Where
   Split stages one belief against one truth, this is for a post that produced a
   *set* of findings: the rows are the audit, the stamp is what it concluded.
   Colour arrives once, in the stamp and the row that went wrong, which is why
   this is the quietest of the five and the right one when the finding is dry. */
function receiptCard(k) {
  const t = THEMES[k];
  const r = spec.record;
  const rows = r.rows
    .map(
      (row) => `
      <div class="row">
        <span class="k">${esc(row.label)}</span>
        <span class="v${row.tone ? ' hit' : ''}"
          ${row.tone ? `style="color:${k === 'dark' ? (TONES[row.tone] ?? T).bright : (TONES[row.tone] ?? T).field}"` : ''}
        >${esc(row.value)}</span>
      </div>`,
    )
    .join('');
  const stampInk = k === 'dark' ? T.bright : T.field;
  return doc(
    `body{background:${t.bg};font-family:${MONO};padding:56px 68px}
     .sheet{height:100%;background:${t.surface};border:1px solid ${t.rule};padding:38px 44px;
       display:flex;flex-direction:column;justify-content:space-between}
     .top{display:flex;justify-content:space-between;align-items:baseline;
       padding-bottom:18px;border-bottom:2px solid ${t.hair}}
     .who{font-size:19px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
       color:${t.text}}
     .when{font-size:16px;color:${t.dim};letter-spacing:.08em}
     .row{display:flex;justify-content:space-between;align-items:baseline;gap:32px;
       padding:20px 0;border-bottom:1px dashed ${t.rule}}
     .k{font-size:17px;letter-spacing:.1em;text-transform:uppercase;color:${t.dim}}
     .v{font-family:${DISPLAY};font-weight:600;font-size:32px;letter-spacing:-.01em;
       color:${t.text};text-align:right}
     .foot{display:flex;justify-content:space-between;align-items:flex-end;gap:28px}
     .stamp{border:3px solid ${stampInk};color:${stampInk};font-weight:700;
       letter-spacing:.14em;text-transform:uppercase;padding:12px 22px;
       transform:rotate(-4deg);font-size:${fitSize(r.stamp, 26, 17, 26)}px}
     .note{font-size:17px;letter-spacing:.1em;text-transform:uppercase;color:${t.dim};
       text-align:right;white-space:pre-line}`,
    `<div class="sheet">
       <div class="top">
         <span class="who">${esc(r.title ?? 'Record')}</span>
         <span class="when">smartdisruptions.com</span>
       </div>
       ${rows}
       <div class="foot">
         ${r.stamp ? `<span class="stamp">${esc(r.stamp)}</span>` : '<span></span>'}
         ${r.note ? `<span class="note">${esc(r.note)}</span>` : ''}
       </div>
     </div>`,
  );
}

/* FIELD — one saturated ground with the sentence reversed out of it.
   The least evidence of the five by a distance, so it is only right when the
   sentence *is* the finding and there is nothing to show beside it. A post with
   a number or a log has something better to put here. */
function fieldCard(k) {
  const t = THEMES[k];
  const s = spec.statement;
  const chars = `${s.quiet ?? ''}${s.loud}`.length;
  return doc(
    `body{background:${T.field};font-family:${SANS};display:flex;flex-direction:column}
     .main{flex:1;display:flex;flex-direction:column;justify-content:center;
       padding:0 78px;gap:26px}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.0;letter-spacing:-.03em;
       color:${FIELD_FG};font-size:${fitSize('x'.repeat(chars), 104, 60, 34)}px}
     .q{color:rgba(249,245,236,.55)}
     .sub{font-family:${MONO};font-size:22px;letter-spacing:.08em;color:rgba(249,245,236,.78)}
     footer{flex:0 0 74px;background:${t.bg};display:flex;align-items:center;
       justify-content:space-between;padding:0 78px;font-family:${MONO};font-size:17px;
       letter-spacing:.12em;text-transform:uppercase;color:${t.dim}}`,
    `<div class="main">
       <div class="h">${s.quiet ? `<span class="q">${esc(s.quiet)}</span><br>` : ''}${esc(s.loud)}</div>
       ${s.note ? `<div class="sub">${esc(s.note)}</div>` : ''}
     </div>
     <footer>
       <span>${esc(fm.category ?? '')}</span>
       <span>smartdisruptions.com</span>
     </footer>`,
  );
}

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
  render(template.render('dark'), heroOut);
  render(template.render('light'), heroLightOut);
  wroteHero = true;
  console.log(`  template: ${template.name}`);
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
