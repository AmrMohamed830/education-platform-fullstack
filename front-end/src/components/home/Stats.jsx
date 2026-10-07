'use client';

import Container from '../common/Container';
import { statsData } from '@/data/stats';
import styles from './Stats.module.css';

export default function Stats() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.statsBanner}>
          <div className={styles.grid}>
            {statsData.map((stat, idx) => (
              <div key={stat.id} className={styles.statCard}>
                <div className={styles.valueGroup}>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
                <h3 className={styles.statLabel}>{stat.label}</h3>
                <p className={styles.statSubtext}>{stat.subtext}</p>
                {idx < statsData.length - 1 && <div className={styles.divider}></div>}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
