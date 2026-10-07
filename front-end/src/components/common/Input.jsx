'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Input.module.css';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
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
    <div className={cn(styles.inputGroup, error && styles.hasError, className)}>
      {label && (
        <label htmlFor={id || name} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {Icon && <Icon size={18} className={styles.iconStart} />}

        <input
          id={id || name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            styles.input,
            Icon && styles.hasIconStart,
            isPasswordType && styles.hasIconEnd
          )}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            className={styles.togglePasswordBtn}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
