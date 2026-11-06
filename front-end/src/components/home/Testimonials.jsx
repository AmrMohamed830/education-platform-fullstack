'use client';

import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import StarRating from '../common/StarRating';
import { testimonialsData } from '@/data/testimonials';
import { MessageSquare, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.section}>
      <Container>
        <SectionHeader
          badgeText="قصص نجاح"
          badgeIcon={MessageSquare}
          title="ماذا يقول خريجونا عن"
          highlightText="تجرِبتهم التعليمية؟"
          subtitle="قصص واقعية لطلاب تحول شغفهم بالتقنية إلى فرص عمل حقيقية وتطور مهني ملموس."
        />

        <div className={styles.grid}>
          {testimonialsData.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatarBox}>{item.avatar}</div>
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{item.name}</h3>
                  <p className={styles.userRole}>{item.role}</p>
                </div>
                <Quote size={32} className={styles.quoteIcon} />
              </div>

              <div className={styles.ratingRow}>
                <StarRating rating={item.rating} />
                <span className={styles.courseTag}>{item.courseTaken}</span>
              </div>

              <p className={styles.comment}>{item.comment}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
