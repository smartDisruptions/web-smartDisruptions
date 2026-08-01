import { Suspense } from 'react';
import { getAuthConfig } from '@/lib/studio/auth';
import LoginForm from './LoginForm';

// An auth page should never be prerendered or cached.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Studio — SmartDisruptions',
  // The Studio is private; keep it out of every index.
  robots: { index: false, follow: false },
};

export default function StudioLogin() {
  const cfg = getAuthConfig();

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-20">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent">
        Studio
      </p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-text-primary">
        Command center
      </h1>

      {cfg.ok ? (
        // LoginForm reads ?next= via useSearchParams, which needs a Suspense
        // boundary or the whole page bails out of static rendering.
        <Suspense
          fallback={<div className="mt-8 h-[7.5rem] rounded-lg bg-fill" />}
        >
          <LoginForm />
        </Suspense>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text-primary">
            Not configured yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Set{' '}
            {cfg.missing
              .map((m) => (
                <code
                  key={m}
                  className="rounded bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-accent-hover"
                >
                  {m}
                </code>
              ))
              .reduce((a, b) => (
                <>
                  {a} and {b}
                </>
              ))}{' '}
            in the environment, then reload. Locally that means{' '}
            <code className="rounded bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-accent-hover">
              .env.local
            </code>
            ; on Vercel, the project&apos;s Environment Variables.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            There is no default password on purpose — an unconfigured Studio
            stays shut rather than open.
          </p>
        </div>
      )}
    </div>
  );
}
