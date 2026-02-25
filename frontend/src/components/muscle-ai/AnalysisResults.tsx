'use client';

interface Props {
  data: any;
}

export default function AnalysisResults({ data }: Props) {
  if (!data) return null;
  const result = data.result || data;
  const formScore = result.form_score ?? result.score ?? 0;
  const reps = result.reps ?? result.rep_count ?? '-';
  const feedback = result.feedback ?? result.tips ?? result.recommendations ?? [];
  const scoreColor = formScore >= 70 ? 'text-accent' : formScore >= 40 ? 'text-warning' : 'text-error';
  const scoreBg = formScore >= 70 ? 'bg-accent-glow' : formScore >= 40 ? 'bg-warning/10' : 'bg-error/10';

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center rounded-xl border border-border bg-bg-secondary p-8 text-center">
        <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full ${scoreBg}`}>
          <span className={`text-3xl font-bold ${scoreColor}`}>{formScore}</span>
        </div>
        <h3 className="text-xl font-bold">Form Score</h3>
        <p className="mt-1 text-text-secondary">Reps counted: {reps}</p>
      </div>

      {Array.isArray(feedback) && feedback.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary p-6">
          <h3 className="mb-4 font-semibold">Feedback</h3>
          <ul className="space-y-2">
            {feedback.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-0.5 text-accent">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
