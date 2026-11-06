'use client';

import Link from 'next/link';
import Container from '../common/Container';
import Button from '../common/Button';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import styles from './CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.ctaCard}>
          {/* Background Decorative Element */}
          <div className={styles.glowBg}></div>

          <div className={styles.content}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              <span>ابدأ الآن بخصم لفترة محدودة</span>
            </div>

            <h2 className={styles.title}>
              هل أنت جاهز للبدء في بناء مستقبل تقني واعد؟
            </h2>

            <p className={styles.description}>
              انضم اليوم لأكثر من 50,000 متعلم عربي، واحصل على الوصول المباشر لكافة المسارات والكورسات التفاعلية.
            </p>

            <div className={styles.actions}>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" icon={ArrowLeft} className={styles.mainCtaBtn}>
                  انضم إلينا وابدأ التعلم المجاني
                </Button>
              </Link>
            </div>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>وصول فوري لكافة الدروس</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>ضمان استرجاع لمدة 14 يوماً</span>
              </div>
              <div className={styles.featureItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>دعم فني وتوجيه 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
