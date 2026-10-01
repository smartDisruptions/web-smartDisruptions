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
 * FIELD NOTES
 *   evidence key   template    the picture
 *   —              split       two panels, the second a saturated field
 *   count          count       one block per unit, filled for the ones that broke
 *   sequence       sequence    ordered events on a rail
 *   annotated      annotated   a passage with its problems marked
 *
 * MARKET STORM (see #54 — a different content type, and not mine to prune)
 *   ledger · quote · scorecard · logo
 *
 * THE BAR, AND WHY SIX TEMPLATES WERE RETIRED
 * -------------------------------------------
 * There were ten of these. `console`, `receipt`, `versus`, `checklist`, `file`
 * and `field` are gone, and the six posts that used them are splits now.
 *
 * The rule said a new template had to be a genuinely different *shape of
 * evidence*, and each of those six cleared it **on paper** — every one had its
 * own data key. None cleared it **in the picture**. A console, a receipt, a
 * versus table and a checklist all resolve to *two or three facts in a frame*,
 * which is precisely what a split is. Rendering the same posts both ways settled
 * it: the split was bigger, clearer, more colourful, and said the same thing.
 * The key was different; the image was not.
 *
 * So the bar is not "does this need its own data" — it is **can a split not draw
 * this**. The three that survived pass that:
 *
 *   count      seven filled blocks is a quantity you see, not a number you read
 *   sequence   a split has no way to express order
 *   annotated  three claims, each with its own underline and fault label
 *
 * A proposed template that a split could carry is a restyle of the split, and
 * the honest move is to improve the split.
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
 * See REGISTRY below for how to add one.
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
 * A hero renders at 494px in the Field Notes grid on desktop and **341px on a
 * phone** — 0.284 of the source, and the number that actually decides this. An
 * earlier version of this file designed to "about 40%", which is the desktop
 * figure, and every template drawn to it lost a third of its size again on the
 * device most people read on.
 *
 * See TYPE below: one scale, and every template carries exactly one line at the
 * top of it.
 *
 * NO NEW DEPENDENCIES
 * -------------------
 * Headless Chrome renders AND encodes it — driven over its own DevTools pipe
 * (see `openChrome()`), it hands back real WebP, so nothing has to convert
 * anything and nothing has to be installed.
 *
 * THE LOOK
 * --------
 * Shadow Dojo, from the same tokens and faces as the site (DESIGN.md, "The
 * share cards are the same dojo"): night ground for the dark copy, washi for
 * the light one, Dela Gothic One for the lede, Inter standing in for the UI
 * face, and vermilion only for marks — the kicker diamond, the seal, the cut.
 * Market Storm's templates stand on the storm ground instead.
 *
 * USAGE
 *   node scripts/make-hero.mjs <slug> scripts/heroes/<slug>.json [--force]
 */
import { spawn } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// The Mac path stays the default because that is where cards are normally made.
// CHROME_PATH overrides it so a cloud session — which has Chromium but no
// /Applications — can render one too; the same escape hatch the web-voltic
// regression suite needed for the same reason.
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const POSTS = 'src/content/posts';
const OUT = 'public/images/content';
const FONT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fonts'
);
const LOGO_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'logos'
);
const W = 1200;
const H = 630;

/** Above this many units the blocks stop being countable at a glance. */
const MAX_BLOCKS = 12;
/** Above this many nodes the sequence rail crowds at grid size. */
const MAX_STEPS = 7;

/**
 * Both themes, mirroring the `--sd-*` tokens in globals.css — Shadow Dojo.
 * Night is the dojo under a moon: an ai-iro ground with moonlight falling from
 * the top right, exactly where the site's body paints it. Day is washi paper
 * under a paper lamp. The surface lifts one visible step above the ground in
 * both, the same relationship a sheet has to the page.
 *
 * `pen` is vermilion, and on a card it is what it is on the site: marks only —
 * the kicker diamond, the seal, the cut. Never the colour of a word.
 */
const THEMES = {
  dark: {
    bg: '#090b16',
    glow: 'rgba(155, 176, 255, 0.2)',
    surface: '#11152a',
    lift: '#1a1f3a',
    text: '#eceefa',
    dim: '#a6abc8',
    accent: '#9bb0ff',
    pen: '#ff5b3d',
    rule: 'rgba(236, 238, 250, 0.12)',
    hair: 'rgba(236, 238, 250, 0.28)',
  },
  light: {
    bg: '#f4efe4',
    glow: 'rgba(43, 58, 150, 0.09)',
    surface: '#fffcf5',
    lift: '#e9e1cf',
    text: '#15172b',
    dim: '#4f5468',
    accent: '#2b3a96',
    pen: '#e2412a',
    rule: 'rgba(21, 23, 43, 0.1)',
    hair: 'rgba(21, 23, 43, 0.26)',
  },
};

/**
 * Market Storm's ground: the same dojo with the storm in it. Night pushes the
 * ground toward ai-iro and the moonlight harder; day keeps the washi and lets
 * an indigo storm-light gather in the corner. Same tokens otherwise, so the
 * two families still read as one site.
 */
const STORM = {
  dark: {
    ...THEMES.dark,
    bg: '#0b1029',
    glow: 'rgba(155, 176, 255, 0.26)',
    surface: '#121a3d',
  },
  light: { ...THEMES.light, glow: 'rgba(43, 58, 150, 0.2)' },
};

/**
 * The ground, as a background shorthand so a template can keep setting
 * `background:` in one place: the theme's colour with the light falling on it
 * from the top right, as `body` paints it in globals.css — the card and the
 * site have to be the same place. The light stays off the centre of the
 * frame, where a knockout logo fills its letters with the flat `bg`.
 */
const ground = (t) =>
  `radial-gradient(760px 470px at 92% -150px, ${t.glow}, transparent 72%), ${t.bg}`;

/**
 * Tone drives every coloured thing in an image. The `field` values are the ink
 * colours from DESIGN.md — text-safe, so washi-toned type clears AA on top of
 * them. The `bright` values are the night flips, used where the colour is
 * carrying meaning as ink (a chip, a figure) on the night ground.
 *
 * The field colour does not change with the theme; only the ground around it
 * does. That is what keeps a post's image recognisably the same picture in both.
 *
 * bad/good/warn are the bear/bull/caution data inks; info is the arcade's blue
 * ink; accent is ai-iro, the site's own indigo.
 */
const FIELD_FG = '#fffcf5';
const TONES = {
  bad: { field: '#b91c1c', bright: '#f87171' },
  good: { field: '#166534', bright: '#4ade80' },
  warn: { field: '#92400e', bright: '#f2b483' },
  info: { field: '#1d4ed8', bright: '#60a5fa' },
  // Indigo — the site's accent, the colour of things you press. Close to
  // `info` by design, and only two specs use this tone.
  accent: { field: '#2b3a96', bright: '#9bb0ff' },
};

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const [slug, specPath] = argv.filter((a) => a !== '--force');

