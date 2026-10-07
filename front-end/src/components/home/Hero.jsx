'use client';

import { ArrowLeft, Sparkles, PlayCircle, ShieldCheck, Users, Star, Code, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Container from '../common/Container';
import Button from '../common/Button';
import Badge from '../common/Badge';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="hero" className={styles.heroSection}>
      {/* Background Decorative Gradient Blobs */}
      <div className={styles.blobPrimary}></div>
      <div className={styles.blobCyan}></div>

      <Container>
        <div className={styles.heroGrid}>
          {/* Right Column: Hero Content */}
          <div className={styles.contentCol}>
            <Badge variant="glow" icon={Sparkles} className={styles.heroBadge}>
              الجيل الجديد من التعليم التقني العربي
            </Badge>

            <h1 className={styles.heroTitle}>
              طوّر مهاراتك التقنية مع منصة{' '}
              <span className="gradient-text">تفاعلية تُعدّك لسوق العمل</span>
            </h1>

            <p className={styles.heroDescription}>
              تعلم البرمجة، الذكاء الاصطناعي، وتصميم الواجهات عبر مسارات عملية وشاملة مع إمكانية الوصول مدى الحياة ومتابعة مباشرة من نخبة من الخبراء.
            </p>

            {/* CTAs */}
            <div className={styles.heroActions}>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" icon={ArrowLeft}>
                  ابدأ التعلم الآن
                </Button>
              </Link>
              <a href="#categories" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg" icon={PlayCircle} iconPosition="start">
                  استكشف المسارات
                </Button>
              </a>
            </div>

            {/* Highlights List */}
            <div className={styles.highlights}>
              <div className={styles.highlightItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>مشاريع عملية 100%</span>
              </div>
              <div className={styles.highlightItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>شهادات إنجاز معتمدة</span>
              </div>
              <div className={styles.highlightItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>دعم وتوجيه مهني</span>
              </div>
            </div>
          </div>

          {/* Left Column: UI Visual Reference & Dynamic Preview Mockup */}
          <div className={styles.visualCol}>
            <div className={styles.previewContainer}>
              {/* Main Card Graphic */}
              <div className={styles.mainCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardDots}>
                    <span className={styles.dotRed}></span>
                    <span className={styles.dotYellow}></span>
                    <span className={styles.dotGreen}></span>
                  </div>
                  <div className={styles.cardBadge}>
                    <Code size={14} />
                    <span>تطبيق عملي: React & Node.js</span>
                  </div>
                </div>

                <div className={styles.codeBody}>
                  <div className={styles.codeLine}>
                    <span className={styles.keyword}>const</span> <span className={styles.variable}>student</span> = <span className={styles.keyword}>new</span> <span className={styles.function}>Developer</span>();
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.variable}>student</span>.<span className={styles.function}>learnPath</span>(<span className={styles.string}>'Full-Stack Web'</span>);
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.variable}>student</span>.<span className={styles.function}>buildRealProjects</span>();
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.comment}>// 🎉 النتيجة: جاهز لوظيفتك الأولى!</span>
                  </div>
                </div>

                {/* Progress Bar Mock */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>إنجاز المسار التعليمي</span>
                    <span className={styles.progressPercent}>85%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill}></div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Active Students */}
              <div className={`${styles.floatingBadge} ${styles.floatTopRight}`}>
                <div className={styles.badgeIconBg}>
                  <Users size={20} color="#FFFFFF" />
                </div>
                <div>
                  <div className={styles.badgeTitle}>+50,000 طالب</div>
                  <div className={styles.badgeSub}>يتعلمون الآن في المنصة</div>
                </div>
              </div>

              {/* Floating Badge 2: Ratings */}
              <div className={`${styles.floatingBadge} ${styles.floatBottomLeft}`}>
                <div className={styles.badgeIconYellow}>
                  <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
                </div>
                <div>
                  <div className={styles.badgeTitle}>4.9 / 5.0</div>
                  <div className={styles.badgeSub}>تقييم +12,000 متعلم</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
