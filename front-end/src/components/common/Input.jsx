'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  error = '',
  icon: Icon = null,
  required = false,
  name,
  id,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full relative', className)}>
      {label && (
        <label htmlFor={id || name} className="text-sm font-bold text-[var(--text-main)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <Icon
            size={18}
            className="absolute right-4 text-[var(--text-muted)] pointer-events-none transition-colors"
          />
        )}

        <input
          id={id || name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full py-3 px-4 text-[0.95rem] text-[var(--text-main)] bg-white border-[1.5px] border-[var(--border-light)] rounded-xl outline-none transition-all duration-200 placeholder:text-[var(--text-light)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-light)]',
            Icon && 'pr-11',
            isPasswordType && 'pl-11',
            error && 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-100'
          )}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            className="absolute left-3 p-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors rounded"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <span className="text-xs text-red-500 font-semibold">{error}</span>}
    </div>
  );
}