if (!slug) {
  console.error(
    'usage: node scripts/make-hero.mjs <slug> [spec.json] [--force]'
  );
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME} — needed to render the card.`);
  process.exit(1);
}

/**
 * Standalone mode — for pages whose text is not a content post.
 *
 * Market Storm reports live in `src/data/marketStorm.ts`, not as markdown, so
 * there is no file to read a title from and nothing to write frontmatter back
 * into. A spec carrying its own `title` says "this is one of those": render the
 * images, skip the writeback, and leave wiring the path up to the caller.
 * Everything between those two ends — templates, tones, both themes — is
 * identical, which is the point. A second renderer would drift within a month.
 */
const postPath = path.join(POSTS, `${slug}.md`);
const specPreview = specPath ? JSON.parse(readFileSync(specPath, 'utf8')) : {};
const standalone = Boolean(specPreview.title);

if (!standalone && !existsSync(postPath)) {
  console.error(
    `No such article: ${postPath}\n` +
      `(For a page that is not a content post, put "title" in the spec to render standalone.)`
  );
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

const raw = standalone ? '' : readFileSync(postPath, 'utf8');
const spec = specPreview;
const fm = standalone
  ? { title: spec.title, category: spec.category ?? 'Market Storm' }
  : frontmatter(raw);

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * The site's own faces, embedded from disk. next/font fetches these at build
 * time into .next, which this script cannot see, so they are vendored beside it:
 * the same Latin subsets the Satori routes read as TTFs from src/fonts/ (see
 * src/fonts/card-fonts.ts for how they were cut). Satori cannot read woff2 and
 * Chrome is happiest with it, hence two copies of one set.
 *
 * Inlined as data: URLs rather than linked, so there is no file-access flag or
 * load race between Chrome and the face. A missing file is fatal, not a warning:
 * these cards once spent weeks going out in Georgia because a fallback was
 * allowed to be silent. `render()` below also asks every page whether each
 * face actually loaded before its picture is taken.
 */
const FACES = [
  { family: 'Dela Gothic One SD', weight: 400, file: 'dela-gothic-one-400.woff2' },
  { family: 'Inter SD', weight: 500, file: 'inter-500.woff2' },
  { family: 'Inter SD', weight: 700, file: 'inter-700.woff2' },
  { family: 'Inter SD', weight: 800, file: 'inter-800.woff2' },
];
function fontFace({ family, weight, file }) {
  const p = path.join(FONT_DIR, file);
  if (!existsSync(p)) {
    console.error(
      `scripts/fonts/${file} is missing — refusing to render a card in a fallback face.`
    );
    process.exit(1);
  }
  const data = readFileSync(p).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2')}`;
}
const FONTS = FACES.map(fontFace).join('');

// Must match `--font-display` in globals.css. When the site's display face
// changes, this and the vendored copies change with it — otherwise the cards go
// out in a face the site does not use, which is exactly how they spent weeks
// rendering in Georgia.
const DISPLAY = `'Dela Gothic One SD', 'Arial Black', system-ui, sans-serif`;
// The site's UI face is the platform's own (system-ui). A card has no platform
// — it is a picture of one — so Inter stands in for it, in both generators.
const SANS = `'Inter SD', system-ui, -apple-system, sans-serif`;
/**
 * Dela Gothic One has one weight, very heavy, with a tall x-height.
 * font-size-adjust: 0.5 holds it to the size the scale below was tuned for,
 * exactly as `.font-display` does in globals.css (the weight shouts, so the
 * size doesn't have to), which keeps the fit budgets working untouched. The
 * Satori routes do the same sum by hand, because Satori ignores the property.
 */
const DISPLAY_CSS = `font-family:${DISPLAY};font-weight:400;font-size-adjust:0.5;letter-spacing:-0.01em;font-kerning:normal;text-wrap:balance`;

/**
 * The kicker (`.sd-kicker` on the site): small tracked capitals in the sans,
 * led by a vermilion diamond. Every label on every card is one, so a label
 * reads as the site's own furniture at any size — the diamond survives the
 * shrink to a phone even where the words don't.
 */
const kicker = (sel, size, color, mark) =>
  `${sel}{font-family:${SANS};font-size:${size}px;font-weight:700;letter-spacing:.14em;
     text-transform:uppercase;color:${color};display:flex;align-items:center;gap:.6em}
   ${sel}::before{content:'';width:.46em;height:.46em;border-radius:1px;background:${mark};
     transform:rotate(45deg);flex:none}`;

/** `.sd-brush-under`'s stroke, as a mask, so the colour stays a token. */
const BRUSH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 14' preserveAspectRatio='none'%3E%3Cpath d='M2 9.5C14 5 30 3.2 52 3.6 76 4 98 5.4 118 3c-6 4.8-24 7.8-48 8.4C44 12 20 12.5 2 9.5z'/%3E%3C/svg%3E")`;

/**
 * The seal (`.sd-seal`): a vermilion hanko with 忍 pressed into it, signing a
 * post hero in its corner the way a print is signed. It is a mark, not a word —
 * the word budget never sees it — and at 341px it is still a red square, which
 * is all a signature has to be.
 *
 * The character is the site's own baked brush path, read from the file the site
 * renders it from, so there is one copy of it. If that file moves, the cards go
 * out unsigned and say so: a flourish is not worth refusing a hero over.
 */
const GLYPHS_TS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/components/brand/glyphs.ts'
);
const SEAL_D = (() => {
  try {
    const src = readFileSync(GLYPHS_TS, 'utf8');
    const json = /export const GLYPHS[^=]*=\s*(\{[\s\S]*?\});\n/.exec(src)[1];
    return JSON.parse(json).brush['忍'].d;
  } catch {
    console.warn(
      '  ! could not read 忍 from src/components/brand/glyphs.ts — cards go out unsigned'
    );
    return null;
  }
})();
const SEAL_CSS = (t) =>
  `.seal{position:absolute;top:30px;right:34px;width:46px;height:46px;border-radius:10px;
     display:flex;align-items:center;justify-content:center;background:${t.pen};
     box-shadow:inset 0 0 0 2px rgba(255,255,255,.22)}
   .seal svg{width:34px;height:34px;fill:#fff}`;
const seal = () =>
  SEAL_D
    ? `<div class="seal"><svg viewBox="0 0 1000 1000"><path d="${SEAL_D}"/></svg></div>`
    : '';

