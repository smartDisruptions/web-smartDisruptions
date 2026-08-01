'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Editor-in-chief command center.
 *
 * Three views over the same data: the Board (what exists and where), the
 * Schedule (what is due, in date order), and Channels (where each piece is
 * going). Every write goes through /api/studio and lands as a commit — the
 * dashboard never holds state the repo doesn't have.
 */

type ChannelPlan = {
  name: string;
  status: 'planned' | 'scheduled' | 'done';
  scheduledFor?: string;
  note?: string;
};

type BranchPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  liveAt?: string;
  channels: ChannelPlan[];
  branch: string;
  sha: string;
  path: string;
  parseError?: string;
};

type BranchScan = { branch: string; posts: BranchPost[]; error?: string };

const CHANNELS = ['linkedin', 'substack', 'reddit', 'email'] as const;
const DRAFT_BRANCH = 'dev';
const PRODUCTION_BRANCH = 'main';

const eyebrow =
  'font-mono text-xs font-medium uppercase tracking-[0.16em] text-text-secondary';

const STATUS_TONE: Record<BranchPost['status'], string> = {
  draft: 'border-border text-text-secondary',
  scheduled: 'border-warn text-warn',
  published: 'border-bull text-bull',
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** ISO -> value for <input type="datetime-local">, in the viewer's zone. */
function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

export default function StudioBoard({
  missingConfig,
}: {
  missingConfig: string[];
}) {
  const [scans, setScans] = useState<BranchScan[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [needsConfig, setNeedsConfig] = useState<string[]>(missingConfig);
  const [view, setView] = useState<'board' | 'schedule' | 'channels'>('board');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const res = await fetch('/api/studio/posts', { cache: 'no-store' });
      const data = (await res.json()) as {
        branches?: BranchScan[];
        error?: string;
        needsConfig?: string[];
      };
      if (data.needsConfig?.length) setNeedsConfig(data.needsConfig);
      if (data.error && !data.needsConfig) setLoadError(data.error);
      setScans(data.branches ?? []);
    } catch {
      setLoadError('Could not reach the Studio API.');
      setScans([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const posts = useMemo(() => (scans ?? []).flatMap((s) => s.posts), [scans]);

  /**
   * One row per article. A post that exists on several branches (a draft
   * branched off dev, say) collapses to the copy furthest along, so the board
   * shows articles rather than duplicates — with the others listed as "also on".
   */
  const articles = useMemo(() => {
    const rank = { draft: 0, scheduled: 1, published: 2 };
    const bySlug = new Map<string, { post: BranchPost; alsoOn: string[] }>();
    for (const p of posts) {
      const found = bySlug.get(p.slug);
      if (!found) {
        bySlug.set(p.slug, { post: p, alsoOn: [] });
        continue;
      }
      const better =
        rank[p.status] > rank[found.post.status] ||
        (p.branch === DRAFT_BRANCH && found.post.branch !== DRAFT_BRANCH);
      if (better) {
        bySlug.set(p.slug, {
          post: p,
          alsoOn: [...found.alsoOn, found.post.branch],
        });
      } else {
        found.alsoOn.push(p.branch);
      }
    }
    return [...bySlug.values()].sort((a, b) => {
      const ad = a.post.liveAt ?? a.post.publishDate;
      const bd = b.post.liveAt ?? b.post.publishDate;
      return ad < bd ? 1 : ad > bd ? -1 : 0;
    });
  }, [posts]);

  const columns = useMemo(
    () => ({
      draft: articles.filter((a) => a.post.status === 'draft'),
      scheduled: articles.filter((a) => a.post.status === 'scheduled'),
      published: articles.filter((a) => a.post.status === 'published'),
    }),
    [articles]
  );

  const dueNow = useMemo(
    () =>
      columns.scheduled.filter((a) => {
        const d = daysUntil(a.post.liveAt);
        return d !== null && d <= 0;
      }),
    [columns.scheduled]
  );

  async function save(body: Record<string, unknown>, okMessage: string) {
    setBusy(true);
    try {
      const res = await fetch('/api/studio/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        prUrl?: string;
      };
      if (res.ok && data.ok) {
        setToast(okMessage + (data.prUrl ? ` — ${data.prUrl}` : ''));
        await load();
        return true;
      }
      setToast(data.error ?? 'Something went wrong.');
      return false;
    } catch {
      setToast('Network error.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (needsConfig.length) {
    return <Setup missing={needsConfig} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>Studio</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-text-primary">
            Command center
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NewDraft onCreated={load} setToast={setToast} />
          <button
            onClick={load}
            className="rounded-lg border border-border px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
          >
            Refresh
          </button>
        </div>
      </header>

      <Summary
        counts={{
          drafts: columns.draft.length,
          scheduled: columns.scheduled.length,
          published: columns.published.length,
          due: dueNow.length,
        }}
      />

      {loadError && (
        <p className="mt-6 rounded-lg border border-bear bg-bear-soft px-4 py-3 text-sm text-text-primary">
          {loadError}
        </p>
      )}

      {(scans ?? []).some((s) => s.error) && (
        <div className="mt-4 rounded-lg border border-warn bg-warn-soft px-4 py-3 text-sm text-text-primary">
          Some branches could not be read:{' '}
          {(scans ?? [])
            .filter((s) => s.error)
            .map((s) => `${s.branch} (${s.error})`)
            .join('; ')}
        </div>
      )}

      <nav className="mt-8 flex gap-2 border-b border-border">
        {(['board', 'schedule', 'channels'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`-mb-px border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
              view === v
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {v}
          </button>
        ))}
      </nav>

      {scans === null ? (
        <p className="mt-10 font-mono text-sm text-text-secondary">
          Reading branches…
        </p>
      ) : articles.length === 0 ? (
        <Empty />
      ) : view === 'board' ? (
        <Board
          columns={columns}
          open={open}
          setOpen={setOpen}
          save={save}
          busy={busy}
        />
      ) : view === 'schedule' ? (
        <Schedule
          articles={articles}
          open={open}
          setOpen={setOpen}
          save={save}
          busy={busy}
        />
      ) : (
        <Channels articles={articles} save={save} busy={busy} />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-lg border border-border bg-surface-elevated px-5 py-3 text-sm text-text-primary shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Setup({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-20">
      <p className={eyebrow}>Studio</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-text-primary">
        One step left
      </h1>
      <p className="mt-4 text-text-primary/85">
        The Studio needs these environment variables before it can read the repo
        or let anyone in:
      </p>
      <ul className="mt-5 flex flex-col gap-3">
        {missing.map((m) => (
          <li
            key={m}
            className="rounded-lg border border-border bg-surface px-4 py-3"
          >
            <code className="font-mono text-sm text-accent-hover">{m}</code>
            <p className="mt-1 text-sm text-text-secondary">{HELP[m]}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        Locally these go in <code className="font-mono">.env.local</code>; on
        Vercel, in the project&apos;s Environment Variables. Nothing is
        committed, and there is no default — an unconfigured Studio stays shut.
      </p>
    </div>
  );
}

const HELP: Record<string, string> = {
  STUDIO_PASSWORD: 'The password you will type to sign in.',
  STUDIO_SECRET:
    'A long random string used to sign session cookies. Rotating it signs everyone out.',
  GITHUB_TOKEN:
    'A GitHub token with repo scope. The Studio reads branches and commits schedule changes with it.',
};

function Summary({
  counts,
}: {
  counts: { drafts: number; scheduled: number; published: number; due: number };
}) {
  const tiles = [
    { label: 'Drafts', value: counts.drafts, tone: 'text-text-primary' },
    { label: 'Scheduled', value: counts.scheduled, tone: 'text-warn' },
    { label: 'Published', value: counts.published, tone: 'text-bull' },
    {
      label: 'Due now',
      value: counts.due,
      tone: counts.due > 0 ? 'text-bear' : 'text-text-secondary',
    },
  ];
  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div className={eyebrow}>{t.label}</div>
          <div
            className={`font-display mt-1 text-2xl font-semibold [font-variant-numeric:tabular-nums] ${t.tone}`}
          >
            {t.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="mt-10 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-text-primary">No articles found on any branch.</p>
      <p className="mt-2 text-sm text-text-secondary">
        New Article puts a file on{' '}
        <code className="font-mono">{DRAFT_BRANCH}</code> as a draft. Ask Claude
        for an article and it lands in the same place.
      </p>
    </div>
  );
}

type SaveFn = (
  body: Record<string, unknown>,
  okMessage: string
) => Promise<boolean>;

type Entry = { post: BranchPost; alsoOn: string[] };

function Board({
  columns,
  open,
  setOpen,
  save,
  busy,
}: {
  columns: Record<'draft' | 'scheduled' | 'published', Entry[]>;
  open: string | null;
  setOpen: (v: string | null) => void;
  save: SaveFn;
  busy: boolean;
}) {
  const cols = [
    {
      key: 'draft' as const,
      title: 'Drafts',
      hint: `written, not yet dated · on ${DRAFT_BRANCH}`,
    },
    {
      key: 'scheduled' as const,
      title: 'Scheduled',
      hint: 'waiting for a date',
    },
    {
      key: 'published' as const,
      title: 'Published',
      hint: `live on ${PRODUCTION_BRANCH}`,
    },
  ];
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-3">
      {cols.map((c) => (
        <section key={c.key} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight text-text-primary">
              {c.title}
            </h2>
            <span className={eyebrow}>{columns[c.key].length}</span>
          </div>
          <p className="text-xs text-text-secondary">{c.hint}</p>
          {columns[c.key].length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-text-secondary">
              Nothing here
            </p>
          ) : (
            columns[c.key].map((entry) => (
              <ArticleCard
                key={entry.post.slug}
                entry={entry}
                open={open === entry.post.slug}
                onToggle={() =>
                  setOpen(open === entry.post.slug ? null : entry.post.slug)
                }
                save={save}
                busy={busy}
              />
            ))
          )}
        </section>
      ))}
    </div>
  );
}

function ArticleCard({
  entry,
  open,
  onToggle,
  save,
  busy,
}: {
  entry: Entry;
  open: boolean;
  onToggle: () => void;
  save: SaveFn;
  busy: boolean;
}) {
  const { post, alsoOn } = entry;
  const due = daysUntil(post.liveAt);

  return (
    <article className="rounded-xl border border-border bg-surface">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-col items-start gap-2 px-4 py-3.5 text-left"
      >
        <div className="flex w-full items-start justify-between gap-3">
          <span className="font-semibold leading-snug text-text-primary">
            {post.title}
          </span>
          <span
            className={`flex-none rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_TONE[post.status]}`}
          >
            {post.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-text-secondary">
          <span className="rounded bg-fill px-1.5 py-0.5">{post.branch}</span>
          {alsoOn.length > 0 && <span>also on {alsoOn.join(', ')}</span>}
          {post.status === 'scheduled' && (
            <span
              className={due !== null && due <= 0 ? 'text-bear' : 'text-warn'}
            >
              {due !== null && due <= 0
                ? 'due now'
                : `in ${due} day${due === 1 ? '' : 's'}`}
            </span>
          )}
        </div>
        {post.parseError && (
          <p className="text-xs text-bear">
            Could not parse this file: {post.parseError}
          </p>
        )}
      </button>
      {open && <Editor post={post} save={save} busy={busy} />}
    </article>
  );
}

function Editor({
  post,
  save,
  busy,
}: {
  post: BranchPost;
  save: SaveFn;
  busy: boolean;
}) {
  const [liveAt, setLiveAt] = useState(toLocalInput(post.liveAt));
  const [confirming, setConfirming] = useState(false);

  const base = { branch: post.branch, slug: post.slug, sha: post.sha };

  return (
    <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
      <p className="text-sm leading-relaxed text-text-secondary">
        {post.excerpt || <em>No excerpt yet.</em>}
      </p>

      <div className="flex flex-col gap-2">
        <label className={eyebrow} htmlFor={`live-${post.slug}`}>
          Go live
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id={`live-${post.slug}`}
            type="datetime-local"
            value={liveAt}
            onChange={(e) => setLiveAt(e.target.value)}
            className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-accent"
          />
          <button
            disabled={busy || !liveAt}
            onClick={() =>
              save(
                {
                  ...base,
                  status: 'scheduled',
                  liveAt: new Date(liveAt).toISOString(),
                },
                `Scheduled "${post.title}"`
              )
            }
            className="rounded-lg border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent hover:text-text-primary disabled:opacity-40"
          >
            Schedule
          </button>
          {post.status !== 'draft' && (
            <button
              disabled={busy}
              onClick={() =>
                save(
                  { ...base, status: 'draft', liveAt: null },
                  `Moved "${post.title}" back to draft`
                )
              }
              className="rounded-lg border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent hover:text-text-primary disabled:opacity-40"
            >
              Unschedule
            </button>
          )}
        </div>
        <p className="text-xs text-text-secondary">
          Scheduling commits the date to{' '}
          <code className="font-mono">{post.branch}</code>. Nothing becomes
          public until you press Publish.
        </p>
      </div>

      <ChannelEditor post={post} save={save} busy={busy} />

      {post.status !== 'published' && (
        <div className="border-t border-border pt-4">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
            >
              Publish…
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-accent bg-fill px-4 py-3">
              <div className="flex flex-col gap-2 text-sm text-text-primary">
                <p>
                  Publish <strong>{post.title}</strong>? It goes live on the
                  site.
                </p>
                <p className="text-text-secondary">
                  This sets status to published, then merges{' '}
                  <code className="font-mono">{DRAFT_BRANCH}</code> into{' '}
                  <code className="font-mono">{PRODUCTION_BRANCH}</code> — so{' '}
                  <strong className="text-text-primary">
                    everything currently on {DRAFT_BRANCH} ships
                  </strong>
                  , not just this article. Other drafts riding along stay
                  invisible.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busy}
                  onClick={async () => {
                    const done = await save(
                      { ...base, action: 'publish', title: post.title },
                      `Published "${post.title}"`
                    );
                    if (done) setConfirming(false);
                  }}
                  className="rounded-lg bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? 'Publishing…' : 'Yes, publish'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChannelEditor({
  post,
  save,
  busy,
}: {
  post: BranchPost;
  save: SaveFn;
  busy: boolean;
}) {
  const [plans, setPlans] = useState<ChannelPlan[]>(post.channels);

  const setChannel = (name: string, patch: Partial<ChannelPlan>) => {
    setPlans((prev) => {
      const found = prev.find((p) => p.name === name);
      if (!found) return [...prev, { name, status: 'planned', ...patch }];
      return prev.map((p) => (p.name === name ? { ...p, ...patch } : p));
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className={eyebrow}>Channels</span>
      <div className="flex flex-col gap-2">
        {CHANNELS.map((name) => {
          const plan = plans.find((p) => p.name === name);
          return (
            <div
              key={name}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2"
            >
              <span className="w-20 flex-none font-mono text-xs text-text-primary">
                {name}
              </span>
              <select
                value={plan?.status ?? 'planned'}
                onChange={(e) =>
                  setChannel(name, {
                    status: e.target.value as ChannelPlan['status'],
                  })
                }
                className="rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-text-primary"
              >
                <option value="planned">planned</option>
                <option value="scheduled">scheduled</option>
                <option value="done">done</option>
              </select>
              <input
                type="datetime-local"
                value={toLocalInput(plan?.scheduledFor)}
                onChange={(e) =>
                  setChannel(name, {
                    scheduledFor: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
                className="rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary"
              />
            </div>
          );
        })}
      </div>
      <button
        disabled={busy}
        onClick={() =>
          save(
            {
              branch: post.branch,
              slug: post.slug,
              sha: post.sha,
              channels: plans.filter(
                (p) => p.status !== 'planned' || p.scheduledFor
              ),
            },
            `Saved the channel plan for "${post.title}"`
          )
        }
        className="self-start rounded-lg border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent hover:text-text-primary disabled:opacity-40"
      >
        Save channels
      </button>
    </div>
  );
}

function Schedule({
  articles,
  open,
  setOpen,
  save,
  busy,
}: {
  articles: Entry[];
  open: string | null;
  setOpen: (v: string | null) => void;
  save: SaveFn;
  busy: boolean;
}) {
  const dated = articles
    .filter((a) => a.post.liveAt || a.post.status === 'scheduled')
    .sort((a, b) => ((a.post.liveAt ?? '') < (b.post.liveAt ?? '') ? -1 : 1));
  const undated = articles.filter(
    (a) => !a.post.liveAt && a.post.status !== 'scheduled'
  );

  return (
    <div className="mt-8 flex flex-col gap-8">
      <section>
        <h2 className="font-display text-lg font-semibold tracking-tight text-text-primary">
          On the calendar
        </h2>
        {dated.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-text-secondary">
            Nothing scheduled. Open an article on the Board and give it a
            go-live date.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col border-t border-border">
            {dated.map((entry) => {
              const due = daysUntil(entry.post.liveAt);
              return (
                <li
                  key={entry.post.slug}
                  className="border-b border-border py-3"
                >
                  <button
                    onClick={() =>
                      setOpen(open === entry.post.slug ? null : entry.post.slug)
                    }
                    className="flex w-full flex-wrap items-baseline gap-x-4 gap-y-1 text-left"
                  >
                    <span
                      className={`w-52 flex-none font-mono text-xs [font-variant-numeric:tabular-nums] ${
                        due !== null && due <= 0 ? 'text-bear' : 'text-accent'
                      }`}
                    >
                      {fmtDate(entry.post.liveAt)}
                    </span>
                    <span className="flex-1 font-semibold text-text-primary">
                      {entry.post.title}
                    </span>
                    <span className="font-mono text-[11px] text-text-secondary">
                      {entry.post.branch}
                    </span>
                  </button>
                  {open === entry.post.slug && (
                    <Editor post={entry.post} save={save} busy={busy} />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {undated.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold tracking-tight text-text-primary">
            No date yet
          </h2>
          <ul className="mt-4 flex flex-col border-t border-border">
            {undated.map((entry) => (
              <li
                key={entry.post.slug}
                className="flex flex-wrap items-baseline gap-x-4 border-b border-border py-3"
              >
                <span className="flex-1 text-text-primary">
                  {entry.post.title}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${STATUS_TONE[entry.post.status]}`}
                >
                  {entry.post.status}
                </span>
                <span className="font-mono text-[11px] text-text-secondary">
                  {entry.post.branch}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Channels({
  articles,
  save,
  busy,
}: {
  articles: Entry[];
  save: SaveFn;
  busy: boolean;
}) {
  void save;
  void busy;
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface-elevated">
          <tr>
            <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Article
            </th>
            {CHANNELS.map((c) => (
              <th
                key={c}
                className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {articles.map(({ post }) => (
            <tr key={post.slug}>
              <td className="border-b border-border px-4 py-3 align-top">
                <span className="font-medium text-text-primary">
                  {post.title}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] text-text-secondary">
                  {post.branch}
                </span>
              </td>
              {CHANNELS.map((c) => {
                const plan = post.channels.find((p) => p.name === c);
                return (
                  <td
                    key={c}
                    className="border-b border-border px-4 py-3 align-top"
                  >
                    {!plan ? (
                      <span className="text-text-secondary">—</span>
                    ) : (
                      <>
                        <span
                          className={`font-mono text-[11px] uppercase tracking-[0.06em] ${
                            plan.status === 'done'
                              ? 'text-bull'
                              : plan.status === 'scheduled'
                                ? 'text-warn'
                                : 'text-text-secondary'
                          }`}
                        >
                          {plan.status}
                        </span>
                        {plan.scheduledFor && (
                          <span className="mt-0.5 block text-[11px] text-text-secondary [font-variant-numeric:tabular-nums]">
                            {fmtDate(plan.scheduledFor)}
                          </span>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NewDraft({
  onCreated,
  setToast,
}: {
  onCreated: () => Promise<void>;
  setToast: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/studio/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        branch?: string;
        error?: string;
      };
      if (res.ok && data.ok) {
        setToast(`Created ${data.branch}`);
        setTitle('');
        setOpen(false);
        await onCreated();
      } else {
        setToast(data.error ?? 'Could not create the draft.');
      }
    } catch {
      setToast('Network error.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90"
      >
        New article
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && create()}
        placeholder="Article title"
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary focus-visible:border-accent"
      />
      <button
        onClick={create}
        disabled={busy || !title.trim()}
        className="rounded-lg bg-accent px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? 'Creating…' : 'Create'}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="rounded-lg border border-border px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-text-secondary hover:text-text-primary"
      >
        Cancel
      </button>
    </div>
  );
}
