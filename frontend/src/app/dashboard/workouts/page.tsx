'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import type { WorkoutItem, PaginatedResponse } from '@/lib/types';

export default function WorkoutsHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<WorkoutItem> | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;
    apiFetch<PaginatedResponse<WorkoutItem>>(`/user/workouts?page=${page}&per_page=20`)
      .then(setData)
      .catch(() => {});
  }, [user, authLoading, router, page]);

  if (authLoading || !user) return <div className="flex min-h-[60vh] items-center justify-center text-text-secondary">Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="mb-2 inline-block text-sm text-text-tertiary hover:text-text-primary">&larr; Dashboard</Link>
          <h1 className="font-display text-2xl font-bold">Workout History</h1>
        </div>
        <Link href="/muscle-ai" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          New Workout
        </Link>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-secondary p-12 text-center">
          <p className="text-text-tertiary">No workouts yet. Upload a video to get form feedback.</p>
          <Link href="/muscle-ai" className="mt-4 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover">
            Upload Video
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary text-left text-text-tertiary">
                <tr>
                  <th className="px-6 py-3 font-medium">Exercise</th>
                  <th className="px-6 py-3 font-medium">Form Score</th>
                  <th className="hidden px-6 py-3 font-medium sm:table-cell">Reps</th>
                  <th className="hidden px-6 py-3 font-medium sm:table-cell">Duration</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((w) => (
                  <tr key={w.id} className="hover:bg-bg-tertiary/50">
                    <td className="px-6 py-4 font-medium capitalize">{w.exercise_type.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        w.form_score >= 70 ? 'bg-accent-glow text-accent' : w.form_score >= 40 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                      }`}>{w.form_score}</span>
                    </td>
                    <td className="hidden px-6 py-4 text-text-secondary sm:table-cell">{w.reps}</td>
                    <td className="hidden px-6 py-4 text-text-secondary sm:table-cell">{w.duration_seconds}s</td>
                    <td className="px-6 py-4 text-text-tertiary">{new Date(w.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:border-border-hover">Previous</button>
              <span className="text-sm text-text-secondary">Page {data.page} of {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:border-border-hover">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