/**
 * Kiru's head — components/brand/KiruMark.tsx, the logo — for the social
 * card's footer, where a feed needs to know whose card this is. It sits on the
 * night ground, so the hood takes his moonlit outline from the full rig.
 */
const KIRU_MARK = `<svg class="kiru" viewBox="0 0 64 64">
  <path d="M47 23c7-4 11-2 15-6-1 6-6 9-12 9 5 1 8 4 12 3-4 4-10 4-15 1z" fill="#bd3019"/>
  <ellipse cx="31" cy="34" rx="26" ry="24" fill="#3d4c95"/>
  <ellipse cx="31" cy="34" rx="24.6" ry="22.6" fill="#252d56"/>
  <path d="M6.4 30 Q31 14.6 55.6 30" stroke="#e8432a" stroke-width="7" fill="none"/>
  <rect x="25" y="17.5" width="12" height="7" rx="1.6" fill="#cfd5e2"/>
  <path d="M32.4 18.6 29 21.7h2.3l-1.4 1.9 3.8-3.2h-2.3z" fill="#e8432a"/>
  <path d="M12 33c9-4.6 29-4.6 38 0 3.2 1.6 3.2 7.6 0 9.2-9 4.6-29 4.6-38 0-3.2-1.6-3.2-7.6 0-9.2Z" fill="#f6d0a8"/>
  <ellipse cx="23.5" cy="37.6" rx="4" ry="4.6" fill="#fff"/>
  <ellipse cx="38.5" cy="37.6" rx="4" ry="4.6" fill="#fff"/>
  <circle cx="24.3" cy="38.3" r="2.6" fill="#13152a"/>
  <circle cx="39.3" cy="38.3" r="2.6" fill="#13152a"/>
  <path d="M18.5 31.6l8 2M43.5 31.6l-8 2" stroke="#13152a" stroke-width="2" stroke-linecap="round"/>
</svg>`;

/**
 * The type scale. Every template draws from this and none invents a size.
 *
 * WHY THE NUMBERS ARE WHAT THEY ARE
 * ---------------------------------
 * A hero renders at 494px in the Field Notes grid on desktop and **341px on a
 * phone** — 0.284 of the 1200px source, which is the size that actually decides
 * this. Multiply any value below by 0.284 to see what a reader gets.
 *
 *   lede    58  ->  16.5px on a phone.  Legible. Every template has exactly one.
 *   major   40  ->  11.4px.  Reads on desktop, marginal on a phone.
 *   minor   30  ->   8.5px.  Texture on a phone, readable on desktop.
 *   label   20  ->   5.7px.  Context. Texture at any small size, by design.
 *   micro   17  ->   4.8px.  Authenticity only — log chrome, flags, seals.
 *
 * THE RULE THAT MATTERS
 * ---------------------
 * **The lede carries the finding.** A reader who sees only the lede still gets
 * the point; everything under it is evidence they can lean in for. That is what
 * makes ten different templates read as one system at card size: same size, same
 * job, same place on every card. Before this existed, the largest element ranged
 * from 7.4px to 29.6px on a phone — a 4x spread, which read as ten unrelated
 * images rather than one set.
 *
 * `field` is the single documented exception: it has no evidence region at all,
 * so its lede takes the whole frame and is allowed LEDE_SOLO.
 */
const TYPE = { lede: 58, major: 40, minor: 30, label: 20, micro: 17 };
const LEDE_SOLO = 78;

/**
 * How many words an image may carry, counting everything it renders.
 *
 * THE MEASUREMENT THAT SET THIS
 * -----------------------------
 * The templates averaged 27 words each, and at 341px — a phone — **69% of those
 * words were under 11px and unreadable**. They cost density on desktop and paid
 * nothing on the device most people read on, which is the worst trade available.
 * One card ran 84% unreadable.
 *
 * MARKS ARE NOT WORDS
 * -------------------
 * The blocks, the rail, the window chrome, the table grid and the stamp border
 * all survive being illegible: an unreadable log window still reads as a
 * terminal, and the shape is the information. An unreadable *sentence* is only
 * noise. So the cut fell on prose, not on structure — the pictures kept their
 * furniture and lost their captions.
 *
 * THE DIVISION OF LABOUR
 * ----------------------
 * **The image carries the evidence; the page carries the claim.** The card next
 * to it already has a title and an excerpt, and the featured post was stating
 * one fact three times — "7 of 8 were wrong" on the image, "It broke seven of my
 * eight claims" in the title, "corrected seven of eight" in the excerpt. A lede
 * that restates the headline is the thing this file's own header warned about
 * and then did anyway.
 */
/**
 * Set at 14 first, which was a guess. Measuring the templates against it showed
 * the guess was wrong for the ones whose picture is *made* of text: a console
 * needs its invocation, two chips, two values and a summary to read as a run,
 * and there is no nineteenth word to cut without it stopping being a console.
 * 20 is what the structural templates actually need; the lean ones land near 10
 * and should stay there.
 */
const WORD_BUDGET = 20;

const RESET = `*{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;-webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility}
  body{position:relative;overflow:hidden}`;
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

/**
 * Size a lede. Every template routes its one lede through here, so the rule
 * lives in a single place rather than in ten CSS blocks.
 *
 * The floor is 46px — 13.1px on a phone — rather than TYPE.major, because the
 * whole point of the lede is that it reads at the smallest size the site renders
 * it at. Letting it shrink freely reintroduced the spread this scale exists to
 * remove: one card at 16.5px next to another at 11.4px reads as two systems.
 *
 * A lede long enough to hit the floor is a lede that is too long. It still
 * renders — refusing to draw an article's hero over a copy nit would be worse —
 * but it says so, because the fix is an editing fix.
 */
const LEDE_BUDGET = 38;
const LEDE_FLOOR = 46;
function ledeSize(text) {
  const n = String(text ?? '').length;
  if (n > 62) {
    console.warn(
      `  ! lede is ${n} characters and will render at the ${LEDE_FLOOR}px floor.\n` +
        `    Under ${LEDE_BUDGET} keeps it at full size — this is the line a phone reader gets.`
    );
  }
  return fitSize(text, TYPE.lede, LEDE_FLOOR, LEDE_BUDGET);
}

/**
 * Which dojo the post templates stand in. A Market Storm card that carries a
 * field-notes key (the AI-capex thesis is a split) still belongs to the storm,
 * so it takes the storm ground; everything else takes the site's own.
 */
