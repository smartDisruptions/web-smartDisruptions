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
 *   evidence key   template    the picture
 *   —              split       two panels, the second a saturated field
 *   count          count       one block per unit, filled for the ones that broke
 *   log            console     the run that produced the finding
 *   record         receipt     a ledger of findings, verdict stamped across it
 *   statement      field       one colour, one sentence reversed out of it
 *   file           file        a document as itself, filename in the chrome
 *   sequence       sequence    ordered events on a rail
 *   checklist      checklist   a set of named peers, each with its own state
 *   annotated      annotated   a passage with its problems marked
 *   versus         versus      two named alternatives across the same dimensions
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
 * Headless Chrome renders AND encodes it — given a `.webp` output path it writes
 * real WebP, so nothing has to convert anything.
 *
 * USAGE
 *   node scripts/make-hero.mjs <slug> scripts/heroes/<slug>.json [--force]
 */
import { execFileSync } from 'node:child_process';
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

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
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
 * time into .next, which this script cannot see, so they are vendored beside it
 * — otherwise Chrome silently falls back to Georgia and the cards go out in a
 * serif the site never uses.
 */
function fontFace(family, file) {
  const p = path.join(FONT_DIR, file);
  if (!existsSync(p)) {
    console.warn(
      `  ! scripts/fonts/${file} missing — falling back to a system face`
    );
    return '';
  }
  return `@font-face{font-family:'${family}';font-weight:100 900;font-style:normal;
    font-display:block;src:url('file://${p}') format('woff2')}`;
}

const FONTS =
  fontFace('DisplaySD', 'instrument-sans.woff2') +
  fontFace('InterCard', 'inter.woff2');
