'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminDashboardData } from '@/data/dashboardData';
import { getAllCourses, addCourse, updateCourse, deleteCourse } from '@/services/course.service';
import { getAdminStatsAndStudents } from '@/services/auth.service';
import Button from '../common/Button';
import CourseModal from './CourseModal';
import CurriculumBuilder from './CurriculumBuilder';
import QuizBuilder from './QuizBuilder';
import {
  BookOpen,
  Users,
  Award,
  MessageSquare,
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import styles from './AdminView.module.css';

const { stats: mockStats, recentStudents: mockStudents } = adminDashboardData;

// Map backend status value to Arabic display label
const statusLabel = (status) => (status === 'active' ? 'نشط' : 'مسودة');

export default function AdminView({ activeTab = 'overview' }) {
  const [courses, setCourses] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalReviews: 0,
  });
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [selectedCurriculumCourse, setSelectedCurriculumCourse] = useState(null);
  const [selectedQuizCourse, setSelectedQuizCourse] = useState(null);

  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  // ── Fetch all courses & stats from backend ──────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const [coursesRes, statsRes] = await Promise.all([
        getAllCourses(),
        getAdminStatsAndStudents().catch(() => null),
      ]);
      setCourses(coursesRes.data.data.courses || []);
      if (statsRes?.data?.data) {
        setAdminStats(statsRes.data.data.stats);
        if (statsRes.data.data.students?.length > 0) {
          setStudentsList(statsRes.data.data.students);
        } else {
          setStudentsList(mockStudents);
        }
      } else {
        setStudentsList(mockStudents);
      }
    } catch {
      setFetchError('تعذّر تحميل بيانات لوحة الإدارة. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      if (!ignore) {
        await fetchDashboardData();
      }
    };

    init();

    return () => {
      ignore = true;
    };
  }, [fetchDashboardData]);

  // ── Alert helper ────────────────────────────────────────────────────
  const showAlert = (text, type = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 3500);
  };

  // ── Modal helpers ───────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setModalError('');
  };

  // ── Save (add or update) ────────────────────────────────────────────
  const handleSaveCourse = async (formData) => {
    if (isSaving) return;
    setIsSaving(true);
    setModalError('');
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, formData);
        showAlert('تم تعديل بيانات الكورس بنجاح! ✏️');
      } else {
        await addCourse(formData);
        showAlert('تمت إضافة الكورس الجديد بنجاح! 🎉');
      }
      handleCloseModal();
      await fetchDashboardData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء حفظ الكورس.';
      setModalError(msg);
      showAlert(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الكورس؟')) return;
    try {
      await deleteCourse(courseId);
      showAlert('تم حذف الكورس بنجاح! 🗑️');
      await fetchDashboardData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء حذف الكورس.';
      showAlert(msg, 'error');
    }
  };

  // ── Search filter ───────────────────────────────────────────────────
  const filteredCourses = courses.filter(
    (c) =>
      (c.title || '').includes(searchQuery) ||
      (c.instructor || '').includes(searchQuery) ||
      (c.category || '').includes(searchQuery),
  );

  // ── Render Curriculum Builder if course is selected ────────────────
  if (selectedCurriculumCourse) {
    return (
      <CurriculumBuilder
        course={selectedCurriculumCourse}
        onBack={() => {
          setSelectedCurriculumCourse(null);
          fetchDashboardData();
        }}
      />
    );
  }

  // ── Render Quiz Builder if course is selected ──────────────────────
  if (selectedQuizCourse) {
    return (
      <QuizBuilder
        course={selectedQuizCourse}
        onBack={() => {
          setSelectedQuizCourse(null);
          fetchDashboardData();
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Admin Top Header */}
      <div className={styles.topHeader}>
        <div>
          <h1 className={styles.title}>لوحة التحكم وإدارة المنصة 👑</h1>
          <p className={styles.subtitle}>
            متابعة إحصائيات المنصة وإدارة الكورسات والطلاب بكل مرونة.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          إضافة كورس جديد
        </Button>
      </div>

      {/* Flash Alert */}
      {alertMsg.text && (
        <div
          className={
            alertMsg.type === 'error' ? styles.alertError : styles.alertSuccess
          }
        >
          {alertMsg.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* KPI Stats Grid — only on overview */}
      {activeTab === 'overview' && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>إجمالي الكورسات</span>
              <div className={styles.iconBox} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div className={styles.statVal}>{adminStats.totalCourses || courses.length}</div>
            <div className={styles.statSub}>كورسات في قاعدة البيانات</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>إجمالي الطلاب</span>
              <div className={styles.iconBox} style={{ background: '#ECFDF5', color: '#10B981' }}>
                <Users size={20} />
              </div>
            </div>
            <div className={styles.statVal}>
              {(adminStats.totalStudents || mockStats.totalStudents).toLocaleString()}
            </div>
            <div className={styles.statSub}>طلاب مسجلون في المنصة</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>إجمالي الاشتراكات</span>
              <div className={styles.iconBox} style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Award size={20} />
              </div>
            </div>
            <div className={styles.statVal}>{adminStats.totalEnrollments || 0}</div>
            <div className={styles.statSub}>اشتراكات نشطة بالدورات</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>آراء ومراجعات الطلاب</span>
              <div className={styles.iconBox} style={{ background: '#F3E8FF', color: '#9333EA' }}>
                <MessageSquare size={20} />
              </div>
            </div>
            <div className={styles.statVal}>{adminStats.totalReviews || 0}</div>
            <div className={styles.statSub}>تقييمات مسجلة للمناهج</div>
          </div>
        </div>
      )}

      {/* Course Management Section */}
      {activeTab !== 'students-manage' && (
        <div className={styles.sectionCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.sectionTitle}>إدارة الكورسات المتاحة</h2>
            <p className={styles.sectionSub}>عرض، تعديل، أو حذف الكورسات الحالية في المنصة</p>
          </div>

          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="ابحث عن كورس أو مدرب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className={styles.stateWrapper}>
            <Loader2 size={32} className={styles.spinner} />
            <span>جارٍ تحميل الكورسات…</span>
          </div>
        )}

        {/* Fetch error state */}
        {!loading && fetchError && (
          <div className={styles.stateWrapper}>
            <AlertCircle size={32} className={styles.errorIcon} />
            <span>{fetchError}</span>
            <Button variant="outline" onClick={fetchCourses}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && filteredCourses.length === 0 && (
          <div className={styles.stateWrapper}>
            <BookOpen size={32} className={styles.emptyIcon} />
            <span>
              {searchQuery ? 'لا توجد نتائج للبحث.' : 'لا توجد كورسات حتى الآن. أضف أول كورس!'}
            </span>
          </div>
        )}

        {/* Courses Table */}
        {!loading && !fetchError && filteredCourses.length > 0 && (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>اسم الكورس</th>
                  <th>المدرب</th>
                  <th>المجال</th>
                  <th>السعر</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <span className={styles.courseTitleCell}>{course.title}</span>
                    </td>
                    <td>{course.instructor || '—'}</td>
                    <td>
                      <span className={styles.catBadge}>{course.category || '—'}</span>
                    </td>
                    <td className={styles.priceCell}>${course.price}</td>
                    <td>
                      <span
                        className={`${styles.statusPill} ${
                          course.status === 'active' ? styles.statusActive : styles.statusDraft
                        }`}
                      >
                        {statusLabel(course.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          type="button"
                          className={styles.curriculumBtn}
                          onClick={() => setSelectedCurriculumCourse(course)}
                          title="إدارة المنهج والدروس"
                        >
                          <BookOpen size={15} />
                          <span>المنهج ({course.sections?.length || 0})</span>
                        </button>
                        <button
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            border: '1px solid #FDE68A',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedQuizCourse(course)}
                          title="إدارة اختبار الكورس"
                        >
                          <HelpCircle size={15} />
                          <span>الاختبار</span>
                        </button>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleOpenEditModal(course)}
                          title="تعديل الكورس"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteCourse(course._id)}
                          title="حذف الكورس"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Recent Registered Students Table — mock data, enrollment system out of scope */}
      {activeTab !== 'courses-manage' && (
        <div className={styles.sectionCard}>
          <div className={styles.tableHeader}>
            <div>
              <h2 className={styles.sectionTitle}>أحدث الطلاب المنضمين</h2>
              <p className={styles.sectionSub}>آخر المسجلين في المنصة خلال الأيام الأخيرة</p>
            </div>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>البريد الإلكتروني</th>
                  <th>الكورس المسجل</th>
                  <th>تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map((st) => (
                  <tr key={st.id || st.email}>
                    <td className={styles.studentNameCell}>{st.name}</td>
                    <td>{st.email}</td>
                    <td>
                      <span className={styles.catBadge}>{st.course}</span>
                    </td>
                    <td className={styles.dateCell}>{st.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <CourseModal
          key={editingCourse?._id || 'new-course'}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveCourse}
          initialData={editingCourse}
          isSaving={isSaving}
          error={modalError}
        />
      )}
    </div>
  );
}
