'use client';

import { studentDashboardData } from '@/data/dashboardData';
import Button from '../common/Button';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Award, 
  PlayCircle, 
  CheckCircle, 
  ArrowLeft,
  Sparkles,
  Calendar
} from 'lucide-react';
import styles from './StudentView.module.css';

export default function StudentView() {
  const { user, stats, enrolledCourses, recommendedCourses } = studentDashboardData;

  return (
    <div className={styles.container}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>مسار التعلم النشط</span>
          </div>
          <h1 className={styles.bannerTitle}>أهلاً بك مجدداً، {user.name} 👋</h1>
          <p className={styles.bannerSub}>
            أكملت {stats.overallProgress}% من إجمالي مساراتك الحالية. واصل الإنجاز لتحصل على شهادتك القادمة!
          </p>
        </div>
        <div className={styles.progressRingCard}>
          <div className={styles.percentText}>{stats.overallProgress}%</div>
          <div className={styles.percentSub}>معدل التقدم العام</div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{stats.enrolledCourses}</div>
            <div className={styles.statLab}>الكورسات المسجلة</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#ECFDF5', color: '#10B981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{stats.completedCourses}</div>
            <div className={styles.statLab}>الكورسات المكتملة</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{stats.hoursLearned} ساعة</div>
            <div className={styles.statLab}>ساعات التعلم</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ background: '#F3E8FF', color: '#9333EA' }}>
            <Award size={22} />
          </div>
          <div>
            <div className={styles.statVal}>{stats.certificates}</div>
            <div className={styles.statLab}>الشهادات المكتسبة</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Enrolled Courses & Sidebar Widgets */}
      <div className={styles.mainGrid}>
        {/* Left Column: Enrolled Courses */}
        <div className={styles.coursesCol}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <GraduationCap size={22} className={styles.sectionIcon} />
              <span>كورساتي قيد التعلم</span>
            </h2>
            <span className={styles.countBadge}>{enrolledCourses.length} كورسات</span>
          </div>

          <div className={styles.coursesList}>
            {enrolledCourses.map((course) => (
              <div key={course.id} className={styles.courseItemCard}>
                <div
                  className={styles.courseColorBar}
                  style={{ background: course.imageGradient }}
                ></div>

                <div className={styles.cardMain}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.courseTitle}>{course.title}</h3>
                      <p className={styles.instructorName}>المدرب: {course.instructor}</p>
                    </div>
                    <span className={styles.progressPill}>{course.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className={styles.lessonsCount}>
                      <span>{course.completedLessons} من {course.totalLessons} درس</span>
                    </div>
                  </div>

                  <div className={styles.lastLessonBox}>
                    <span className={styles.lastLessonLabel}>آخر درس:</span>
                    <span className={styles.lastLessonTitle}>{course.lastLesson}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <Button variant={course.progress === 100 ? 'secondary' : 'primary'} size="sm" icon={PlayCircle}>
                      {course.progress === 100 ? 'مراجعة الكورس' : 'متابعة التعلم'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className={styles.widgetsCol}>
          {/* Upcoming Live Session Card */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <Calendar size={18} className={styles.widgetIcon} />
              <h3 className={styles.widgetTitle}>جلسة بث مباشر قادمة</h3>
            </div>
            <p className={styles.sessionTitle}>
              مناقشة مشاريع ختام مسار Node.js وحل استفسارات الطلاب
            </p>
            <div className={styles.sessionTime}>
              <span>⏰ اليوم الساعة 08:00 مساءً</span>
            </div>
            <Button variant="outline" size="sm" fullWidth>
              الانضمام للجلسة المباشرة
            </Button>
          </div>

          {/* Recommended Courses Widget */}
          <div className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <Sparkles size={18} className={styles.widgetIcon} />
              <h3 className={styles.widgetTitle}>مقترح لك</h3>
            </div>
            <div className={styles.recList}>
              {recommendedCourses.map((rec) => (
                <div key={rec.id} className={styles.recItem}>
                  <div className={styles.recTitle}>{rec.title}</div>
                  <div className={styles.recMeta}>
                    <span>{rec.category}</span> • <span>⭐ {rec.rating}</span>
                  </div>
                  <Button variant="ghost" size="sm" icon={ArrowLeft} className={styles.recBtn}>
                    عرض التفاصيل
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