// Must match `--font-display` in globals.css. When the site's display face
// changes, this and the vendored woff2 change with it — otherwise the cards go
// out in a face the site does not use, which is exactly how they spent weeks
// rendering in Georgia.
const DISPLAY = `DisplaySD, system-ui, -apple-system, sans-serif`;
const SANS = `InterCard, system-ui, -apple-system, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, Menlo, monospace`;

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
    check: (s) =>
      s.loud
        ? null
        : 'statement.loud is required — it is the line that carries',
  },
  {
    name: 'file',
    key: 'file',
    render: (k) => fileCard(k),
    check: (f) =>
      !f.lines?.length
        ? 'file.lines is empty'
        : f.lines.length > 4
          ? `file.lines has ${f.lines.length}; above 4 the card stops reading at grid size`
          : !f.verdict
            ? 'file.verdict is required — a file card is all small mono, so the caption is the only thing a phone can read'
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
    name: 'checklist',
    key: 'checklist',
    render: (k) => checklistCard(k),
    check: (c) =>
      !c.items?.length
        ? 'checklist.items is empty'
        : c.items.length > 4
          ? `checklist.items has ${c.items.length}; above 4 the names stop being readable`
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
  {
    name: 'versus',
    key: 'versus',
    render: (k) => versusCard(k),
    check: (v) =>
      !v.rows?.length
        ? 'versus.rows is empty'
        : !v.left?.name || !v.right?.name
          ? 'versus needs left.name and right.name — the columns are the point'
          : v.rows.length > 4
            ? `versus.rows has ${v.rows.length}; above 4 the table gets cramped`
            : !v.verdict
              ? 'versus.verdict is required — a table has no natural lede, so it has to be stated'
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
 * dark-on-paper to bright-on-charcoal exactly like the arcade inks, and both
 * halves are already AA-verified there. `neutral` is deliberately the body
 * colour rather than a fourth hue — a figure that carries no polarity should
 * not look like it carries one.
 */
const DATA_TONE = { bull: 'good', bear: 'bad', warn: 'warn' };
const ink = (k, tone) => {
  const mapped = DATA_TONE[tone];
  if (!mapped) return THEMES[k].text;
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
function logoCard(k) {
  const t = THEMES[k];
  const l = spec.logo;
  const file = path.join(LOGO_DIR, l.file);
  const w = Math.round(W * (l.scale ?? 0.46));
  return doc(
    `body{background:${t.bg};display:flex;align-items:center;justify-content:center}
     .m{width:${w}px;height:${Math.round(H * 0.42)}px;background:${t.text};
       -webkit-mask:url('file://${file}') center/contain no-repeat;
       mask:url('file://${file}') center/contain no-repeat}`,
    `<div class="m"></div>`
  );
}

/* QUOTE — the ticker board. A monospace symbol at display size over a rule of
   figures, each inked by its own polarity. This is the most literal of the
   three: it is the report's price strip, cropped. Tabular numerals throughout,
   because a row of figures that shifts on the digit is a row nobody trusts.

   The catalyst used to sit beside the ticker and was cut: at 341px it rendered
   as texture rather than words, and the card underneath already prints it. A
   hero that repeats the chrome around it is spending its scarcest resource —
   room — on nothing. */
function quoteCard(k) {
  const t = THEMES[k];
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
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:40px;padding:0 74px}
     .top{display:flex;align-items:baseline;gap:26px}
     .tk{font-family:${MONO};font-weight:700;font-size:76px;letter-spacing:.06em;
       color:${t.accent};line-height:1}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.06;letter-spacing:-.025em;
       color:${t.text};font-size:${ledeSize(q.verdict)}px;max-width:1000px}
     .row{display:flex;gap:0;border-top:1px solid ${t.rule}}
     .c{flex:1;padding:22px 26px 4px 0;display:flex;flex-direction:column;gap:10px;
       border-right:1px solid ${t.rule}}
     .c:last-child{border-right:0}
     .ck{font-family:${MONO};font-size:${TYPE.micro}px;letter-spacing:.14em;
       text-transform:uppercase;color:${t.dim}}
     .cv{font-family:${MONO};font-weight:700;font-size:${TYPE.major}px;
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
  const t = THEMES[k];
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
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:34px;padding:0 74px}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.06;letter-spacing:-.025em;
       color:${t.text};font-size:${ledeSize(s.verdict)}px;max-width:1000px}
     .g{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:${t.rule};
       border:1px solid ${t.rule}}
     .t{background:${t.surface};padding:26px;display:flex;flex-direction:column;gap:12px}
     .tl{display:flex;align-items:center;gap:10px;font-family:${MONO};
       font-size:${TYPE.label}px;letter-spacing:.13em;text-transform:uppercase;color:${t.dim}}
     .dot{width:10px;height:10px;border-radius:50%;flex:0 0 auto}
     .tv{font-family:${MONO};font-weight:700;font-size:${TYPE.major}px;
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
  const t = THEMES[k];
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
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:34px;padding:0 74px}
     .l{font-family:${MONO};font-size:${TYPE.label}px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase;color:${t.dim}}
     .chips{display:flex;gap:18px}
     .chip{display:flex;align-items:baseline;gap:12px;padding:16px 26px;
       border:2px solid;border-radius:12px}
     .n{font-family:${MONO};font-weight:700;font-size:44px;
       font-variant-numeric:tabular-nums;line-height:1}
     .w{font-family:${MONO};font-size:${TYPE.label}px;letter-spacing:.1em;
       text-transform:uppercase}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.08;letter-spacing:-.025em;
       color:${t.text};font-size:${ledeSize(l.finding)}px;max-width:1010px}
     .n2{font-family:${MONO};font-size:${TYPE.label}px;color:${t.dim};letter-spacing:.02em}`,
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
   card is one border too many. */
function split(k) {
  const t = THEMES[k];
  return doc(
    `body{display:flex;flex-direction:column;background:${t.bg};font-family:${SANS}}
     .p{display:flex;flex-direction:column;justify-content:center;gap:20px;padding:0 68px}
     .a{flex:0 0 282px;background:${t.surface};border-bottom:1px solid ${t.rule}}
     .b{flex:1 1 auto;background:${T.field}}
     .l{font-family:${MONO};font-size:${TYPE.label}px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase}
     .a .l{color:${t.dim}} .b .l{color:rgba(249,245,236,.82)}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.08;letter-spacing:-.025em}
     .a .h{color:${t.text};font-size:${ledeSize(before.text)}px}
     .b .h{color:${FIELD_FG};font-size:${ledeSize(after.text)}px}
     .d{font-family:${MONO};font-size:${TYPE.label}px;color:rgba(249,245,236,.78);letter-spacing:.02em}`,
    `<div class="p a">
       ${before.label ? `<div class="l">${esc(before.label)}</div>` : ''}
       <div class="h">${esc(before.text)}</div>
     </div>
     <div class="p b">
       ${after.label ? `<div class="l">${esc(after.label)}</div>` : ''}
       <div class="h">${esc(after.text)}</div>

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
      : `<span style="border:2px solid ${t.hair};flex:1;border-radius:4px"></span>`
  ).join('');
  return doc(
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:38px;padding:0 74px}
     .l{font-family:${MONO};font-size:${TYPE.label}px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase;color:${t.dim}}
     .blocks{display:flex;gap:14px;height:130px}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.06;letter-spacing:-.025em;
       color:${t.text};font-size:${ledeSize(`${c.hit} of ${c.of} ${c.verdict ?? ''}`)}px}
     .h em{font-style:normal;color:${k === 'dark' ? T.bright : T.field}}
     .d{font-family:${MONO};font-size:${TYPE.label}px;letter-spacing:.04em;color:${t.dim}}`,
    `<div class="l">${esc(c.of)} ${esc(c.unit)}</div>
     <div class="blocks">${blocks}</div>
     <div class="h"><em>${esc(c.hit)} of ${esc(c.of)}</em>${c.verdict ? ` ${esc(c.verdict)}` : ''}</div>
