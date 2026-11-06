'use client';

import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, count = null }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.floor(rating) ? 'text-amber-500' : 'text-slate-300'}
            fill={star <= Math.floor(rating) ? '#F59E0B' : 'transparent'}
          />
        ))}
      </div>
      <span className="text-[var(--text-main)] font-bold mr-1">{rating}</span>
      {count && <span className="text-[var(--text-muted)] text-[0.8125rem]">({count})</span>}
    </div>
  );
}
