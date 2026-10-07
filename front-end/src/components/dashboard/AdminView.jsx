'use client';

import { useState } from 'react';
import { adminDashboardData } from '@/data/dashboardData';
import Button from '../common/Button';
import CourseModal from './CourseModal';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import styles from './AdminView.module.css';

export default function AdminView() {
  const { stats, coursesList: initialCourses, recentStudents } = adminDashboardData;
  const [courses, setCourses] = useState(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (savedData) => {
    if (editingCourse) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? { ...c, ...savedData } : c))
      );
      showAlert('تم تعديل بيانات الكورس بنجاح!');
    } else {
      const newCourse = {
        id: `adm-${Date.now()}`,
        studentsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        ...savedData,
      };
      setCourses((prev) => [newCourse, ...prev]);
      showAlert('تمت إضافة الكورس الجديد بنجاح!');
    }
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('هل أنت تأكد من رغبتك في حذف هذا الكورس؟')) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      showAlert('تم حذف الكورس بنجاح!');
    }
  };

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.includes(searchQuery) ||
      c.instructor.includes(searchQuery) ||
      c.category.includes(searchQuery)
  );

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

      {/* Flash Success Notification */}
      {alertMsg && (
        <div className={styles.alertSuccess}>
          <CheckCircle size={18} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>إجمالي الكورسات</span>
            <div className={styles.iconBox} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className={styles.statVal}>{courses.length}</div>
          <div className={styles.statSub}>+4 كورسات هذا الشهر</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>إجمالي الطلاب</span>
            <div className={styles.iconBox} style={{ background: '#ECFDF5', color: '#10B981' }}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statVal}>{stats.totalStudents.toLocaleString()}</div>
          <div className={styles.statSub}>نمو بنسبة {stats.monthlyGrowth}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>إجمالي الإيرادات</span>
            <div className={styles.iconBox} style={{ background: '#FEF3C7', color: '#D97706' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.statVal}>{stats.totalRevenue}</div>
          <div className={styles.statSub}>صافي أرباح الدورات</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>المدربون والخبراء</span>
            <div className={styles.iconBox} style={{ background: '#F3E8FF', color: '#9333EA' }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div className={styles.statVal}>{stats.totalInstructors}</div>
          <div className={styles.statSub}>في مختلف التخصصات</div>
        </div>
      </div>

      {/* Course Management Section */}
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

        {/* Courses Table */}
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>اسم الكورس</th>
                <th>المدرب</th>
                <th>المجال</th>
                <th>عدد الطلاب</th>
                <th>السعر</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <span className={styles.courseTitleCell}>{course.title}</span>
                  </td>
                  <td>{course.instructor}</td>
                  <td>
                    <span className={styles.catBadge}>{course.category}</span>
                  </td>
                  <td>{course.studentsCount} طالب</td>
                  <td className={styles.priceCell}>{course.price}</td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        course.status === 'نشط' ? styles.statusActive : styles.statusDraft
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleOpenEditModal(course)}
                        title="تعديل الكورس"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteCourse(course.id)}
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
      </div>

      {/* Recent Registered Students Table */}
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
              {recentStudents.map((st) => (
                <tr key={st.id}>
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

      {/* Add/Edit Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={editingCourse}
      />
    </div>
  );
}
