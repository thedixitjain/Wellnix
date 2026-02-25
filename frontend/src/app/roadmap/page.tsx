const timeline = [
  {
    quarter: 'Q1 2026',
    status: 'completed',
    items: [
      'Ana RAG chatbot launch',
      'Next.js frontend migration',
      'JWT authentication system',
      'Async video processing with Celery',
    ],
  },
  {
    quarter: 'Q2 2026',
    status: 'in-progress',
    items: [
      'Mobile PWA support',
      'Multi-language nutrition labels (OCR)',
      'Workout video real-time feedback',
      'Barcode scanner integration',
    ],
  },
  {
    quarter: 'Q3 2026',
    status: 'planned',
    items: [
      'PostgreSQL migration',
      'Meal planning calendar',
      'Social features and leaderboards',
      'Wearable device integrations',
    ],
  },
  {
    quarter: 'Q4 2026',
    status: 'planned',
    items: [
      'Enterprise white-label platform',
      'Advanced analytics dashboard',
      'Custom AI model fine-tuning',
      'Mobile native app (React Native)',
    ],
  },
];

const statusStyles: Record<string, string> = {
  completed: 'bg-accent-glow text-accent border-accent/30',
  'in-progress': 'bg-info/10 text-info border-info/30',
  planned: 'bg-bg-tertiary text-text-secondary border-border',
};

const statusLabels: Record<string, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display text-4xl font-bold">Product Roadmap</h1>
        <p className="mx-auto mt-4 max-w-lg text-text-secondary">
          See where we are heading. Our roadmap is shaped by user feedback and our vision for accessible health AI.
        </p>
      </div>

      <div className="space-y-8">
        {timeline.map((t) => (
          <div key={t.quarter} className="rounded-xl border border-border bg-bg-secondary p-8">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-xl font-bold">{t.quarter}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[t.status]}`}>
                {statusLabels[t.status]}
              </span>
            </div>
            <ul className="space-y-2">
              {t.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                  {t.status === 'completed' ? (
                    <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-text-tertiary" />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
