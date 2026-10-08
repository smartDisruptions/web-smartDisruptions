'use client';

import Link from 'next/link';
import { useState } from 'react';

// Email-capture form. Posts to /api/subscribe (Supabase-backed, insert-only).
// `source` tags where the signup came from so we can see which surface works.
// On the three Build pages it is also the list: 'websites', 'apps' and
// 'games' are each that page's own email list, so a send for one category
// goes to the people who asked for it.
//
// The look: in a narrow space, a full-width field above a full-width
// vermilion button — both thumb-sized. Given 24rem or more they join into one
// pill, the button riding inside the field's right end, and the pill takes
// the focus ring. It's a container query, not a viewport one, so the form
// fits whatever it's placed in: a sheet, a card, a grid tile.
export default function SubscribeForm({
  source = 'site',
  className = '',
  cta = 'Get the next build',
}: {
  source?:
    | 'site'
    | 'post'
    | 'home'
    | 'market-storm'
    | 'websites'
    | 'apps'
    | 'games';
  className?: string;
  /** The button's words. Defaults to the site-wide ask. */
  cta?: string;
}) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot — hidden from humans
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>(
    'idle'
  );
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, company }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus('done');
      } else {
        setStatus('error');
        setError(data.error ?? 'Something went wrong — try again in a minute.');
      }
    } catch {
      setStatus('error');
      setError('Something went wrong — try again in a minute.');
    }
  }

  if (status === 'done') {
    return (
      <p
        className={`inline-flex min-h-12 items-center gap-2.5 rounded-full bg-accent/10 py-2 pr-5 pl-2.5 text-base font-semibold text-accent ${className}`.trim()}
        role="status"
      >
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-sm text-background"
        >
          ✓
        </span>
        You&rsquo;re in. Next build, your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`@container relative w-full max-w-md ${className}`.trim()}
    >
      {/* Honeypot — hidden from people, filled by bots */}
      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <label htmlFor={`subscribe-email-${source}`} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2.5 @sm:flex-row @sm:items-center @sm:gap-1 @sm:rounded-full @sm:border @sm:border-[var(--sd-border-strong)] @sm:bg-surface @sm:p-1 @sm:shadow-[0_14px_30px_-22px_var(--sd-card-shadow)] @sm:transition-[border-color,box-shadow] @sm:focus-within:border-accent @sm:focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sd-accent)_28%,transparent)]">
        <input
          id={`subscribe-email-${source}`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-12 w-full min-w-0 flex-1 rounded-full border border-[var(--sd-border-strong)] bg-surface px-5 text-base text-text-primary shadow-[0_10px_24px_-20px_var(--sd-card-shadow)] transition-[border-color,box-shadow] placeholder:text-text-secondary focus-visible:!rounded-full focus-visible:border-accent focus-visible:!outline-transparent focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--sd-accent)_28%,transparent)] @sm:min-h-11 @sm:border-0 @sm:bg-transparent @sm:px-4 @sm:shadow-none @sm:focus-visible:shadow-none"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="sd-btn-primary relative inline-flex min-h-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d63a22] px-6 text-[0.95rem] font-bold tracking-[0.01em] text-white shadow-[0_10px_24px_-10px_rgba(214,58,34,.7)] transition-[background-color,box-shadow,scale] duration-300 hover:bg-[#c2311b] hover:shadow-[0_16px_34px_-12px_rgba(214,58,34,.8)] focus-visible:!rounded-full active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 @sm:min-h-11"
        >
          {status === 'sending' ? 'Adding…' : cta}
        </button>
      </div>
      {status === 'error' && (
        <p
          className="mt-2.5 px-1 text-sm font-medium text-accent-secondary"
          role="alert"
        >
          {error}
        </p>
      )}
      <p className="mt-3 px-1 text-xs leading-relaxed text-text-secondary">
        Just your email, just new builds — never sold or shared. Unsubscribe
        anytime by replying to any email.{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-accent"
        >
          Privacy
        </Link>
      </p>
    </form>
  );
}