const GROUND = fm.category === 'Market Storm' ? STORM : THEMES;

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
    name: 'sequence',
    key: 'sequence',
    render: (k) => sequenceCard(k),
    check: (s) =>
      !s.steps?.length
        ? 'sequence.steps is empty'
        : s.steps.length > MAX_STEPS
          ? `sequence.steps has ${s.steps.length}; above ${MAX_STEPS} the rail crowds`
          : null,
  },
  {
    name: 'annotated',
    key: 'annotated',
    render: (k) => annotatedCard(k),
    // The three flagged claims ARE the picture: this template exists to show
    // that something reads fine and isn't, and a reader has to be able to read
    // the claim to see the flaw in it. Shortening them to hit the shared budget
    // would remove the thing the template is for. Raised deliberately, once,
    // with a reason — not by moving WORD_BUDGET for everyone.
    words: 28,
    check: (a) =>
      !a.spans?.length
        ? 'annotated.spans is empty'
        : a.spans.length > 3
          ? `annotated.spans has ${a.spans.length}; three flagged claims is the ceiling`
          : null,
  },
  /* ---- Market Storm ----------------------------------------------------
     Three templates for the research reports, and they are deliberately their
     own family. Every template above carries ONE tone: a post has a finding
     and the finding is good or bad. A financial report does not work that way
     — AWS margin expanding and free cash flow going negative are the same
     quarter, and DESIGN.md gives Market Storm a three-ink bull/bear/warn axis
     for exactly that reason. These are the only templates that colour each
     datum independently, which is what makes the section recognisable in the
     grid without a badge saying so.

     They still obey the one rule that matters: a lede at the standard size, in
     the standard place, carrying the finding. */
  {
    name: 'quote',
    key: 'quote',
    render: (k) => quoteCard(k),
    check: (q) =>
      !q.ticker
        ? 'quote.ticker is required — the ticker is the whole identity of the card'
        : !q.cells?.length
          ? 'quote.cells is empty'
          : q.cells.length > 4
            ? `quote.cells has ${q.cells.length}; above 4 the figures stop being legible at grid size`
            : !q.verdict
              ? 'quote.verdict is required — a row of figures has no natural lede'
              : null,
  },
  {
    name: 'scorecard',
    key: 'scorecard',
    render: (k) => scorecardCard(k),
    check: (s) =>
      !s.kpis?.length
        ? 'scorecard.kpis is empty'
        : s.kpis.length !== 4
          ? `scorecard.kpis has ${s.kpis.length}; the grid is 2x2 and takes exactly 4`
          : !s.verdict
            ? 'scorecard.verdict is required — four tiles have no natural lede'
            : null,
  },
  {
    name: 'ledger',
    key: 'ledger',
    // 24, not the shared 20. The three tallies and their labels are what a
    // verification ledger IS, and the Market Storm work (#54) already ran its
    // own pass at cutting text that was unreadable at card size. Recording the
    // number this template actually ships rather than re-cutting someone else's
    // deliberate design inside a merge, or leaving a warning that cries wolf.
    words: 24,
    render: (k) => ledgerCard(k),
    check: (l) =>
      [l.confirmed, l.partlyTrue, l.corrected].some(
        (n) => typeof n !== 'number'
      )
        ? 'ledger needs numeric confirmed, partlyTrue and corrected'
        : !l.finding
          ? 'ledger.finding is required — the counts are the texture, the finding is the point'
          : null,
  },
  {
    name: 'logo',
    key: 'logo',
    render: (k) => logoCard(k),
    check: (l) =>
      !l.file
        ? 'logo.file is required — the mark to render'
        : !existsSync(path.join(LOGO_DIR, l.file))
          ? `logo.file "${l.file}" is not in scripts/logos/`
          : null,
  },
  { name: 'split', key: null, render: (k) => split(k) },
];

/**
 * The data inks, for the Market Storm family only.
 *
 * `bull`/`bear`/`warn` are the semantic axis from DESIGN.md; they flip
 * dark-on-washi to bright-at-night exactly like the arcade inks, and both
 * halves are already AA-verified there (on the storm ground too — it is darker
 * than the night it replaces). `neutral` is deliberately the body colour rather
 * than a fourth hue — a figure that carries no polarity should not look like it
 * carries one.
 */
const DATA_TONE = { bull: 'good', bear: 'bad', warn: 'warn' };
const ink = (k, tone) => {
  const mapped = DATA_TONE[tone];
  if (!mapped) return STORM[k].text;
  return k === 'dark' ? TONES[mapped].bright : TONES[mapped].field;
};

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
    console.error(
      `\nThis spec carries ${claimed.length} evidence keys: ${keys}.`
    );
    console.error(
      'A hero shows one piece of evidence, so only one key may be present.'
    );
    console.error(
      'Keep the one the post is actually about and delete the rest.\n'
    );
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

/* LOGO — the company's mark, centred on the ground, and nothing else.
   The plainest card here by an order of magnitude, which is the point: it is
   for an index where the reader is scanning for a company, not reading a
   finding.

   It renders as a MASK rather than an <img>, so the mark takes the theme's
   text colour instead of its own. Two of the four are otherwise unreadable —
   SpaceX's wordmark is #005288 and Palantir's is black, and both vanish on
   charcoal. Reversing to a single colour is the standard permitted treatment
   on a dark ground, it keeps four different marks reading as one set, and it
   stops the index turning into four competing brand palettes. Microsoft's
   coloured squares go grey with everything else; that is the price.

   The mark is capped at 46% of the frame's width. A logo that fills its card
   reads as an advert for that company rather than as a label on ours. */
/**
 * A company mark, reversed to the theme.
 *
 * TWO WAYS TO DRAW ONE, AND WHY
 * -----------------------------
 * The default is a CSS mask filled with the theme's text colour. That is the
 * right treatment for a mark whose shapes ARE the logo — a wordmark, or a
 * device with real gaps in it — and it is what every mark here used until IREN.
 *
 * A mask cannot draw a KNOCKOUT logo: one where the wordmark is a hole punched
 * through a solid device and only reads because of colour contrast. Mask the
 * whole file and the letters union with the block they sit on, and the card
 * renders a solid slab. IREN is exactly this — a green parallelogram with the
 * letters set in navy on top of it.
 *
 * So `logo.knockout` lists the source fills that should come back as the
 * BACKGROUND colour instead of the text colour. The SVG is then inlined and
 * recoloured rather than masked, which keeps the mark monochrome — two theme
 * tokens, no brand palette — while preserving the shape that makes it legible.
 */
