'use client';

import { useState } from 'react';

// Email-capture form. Posts to /api/subscribe (Supabase-backed, insert-only).
// `source` tags where the signup came from so we can see which surface works.
export default function SubscribeForm({
  source = 'site',
  className = '',
}: {
  source?: 'site' | 'post' | 'home';
  className?: string;
}) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); // honeypot — hidden from humans
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>(
    'idle',
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
      className={`flex w-full max-w-md flex-col gap-3 sm:flex-row ${className}`.trim()}
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
        className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50"
      >
        {status === 'sending' ? 'Adding…' : 'Get the next build'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-accent-secondary sm:basis-full" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