`,
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
      </div>`
    )
    .join('');
  return doc(
    `body{background:${t.bg};font-family:${MONO};padding:76px 60px}
     .win{height:100%;background:${t.surface};border:1px solid ${t.rule};border-radius:12px;
       overflow:hidden;display:flex;flex-direction:column}
     .bar{display:flex;align-items:center;gap:10px;padding:16px 22px;background:${t.lift};
       border-bottom:1px solid ${t.rule}}
     .dot{width:12px;height:12px;border-radius:50%;background:${t.rule}}
     .name{margin-left:8px;font-size:${TYPE.micro}px;color:${t.dim};letter-spacing:.06em}
     .body{flex:1;padding:26px 30px;display:flex;flex-direction:column;gap:20px;
       justify-content:center}
     .line{display:flex;align-items:center;gap:18px}
     .chip{border:1px solid;border-radius:3px;padding:3px 10px;font-size:${TYPE.micro}px;
       font-weight:600;letter-spacing:.1em;white-space:nowrap}
     .txt{font-size:${TYPE.minor}px;color:${t.text};letter-spacing:-.01em}
     .muted{color:${t.dim}}
     .sum{font-family:${DISPLAY};font-weight:600;letter-spacing:-.025em;
       color:${k === 'dark' ? T.bright : T.field};padding-top:20px;
       border-top:1px solid ${t.rule};font-size:${ledeSize(l.summary)}px}`,
    `<div class="win">
       <div class="bar">
         <span class="dot"></span><span class="dot"></span><span class="dot"></span>
         <span class="name">${esc(l.name)}</span>
       </div>
       <div class="body">
         ${lines}
         ${l.summary ? `<div class="sum">${esc(l.summary)}</div>` : ''}
       </div>
     </div>`
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
      </div>`
    )
    .join('');
  const stampInk = k === 'dark' ? T.bright : T.field;
  return doc(
    `body{background:${t.bg};font-family:${MONO};padding:56px 68px}
     .sheet{height:100%;background:${t.surface};border:1px solid ${t.rule};padding:38px 44px;
       display:flex;flex-direction:column;justify-content:space-between}
     .top{display:flex;justify-content:space-between;align-items:baseline;
       padding-bottom:18px;border-bottom:2px solid ${t.hair}}
     .who{font-size:${TYPE.micro}px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
       color:${t.text}}
     .when{font-size:${TYPE.micro}px;color:${t.dim};letter-spacing:.08em}
     .row{display:flex;justify-content:space-between;align-items:baseline;gap:32px;
       padding:20px 0;border-bottom:1px dashed ${t.rule}}
     .k{font-size:${TYPE.micro}px;letter-spacing:.1em;text-transform:uppercase;color:${t.dim}}
     .v{font-family:${DISPLAY};font-weight:600;font-size:${TYPE.minor}px;letter-spacing:-.01em;
       color:${t.text};text-align:right}
     .foot{display:flex;justify-content:space-between;align-items:flex-end;gap:28px}
     /* The stamp is this template's lede — it is the verdict, which is the whole
        point of a record. It is set in the display face rather than mono: at
        lede size, mono uppercase with tracking ran about 980px wide, wrapped to
        two lines, and squeezed the note beside it into a column one word wide. */
     .stamp{flex:0 1 auto;border:3px solid ${stampInk};color:${stampInk};
       font-family:${DISPLAY};font-weight:600;letter-spacing:-.005em;padding:10px 20px;
       transform:rotate(-3deg);line-height:1.1;
       font-size:${ledeSize(r.stamp)}px}
     .note{flex:0 0 auto;font-family:${MONO};font-size:${TYPE.micro}px;letter-spacing:.1em;
       text-transform:uppercase;color:${t.dim};text-align:right;white-space:pre-line}`,
    `<div class="sheet">
       <div class="top">
         <span class="who">${esc(r.title ?? 'Record')}</span>
       </div>
       ${rows}
       <div class="foot">
         ${r.stamp ? `<span class="stamp">${esc(r.stamp)}</span>` : '<span></span>'}

       </div>
     </div>`
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
       color:${FIELD_FG};font-size:${fitSize('x'.repeat(chars), LEDE_SOLO, TYPE.lede, 34)}px}
     .q{color:rgba(249,245,236,.55)}
     .sub{font-family:${MONO};font-size:${TYPE.label}px;letter-spacing:.08em;color:rgba(249,245,236,.78)}
     footer{flex:0 0 74px;background:${t.bg};display:flex;align-items:center;
       justify-content:space-between;padding:0 78px;font-family:${MONO};font-size:${TYPE.micro}px;
       letter-spacing:.12em;text-transform:uppercase;color:${t.dim}}`,
    `<div class="main">
       <div class="h">${s.quiet ? `<span class="q">${esc(s.quiet)}</span><br>` : ''}${esc(s.loud)}</div>

     </div>
     <footer>
       <span>${esc(fm.category ?? '')}</span>
       <span>smartdisruptions.com</span>
     </footer>`
  );
}

