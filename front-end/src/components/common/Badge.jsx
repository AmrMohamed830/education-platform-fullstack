'use client';

import { cn } from '@/utils/cn';
import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'primary',
  icon: Icon = null,
  className = '',
}) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {Icon && <Icon size={14} className={styles.icon} />}
      <span>{children}</span>
    </span>
  );
}
