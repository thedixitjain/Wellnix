'use client';

import Button from '@/components/ui/Button';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-6xl font-bold text-error">500</h1>
      <p className="mt-4 text-xl font-semibold">Something went wrong</p>
      <p className="mt-2 max-w-md text-text-secondary">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={reset} className="mt-8" variant="secondary">
        Try Again
      </Button>
    </div>
  );
}