function logoCard(k) {
  const t = STORM[k];
  const l = spec.logo;
  const file = path.join(LOGO_DIR, l.file);
  const w = Math.round(W * (l.scale ?? 0.46));
  const h = Math.round(H * 0.42);

  if (l.knockout?.length) {
    const svg = readFileSync(file, 'utf8')
      // Drop any full-bleed background plate; the card supplies its own ground.
      .replace(/<rect\b[^>]*\/>/g, '')
      .replace(/fill="([^"]+)"/g, (m, c) =>
        c === 'none' ? m : `fill="${l.knockout.includes(c) ? t.bg : t.text}"`
      )
      .replace(/<svg\b/, `<svg style="width:${w}px;height:${h}px"`);
    return doc(
      `body{background:${ground(t)};display:flex;align-items:center;justify-content:center}
       svg{width:${w}px;height:${h}px}`,
      svg
    );
  }

  return doc(
    `body{background:${ground(t)};display:flex;align-items:center;justify-content:center}
     .m{width:${w}px;height:${h}px;background:${t.text};
       -webkit-mask:url('file://${file}') center/contain no-repeat;
       mask:url('file://${file}') center/contain no-repeat}`,
    `<div class="m"></div>`
  );
}

/* QUOTE — the ticker board. The symbol at display size over a rule of
   figures, each inked by its own polarity. This is the most literal of the
   three: it is the report's price strip, cropped. Tabular numerals throughout,
   because a row of figures that shifts on the digit is a row nobody trusts.

   The catalyst used to sit beside the ticker and was cut: at 341px it rendered
   as texture rather than words, and the card underneath already prints it. A
   hero that repeats the chrome around it is spending its scarcest resource —
   room — on nothing. */
function quoteCard(k) {
  const t = STORM[k];
  const q = spec.quote;
  const cells = q.cells
    .map(
      (c) => `<div class="c">
         <div class="ck">${esc(c.k)}</div>
         <div class="cv" style="color:${ink(k, c.tone)}">${esc(c.v)}</div>
       </div>`
    )
    .join('');
  return doc(
    `body{background:${ground(t)};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:40px;padding:0 74px}
     .top{display:flex;align-items:baseline;gap:26px}
     .tk{${DISPLAY_CSS};font-size:76px;letter-spacing:.02em;color:${t.accent};line-height:1}
     .h{${DISPLAY_CSS};line-height:1.08;
       color:${t.text};font-size:${ledeSize(q.verdict)}px;max-width:1000px}
     .row{display:flex;gap:0;border-top:1px solid ${t.rule}}
     .c{flex:1;padding:22px 26px 4px 0;display:flex;flex-direction:column;gap:10px;
       border-right:1px solid ${t.rule}}
     .c + .c{padding-left:26px}
     .c:last-child{border-right:0}
     .ck{font-family:${SANS};font-size:${TYPE.micro}px;font-weight:700;letter-spacing:.14em;
       text-transform:uppercase;color:${t.dim}}
     .cv{font-family:${SANS};font-weight:800;font-size:${TYPE.major}px;
       font-variant-numeric:tabular-nums;letter-spacing:-.01em}`,
    `<div class="top"><span class="tk">${esc(q.ticker)}</span></div>
     <div class="h">${esc(q.verdict)}</div>
     <div class="row">${cells}</div>`
  );
}

/* SCORECARD — four tiles, 2x2, each with its own polarity dot. The report's own
   KPI grid at card scale. The dot rather than a coloured card edge is
   deliberate: a tinted rail down the side of a tile is the documented AI-UI
   tell the house rejects, and ReportView refuses it on the page for the same
   reason.

   Each tile carried a third line — the delta, "down from 68%" — and it is gone.
   Four tiles times a sub-label put this template at 13 text elements against
   the 3-5 every other template carries, and at 341px that third line was below
   reading size in every one of them. It was the only thing on any of these
   cards that was purely noise: unreadable, and there to be unreadable. A
   figure that needs context has a lede above it for exactly that. */
function scorecardCard(k) {
  const t = STORM[k];
  const s = spec.scorecard;
  const tiles = s.kpis
    .map(
      (kpi) => `<div class="t">
         <div class="tl"><span class="dot" style="background:${ink(k, kpi.tone)}"></span>
           <span>${esc(kpi.label)}</span></div>
         <div class="tv" style="color:${ink(k, kpi.tone)}">${esc(kpi.value)}</div>
       </div>`
    )
    .join('');
  return doc(
    `body{background:${ground(t)};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:34px;padding:0 74px}
     .h{${DISPLAY_CSS};line-height:1.08;
       color:${t.text};font-size:${ledeSize(s.verdict)}px;max-width:1000px}
     .g{display:grid;grid-template-columns:1fr 1fr;gap:14px}
     .t{background:${t.surface};border:1px solid ${t.rule};border-radius:16px;
       padding:24px 26px;display:flex;flex-direction:column;gap:12px}
     .tl{display:flex;align-items:center;gap:10px;font-family:${SANS};font-weight:700;
       font-size:${TYPE.label}px;letter-spacing:.12em;text-transform:uppercase;color:${t.dim}}
     .dot{width:10px;height:10px;border-radius:50%;flex:0 0 auto}
     .tv{font-family:${SANS};font-weight:800;font-size:${TYPE.major}px;
       font-variant-numeric:tabular-nums;letter-spacing:-.01em;line-height:1}`,
    `<div class="h">${esc(s.verdict)}</div>
     <div class="g">${tiles}</div>`
  );
}

/* LEDGER — the verification pass, which is the thing this section has that a
   sell-side note does not. Three chips carrying the counts, then the one
   finding worth the space. The chips are outlined rather than filled so that
   three of them side by side read as a tally and not as three warnings.

   This was already the sparsest of the three and it survived card size best,
   which is the argument for the cuts made to the other two. Its own eyebrow
   went anyway: "EVERY LOAD-BEARING CLAIM, REFUTED ON PURPOSE" was texture at
   341px, and three chips reading 6 / 3 / 4 already say a ledger is what this
   is. */
function ledgerCard(k) {
  const t = STORM[k];
  const l = spec.ledger;
  /* `corrected` is neutral, not red, and that is a judgement rather than a
     styling detail. Red says the finding is bad. A correction is the ledger
     doing its job — often the most valuable line on the page, and twice now it
     has been this report's own error. ReportView has always drawn it neutral;
     the card matching it keeps the two from arguing.

     Neutral takes the hairline for its border rather than full body colour, so
     a chip carrying no polarity does not out-shout the two that do. */
  const chip = (n, word, tone) => {
    const c = ink(k, tone);
    const border = tone ? c : t.hair;
    return `<div class="chip" style="border-color:${border}">
        <span class="n" style="color:${c}">${n}</span>
        <span class="w" style="color:${c}">${esc(word)}</span>
      </div>`;
  };
  return doc(
    `body{background:${ground(t)};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:34px;padding:0 74px}
     .chips{display:flex;gap:18px}
     .chip{display:flex;align-items:baseline;gap:12px;padding:15px 28px 16px;
       border:2px solid;border-radius:999px}
     .n{font-family:${SANS};font-weight:800;font-size:44px;
       font-variant-numeric:tabular-nums;line-height:1}
     .w{font-family:${SANS};font-weight:700;font-size:${TYPE.label}px;letter-spacing:.12em;
       text-transform:uppercase}
     .h{${DISPLAY_CSS};line-height:1.08;
       color:${t.text};font-size:${ledeSize(l.finding)}px;max-width:1010px}
     .n2{font-family:${SANS};font-weight:500;font-size:${TYPE.label}px;color:${t.dim};letter-spacing:.01em}`,
    `<div class="chips">
       ${chip(l.confirmed, 'confirmed', 'bull')}
       ${chip(l.partlyTrue, 'partly-true', 'warn')}
       ${chip(l.corrected, 'corrected', null)}
     </div>
     <div class="h">${esc(l.finding)}</div>
     ${l.note ? `<div class="n2">${esc(l.note)}</div>` : ''}`
  );
}

