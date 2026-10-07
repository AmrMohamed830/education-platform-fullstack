'use client';

import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import styles from './Checkbox.module.css';

export default function Checkbox({
  label,
  checked,
  onChange,
  id,
  name,
  className = '',
}) {
  return (
    <label htmlFor={id || name} className={cn(styles.container, className)}>
      <input
        type="checkbox"
        id={id || name}
        name={name}
        checked={checked}
        onChange={onChange}
        className={styles.hiddenCheckbox}
      />
      <div className={cn(styles.styledCheckbox, checked && styles.checked)}>
        {checked && <Check size={14} className={styles.checkIcon} />}
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
