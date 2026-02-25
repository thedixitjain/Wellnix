interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-6 transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-tertiary">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs text-text-tertiary">{sub}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}
