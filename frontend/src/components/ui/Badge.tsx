type Variant = 'accent' | 'info' | 'warning' | 'error' | 'neutral';

const variants: Record<Variant, string> = {
  accent: 'bg-accent-glow text-accent border-accent/30',
  info: 'bg-info/10 text-info border-info/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  error: 'bg-error/10 text-error border-error/30',
  neutral: 'bg-bg-tertiary text-text-secondary border-border',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'accent', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
