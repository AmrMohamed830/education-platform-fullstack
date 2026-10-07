'use client';

import { cn } from '@/utils/cn';
import styles from './Button.module.css';

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
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'start' && <Icon className={styles.iconStart} size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      <span>{children}</span>
      {Icon && iconPosition === 'end' && <Icon className={styles.iconEnd} size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
    </button>
  );
}
