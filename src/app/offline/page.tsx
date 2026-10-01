import type { Metadata } from 'next';
import Kiru from '@/components/kiru/Kiru';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Offline — Smart Disruptions',
  robots: { index: false, follow: false },
};

/**
 * What the service worker (public/sw.js) shows for a page you haven't opened
 * before, when there's no connection. Pages you have visited still open.
 */
export default function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <Kiru pose="meditate" className="h-56 w-auto" />
      <p className="sd-kicker mt-6">No connection</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">Kiru is waiting it out.</h1>
      <p className="font-read mt-4 text-lg leading-relaxed text-text-secondary">
        You&apos;re offline, and this page isn&apos;t saved on your device yet. Anything you&apos;ve
        already opened here still works — try going back to it.
      </p>
      <div className="mt-8">
        <Button variant="primary" href="/">
          Try the home page
        </Button>
      </div>
    </section>
  );
}