/* SPLIT — two full-bleed panels, the second a saturated field. No inner card:
   the article already frames the hero in a bordered figure, and a card inside a
   card is one border too many.

   The field is cut on a slant rather than ruled, and the cut catches the blade
   light: it is the katana stroke the site draws through its headlines
   (`.sd-slash`), here between what I believed and what turned out to be true.
   That stroke is the whole picture, so it is the one flourish this gets. */
const CUT = 44;
function split(k) {
  const t = GROUND[k];
  const deg = ((Math.atan2(CUT, W) * 180) / Math.PI).toFixed(3);
  return doc(
    `body{display:flex;flex-direction:column;background:${ground(t)};font-family:${SANS}}
     .p{position:relative;display:flex;flex-direction:column;justify-content:center;gap:20px;padding:0 68px}
     .a{flex:0 0 282px}
     .b{flex:1 1 auto;background:${T.field};margin-top:-${CUT}px;padding-top:${CUT}px;
       clip-path:polygon(0 ${CUT}px,100% 0,100% 100%,0 100%)}
     .cut{position:absolute;left:0;top:${282 - 1.5}px;width:${W + 2}px;height:3px;
       transform-origin:0 50%;transform:rotate(-${deg}deg);
       background:linear-gradient(90deg,transparent,${t.pen} 30%,#fff 62%,transparent)}
     ${kicker('.a .l', TYPE.label, t.dim, t.pen)}
     ${kicker('.b .l', TYPE.label, 'rgba(255,252,245,.84)', 'rgba(255,252,245,.84)')}
     .h{${DISPLAY_CSS};line-height:1.08}
     .a .h{color:${t.text};font-size:${ledeSize(before.text)}px}
     .b .h{color:${FIELD_FG};font-size:${ledeSize(after.text)}px}
     ${SEAL_CSS(t)}`,
    `<div class="p a">
       ${before.label ? `<div class="l">${esc(before.label)}</div>` : ''}
       <div class="h">${esc(before.text)}</div>
     </div>
     <div class="p b">
       ${after.label ? `<div class="l">${esc(after.label)}</div>` : ''}
       <div class="h">${esc(after.text)}</div>
     </div>
     <div class="cut"></div>
     ${seal()}`
  );
}

/* COUNT — the figure made geometry: one block per unit, filled for the ones
   that broke. The blocks are a fill, not text, so the bright ink is cleared for
   them on the dark ground; they are also the only element in any of the three
   templates that does not depend on type rendering to be read. */
function countCard(k) {
  const t = GROUND[k];
  const c = spec.count;
  const fill = k === 'dark' ? T.bright : T.field;
  const blocks = Array.from({ length: c.of }, (_, i) =>
    i < c.hit ? `<span class="on"></span>` : `<span class="off"></span>`
  ).join('');
  return doc(
    `body{background:${ground(t)};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:38px;padding:0 74px}
     ${kicker('.l', TYPE.label, t.dim, t.pen)}
     .blocks{display:flex;gap:14px;height:130px}
     .blocks span{flex:1;border-radius:14px}
     .blocks .on{background:${fill};box-shadow:inset 0 3px 0 rgba(255,255,255,.18)}
     .blocks .off{border:2px solid ${t.hair}}
     .h{${DISPLAY_CSS};line-height:1.06;
       color:${t.text};font-size:${ledeSize(`${c.hit} of ${c.of} ${c.verdict ?? ''}`)}px}
     .h em{font-style:normal;color:${fill}}
     ${SEAL_CSS(t)}`,
    `<div class="l">${esc(c.of)} ${esc(c.unit)}</div>
     <div class="blocks">${blocks}</div>
     <div class="h"><em>${esc(c.hit)} of ${esc(c.of)}</em>${c.verdict ? ` ${esc(c.verdict)}` : ''}</div>
     ${seal()}`
  );
}

/* RECEIPT — a ledger of findings with the verdict stamped across it. Where
   Split stages one belief against one truth, this is for a post that produced a
   *set* of findings: the rows are the audit, the stamp is what it concluded.
   Colour arrives once, in the stamp and the row that went wrong, which is why
   this is the quietest of the five and the right one when the finding is dry. */

/* FIELD — one saturated ground with the sentence reversed out of it.
   The least evidence of the five by a distance, so it is only right when the
   sentence *is* the finding and there is nothing to show beside it. A post with
   a number or a log has something better to put here. */

/* FILE — a document as itself: the filename in the chrome, the contents below.
   For a post whose evidence is a file someone can go and write — a config, a
   context file, a spec. Distinct from `console`, which shows what a machine
   *emitted*; this shows what a person *wrote*. */

/* SEQUENCE — ordered events on a rail. For a post whose evidence is that things
   happened in an order: six prompts, four deploys, a migration. The numbers are
   the part that survives the shrink, so they are drawn, not set in type. */
function sequenceCard(k) {
  const t = GROUND[k];
  const s = spec.sequence;
  const ink = k === 'dark' ? T.bright : T.field;
  const steps = s.steps
    .map(
      (st, i) => `
      <div class="step">
        <div class="node${st.mark ? ' on' : ''}">${i + 1}</div>
        <div class="cap">${esc(st.text)}</div>
      </div>`
    )
    .join('');
  return doc(
    `body{background:${ground(t)};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:44px;padding:0 74px}
     .rail{position:relative;display:flex;justify-content:space-between;gap:18px}
     .rail:before{content:'';position:absolute;left:26px;right:26px;top:25px;height:2px;
       background:${t.hair}}
     .step{position:relative;flex:1 1 0;display:flex;flex-direction:column;
       align-items:center;gap:16px;min-width:0}
     .node{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;
       justify-content:center;font-family:${SANS};font-size:${TYPE.label}px;font-weight:800;
       font-variant-numeric:tabular-nums;background:${t.surface};border:2px solid ${t.hair};
       color:${t.dim};position:relative;z-index:1}
     /* A bright fill at night takes the ground's ink for its numeral; washi-
        toned type on a pale green is unreadable. */
     .node.on{background:${ink};border-color:${ink};color:${k === 'dark' ? t.bg : FIELD_FG}}
     .cap{font-family:${SANS};font-size:${TYPE.micro}px;font-weight:700;line-height:1.35;
       color:${t.text};text-align:center}
     .h{${DISPLAY_CSS};line-height:1.06;
       color:${t.text};font-size:${ledeSize(s.verdict)}px}
     .h em{font-style:normal;color:${ink}}
     ${SEAL_CSS(t)}`,
    `     <div class="rail">${steps}</div>
     ${s.verdict ? `<div class="h">${s.verdict.replace(/\*(.+?)\*/g, (_, m) => `<em>${esc(m)}</em>`)}</div>` : ''}
     ${seal()}`
  );
}

