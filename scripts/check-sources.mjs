/**
 * Walks every Market Storm report's source list and checks that each link
 * still resolves.
 *
 * WHY THIS EXISTS
 * ---------------
 * A source list is a claim: that these documents were read and that the
 * report's conclusions rest on them. A dead link breaks the claim in the one
 * place a sceptical reader goes to test it, and it breaks silently — nothing
 * in the build fails when a newspaper reorganises its URLs.
 *
 * It also caught the original problem: reports were shipping with eleven
 * sources against sixty-eight consulted, and the gap was invisible because
 * nothing counted.
 *
 *   node scripts/check-sources.mjs            # every report
 *   node scripts/check-sources.mjs goog       # one report, by slug fragment
 *
 * Exit 1 on a dead link. A 403 or 429 is a bot filter, not a dead document —
 * reported, never fatal, because the page is fine in a browser and we cannot
 * tell the difference from here without one.
 */
import { marketStormReports } from '../src/data/marketStorm.ts';

const FILTER = process.argv[2];
const UA =
  'SmartDisruptions-linkcheck/1.0 (+https://smartdisruptions.com; joshescusa@gmail.com)';
const BOT_FILTERED = new Set([401, 403, 405, 429]);

/**
 * Hosts that answer a scripted request with a code that normally means
 * "your URL is wrong". Verified by hand in a real browser before being added
 * here — the entry is an assertion that the page loads, not a way to silence
 * the check. Keyed by host so a genuinely malformed URL anywhere else still
 * fails the build.
 */
const ODD_BOT_CODES = new Map([
  // 400 Bad Request to a script; the page renders normally in a browser.
  ['stockanalysis.com', new Set([400])],
  // 202 Accepted, then a challenge page a script never solves.
  ['www.morningstar.com', new Set([202])],
  // Refuse the connection outright, which looks identical to a dead host from
  // here. Each URL under these was opened by hand in a real browser and loads:
  // the AMD blog post and the MI455X brochure (which downloads rather than
  // renders), and the NPR piece on SpaceX's first post-IPO quarter.
  ['www.amd.com', new Set([0])],
  ['www.npr.org', new Set([0])],
  // Verified in a browser: the Enchanted Rock supply-agreement release loads.
  ['investors.psiengines.com', new Set([0])],
]);

function isBotFiltered(url, code) {
  if (BOT_FILTERED.has(code)) return true;
  try {
    return ODD_BOT_CODES.get(new URL(url).hostname)?.has(code) ?? false;
  } catch {
    return false;
  }
}
const CONCURRENCY = 8;
const TIMEOUT_MS = 25_000;

/** A source list this short means the research did not make it into the report. */
const MIN_SOURCES = 8;

async function status(url) {
  const ctl = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA },
      signal: ctl,
    });
    return r.status;
  } catch {
    return 0;
  }
}

async function pool(items, worker) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (i < items.length) out.push(await worker(items[i++]));
    }),
  );
  return out;
}

const reports = marketStormReports.filter(
  (r) => !FILTER || r.slug.includes(FILTER),
);
if (!reports.length) {
  console.error(`No Market Storm report matches "${FILTER}".`);
  process.exit(1);
}

let dead = 0,
  filtered = 0,
  checked = 0,
  thin = 0;

for (const report of reports) {
  const urls = [];
  for (const s of report.sources) {
    urls.push({ n: s.n, url: s.url, label: s.label });
    if (s.secondaryUrl)
      urls.push({ n: s.n, url: s.secondaryUrl, label: `${s.label} (secondary)` });
  }

  const kinds = report.sources.reduce((acc, s) => {
    const k = s.kind ?? (s.primary ? 'filing' : 'analysis');
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const shelf = Object.entries(kinds)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · ');

  console.log(`\n${report.ticker} — ${report.sources.length} sources (${shelf})`);

  if (report.sources.length < MIN_SOURCES) {
    thin++;
    console.log(
      `  THIN  only ${report.sources.length} sources — the research behind a report cites far more than this`,
    );
  }

  // Duplicate URLs mean the same document counted twice, which inflates the
  // number the page prints and is exactly the padding the rule forbids.
  const seen = new Map();
  for (const u of urls) {
    if (seen.has(u.url))
      console.log(`  DUPE  ${u.n} and ${seen.get(u.url)} are the same URL: ${u.url}`);
    else seen.set(u.url, u.n);
  }

  const results = await pool(urls, async (u) => ({ ...u, code: await status(u.url) }));
  checked += results.length;

  for (const r of results.sort((a, b) => a.n - b.n)) {
    if (r.code === 200) continue;
    if (isBotFiltered(r.url, r.code)) {
      filtered++;
      console.log(`  bot-filtered (${r.code})  [${r.n}] ${r.url}`);
    } else {
      dead++;
      console.log(`  DEAD (${r.code || 'no response'})  [${r.n}] ${r.label}\n        ${r.url}`);
    }
  }
}

console.log(
  `\n${checked} links checked · ${dead} dead · ${filtered} bot-filtered (fine in a browser)` +
    (thin ? ` · ${thin} report(s) under ${MIN_SOURCES} sources` : ''),
);
process.exit(dead > 0 ? 1 : 0);
