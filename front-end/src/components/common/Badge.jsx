'use client';

import { cn } from '@/utils/cn';

const variantClasses = {
  primary:
    'bg-[var(--primary-light)] text-[var(--primary)] border border-indigo-600/15',
  accent:
    'bg-[var(--accent-light)] text-[var(--accent)] border border-emerald-500/20',
  glow:
    'bg-gradient-to-br from-indigo-600/10 to-cyan-500/10 text-[var(--primary)] border border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
};

export default function Badge({
  children,
  variant = 'primary',
  icon: Icon = null,
  className = '',
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 py-1.5 px-3.5 text-[0.8125rem] font-semibold rounded-full leading-none whitespace-nowrap',
        variantClasses[variant] || variantClasses.primary,
        className
      )}
    >
      {Icon && <Icon size={14} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
