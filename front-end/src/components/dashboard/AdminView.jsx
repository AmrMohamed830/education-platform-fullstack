'use client';

import { useState } from 'react';
import { adminDashboardData } from '@/data/dashboardData';
import { useCourses } from '@/hooks/queries/useCourses';
import { useAdminStats } from '@/hooks/queries/useAuth';
import {
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from '@/hooks/mutations/useCourseMutations';
import Button from '../common/Button';
import CourseModal from './CourseModal';
import CurriculumBuilder from './CurriculumBuilder';
import {
  BookOpen,
  Users,
  Award,
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const { stats: mockStats, recentStudents: mockStudents } = adminDashboardData;

// Map backend status value to Arabic display label
const statusLabel = (status) => (status === 'active' ? 'نشط' : 'مسودة');

export default function AdminView({ activeTab = 'overview' }) {
  const { data: coursesData, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses();
  const { data: adminStatsData, isLoading: statsLoading } = useAdminStats();

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const courses = coursesData?.courses || [];
  const adminStats = adminStatsData?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalReviews: 0,
  };
  const studentsList = adminStatsData?.students?.length > 0
    ? adminStatsData.students
    : mockStudents;

  const loading = coursesLoading || statsLoading;
  const fetchError = coursesError ? 'تعذّر تحميل بيانات لوحة الإدارة. يرجى المحاولة مجدداً.' : '';

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [modalError, setModalError] = useState('');
  const [selectedCurriculumCourse, setSelectedCurriculumCourse] = useState(null);

  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
    setModalError('');
    try {
      if (editingCourse) {
        await updateMutation.mutateAsync({ courseId: editingCourse._id, data: formData });
        showAlert('تم تعديل بيانات الكورس بنجاح! ✏️');
      } else {
        await createMutation.mutateAsync(formData);
        showAlert('تمت إضافة الكورس الجديد بنجاح! 🎉');
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء حفظ الكورس.';
      setModalError(msg);
      showAlert(msg, 'error');
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الكورس؟')) return;
    try {
      await deleteMutation.mutateAsync(courseId);
      showAlert('تم حذف الكورس بنجاح! 🗑️');
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
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5">لوحة التحكم وإدارة المنصة 👑</h1>
          <p className="text-sm sm:text-base text-slate-500">
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
          className={`flex items-center gap-2.5 p-3.5 px-5 rounded-lg text-sm font-bold animate-[fadeIn_0.25s_ease] ${
            alertMsg.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
          }`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-slate-500">إجمالي الكورسات</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600">
                <BookOpen size={20} />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-['Alexandria',sans-serif] text-slate-900 mb-1">
              {adminStats.totalCourses || courses.length}
            </div>
            <div className="text-xs text-primary font-bold">كورسات في قاعدة البيانات</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-slate-500">إجمالي الطلاب</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                <Users size={20} />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-['Alexandria',sans-serif] text-slate-900 mb-1">
              {(adminStats.totalStudents || mockStats.totalStudents).toLocaleString()}
            </div>
            <div className="text-xs text-primary font-bold">طلاب مسجلون في المنصة</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-slate-500">إجمالي الاشتراكات</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                <Award size={20} />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-['Alexandria',sans-serif] text-slate-900 mb-1">
              {adminStats.totalEnrollments || 0}
            </div>
            <div className="text-xs text-primary font-bold">اشتراكات نشطة بالدورات</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold text-slate-500">آراء ومراجعات الطلاب</span>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-['Alexandria',sans-serif] text-slate-900 mb-1">
              {adminStats.totalReviews || 0}
            </div>
            <div className="text-xs text-primary font-bold">تقييمات مسجلة للمناهج</div>
          </div>
        </div>
      )}

      {/* Course Management Section */}
      {activeTab !== 'students-manage' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">إدارة الكورسات المتاحة</h2>
              <p className="text-xs sm:text-sm text-slate-500">عرض، تعديل، أو حذف الكورسات الحالية في المنصة</p>
            </div>

            <div className="relative w-full sm:w-64 flex items-center">
              <Search size={16} className="absolute right-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن كورس أو مدرب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-3.5 py-2.5 rounded-lg border border-slate-200 text-sm outline-none bg-slate-50 focus:border-primary focus:bg-white transition"
              />
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3.5 py-12 text-slate-500 text-sm text-center">
              <Loader2 size={32} className="text-primary animate-spin" />
              <span>جارٍ تحميل الكورسات…</span>
            </div>
          )}

          {/* Fetch error state */}
          {!loading && fetchError && (
            <div className="flex flex-col items-center justify-center gap-3.5 py-12 text-slate-500 text-sm text-center">
              <AlertCircle size={32} className="text-red-500" />
              <span>{fetchError}</span>
              <Button variant="outline" onClick={() => refetchCourses()}>
                إعادة المحاولة
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3.5 py-12 text-slate-500 text-sm text-center">
              <BookOpen size={32} className="text-slate-400" />
              <span>
                {searchQuery ? 'لا توجد نتائج للبحث.' : 'لا توجد كورسات حتى الآن. أضف أول كورس!'}
              </span>
            </div>
          )}

          {/* Courses Table */}
          {!loading && !fetchError && filteredCourses.length > 0 && (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-right text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                    <th className="p-3.5 px-4">اسم الكورس</th>
                    <th className="p-3.5 px-4">المدرب</th>
                    <th className="p-3.5 px-4">المجال</th>
                    <th className="p-3.5 px-4">السعر</th>
                    <th className="p-3.5 px-4">الحالة</th>
                    <th className="p-3.5 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900">{course.title}</td>
                      <td className="p-4 text-slate-600">{course.instructor || '—'}</td>
                      <td className="p-4">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          {course.category || '—'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-primary">${course.price}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            course.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {statusLabel(course.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                            onClick={() => setSelectedCurriculumCourse(course)}
                            title="إدارة المنهج والدروس"
                          >
                            <BookOpen size={15} />
                            <span>المنهج ({course.sections?.length || 0})</span>
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-md text-primary bg-primary/10 hover:bg-primary hover:text-white transition cursor-pointer"
                            onClick={() => handleOpenEditModal(course)}
                            title="تعديل الكورس"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-md text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition cursor-pointer"
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

      {/* Recent Registered Students Table */}
      {activeTab !== 'courses-manage' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between gap-6 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">أحدث الطلاب المنضمين</h2>
              <p className="text-xs sm:text-sm text-slate-500">آخر المسجلين في المنصة خلال الأيام الأخيرة</p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-right text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500">
                  <th className="p-3.5 px-4">اسم الطالب</th>
                  <th className="p-3.5 px-4">البريد الإلكتروني</th>
                  <th className="p-3.5 px-4">الكورس المسجل</th>
                  <th className="p-3.5 px-4">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentsList.map((st) => (
                  <tr key={st.id || st.email} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-900">{st.name}</td>
                    <td className="p-4 text-slate-600">{st.email}</td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{st.course}</span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{st.date}</td>
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
