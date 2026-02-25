'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import type { ScanItem, PaginatedResponse } from '@/lib/types';

export default function ScanHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<ScanItem> | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;
    apiFetch<PaginatedResponse<ScanItem>>(`/user/scans?page=${page}&per_page=20`)
      .then(setData)
      .catch(() => {});
  }, [user, authLoading, router, page]);

  if (authLoading || !user) return <div className="flex min-h-[60vh] items-center justify-center text-text-secondary">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="mb-2 inline-block text-sm text-text-tertiary hover:text-text-primary">&larr; Dashboard</Link>
          <h1 className="font-display text-2xl font-bold">Scan History</h1>
        </div>
        <Link href="/nutri-ai" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          New Scan
        </Link>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-secondary p-12 text-center">
          <p className="text-text-tertiary">No scans yet. Scan a nutrition label to get started.</p>
          <Link href="/nutri-ai" className="mt-4 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover">
            Scan a Label
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary text-left text-text-tertiary">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Grade</th>
                  <th className="hidden px-6 py-3 font-medium sm:table-cell">Calories</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-tertiary/50">
                    <td className="px-6 py-4 font-medium">{s.product_name || 'Scan'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        s.score >= 70 ? 'bg-accent-glow text-accent' : s.score >= 40 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                      }`}>{s.score}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{s.grade}</td>
                    <td className="hidden px-6 py-4 text-text-secondary sm:table-cell">{s.calories ?? '-'}</td>
                    <td className="px-6 py-4 text-text-tertiary">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:border-border-hover">
                Previous
              </button>
              <span className="text-sm text-text-secondary">Page {data.page} of {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:border-border-hover">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
