'use client';

import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

export default function StarRating({ rating = 5, count = null }) {
  return (
    <div className={styles.ratingContainer}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.floor(rating) ? styles.starFilled : styles.starEmpty}
            fill={star <= Math.floor(rating) ? '#F59E0B' : 'transparent'}
          />
        ))}
      </div>
      <span className={styles.ratingValue}>{rating}</span>
      {count && <span className={styles.ratingCount}>({count})</span>}
    </div>
  );
}
