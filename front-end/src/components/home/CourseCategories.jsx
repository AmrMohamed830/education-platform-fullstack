'use client';

import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import { categoriesData } from '@/data/categories';
import { Code2, BrainCircuit, Smartphone, Palette, ShieldCheck, Cloud, BookOpen, Users, ArrowLeft } from 'lucide-react';
import styles from './CourseCategories.module.css';

const ICON_MAP = {
  Code2,
  BrainCircuit,
  Smartphone,
  Palette,
  ShieldCheck,
  Cloud,
};

export default function CourseCategories() {
  return (
    <section id="categories" className={styles.section}>
      <Container>
        <SectionHeader
          badgeText="المجالات التعليمية"
          badgeIcon={BookOpen}
          title="اختر تخصصك وابدأ"
          highlightText="رحلة الاحتراف والتطوير"
          subtitle="مسارات متكاملة مُصممة وفق أحدث المهارات المطلوبة في سوق العمل العربي والعالمي."
        />

        <div className={styles.grid}>
          {categoriesData.map((category) => {
            const IconComponent = ICON_MAP[category.icon] || Code2;
            return (
              <div key={category.id} className={styles.categoryCard}>
                <div
                  className={styles.iconBox}
                  style={{ '--cat-color': category.color }}
                >
                  <IconComponent size={28} />
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{category.title}</h3>
                  <p className={styles.desc}>{category.description}</p>
                  
                  <div className={styles.footerInfo}>
                    <div className={styles.infoBadge}>
                      <BookOpen size={14} />
                      <span>{category.courseCount} دورة</span>
                    </div>
                    <div className={styles.infoBadge}>
                      <Users size={14} />
                      <span>{category.studentCount} طالب</span>
                    </div>
                  </div>
                </div>

                <div className={styles.arrowBox}>
                  <ArrowLeft size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
