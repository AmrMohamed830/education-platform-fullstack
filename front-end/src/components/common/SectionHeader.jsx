'use client';

import Badge from './Badge';
import { cn } from '@/utils/cn';

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
    <div
      className={cn(
        'mb-10 md:mb-14 max-w-[720px]',
        centered && 'mx-auto text-center',
        className
      )}
    >
      {badgeText && (
        <Badge variant="glow" icon={badgeIcon} className="mb-4">
          {badgeText}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-main)] mb-3">
        {title}{' '}
        {highlightText && <span className="gradient-text">{highlightText}</span>}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
