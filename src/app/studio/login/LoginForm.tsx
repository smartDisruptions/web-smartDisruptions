'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Only ever follow a same-site absolute path, so a crafted ?next= cannot
  // bounce the operator to another origin after a successful login.
  const raw = params.get('next') ?? '/studio';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/studio';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/studio/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        router.replace(next);
        router.refresh();
      } else {
        setError(data.error ?? 'Could not sign in.');
        setBusy(false);
      }
    } catch {
      setError('Network error — try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
      <label htmlFor="studio-password" className="sr-only">
        Studio password
      </label>
      <input
        id="studio-password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="rounded-lg border border-border bg-surface px-4 py-3 text-text-primary outline-none placeholder:text-text-secondary focus-visible:border-accent"
      />
      <button
        type="submit"
        disabled={busy || password === ''}
        className="rounded-lg bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? 'Checking…' : 'Sign in'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-bear">
          {error}
        </p>
      )}
    </form>
  );
}
