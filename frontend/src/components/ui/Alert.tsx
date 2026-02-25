type Variant = 'error' | 'success' | 'info' | 'warning';

const variants: Record<Variant, string> = {
  error: 'bg-error/10 border-error/30 text-error',
  success: 'bg-accent-glow border-accent/30 text-accent',
  info: 'bg-info/10 border-info/30 text-info',
  warning: 'bg-warning/10 border-warning/30 text-warning',
};

interface AlertProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export default function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  return (
    <div className={`rounded-lg border p-4 text-sm ${variants[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
}
