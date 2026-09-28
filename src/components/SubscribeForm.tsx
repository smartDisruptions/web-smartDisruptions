'use client';

import Link from 'next/link';
import { useState } from 'react';

// Email-capture form. Posts to /api/subscribe (Supabase-backed, insert-only).
// `source` tags where the signup came from so we can see which surface works.
export default function SubscribeForm({
  source = 'site',
  className = '',
}: {
  source?: 'site' | 'post' | 'home' | 'market-storm';
  className?: string;
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
        className={`text-base font-medium text-accent ${className}`.trim()}
        role="status"
      >
        You&rsquo;re in. Next build, your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`.trim()}
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
      <input
        id={`subscribe-email-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-h-11 min-w-0 flex-1 rounded-none border-0 border-b-[3px] border-text-primary bg-transparent px-1 py-2 text-base text-text-primary placeholder:text-text-secondary/70 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="nb-wobble font-display inline-flex min-h-11 items-center justify-center border-2 border-[var(--sd-sticky-ink)] bg-[var(--sd-sticky)] px-5 py-1 text-xl text-[var(--sd-sticky-ink)] transition-all hover:-rotate-1 hover:scale-[1.03] disabled:pointer-events-none disabled:opacity-50"
      >
        {status === 'sending' ? 'Adding…' : 'Get the next build'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-accent-secondary sm:basis-full" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-text-secondary/80 sm:basis-full">
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