/* FILE — a document as itself: the filename in the chrome, the contents below.
   For a post whose evidence is a file someone can go and write — a config, a
   context file, a spec. Distinct from `console`, which shows what a machine
   *emitted*; this shows what a person *wrote*. */
function fileCard(k) {
  const t = THEMES[k];
  const f = spec.file;
  const ink = k === 'dark' ? T.bright : T.field;
  const lines = f.lines
    .map(
      (ln) => `
      <div class="ln">
        <div class="h"><span class="hash">#</span> ${esc(ln.h)}</div>
        <div class="v">${esc(ln.v)}</div>
      </div>`
    )
    .join('');
  return doc(
    `body{background:${t.bg};font-family:${MONO};padding:52px 72px;display:flex;
       flex-direction:column;gap:26px}
     /* A file card is all small mono by nature — that is the metaphor and it is
        worth keeping — so the lede sits under it as a caption rather than being
        forced inside the window. The card is the evidence; this is the finding. */
     .win{flex:1 1 auto;min-height:0;background:${t.surface};border:1px solid ${t.rule};
       border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
     .bar{display:flex;align-items:center;gap:10px;padding:15px 22px;background:${t.lift};
       border-bottom:1px solid ${t.rule}}
     .dot{width:11px;height:11px;border-radius:50%;background:${t.rule}}
     .fn{margin-left:10px;font-size:${TYPE.label}px;font-weight:600;letter-spacing:.02em;
       color:${t.text}}
     .fn em{font-style:normal;color:${ink}}
     .body{flex:1;padding:22px 30px;display:flex;flex-direction:column;
       justify-content:center;gap:18px}
     .h{font-size:${TYPE.label}px;font-weight:600;color:${ink};letter-spacing:.01em}
     .hash{opacity:.55}
     .v{font-size:${TYPE.label}px;color:${t.dim};margin-top:5px;letter-spacing:-.005em}
     .lede{flex:0 0 auto;font-family:${DISPLAY};font-weight:600;letter-spacing:-.025em;
       color:${t.text};line-height:1.06;
       font-size:${ledeSize(f.verdict)}px}
     .lede em{font-style:normal;color:${ink}}`,
    `<div class="win">
       <div class="bar">
         <span class="dot"></span><span class="dot"></span><span class="dot"></span>
         <span class="fn">${esc(f.name)}<em>${esc(f.ext ?? '')}</em></span>
       </div>
       <div class="body">${lines}</div>
     </div>
     ${
       f.verdict
         ? `<div class="lede">${f.verdict.replace(/\*(.+?)\*/g, (_, m) => `<em>${esc(m)}</em>`)}</div>`
         : ''
     }`
  );
}

