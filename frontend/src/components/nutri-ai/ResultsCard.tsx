'use client';

import ReactMarkdown from 'react-markdown';

interface ResultsCardProps {
  data: Record<string, unknown>;
}

function getGrade(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'F';
}

export default function ResultsCard({ data }: ResultsCardProps) {
  const score = (data?.score as number) ?? 0;
  const grade = getGrade(score);
  const explanation = (data?.explanation as string) ?? '';
  const nutrients = (data?.nutrition_info ?? data?.nutrients ?? data?.nutrition ?? {}) as Record<string, unknown>;
  const healthMetrics = (data?.health_metrics ?? {}) as Record<string, unknown>;

  const scoreColor = score >= 70 ? 'text-accent' : score >= 40 ? 'text-warning' : 'text-error';
  const scoreBg = score >= 70 ? 'bg-accent-glow' : score >= 40 ? 'bg-warning/10' : 'bg-error/10';

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center rounded-xl border border-border bg-bg-secondary p-8 text-center">
        <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full ${scoreBg}`}>
          <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
        </div>
        <h2 className="text-xl font-bold">Consumability Score</h2>
        <span className={`mt-2 rounded-full px-4 py-1 text-sm font-semibold ${scoreBg} ${scoreColor}`}>
          Grade: {grade}
        </span>
      </div>

      {Object.keys(nutrients).length > 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary p-6">
          <h3 className="mb-4 font-semibold">Nutritional Breakdown</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(nutrients).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                <span className="text-sm capitalize text-text-secondary">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(healthMetrics).length > 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary p-6">
          <h3 className="mb-4 font-semibold">Your Health Metrics</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(healthMetrics).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) return null;
              return (
                <div key={key} className="flex items-center justify-between rounded-lg bg-bg-tertiary px-4 py-3">
                  <span className="text-sm capitalize text-text-secondary">{key.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {explanation && (
        <div className="rounded-xl border border-border bg-bg-secondary p-6">
          <h3 className="mb-4 font-semibold">AI Analysis</h3>
          <div className="prose prose-sm prose-invert max-w-none text-text-secondary">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
