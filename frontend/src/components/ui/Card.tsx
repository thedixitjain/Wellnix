import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export default function Card({ glow, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-bg-secondary p-6 transition-all duration-300 ${
        glow ? 'hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5' : 'hover:border-border-hover'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
