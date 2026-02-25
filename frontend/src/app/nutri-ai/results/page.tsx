'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ResultsCard from '@/components/nutri-ai/ResultsCard';

export default function NutriResultsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('nutri_result');
    if (raw) {
      try { setData(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-text-secondary">No results found. Upload a label first.</p>
        <Link href="/nutri-ai/upload" className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
          Upload Label
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 font-display text-2xl font-bold">Analysis Results</h1>
      <ResultsCard data={data} />
      <div className="mt-8 flex gap-4">
        <Link href="/nutri-ai/upload" className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover">
          Scan Another
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-border px-6 py-2.5 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
