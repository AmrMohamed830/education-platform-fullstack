'use client';

import Container from '../common/Container';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import StarRating from '../common/StarRating';
import { featuredCoursesData } from '@/data/courses';
import { BookOpen, Users, Clock, ArrowLeft, Bookmark } from 'lucide-react';
import styles from './Courses.module.css';

export default function Courses() {
  return (
    <section id="courses" className={styles.section}>
      <Container>
        <SectionHeader
          badgeText="الكورسات الأكثر طلباً"
          badgeIcon={BookOpen}
          title="استكشف أشهر الكورسات"
          highlightText="والمسارات التعليمية"
          subtitle="مناهج تفاعلية مُحدثة ومصممة لنقلك من الصفر إلى احتراف العمل في أفضل المشاريع."
        />

        <div className={styles.grid}>
          {featuredCoursesData.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              {/* Card Banner / Header Image Mock */}
              <div
                className={styles.imageBanner}
                style={{ background: course.imageGradient }}
              >
                <div className={styles.badgeRow}>
                  <span className={styles.courseBadge}>{course.badge}</span>
                  <button className={styles.bookmarkBtn} aria-label="حفظ الكورس">
                    <Bookmark size={16} />
                  </button>
                </div>
                <div className={styles.levelTag}>{course.level}</div>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <div className={styles.categoryRow}>
                  <span className={styles.categoryName}>{course.category}</span>
                  <StarRating rating={course.rating} count={course.ratingCount} />
                </div>

                <h3 className={styles.courseTitle}>{course.title}</h3>

                <div className={styles.instructorInfo}>
                  <div className={styles.instructorAvatar}>
                    {course.instructor.charAt(2)}
                  </div>
                  <div>
                    <div className={styles.instructorName}>{course.instructor}</div>
                    <div className={styles.instructorRole}>{course.instructorRole}</div>
                  </div>
                </div>

                {/* Tech Tags */}
                <div className={styles.tagsRow}>
                  {course.tags.map((tag) => (
                    <span key={tag} className={styles.tagPill}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Course Details Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.metaGroup}>
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Users size={14} />
                      <span>{course.students}</span>
                    </div>
                  </div>

                  <div className={styles.priceGroup}>
                    <span className={styles.price}>{course.price} $</span>
                    <span className={styles.originalPrice}>{course.originalPrice} $</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewMoreRow}>
          <Button variant="outline" size="lg" icon={ArrowLeft}>
            عرض كافة الكورسات والمسارات ({featuredCoursesData.length * 12}+)
          </Button>
        </div>
      </Container>
    </section>
  );
}
