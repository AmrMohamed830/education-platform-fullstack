'use client';

import { useState, useRef } from 'react';
import { useCurriculum } from '@/hooks/queries/useCurriculum';
import {
  useAddSection,
  useUpdateSection,
  useDeleteSection,
  useAddLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderCurriculum,
} from '@/hooks/mutations/useCurriculumMutations';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import {
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  Clock,
  Layers,
  BookOpen,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  X,
  Upload,
} from 'lucide-react';
import { uploadResourceFile } from '@/services/upload.service';

export default function CurriculumBuilder({ course, onBack }) {
  const courseId = course?._id;

  const { data: currData, isLoading: loading, error: currError } = useCurriculum(courseId);

  const addSectionMutation = useAddSection(courseId);
  const updateSectionMutation = useUpdateSection(courseId);
  const deleteSectionMutation = useDeleteSection(courseId);
  const addLessonMutation = useAddLesson(courseId);
  const updateLessonMutation = useUpdateLesson(courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);
  const reorderMutation = useReorderCurriculum(courseId);

  const [sections, setSections] = useState([]);
  const [prevCurrSections, setPrevCurrSections] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  // Expanded sections tracking
  const [expandedSections, setExpandedSections] = useState({});

  if (currData?.sections && currData.sections !== prevCurrSections) {
    setPrevCurrSections(currData.sections);
    setSections(currData.sections);
  }

  const error = currError ? (currError?.response?.data?.message || 'تعذر تحميل منهج الكورس.') : '';
  const isSaving =
    addSectionMutation.isPending ||
    updateSectionMutation.isPending ||
    deleteSectionMutation.isPending ||
    addLessonMutation.isPending ||
    updateLessonMutation.isPending ||
    deleteLessonMutation.isPending ||
    reorderMutation.isPending;

  // ── Modals State ────────────────────────────────────────────────────
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({ title: '', description: '' });

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    isPreview: false,
    resources: [],
  });
  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [uploadingResource, setUploadingResource] = useState(false);
  const resourceFileInputRef = useRef(null);

  const handleResourceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingResource(true);
      const res = await uploadResourceFile(file);
      setNewResource({
        title: res.data.data.title || file.name,
        url: res.data.data.url,
      });
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل رفع الملف.');
    } finally {
      setUploadingResource(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, parentId, title }

  // ── Alert Helper ────────────────────────────────────────────────────
  const showAlert = (text, type = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 3500);
  };

  // Toggle Section Collapse
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false ? true : false,
    }));
  };

  // ── Section Actions ─────────────────────────────────────────────────
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionFormData({ title: '', description: '' });
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title || '',
      description: section.description || '',
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionFormData.title.trim()) return;

    try {
      if (editingSection) {
        await updateSectionMutation.mutateAsync({
          sectionId: editingSection._id,
          data: sectionFormData,
        });
        showAlert('تم تعديل بيانات الوحدة بنجاح! ✏️');
      } else {
        await addSectionMutation.mutateAsync(sectionFormData);
        showAlert('تمت إضافة الوحدة الجديدة بنجاح! 🎉');
      }
      setIsSectionModalOpen(false);
    } catch (err) {
      showAlert(err?.response?.data?.message || 'فشل حفظ الوحدة.', 'error');
    }
  };

  // ── Lesson Actions ──────────────────────────────────────────────────
  const handleOpenAddLesson = (sectionId) => {
    setTargetSectionId(sectionId);
    setEditingLesson(null);
    setLessonFormData({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      isPreview: false,
      resources: [],
    });
    setNewResource({ title: '', url: '' });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (sectionId, lesson) => {
    setTargetSectionId(sectionId);
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title || '',
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration !== undefined ? String(lesson.duration) : '',
      isPreview: Boolean(lesson.isPreview),
      resources: Array.isArray(lesson.resources) ? [...lesson.resources] : [],
    });
    setNewResource({ title: '', url: '' });
    setIsLessonModalOpen(true);
  };

  const handleAddResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    setLessonFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { ...newResource, type: 'link' }],
    }));
    setNewResource({ title: '', url: '' });
  };

  const handleRemoveResource = (index) => {
    setLessonFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonFormData.title.trim() || !targetSectionId) return;

    try {
      const payload = {
        title: lessonFormData.title.trim(),
        description: lessonFormData.description.trim(),
        videoUrl: lessonFormData.videoUrl.trim(),
        duration: Number(lessonFormData.duration) || 0,
        isPreview: lessonFormData.isPreview,
        resources: lessonFormData.resources,
      };

      if (editingLesson) {
        await updateLessonMutation.mutateAsync({
          sectionId: targetSectionId,
          lessonId: editingLesson._id,
          data: payload,
        });
        showAlert('تم تعديل الدرس بنجاح! ✏️');
      } else {
        await addLessonMutation.mutateAsync({
          sectionId: targetSectionId,
          data: payload,
        });
        showAlert('تمت إضافة الدرس بنجاح! 🎉');
      }
      setIsLessonModalOpen(false);
    } catch (err) {
      showAlert(err?.response?.data?.message || 'فشل حفظ الدرس.', 'error');
    }
  };

  // ── Deletion Execution ──────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'section') {
        await deleteSectionMutation.mutateAsync(deleteConfirm.id);
        showAlert('تم حذف الوحدة وجميع دروسها بنجاح! 🗑️');
      } else if (deleteConfirm.type === 'lesson') {
        await deleteLessonMutation.mutateAsync({
          sectionId: deleteConfirm.parentId,
          lessonId: deleteConfirm.id,
        });
        showAlert('تم حذف الدرس بنجاح! 🗑️');
      }
      setDeleteConfirm(null);
    } catch (err) {
      showAlert(err?.response?.data?.message || 'فشل الحذف.', 'error');
    }
  };

  // ── Reordering Helpers ──────────────────────────────────────────────
  const handleMoveSection = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Build sections order payload
    const sectionsOrder = newSections.map((sec, i) => ({
      sectionId: sec._id,
      order: i,
    }));

    setSections(newSections);

    try {
      await reorderMutation.mutateAsync(sectionsOrder);
      showAlert('تم تحديث ترتيب الوحدات!');
    } catch {
      if (currData?.sections) setSections(currData.sections);
      showAlert('تعذر حفظ الترتيب الجديد.', 'error');
    }
  };

  const handleMoveLesson = async (sectionId, lessonIndex, direction) => {
    const sectionIndex = sections.findIndex((s) => s._id === sectionId);
    if (sectionIndex === -1) return;

    const currentSection = sections[sectionIndex];
    const lessons = [...currentSection.lessons];
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;

    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const temp = lessons[lessonIndex];
    lessons[lessonIndex] = lessons[targetIndex];
    lessons[targetIndex] = temp;

    const updatedSection = { ...currentSection, lessons };
    const newSections = [...sections];
    newSections[sectionIndex] = updatedSection;

    setSections(newSections);

    const sectionsOrder = [
      {
        sectionId,
        lessonsOrder: lessons.map((les, i) => ({
          lessonId: les._id,
          order: i,
        })),
      },
    ];

    try {
      await reorderMutation.mutateAsync(sectionsOrder);
      showAlert('تم تحديث ترتيب الدروس!');
    } catch {
      if (currData?.sections) setSections(currData.sections);
      showAlert('تعذر حفظ الترتيب الجديد.', 'error');
    }
  };

  // Summary calculations
  const totalSectionsCount = sections.length;
  const totalLessonsCount = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const totalDurationMinutes = sections.reduce(
    (acc, s) => acc + (s.lessons?.reduce((lAcc, l) => lAcc + (l.duration || 0), 0) || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap bg-white p-5 sm:px-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition"
            onClick={onBack}
          >
            <ArrowRight size={18} />
            <span>العودة لقائمة الكورسات</span>
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
              منهج كورس: {course.title}
            </h2>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                <Layers size={14} />
                {totalSectionsCount} وحدات
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                <BookOpen size={14} />
                {totalLessonsCount} درس
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <Clock size={14} />
                {totalDurationMinutes} دقيقة إجمالية
              </span>
            </div>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAddSection}>
          إضافة وحدة جديدة (Section)
        </Button>
      </div>

      {/* ── Alerts ── */}
      {alertMsg.text && (
        <div
          className={`flex items-center gap-2.5 p-3.5 px-5 rounded-lg text-sm font-bold animate-[fadeIn_0.2s_ease] ${
            alertMsg.type === 'error'
              ? 'bg-red-50 border border-red-300 text-red-800'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
          }`}
        >
          {alertMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* ── Loading / Empty States ── */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 sm:p-16 text-center flex flex-col items-center gap-4 text-slate-600 font-semibold">
          <Loader2 size={36} className="text-primary animate-spin" />
          <span>جارٍ تحميل وحدات ودروس الكورس...</span>
        </div>
      )}

      {!loading && sections.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 sm:p-16 text-center flex flex-col items-center gap-4">
          <Layers size={48} className="text-slate-400" />
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">لم يتم إضافة أي وحدات دراسية بعد</h3>
          <p className="text-sm sm:text-base text-slate-500 max-w-md">
            ابدأ ببناء المحتوى التعليمي لهذا الكورس بإضافة وحدتك الأولى، ثم قسّمها إلى دروس وفيديوهات وتطبيقات.
          </p>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddSection}>
            إضافة أول وحدة الآن
          </Button>
        </div>
      )}

      {/* ── Sections List ── */}
      {!loading && sections.length > 0 && (
        <div className="flex flex-col gap-5">
          {sections.map((section, sIndex) => {
            const isExpanded = expandedSections[section._id] !== false;

            return (
              <div key={section._id} className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-sm transition">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 bg-slate-50 border-b border-slate-200 gap-4">
                  <div className="flex items-center gap-3.5 flex-1">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      {sIndex + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base sm:text-lg font-extrabold text-slate-900">{section.title}</span>
                      {section.description && (
                        <span className="text-xs sm:text-sm text-slate-500">{section.description}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:enabled:bg-slate-100 hover:enabled:text-primary hover:enabled:border-primary/30 disabled:opacity-35 disabled:cursor-not-allowed"
                      onClick={() => handleMoveSection(sIndex, 'up')}
                      disabled={sIndex === 0}
                      title="تحريك لأعلى"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:enabled:bg-slate-100 hover:enabled:text-primary hover:enabled:border-primary/30 disabled:opacity-35 disabled:cursor-not-allowed"
                      onClick={() => handleMoveSection(sIndex, 'down')}
                      disabled={sIndex === sections.length - 1}
                      title="تحريك لأسفل"
                    >
                      <ArrowDown size={15} />
                    </button>

                    {/* Edit Section */}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:bg-slate-100 hover:text-primary hover:border-primary/30"
                      onClick={() => handleOpenEditSection(section)}
                      title="تعديل اسم الوحدة"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Add Lesson */}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleOpenAddLesson(section._id)}
                    >
                      إضافة درس
                    </Button>

                    {/* Delete Section */}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'section',
                          id: section._id,
                          title: section.title,
                        })
                      }
                      title="حذف الوحدة"
                    >
                      <Trash2 size={15} />
                    </button>

                    {/* Collapse / Expand */}
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center text-slate-500 cursor-pointer transition"
                      onClick={() => toggleSection(section._id)}
                      title={isExpanded ? 'طي الوحدة' : 'توسيع الوحدة'}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Section Lessons (Expanded) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-white flex flex-col gap-3">
                    {(!section.lessons || section.lessons.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-slate-400 border-2 border-dashed border-slate-300 rounded-lg gap-2.5">
                        <BookOpen size={28} />
                        <span className="text-sm font-medium">لا توجد دروس في هذه الوحدة حتى الآن.</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Plus}
                          onClick={() => handleOpenAddLesson(section._id)}
                        >
                          إضافة أول درس لهذه الوحدة
                        </Button>
                      </div>
                    )}

                    {section.lessons && section.lessons.length > 0 && (
                      section.lessons.map((lesson, lIndex) => (
                        <div key={lesson._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:px-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-lg gap-3 transition">
                          <div className="flex items-center gap-3 flex-1">
                            <Video size={18} className="text-primary shrink-0" />
                            <div className="flex flex-col gap-1">
                              <span className="text-sm sm:text-base font-bold text-slate-800">{lesson.title}</span>
                              <div className="flex items-center gap-2.5 flex-wrap text-xs text-slate-500">
                                <span>{lesson.duration || 0} دقيقة</span>
                                <span>•</span>
                                {lesson.isPreview ? (
                                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">معاينة مجانية</span>
                                ) : (
                                  <span className="bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded text-xs">خاص بالمشتركين</span>
                                )}
                                {lesson.resources && lesson.resources.length > 0 && (
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold text-xs">
                                    {lesson.resources.length} مرفقات
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            {/* Reorder lesson */}
                            <button
                              type="button"
                              className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:enabled:bg-slate-100 hover:enabled:text-primary hover:enabled:border-primary/30 disabled:opacity-35 disabled:cursor-not-allowed"
                              onClick={() => handleMoveLesson(section._id, lIndex, 'up')}
                              disabled={lIndex === 0}
                              title="تحريك لأعلى"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:enabled:bg-slate-100 hover:enabled:text-primary hover:enabled:border-primary/30 disabled:opacity-35 disabled:cursor-not-allowed"
                              onClick={() => handleMoveLesson(section._id, lIndex, 'down')}
                              disabled={lIndex === section.lessons.length - 1}
                              title="تحريك لأسفل"
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Edit Lesson */}
                            <button
                              type="button"
                              className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:bg-slate-100 hover:text-primary"
                              onClick={() => handleOpenEditLesson(section._id, lesson)}
                              title="تعديل الدرس"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Lesson */}
                            <button
                              type="button"
                              className="w-7 h-7 rounded border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'lesson',
                                  id: lesson._id,
                                  parentId: section._id,
                                  title: lesson.title,
                                })
                              }
                              title="حذف الدرس"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Section Modal ── */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection ? 'تعديل بيانات الوحدة' : 'إضافة وحدة جديدة'}
      >
        <form onSubmit={handleSaveSection} className="flex flex-col gap-4">
          <Input
            label="عنوان الوحدة"
            placeholder="مثال: الوحدة الأولى: مدخل وأساسيات"
            value={sectionFormData.title}
            onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-800">وصف الوحدة (اختياري)</label>
            <textarea
              className="w-full p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none resize-y transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-right"
              rows={3}
              placeholder="وصف مختصر لمحتوى هذه الوحدة..."
              value={sectionFormData.description}
              onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSectionModalOpen(false)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'جارٍ الحفظ...' : editingSection ? 'حفظ التعديل' : 'إضافة الوحدة'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Lesson Modal ── */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title={editingLesson ? 'تعديل بيانات الدرس' : 'إضافة درس جديد'}
      >
        <form onSubmit={handleSaveLesson} className="flex flex-col gap-4">
          <Input
            label="عنوان الدرس"
            placeholder="مثال: تثبيت بيئة العمل وإعداد المشروع"
            value={lessonFormData.title}
            onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-800">وصف الدرس</label>
            <textarea
              className="w-full p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none resize-y transition focus:border-primary focus:ring-2 focus:ring-primary/20 text-right"
              rows={2}
              placeholder="اكتب نبذة أو ملخصاً عن محتوى هذا الدرس..."
              value={lessonFormData.description}
              onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="رابط الفيديو (YouTube أو Vimeo أو MP4)"
              placeholder="https://www.youtube.com/watch?v=..."
              value={lessonFormData.videoUrl}
              onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
            />

            <Input
              label="مدة الدرس بالدقائق"
              type="number"
              min="0"
              placeholder="15"
              value={lessonFormData.duration}
              onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
            />
          </div>

          {/* Preview Checkbox */}
          <label className="flex items-center gap-2.5 p-3 px-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary cursor-pointer"
              checked={lessonFormData.isPreview}
              onChange={(e) => setLessonFormData({ ...lessonFormData, isPreview: e.target.checked })}
            />
            <div>
              <div className="text-sm font-bold text-slate-800">درس متاح للمعاينة المجانية (Preview)</div>
              <span className="text-xs text-slate-500">
                يمكن لأي زائر مشاهدة هذا الدرس قبل الاشتراك في الكورس.
              </span>
            </div>
          </label>

          {/* Resources List */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">ملفات ومصادر خارجية للدرس ({lessonFormData.resources.length})</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                placeholder="عنوان الملف (مثال: كود الدرس على GitHub)"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              />
              <Input
                placeholder="الرابط (URL)"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddResource}>
                إضافة
              </Button>
            </div>

            <div className="my-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => resourceFileInputRef.current?.click()}
                disabled={uploadingResource}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer transition"
              >
                {uploadingResource ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>جارٍ رفع الملف...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>رفع ملف PDF أو مستند من جهازك</span>
                  </>
                )}
              </button>
              <input
                ref={resourceFileInputRef}
                type="file"
                accept=".pdf,.zip,.rar,.docx,.doc,.pptx,.txt"
                className="hidden"
                onChange={handleResourceFileUpload}
              />
            </div>

            {lessonFormData.resources.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-2 px-3 bg-slate-100 rounded-md text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon size={14} className="text-primary shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{res.title}</span>
                  <span className="text-slate-500 text-xs truncate">({res.url})</span>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                  onClick={() => handleRemoveResource(i)}
                  title="حذف الملف"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLessonModalOpen(false)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'جارٍ الحفظ...' : editingLesson ? 'حفظ التعديل' : 'إضافة الدرس'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Dialog ── */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="تأكيد الحذف"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف{' '}
            <strong>{deleteConfirm?.type === 'section' ? 'الوحدة' : 'الدرس'}</strong>: &quot;
            {deleteConfirm?.title}&quot;؟
            {deleteConfirm?.type === 'section' && (
              <span className="block text-red-600 mt-1.5 font-semibold text-xs sm:text-sm">
                ⚠️ تحذير: سيتم حذف جميع الدروس والمحتويات التابعة لهذه الوحدة أيضاً!
              </span>
            )}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isSaving}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={isSaving}
            >
              {isSaving ? 'جارٍ الحذف...' : 'نعم، احذف'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
