'use client';

import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Checkbox({
  label,
  checked = false,
  onChange,
  id,
  name,
  className = '',
  ...props
}) {
  return (
    <label
      htmlFor={id || name}
      className={cn('group inline-flex items-center gap-2.5 cursor-pointer select-none', className)}
    >
      <input
        type="checkbox"
        id={id || name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
        {...props}
      />

      <div
        className={cn(
          'w-5 h-5 rounded-md border-[1.5px] border-[var(--border-hover)] bg-white flex items-center justify-center transition-all duration-200 group-hover:border-[var(--primary)]',
          checked && 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] border-[var(--primary)]'
        )}
      >
        {checked && <Check size={14} className="text-white" />}
      </div>

      {label && <span className="text-sm font-semibold text-[var(--text-body)]">{label}</span>}
    </label>
  );
}