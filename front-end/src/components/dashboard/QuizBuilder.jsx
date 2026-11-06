'use client';

import { useState } from 'react';
import { useCourseQuiz } from '@/hooks/queries/useQuizzes';
import { useUpsertQuiz } from '@/hooks/mutations/useQuizMutations';
import Button from '../common/Button';
import {
  ArrowRight,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Check,
} from 'lucide-react';
import styles from './QuizBuilder.module.css';

export default function QuizBuilder({ course, onBack }) {
  const courseId = course?._id;

  const { data: quizData, isLoading: loading } = useCourseQuiz(courseId);
  const upsertMutation = useUpsertQuiz(courseId);

  const existingQuiz = quizData?.quiz;

  // Local form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(20);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [prevQuizId, setPrevQuizId] = useState(null);

  const [alertMsg, setAlertMsg] = useState({ text: '', type: 'success' });

  // Sync state when quizData arrives
  if (existingQuiz && existingQuiz._id !== prevQuizId) {
    setPrevQuizId(existingQuiz._id);
    setTitle(existingQuiz.title || 'الاختبار النهائي للدورة');
    setDescription(existingQuiz.description || '');
    setPassingScore(existingQuiz.passingScore || 70);
    setTimeLimit(existingQuiz.timeLimit !== undefined ? existingQuiz.timeLimit : 20);
    setIsActive(existingQuiz.isActive !== false);
    setQuestions(
      existingQuiz.questions?.length > 0
        ? existingQuiz.questions.map((q) => ({
            questionText: q.questionText || '',
            options: q.options?.length ? [...q.options] : ['', ''],
            correctOptionIndex: q.correctOptionIndex ?? 0,
            points: q.points || 10,
            explanation: q.explanation || '',
          }))
        : [
            {
              questionText: '',
              options: ['', '', '', ''],
              correctOptionIndex: 0,
              points: 10,
              explanation: '',
            },
          ]
    );
  } else if (!existingQuiz && !loading && prevQuizId === null && questions.length === 0) {
    // New quiz default
    setPrevQuizId('new');
    setTitle('الاختبار النهائي للدورة');
    setDescription('اختبار تقييمي لقياس مدى استيعابك لمفاهيم ومحتويات الكورس.');
    setPassingScore(70);
    setTimeLimit(20);
    setIsActive(true);
    setQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 10,
        explanation: '',
      },
    ]);
  }

  const showAlert = (text, type = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 3500);
  };

  // Add question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 10,
        explanation: '',
      },
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      showAlert('يجب أن يحتوي الاختبار على سؤال واحد على الأقل.', 'error');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Update question field
  const handleQuestionChange = (qIndex, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], [field]: value };
      return copy;
    });
  };

  // Update question option
  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOptions = [...copy[qIndex].options];
      newOptions[optIndex] = value;
      copy[qIndex] = { ...copy[qIndex], options: newOptions };
      return copy;
    });
  };

  // Set correct option
  const handleSetCorrectOption = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], correctOptionIndex: optIndex };
      return copy;
    });
  };

  // Save Quiz
  const handleSaveQuiz = async (e) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      showAlert('يرجى إدخال عنوان الاختبار.', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showAlert(`يرجى كتابة نص السؤال رقم ${i + 1}.`, 'error');
        return;
      }
      const filledOptions = q.options.filter((o) => o.trim() !== '');
      if (filledOptions.length < 2) {
        showAlert(`السؤال رقم ${i + 1} يجب أن يحتوي على خيارين على الأقل.`, 'error');
        return;
      }
      if (!q.options[q.correctOptionIndex]?.trim()) {
        showAlert(`يرجى تحديد إجابة صحيحة صالحة للسؤال رقم ${i + 1}.`, 'error');
        return;
      }
    }

    try {
      await upsertMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        passingScore: Number(passingScore) || 70,
        timeLimit: Number(timeLimit) || 0,
        isActive,
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correctOptionIndex: q.correctOptionIndex,
          points: Number(q.points) || 10,
          explanation: (q.explanation || '').trim(),
        })),
      });

      showAlert('تم حفظ وتحديث الاختبار بنجاح! 🎯', 'success');
    } catch (err) {
      showAlert(err?.response?.data?.message || 'حدث خطأ أثناء حفظ الاختبار.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarRight}>
          <button type="button" className={styles.backBtn} onClick={onBack}>
            <ArrowRight size={18} />
            <span>العودة للكورسات</span>
          </button>
          <div className={styles.courseHeaderInfo}>
            <h2>إدارة اختبار: {course?.title}</h2>
            <p>أنشئ أسئلة اختيار من متعدد وحدد درجات النجاح والوقت الزمني</p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Save}
          onClick={handleSaveQuiz}
          disabled={upsertMutation.isPending || loading}
        >
          {upsertMutation.isPending ? 'جارٍ الحفظ…' : 'حفظ ونشر الاختبار'}
        </Button>
      </div>

      {/* ── Alerts ── */}
      {alertMsg.text && (
        <div
          className={`${styles.alert} ${
            alertMsg.type === 'success' ? styles.alertSuccess : styles.alertError
          }`}
        >
          {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.card} style={{ alignItems: 'center', padding: '3rem' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>جارٍ تحميل بيانات الاختبار…</span>
        </div>
      ) : (
        <>
          {/* ── Settings Card ── */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <HelpCircle size={20} color="var(--primary)" />
              إعدادات الاختبار العامة
            </h3>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>عنوان الاختبار *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: الاختبار النهائي الشامل"
                  required
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Award size={15} style={{ display: 'inline', marginLeft: 4 }} />
                    درجة النجاح (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className={styles.input}
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={15} style={{ display: 'inline', marginLeft: 4 }} />
                    المدة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="0 تعني بدون وقت"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>وصف الاختبار أو تعليمات للطلاب</label>
              <textarea
                rows={2}
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تعليمات الاختبار، متطلبات الإجابة، إلخ..."
              />
            </div>
          </div>

          {/* ── Questions List ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                أسئلة الاختبار ({questions.length})
              </h3>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionBadge}>سؤال {qIndex + 1}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        الدرجات:
                      </span>
                      <input
                        type="number"
                        min="1"
                        style={{ width: '60px', padding: '0.25rem 0.5rem', textAlign: 'center' }}
                        className={styles.input}
                        value={q.points}
                        onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className={styles.deleteQuestionBtn}
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <Trash2 size={14} />
                      <span>حذف السؤال</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>نص السؤال *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    placeholder="اكتب صيغة السؤال هنا..."
                  />
                </div>

                {/* Options */}
                <div className={styles.optionsSection}>
                  <label className={styles.label}>
                    خيارات الإجابة (اضغط على الدائرة لتحديد الإجابة الصحيحة):
                  </label>

                  {q.options.map((opt, optIndex) => {
                    const isCorrect = q.correctOptionIndex === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`${styles.optionItem} ${isCorrect ? styles.optionItemActive : ''}`}
                      >
                        <button
                          type="button"
                          className={`${styles.optionRadio} ${isCorrect ? styles.optionRadioActive : ''}`}
                          onClick={() => handleSetCorrectOption(qIndex, optIndex)}
                          title={isCorrect ? 'الإجابة الصحيحة الحالية' : 'تحديد كإجابة صحيحة'}
                        >
                          {isCorrect && <Check size={14} />}
                        </button>

                        <input
                          type="text"
                          className={styles.input}
                          style={{ border: 'none', background: 'transparent', padding: '0.2rem' }}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`الخيار ${optIndex + 1}`}
                        />

                        {isCorrect && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#059669',
                              backgroundColor: '#D1FAE5',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            الإجابة الصحيحة
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>تفسير أو تعليل الإجابة (يظهر للطالب بعد الحل - اختياري)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                    placeholder="شرح توضيحي لسبب صحة هذه الإجابة..."
                  />
                </div>
              </div>
            ))}

            <div className={styles.addBtnRow}>
              <button type="button" className={styles.addQuestionBtn} onClick={handleAddQuestion}>
                <Plus size={18} />
                <span>إضافة سؤال جديد إلى الاختبار</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