/* ANNOTATED — a passage with its problems marked. For a post whose evidence is
   that something *reads fine and isn't*: the claim stays legible, the flag names
   what is wrong with it. The underline does the work a red pen would — a brush
   stroke in the tone's ink, the same stroke the site puts under a heading. */
function annotatedCard(k) {
  const t = GROUND[k];
  const a = spec.annotated;
  const ink = k === 'dark' ? T.bright : T.field;
  const spans = a.spans
    .map(
      (sp) => `
      <div class="sp">
        <div class="claim">${esc(sp.text)}</div>
        <div class="flag">${esc(sp.flag)}</div>
      </div>`
    )
    .join('');
  return doc(
    `body{background:${ground(t)};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:30px;padding:0 76px}
     .top{display:flex;flex-direction:column;gap:8px}
     /* The intro is the lede — it is the finding. The flagged claims are the
        evidence and sit one step down the ramp. */
     .h{${DISPLAY_CSS};color:${t.text};
       line-height:1.06;font-size:${ledeSize(a.intro)}px}
     .sp{padding:9px 0}
     /* The claims are the text being read, so they are set in the reading
        weight of the sans rather than the poster face: the lede shouts, the
        evidence speaks. */
     .claim{font-family:${SANS};font-weight:700;font-size:${TYPE.major}px;
       letter-spacing:-.015em;color:${t.text};display:inline-block;position:relative;
       padding-bottom:13px;line-height:1.2}
     .claim::after{content:'';position:absolute;left:-4px;right:-8px;bottom:0;height:12px;
       background:${ink};-webkit-mask:${BRUSH} center/100% 100% no-repeat;
       mask:${BRUSH} center/100% 100% no-repeat}
     ${kicker('.flag', TYPE.micro, ink, ink)}
     .flag{font-weight:800;margin-top:8px}
     ${SEAL_CSS(t)}`,
    `<div class="top">
       <div class="h">${esc(a.intro)}</div>
     </div>
     <div>${spans}</div>
     ${seal()}`
  );
}

/**
 * The social card. One design for every template — see the header.
 *
 * Always the night copy: a feed is somebody else's page, and the moonlit dojo
 * is the version of the site that is recognisable at a glance. The evidence row
 * is cut like a split — the katana stroke again, standing up this time — and
 * the footer carries Kiru's head, because in a feed the card has to say whose
 * it is before anything else.
 */
const OG_CUT = 40;
function ogHtml() {
  const t = THEMES.dark;
  const chars = headline.map((h) => h.t).join('').length;
  return doc(
    `body{display:flex;flex-direction:column;background:${ground(t)};font-family:${SANS}}
     .head{flex:1 1 auto;display:flex;align-items:center;padding:0 68px}
     h1{${DISPLAY_CSS};line-height:1.1;
       color:${t.text};font-size:${fitSize('x'.repeat(chars), 58, 38, 62)}px}
     .evidence{flex:0 0 194px;display:flex;position:relative}
     .cell{flex:1 1 0;display:flex;flex-direction:column;justify-content:center;gap:13px;
       padding:0 44px;min-width:0}
     .one{background:${t.surface};box-shadow:inset 0 1px 0 ${t.rule}}
     .two{background:${T.field};margin-left:-${OG_CUT}px;padding-left:${44 + OG_CUT}px;
       clip-path:polygon(${OG_CUT}px 0,100% 0,100% 100%,0 100%)}
     .glint{position:absolute;top:0;bottom:0;left:${(W - OG_CUT) / 2}px;width:${OG_CUT}px;
       background:linear-gradient(to bottom right,transparent calc(50% - 1.5px),
         rgba(255,255,255,.6) 50%,transparent calc(50% + 1.5px))}
     ${kicker('.one .l', 16, t.dim, t.pen)}
     ${kicker('.two .l', 16, 'rgba(255,252,245,.84)', 'rgba(255,252,245,.84)')}
     .v{${DISPLAY_CSS};font-size:31px;line-height:1.15;overflow:hidden;display:-webkit-box;
       -webkit-line-clamp:2;-webkit-box-orient:vertical}
     .one .v{color:${t.text}} .two .v{color:${FIELD_FG}}
     footer{flex:0 0 82px;display:flex;align-items:center;justify-content:space-between;
       padding:0 68px;color:${t.text}}
     .site{display:flex;align-items:center;gap:14px;font-size:20px;font-weight:700}
     .kiru{width:42px;height:42px}
     ${kicker('.cat', 15, t.accent, t.pen)}`,
    `<div class="head"><h1>${headline
      .map((h) =>
        h.tone && TONES[h.tone]
          ? `<span style="color:${TONES[h.tone].bright}">${esc(h.t)}</span>`
          : esc(h.t)
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
       <div class="glint"></div>
     </div>
     <footer>
       <span class="site">${KIRU_MARK}<span>smartdisruptions.com</span></span>
       <span class="cat">${esc(fm.category ?? '')}</span>
     </footer>`
  );
}

const tmp = mkdtempSync(path.join(tmpdir(), 'hero-'));

/**
 * WebP quality for every card: 80, which is what `--screenshot` used to encode
 * at, so a re-render does not quietly grow the files the grid loads (two ~15KB
 * heroes per post card). Measured on the Shadow Dojo set: 84 came out the same
 * total size as the Notebook files it replaced, 80 about a tenth smaller, and
 * at 2x zoom the type and the moonlight gradient looked the same in both.
 */
const WEBP_QUALITY = 80;

/**
 * Chrome, driven over its DevTools pipe rather than with `--screenshot`.
 *
 * `--screenshot` sizes the WINDOW, not the page. New headless (Chromium 141 in
 * a cloud session) kept 87 of the 630 pixels for a toolbar nobody can see, and
 * every card came out with its bottom seventh blank — the field of a split
 * stopped short, the social card lost its footer. Setting the viewport through
 * the protocol is exact on every build, and the same pipe lets the run ask the
 * page whether its faces loaded and pick the WebP quality: two things the flag
 * never could. Chrome still does all the rendering and the encoding.
 */
