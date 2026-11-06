'use client';

import Badge from './Badge';
import { cn } from '@/utils/cn';
import styles from './SectionHeader.module.css';

export default function SectionHeader({
  badgeText,
  badgeIcon,
  title,
  highlightText,
  subtitle,
  centered = true,
  className = '',
}) {
  return (
    <div className={cn(styles.header, centered && styles.centered, className)}>
      {badgeText && (
        <Badge variant="glow" icon={badgeIcon} className={styles.badge}>
          {badgeText}
        </Badge>
      )}
      <h2 className={styles.title}>
        {title}{' '}
        {highlightText && <span className="gradient-text">{highlightText}</span>}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
