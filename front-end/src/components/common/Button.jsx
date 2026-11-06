'use client';

import { cn } from '@/utils/cn';

const variantClasses = {
  primary:
    'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] border border-white/15 hover:from-[var(--primary-hover)] hover:to-[var(--primary)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)] hover:-translate-y-0.5',
  secondary:
    'bg-[var(--primary-light)] text-[var(--primary)] border border-indigo-600/15 hover:bg-indigo-100 hover:text-[var(--primary-hover)] hover:-translate-y-0.5',
  outline:
    'bg-transparent text-[var(--text-main)] border-[1.5px] border-[var(--border-hover)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-[var(--text-body)] hover:bg-slate-100/80 hover:text-[var(--primary)]',
  accent:
    'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] hover:-translate-y-0.5',
};

const sizeClasses = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'end',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'group inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ease-out whitespace-nowrap outline-none select-none relative overflow-hidden active:scale-[0.98]',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'start' && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'end' && (
        <Icon
          className="transition-transform duration-200 group-hover:-translate-x-1"
          size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
        />
      )}
    </button>
  );
}