function openChrome() {
  const proc = spawn(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--allow-file-access-from-files',
      '--remote-debugging-pipe',
      // A throwaway profile inside this run's temp folder. Chrome ignores the
      // debugging pipe on the default profile, and a card run has no business
      // near the browser profile someone actually uses.
      `--user-data-dir=${path.join(tmp, 'profile')}`,
      // Chrome refuses to run as root without this. That is only ever true in
      // a container, so it is added by detection rather than always: on a Mac
      // the sandbox stays on, which is the point of having one.
      ...(typeof process.getuid === 'function' && process.getuid() === 0
        ? ['--no-sandbox']
        : []),
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] }
  );
  const pending = new Map();
  const waiting = [];
  let seq = 0;
  let buf = Buffer.alloc(0);
  proc.stdio[4].on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    let end;
    while ((end = buf.indexOf(0)) !== -1) {
      const msg = JSON.parse(buf.subarray(0, end).toString('utf8'));
      buf = buf.subarray(end + 1);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        const i = waiting.findIndex((w) => w.method === msg.method);
        if (i !== -1) waiting.splice(i, 1)[0].resolve(msg.params);
      }
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      proc.stdio[3].write(
        JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0'
      );
    });
  const next = (method) =>
    new Promise((resolve) => waiting.push({ method, resolve }));
  return { proc, send, next };
}

/**
 * A fallback face is not an error Chrome reports — it just renders, which is
 * how these cards once spent weeks going out in Georgia with nobody noticing.
 * So every page is asked, before its picture is taken, whether each face it
 * was given is actually loaded and in use, and the run stops if one is not.
 */
const FACE_CHECK = `Promise.all(${JSON.stringify(
  FACES.map((f) => `${f.weight} 40px '${f.family}'`)
)}.map((f) => document.fonts.load(f))).then((sets) => sets.every((s) =>
  s.length > 0 && s.every((face) => face.status === 'loaded')), () => false)`;

function fail(message) {
  console.error(message);
  chrome?.proc.kill('SIGKILL');
  rmSync(tmp, { recursive: true, force: true });
  process.exit(1);
}

// One browser for all three images. A hung Chrome should fail the run, not
// hang it.
const chrome = openChrome();
chrome.proc.on('error', (e) => fail(`Could not start Chrome: ${e.message}`));
setTimeout(
  () => fail('Chrome stopped answering — no images were finished.'),
  90_000
).unref();
const { targetId } = await chrome.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await chrome.send('Target.attachToTarget', {
  targetId,
  flatten: true,
});
await chrome.send('Page.enable', {}, sessionId);
await chrome.send(
  'Emulation.setDeviceMetricsOverride',
  { width: W, height: H, deviceScaleFactor: 1, mobile: false },
  sessionId
);

let shots = 0;
async function render(html, outWebp) {
  const htmlPath = path.join(tmp, `card-${++shots}.html`);
  writeFileSync(htmlPath, html);
  const loaded = chrome.next('Page.loadEventFired');
  await chrome.send('Page.navigate', { url: `file://${htmlPath}` }, sessionId);
  await loaded;
  const faces = await chrome.send(
    'Runtime.evaluate',
    { expression: FACE_CHECK, awaitPromise: true, returnByValue: true },
    sessionId
  );
  if (faces.result?.value !== true) {
    fail(
      `The card faces did not load in Chrome — refusing to render ${path.basename(outWebp)} in a fallback face.\n` +
        `Check scripts/fonts/: ${FACES.map((f) => f.file).join(', ')}.`
    );
  }
  const { data } = await chrome.send(
    'Page.captureScreenshot',
    {
      format: 'webp',
      quality: WEBP_QUALITY,
      clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
    },
    sessionId
  );
  writeFileSync(outWebp, Buffer.from(data, 'base64'));
}

// A post may already have a hero that is not generated — an app screenshot, a
// real photograph. Those beat anything drawn here, so never replace one by
// accident: --force is how you say you meant it.
const hasHero = /^heroImage:/m.test(raw);
// `out` lets a spec write under a different basename than the slug it belongs
// to — a report needs BOTH a full hero for its page and a plain card image for
// the index, and without this the second render overwrites the first.
const outBase = spec.out ?? slug;
const heroOut = path.join(OUT, `${outBase}-hero.webp`);
const heroLightOut = path.join(OUT, `${outBase}-hero-light.webp`);
const ogOut = path.join(OUT, `${outBase}.webp`);

let wroteHero = false;
if (hasHero && !force) {
  console.log('  hero already set — social card only (--force to replace it)');
} else {
  const template = chooseTemplate();
  const markup = template.render('dark');

  // Count what the picture actually says. Counting the rendered markup rather
  // than the spec is the point: it catches words a template adds on its own, and
  // it cannot drift out of sync with a renderer the way a spec-side count would.
  const words = markup
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .split(/\s+/)
    // A lone `#`, `·` or `→` is a mark, not a word — it carries no reading cost.
    .filter((w) => /[a-z0-9]/i.test(w)).length;
  const budget = template.words ?? WORD_BUDGET;
  if (words > budget) {
    console.warn(
      `  ! ${words} words on this image; the budget is ${budget}.\n` +
        `    At 341px most of them are under 11px and read as grey noise. The card\n` +
        `    beside it already carries the title and the excerpt — cut, don't shrink.`
    );
  } else {
    console.log(`  words: ${words}/${budget}`);
  }

  await render(markup, heroOut);
  await render(template.render('light'), heroLightOut);
  wroteHero = true;
  console.log(`  template: ${template.name}`);
  console.log(`  ${heroOut}`);
  console.log(`  ${heroLightOut}`);
}
await render(ogHtml(), ogOut);
console.log(`  ${ogOut}`);
// Let Chrome close its profile before the temp folder goes, then make sure.
if (chrome.proc.exitCode === null) {
  const exited = new Promise((resolve) => chrome.proc.once('exit', resolve));
  chrome.send('Browser.close').catch(() => {});
  let timer;
  await Promise.race([
    exited,
    new Promise((resolve) => (timer = setTimeout(resolve, 5000))),
  ]);
  clearTimeout(timer);
  chrome.proc.kill('SIGKILL');
}
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

if (standalone) {
  console.log(
    `  standalone — no frontmatter to update. Wire the paths up by hand:\n` +
      `    hero  /images/content/${slug}-hero.webp (+ -hero-light)\n` +
      `    social /images/content/${slug}.webp`
  );
} else if (text !== raw) {
  writeFileSync(postPath, text);
  console.log(`  updated frontmatter in ${postPath}`);
}