/* SEQUENCE — ordered events on a rail. For a post whose evidence is that things
   happened in an order: six prompts, four deploys, a migration. The numbers are
   the part that survives the shrink, so they are drawn, not set in type. */
function sequenceCard(k) {
  const t = THEMES[k];
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
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:44px;padding:0 74px}
     .l{font-family:${MONO};font-size:${TYPE.label}px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase;color:${t.dim}}
     .rail{position:relative;display:flex;justify-content:space-between;gap:18px}
     .rail:before{content:'';position:absolute;left:26px;right:26px;top:26px;height:2px;
       background:${t.rule}}
     .step{position:relative;flex:1 1 0;display:flex;flex-direction:column;
       align-items:center;gap:16px;min-width:0}
     .node{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;
       justify-content:center;font-family:${MONO};font-size:${TYPE.label}px;font-weight:700;
       background:${t.surface};border:2px solid ${t.hair};color:${t.dim};
       position:relative;z-index:1}
     .node.on{background:${ink};border-color:${ink};color:${FIELD_FG}}
     .cap{font-family:${MONO};font-size:${TYPE.micro}px;line-height:1.35;color:${t.text};
       text-align:center;letter-spacing:-.005em}
     .h{font-family:${DISPLAY};font-weight:600;line-height:1.06;letter-spacing:-.025em;
       color:${t.text};font-size:${ledeSize(s.verdict)}px}
     .h em{font-style:normal;color:${ink}}`,
    `     <div class="rail">${steps}</div>
     ${s.verdict ? `<div class="h">${s.verdict.replace(/\*(.+?)\*/g, (_, m) => `<em>${esc(m)}</em>`)}</div>` : ''}`,
  );
}

/* CHECKLIST — a set of named peers, each with its own state. Not a tally (that
   is `count`, where the units are identical) and not a ledger of findings (that
   is `record`, which ends in a verdict). This is "here are the three things",
   where the names are the content. Markers are drawn, never emoji. */
function checklistCard(k) {
  const t = THEMES[k];
  const c = spec.checklist;
  const ink = k === 'dark' ? T.bright : T.field;
  const items = c.items
    .map(
      (it) => `
      <div class="item">
        <span class="mark${it.off ? ' off' : ''}"></span>
        <span class="txt"><b>${esc(it.text)}</b></span>
      </div>`,
    )
    .join('');
  return doc(
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:34px;padding:0 76px}
     .l{font-family:${MONO};font-size:${TYPE.label}px;font-weight:500;letter-spacing:.15em;
       text-transform:uppercase;color:${t.dim}}
     /* The label is the lede here: it states the finding, and the named items
        below are the evidence for it. Promoting the items instead would give the
        card three ledes and none of them would be the point. */
     .lede{font-family:${DISPLAY};font-weight:600;letter-spacing:-.025em;color:${t.text};
       line-height:1.06;font-size:${ledeSize(c.label)}px}
     .item{display:flex;align-items:baseline;gap:20px;padding:13px 0;
       border-bottom:1px solid ${t.rule}}
     .item:last-of-type{border-bottom:0}
     .mark{flex:0 0 auto;width:20px;height:20px;border-radius:5px;background:${ink};
       transform:translateY(2px)}
     .mark.off{background:transparent;border:2px solid ${t.hair}}
     .txt b{font-family:${DISPLAY};font-weight:600;font-size:${TYPE.major}px;
       letter-spacing:-.025em;color:${t.text}}
     .txt i{font-style:normal;font-family:${MONO};font-size:${TYPE.micro}px;color:${t.dim};
       margin-left:14px;letter-spacing:.02em}
     .note{font-family:${MONO};font-size:${TYPE.label}px;letter-spacing:.04em;color:${t.dim}}`,
    `<div class="lede">${esc(c.label)}</div>
     <div>${items}</div>
`,
  );
}

/* ANNOTATED — a passage with its problems marked. For a post whose evidence is
   that something *reads fine and isn't*: the claim stays legible, the flag names
   what is wrong with it. The underline does the work a red pen would. */
