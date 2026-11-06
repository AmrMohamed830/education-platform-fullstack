'use client';

import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import Badge from '../common/Badge';
import { featuresData } from '@/data/features';
import { Code, GraduationCap, Clock, Award, Users, Compass, Sparkles } from 'lucide-react';
import styles from './Features.module.css';

const ICON_MAP = {
  Code,
  GraduationCap,
  Clock,
  Award,
  Users,
  Compass,
};

export default function Features() {
  return (
    <section id="features" className={styles.section}>
      <Container>
        <SectionHeader
          badgeText="لماذا نتميز؟"
          badgeIcon={Sparkles}
          title="مميزات فريدة تضمن لك"
          highlightText="رحلة تعليمية ناجحة"
          subtitle="صممنا تجربتك التعليمية بعناية فائقة لتجمع بين المتعة، التطبيق العملي، والتفاعل المباشر."
        />

        <div className={styles.grid}>
          {featuresData.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Code;
            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.iconWrapper}>
                    <IconComponent size={26} className={styles.icon} />
                  </div>
                  <Badge variant="primary">{item.badge}</Badge>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
