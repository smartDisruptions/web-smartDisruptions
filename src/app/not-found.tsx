import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-5">
      {/* A sticky note where the page should have been. */}
      <div className="nb-sticky nb-tape -rotate-2 px-10 pt-9 pb-8 text-center">
        <h1 className="font-display text-8xl">404</h1>
        <p className="font-display mt-1 text-3xl">
          this page isn&apos;t in the notebook.
        </p>
      </div>
      <Button variant="secondary" size="lg" href="/" className="mt-10">
        &larr; back to the front
      </Button>
    </div>
  );
}