function annotatedCard(k) {
  const t = THEMES[k];
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
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;gap:30px;padding:0 76px}
     .top{display:flex;flex-direction:column;gap:8px}
     /* The intro is the lede — it is the finding. The flagged claims are the
        evidence and sit one step down the ramp. */
     .h{font-family:${DISPLAY};font-weight:600;letter-spacing:-.025em;color:${t.text};
       line-height:1.06;font-size:${ledeSize(a.intro)}px}
     .sub{font-family:${MONO};font-size:${TYPE.micro}px;letter-spacing:.04em;color:${t.dim}}
     .sp{padding:11px 0}
     .claim{font-family:${DISPLAY};font-weight:600;font-size:${TYPE.major}px;
       letter-spacing:-.01em;color:${t.text};display:inline-block;
       border-bottom:3px solid ${ink};padding-bottom:5px;line-height:1.2}
     .flag{font-family:${MONO};font-size:${TYPE.micro}px;font-weight:600;letter-spacing:.14em;
       text-transform:uppercase;color:${ink};margin-top:9px}`,
    `<div class="top">
       <div class="h">${esc(a.intro)}</div>

     </div>
     <div>${spans}</div>`
  );
}

/* VERSUS — two named alternatives across the same dimensions. For build-vs-buy,
   mine-vs-theirs, before-the-rewrite-vs-after. Distinct from `split`, which is
   one belief against one truth on a single axis; this compares two things that
   both exist, on several. */
function versusCard(k) {
  const t = THEMES[k];
  const v = spec.versus;
  const ink = k === 'dark' ? T.bright : T.field;
  const rows = v.rows
    .map(
      (r) => `
      <div class="r"><span class="a">${esc(r.l)}</span></div>
      <div class="r"><span class="b">${esc(r.r)}</span></div>`
    )
    .join('');
  return doc(
    `body{background:${t.bg};font-family:${SANS};display:flex;flex-direction:column;
       justify-content:center;padding:0 72px;gap:30px}
     /* A table has no natural lede — every cell is peer content — so this one is
        stated. Without it the largest thing on the card was a 40px cell, which is
        11px on a phone, and the card said nothing at the size most people see. */
     .lede{font-family:${DISPLAY};font-weight:600;letter-spacing:-.025em;color:${t.text};
       line-height:1.06;font-size:${ledeSize(v.verdict)}px}
     .lede em{font-style:normal;color:${ink}}
     .grid{display:grid;grid-template-columns:1fr 1fr;column-gap:44px;align-items:baseline}
     .hd{font-family:${MONO};font-size:${TYPE.micro}px;font-weight:600;letter-spacing:.13em;
       text-transform:uppercase;padding-bottom:13px;border-bottom:2px solid ${t.hair}}
     .hd.one{color:${t.dim}} .hd.two{color:${ink}}
     .r{padding:15px 0;border-bottom:1px solid ${t.rule}}
     .a{font-family:${DISPLAY};font-weight:600;font-size:${TYPE.minor}px;
       letter-spacing:-.025em;color:${t.dim}}
     .b{font-family:${DISPLAY};font-weight:600;font-size:${TYPE.minor}px;
       letter-spacing:-.025em;color:${t.text}}`,
    `${
      v.verdict
        ? `<div class="lede">${v.verdict.replace(/\*(.+?)\*/g, (_, m) => `<em>${esc(m)}</em>`)}</div>`
        : ''
    }
     <div class="grid">
       <div class="hd one">${esc(v.left.name)}</div>
       <div class="hd two">${esc(v.right.name)}</div>
       ${rows}
     </div>`
  );
}

/** The social card. One design for every template — see the header. */
function ogHtml() {
  const t = THEMES.dark;
  const chars = headline.map((h) => h.t).join('').length;
  return doc(
    `body{display:flex;flex-direction:column;background:${t.bg};font-family:${SANS}}
     .head{flex:1 1 auto;display:flex;align-items:center;padding:0 68px}
     h1{font-family:${DISPLAY};font-weight:600;line-height:1.08;letter-spacing:-.025em;
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
     </div>
     <footer>
       <span>smartdisruptions.com</span>
       <span class="cat">${esc(fm.category ?? '')}</span>
     </footer>`
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
    { stdio: 'ignore' }
  );
  if (!existsSync(outWebp)) throw new Error(`Chrome did not write ${outWebp}`);
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
        `    beside it already carries the title and the excerpt — cut, don't shrink.`,
    );
  } else {
    console.log(`  words: ${words}/${budget}`);
  }

  render(markup, heroOut);
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
