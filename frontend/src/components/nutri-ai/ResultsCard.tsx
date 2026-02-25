'use client';

interface ResultsCardProps {
  data: any;
}

export default function ResultsCard({ data }: ResultsCardProps) {
  const score = data?.score ?? data?.health_score ?? 0;
  const grade = data?.grade ?? data?.health_grade ?? 'N/A';
  const product = data?.product_name ?? 'Unknown Product';
  const nutrients = data?.nutrients ?? data?.nutrition ?? {};
  const recommendations = data?.recommendations ?? data?.suggestions ?? [];

  const scoreColor = score >= 70 ? 'text-accent' : score >= 40 ? 'text-warning' : 'text-error';
  const scoreBg = score >= 70 ? 'bg-accent-glow' : score >= 40 ? 'bg-warning/10' : 'bg-error/10';

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="flex flex-col items-center rounded-xl border border-border bg-bg-secondary p-8 text-center">
        <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full ${scoreBg}`}>
          <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
        </div>
        <h2 className="text-xl font-bold">{product}</h2>
        <span className={`mt-2 rounded-full px-4 py-1 text-sm font-semibold ${scoreBg} ${scoreColor}`}>
          Grade: {grade}
        </span>
      </div>

      {/* Nutrients */}
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

      {/* Recommendations */}
      {Array.isArray(recommendations) && recommendations.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary p-6">
          <h3 className="mb-4 font-semibold">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-0.5 text-accent">&#8226;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
