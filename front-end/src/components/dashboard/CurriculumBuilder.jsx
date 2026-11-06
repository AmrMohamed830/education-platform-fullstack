'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCourseCurriculum,
  addSection,
  updateSection,
  deleteSection,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderCurriculum,
} from '@/services/curriculum.service';
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
  FileText,
  Clock,
  Sparkles,
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
import styles from './CurriculumBuilder.module.css';

export default function CurriculumBuilder({ course, onBack }) {
  const courseId = course?._id;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });
  const [isSaving, setIsSaving] = useState(false);

  // Expanded sections tracking
  const [expandedSections, setExpandedSections] = useState({});

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

  // ── Fetch Curriculum ────────────────────────────────────────────────
  const fetchCurriculum = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError('');
      const res = await getCourseCurriculum(courseId);
      const fetchedSections = res.data.data.sections || [];
      setSections(fetchedSections);

      // Expand all sections by default
      const initialExpanded = {};
      fetchedSections.forEach((sec) => {
        initialExpanded[sec._id] = true;
      });
      setExpandedSections(initialExpanded);
    } catch (err) {
      setError(err?.response?.data?.message || 'تعذر تحميل منهج الكورس.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!ignore) {
        await fetchCurriculum();
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, [fetchCurriculum]);

  // ── Alert Helper ────────────────────────────────────────────────────
  const showAlert = (text, type = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 3500);
  };

  // Toggle Section Collapse
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
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

    setIsSaving(true);
    try {
      if (editingSection) {
        await updateSection(course._id, editingSection._id, sectionFormData);
        showAlert('تم تعديل بيانات الوحدة بنجاح! ✏️');
      } else {
        await addSection(course._id, sectionFormData);
        showAlert('تمت إضافة الوحدة الجديدة بنجاح! 🎉');
      }
      setIsSectionModalOpen(false);
      await fetchCurriculum();
    } catch (err) {
      showAlert(err?.response?.data?.message || 'فشل حفظ الوحدة.', 'error');
    } finally {
      setIsSaving(false);
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

    setIsSaving(true);
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
        await updateLesson(course._id, targetSectionId, editingLesson._id, payload);
        showAlert('تم تعديل الدرس بنجاح! ✏️');
      } else {
        await addLesson(course._id, targetSectionId, payload);
        showAlert('تمت إضافة الدرس بنجاح! 🎉');
      }
      setIsLessonModalOpen(false);
      await fetchCurriculum();
    } catch (err) {
      showAlert(err?.response?.data?.message || 'فشل حفظ الدرس.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deletion Execution ──────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsSaving(true);
    try {
      if (deleteConfirm.type === 'section') {
        await deleteSection(course._id, deleteConfirm.id);
        showAlert('تم حذف الوحدة وجميع دروسها بنجاح! 🗑️');
      } else if (deleteConfirm.type === 'lesson') {
        await deleteLesson(course._id, deleteConfirm.parentId, deleteConfirm.id);
        showAlert('تم حذف الدرس بنجاح! 🗑️');
      }
      setDeleteConfirm(null);
      await fetchCurriculum();
    } catch (err) {
      showAlert(err?.response?.data?.message || 'فشل الحذف.', 'error');
    } finally {
      setIsSaving(false);
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
      await reorderCurriculum(course._id, sectionsOrder);
      showAlert('تم تحديث ترتيب الوحدات!');
    } catch {
      await fetchCurriculum();
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
      await reorderCurriculum(course._id, sectionsOrder);
      showAlert('تم تحديث ترتيب الدروس!');
    } catch {
      await fetchCurriculum();
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
    <div className={styles.container}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarRight}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <ArrowRight size={18} />
            <span>العودة لقائمة الكورسات</span>
          </button>

          <div className={styles.courseHeaderInfo}>
            <h2>منهج كورس: {course.title}</h2>
            <div className={styles.courseMetaPills}>
              <span className={styles.metaPill}>
                <Layers size={14} />
                {totalSectionsCount} وحدات
              </span>
              <span className={styles.metaPill}>
                <BookOpen size={14} />
                {totalLessonsCount} درس
              </span>
              <span className={`${styles.metaPill} ${styles.metaPillGreen}`}>
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
        <div className={alertMsg.type === 'error' ? styles.alertError : styles.alertSuccess}>
          {alertMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* ── Loading / Empty States ── */}
      {loading && (
        <div className={styles.emptyStateContainer}>
          <Loader2 size={36} className={styles.loadingSpinner} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>جارٍ تحميل وحدات ودروس الكورس...</span>
        </div>
      )}

      {!loading && sections.length === 0 && (
        <div className={styles.emptyStateContainer}>
          <Layers size={48} color="#94A3B8" />
          <h3 className={styles.emptyStateTitle}>لم يتم إضافة أي وحدات دراسية بعد</h3>
          <p className={styles.emptyStateSub}>
            ابدأ ببناء المحتوى التعليمي لهذا الكورس بإضافة وحدتك الأولى، ثم قسّمها إلى دروس وفيديوهات وتطبيقات.
          </p>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddSection}>
            إضافة أول وحدة الآن
          </Button>
        </div>
      )}

      {/* ── Sections List ── */}
      {!loading && sections.length > 0 && (
        <div className={styles.sectionsList}>
          {sections.map((section, sIndex) => {
            const isExpanded = expandedSections[section._id] !== false;

            return (
              <div key={section._id} className={styles.sectionCard}>
                {/* Section Header */}
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeaderLeft}>
                    <span className={styles.sectionOrderBadge}>{sIndex + 1}</span>
                    <div className={styles.sectionTitleArea}>
                      <span className={styles.sectionTitle}>{section.title}</span>
                      {section.description && (
                        <span className={styles.sectionDesc}>{section.description}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.sectionActions}>
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleMoveSection(sIndex, 'up')}
                      disabled={sIndex === 0}
                      title="تحريك لأعلى"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleMoveSection(sIndex, 'down')}
                      disabled={sIndex === sections.length - 1}
                      title="تحريك لأسفل"
                    >
                      <ArrowDown size={15} />
                    </button>

                    {/* Edit Section */}
                    <button
                      type="button"
                      className={styles.iconBtn}
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
                      className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
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
                      className={styles.toggleExpandBtn}
                      onClick={() => toggleSection(section._id)}
                      title={isExpanded ? 'طي الوحدة' : 'توسيع الوحدة'}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Section Lessons (Expanded) */}
                {isExpanded && (
                  <div className={styles.lessonsArea}>
                    {(!section.lessons || section.lessons.length === 0) && (
                      <div className={styles.emptySectionLessons}>
                        <BookOpen size={28} />
                        <span>لا توجد دروس في هذه الوحدة حتى الآن.</span>
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
                        <div key={lesson._id} className={styles.lessonItem}>
                          <div className={styles.lessonInfoLeft}>
                            <Video size={18} className={styles.lessonIcon} />
                            <div className={styles.lessonDetails}>
                              <span className={styles.lessonTitle}>{lesson.title}</span>
                              <div className={styles.lessonMetaRow}>
                                <span>{lesson.duration || 0} دقيقة</span>
                                <span>•</span>
                                {lesson.isPreview ? (
                                  <span className={styles.previewBadge}>معاينة مجانية</span>
                                ) : (
                                  <span className={styles.lockedBadge}>خاص بالمشتركين</span>
                                )}
                                {lesson.resources && lesson.resources.length > 0 && (
                                  <span className={styles.resourceTag}>
                                    {lesson.resources.length} مرفقات
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.lessonActions}>
                            {/* Reorder lesson */}
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => handleMoveLesson(section._id, lIndex, 'up')}
                              disabled={lIndex === 0}
                              title="تحريك لأعلى"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => handleMoveLesson(section._id, lIndex, 'down')}
                              disabled={lIndex === section.lessons.length - 1}
                              title="تحريك لأسفل"
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Edit Lesson */}
                            <button
                              type="button"
                              className={styles.iconBtn}
                              onClick={() => handleOpenEditLesson(section._id, lesson)}
                              title="تعديل الدرس"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Lesson */}
                            <button
                              type="button"
                              className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
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
        <form onSubmit={handleSaveSection} className={styles.form}>
          <Input
            label="عنوان الوحدة"
            placeholder="مثال: الوحدة الأولى: مدخل وأساسيات"
            value={sectionFormData.title}
            onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
            required
          />

          <div className={styles.textareaGroup}>
            <label className={styles.label}>وصف الوحدة (اختياري)</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="وصف مختصر لمحتوى هذه الوحدة..."
              value={sectionFormData.description}
              onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
            />
          </div>

          <div className={styles.modalActions}>
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
        <form onSubmit={handleSaveLesson} className={styles.form}>
          <Input
            label="عنوان الدرس"
            placeholder="مثال: تثبيت بيئة العمل وإعداد المشروع"
            value={lessonFormData.title}
            onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
            required
          />

          <div className={styles.textareaGroup}>
            <label className={styles.label}>وصف الدرس</label>
            <textarea
              className={styles.textarea}
              rows={2}
              placeholder="اكتب نبذة أو ملخصاً عن محتوى هذا الدرس..."
              value={lessonFormData.description}
              onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
            />
          </div>

          <div className={styles.row}>
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
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={lessonFormData.isPreview}
              onChange={(e) => setLessonFormData({ ...lessonFormData, isPreview: e.target.checked })}
            />
            <div>
              <div className={styles.checkboxLabel}>درس متاح للمعاينة المجانية (Preview)</div>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                يمكن لأي زائر مشاهدة هذا الدرس قبل الاشتراك في الكورس.
              </span>
            </div>
          </label>

          {/* Resources List */}
          <div className={styles.resourcesSection}>
            <div className={styles.resourcesHeader}>
              <span className={styles.label}>ملفات ومصادر خارجية للدرس ({lessonFormData.resources.length})</span>
            </div>

            <div className={styles.resourceRow}>
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

            <div style={{ margin: '0.4rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => resourceFileInputRef.current?.click()}
                disabled={uploadingResource}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px dashed #CBD5E1',
                  background: '#F8FAFC',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {uploadingResource ? (
                  <>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
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
                style={{ display: 'none' }}
                onChange={handleResourceFileUpload}
              />
            </div>

            {lessonFormData.resources.map((res, i) => (
              <div key={i} className={styles.resourceItemCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LinkIcon size={14} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>{res.title}</span>
                  <span style={{ color: '#64748B', fontSize: '0.78rem' }}>({res.url})</span>
                </div>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                  onClick={() => handleRemoveResource(i)}
                  title="حذف الملف"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.modalActions}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
            هل أنت متأكد من رغبتك في حذف{' '}
            <strong>{deleteConfirm?.type === 'section' ? 'الوحدة' : 'الدرس'}</strong>: &quot;
            {deleteConfirm?.title}&quot;؟
            {deleteConfirm?.type === 'section' && (
              <span style={{ display: 'block', color: '#DC2626', marginTop: '0.35rem', fontWeight: 600 }}>
                ⚠️ تحذير: سيتم حذف جميع الدروس والمحتويات التابعة لهذه الوحدة أيضاً!
              </span>
            )}
          </p>

          <div className={styles.modalActions}>
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
