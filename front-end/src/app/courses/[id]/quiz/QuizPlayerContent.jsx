'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCourse } from '@/hooks/queries/useCourses';
import { useCourseQuiz } from '@/hooks/queries/useQuizzes';
import { useSubmitQuiz } from '@/hooks/mutations/useQuizMutations';
import { useCourseProgress } from '@/hooks/queries/useEnrollments';
import useAuthStore from '@/store/auth.store';
import Button from '@/components/common/Button';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import styles from './QuizPlayer.module.css';

export default function QuizPlayerContent({ courseId }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: quizData, isLoading: quizLoading } = useCourseQuiz(courseId);
  const { data: progressData } = useCourseProgress(courseId);
  const submitMutation = useSubmitQuiz(courseId);

  const quiz = quizData?.quiz;
  const bestAttempt = quizData?.bestAttempt;
  const hasPassedPreviously = quizData?.hasPassed;

  // Quiz progression state: 'idle' | 'taking' | 'result'
  const [quizState, setQuizState] = useState('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIndex }
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const questions = useMemo(() => quiz?.questions || [], [quiz?.questions]);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIdx];

  // Initialize timer when quiz starts
  const handleStartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setSubmissionResult(null);
    setSubmitError('');

    const timeLimitMinutes = quiz?.timeLimit || 0;
    if (timeLimitMinutes > 0) {
      setTimeLeftSeconds(timeLimitMinutes * 60);
    } else {
      setTimeLeftSeconds(0);
    }

    setQuizState('taking');
  };

  // Submit quiz
  const handleSubmitQuiz = useCallback(async (customAnswers) => {
    if (submitMutation.isPending) return;

    try {
      setSubmitError('');
      const answersMap = customAnswers || selectedAnswers;

      // Construct a reliable payload mapping each question by _id and by index
      const answersPayload = questions.map((q, idx) => {
        const selected =
          answersMap[q._id] !== undefined
            ? answersMap[q._id]
            : answersMap[idx] !== undefined
            ? answersMap[idx]
            : -1;

        return {
          questionId: q._id ? String(q._id) : String(idx),
          selectedOption: Number(selected),
        };
      });

      const res = await submitMutation.mutateAsync(answersPayload);
      setSubmissionResult(res.data.data);
      setQuizState('result');
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'حدث خطأ أثناء تصحيح الاختبار.');
    }
  }, [questions, selectedAnswers, submitMutation]);

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'taking' || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeLeftSeconds, handleSubmitQuiz]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Answer selection
  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
      [currentQuestionIdx]: optionIndex,
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100) : 0;

  if (courseLoading || quizLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 size={44} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>جارٍ تجهيز الاختبار النهائي للدورة...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.isActive || totalQuestions === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.headerCard} style={{ textAlign: 'center', alignItems: 'center', padding: '3.5rem 2rem' }}>
            <HelpCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h2 className={styles.quizTitle}>لا يوجد اختبار متاح حالياً</h2>
            <p className={styles.quizDesc}>
              لم يقم مدرّب الكورس بإضافة اختبار نهائي لهذا المسار بعد. يمكنك إكمال الدروس ومتابعة التعلم.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href={`/courses/${courseId}/learn`} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="md" icon={ArrowRight}>
                  العودة لمحتوى الدورة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN 1: INTRO / IDLE ──
  if (quizState === 'idle') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.topNav}>
            <Link href={`/courses/${courseId}/learn`} className={styles.backBtn}>
              <ArrowRight size={18} />
              <span>العودة إلى دروس الكورس</span>
            </Link>
            <span className={styles.coursePill}>{course?.title}</span>
          </div>

          <div className={styles.headerCard}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                <Sparkles size={15} style={{ display: 'inline', marginLeft: 4 }} />
                التقييم النهائي للدورة
              </span>
              <h1 className={styles.quizTitle}>{quiz.title}</h1>
              <p className={styles.quizDesc}>
                {quiz.description || 'أكمل هذا الاختبار لقياس فهمك لمفاهيم الكورس والحصول على شهادتك المعتمدة.'}
              </p>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <HelpCircle size={18} color="var(--primary)" />
                <span>{totalQuestions} أسئلة اختيار من متعدد</span>
              </div>
              <div className={styles.metaItem}>
                <Award size={18} color="var(--accent)" />
                <span>درجة النجاح: {quiz.passingScore}%</span>
              </div>
              {quiz.timeLimit > 0 && (
                <div className={styles.metaItem}>
                  <Clock size={18} color="#F59E0B" />
                  <span>الوقت المحدد: {quiz.timeLimit} دقيقة</span>
                </div>
              )}
            </div>

            {/* Previous Attempt if exists */}
            {bestAttempt && (
              <div
                style={{
                  background: hasPassedPreviously ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${hasPassedPreviously ? '#A7F3D0' : '#FECACA'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 800, color: hasPassedPreviously ? '#065F46' : '#991B1B', marginBottom: '0.25rem' }}>
                    {hasPassedPreviously ? 'مبروك! لقد اجتزت هذا الاختبار بنجاح سابقاً 🏆' : 'آخر محاولة لك لم تكتمل بنجاح'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: hasPassedPreviously ? '#047857' : '#B91C1C' }}>
                    أعلى نتيجة حققتها: <strong>{bestAttempt.score}%</strong> (درجة النجاح المطلوبة {quiz.passingScore}%)
                  </p>
                </div>

                {hasPassedPreviously && (
                  <Link href={`/courses/${courseId}/certificate`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="sm" icon={Award}>
                      استعراض الشهادة 📜
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" icon={PlayArrowIcon} onClick={handleStartQuiz}>
                {bestAttempt ? 'إعادة خوض الاختبار 🔄' : 'بدء الاختبار الآن 🚀'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN 2: TAKING QUIZ ──
  if (quizState === 'taking') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          {/* Top Info Bar */}
          <div className={styles.headerCard} style={{ padding: '1.25rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{quiz.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  السؤال {currentQuestionIdx + 1} من {totalQuestions}
                </span>
              </div>

              {quiz.timeLimit > 0 && (
                <div className={`${styles.timerBadge} ${timeLeftSeconds < 120 ? styles.timerWarning : ''}`}>
                  <Clock size={16} />
                  <span>{formatTimer(timeLeftSeconds)}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumberBadge}>سؤال {currentQuestionIdx + 1}</span>
                <span className={styles.pointsBadge}>{currentQuestion.points || 10} درجات</span>
              </div>

              <h2 className={styles.questionText}>{currentQuestion.questionText}</h2>

              {/* Options */}
              <div className={styles.optionsList}>
                {currentQuestion.options?.map((opt, optIdx) => {
                  const isSelected =
                    selectedAnswers[currentQuestion._id] === optIdx ||
                    selectedAnswers[currentQuestionIdx] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={`${styles.optionBtn} ${isSelected ? styles.optionBtnActive : ''}`}
                      onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                    >
                      <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {submitError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {submitError}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className={styles.footerNav}>
                <Button
                  variant="outline"
                  size="md"
                  icon={ChevronRight}
                  iconPosition="start"
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                >
                  السابق
                </Button>

                {currentQuestionIdx < totalQuestions - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={ChevronLeft}
                    iconPosition="end"
                    onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                  >
                    التالي
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    icon={Send}
                    onClick={() => handleSubmitQuiz()}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? 'جارٍ الإرسال…' : 'تسليم وإنهاء الاختبار'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN 3: RESULTS ──
  const attemptData = submissionResult?.attempt || submissionResult || {};
  const isPassed =
    attemptData?.isPassed ??
    attemptData?.passed ??
    submissionResult?.isPassed ??
    submissionResult?.passed ??
    false;
  const score = attemptData?.score ?? submissionResult?.score ?? 0;
  const earnedPoints =
    attemptData?.earnedPoints ?? submissionResult?.earnedPoints ?? 0;
  const totalPoints =
    attemptData?.totalPoints ?? submissionResult?.totalPoints ?? 0;
  const questionResults = submissionResult?.questionResults || [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.resultCard}>
          <div className={`${styles.resultIcon} ${isPassed ? styles.resultSuccess : styles.resultFail}`}>
            {isPassed ? <CheckCircle2 size={54} /> : <XCircle size={54} />}
          </div>

          <h1 className={styles.resultTitle}>
            {isPassed ? 'تهانينا! لقد اجتزت الاختبار بنجاح 🎉' : 'للأسف، لم تحقق درجة النجاح المطلوبة'}
          </h1>

          <p className={styles.resultDesc}>
            {isPassed
              ? 'أحسنت صنعاً! لقد أظهرت استيعاباً رائعاً لمحتويات الكورس. يمكنك الآن إصدار وتحميل شهادتك المعتمدة مباشرة.'
              : `درجة النجاح المطلوبة هي ${quiz.passingScore}%. يمكنك مراجعة محتوى الدروس وإعادة المحاولة في أي وقت.`}
          </p>

          <div className={styles.scoreBox}>
            <div className={styles.scoreItem}>
              <span className={`${styles.scoreVal} ${isPassed ? styles.scoreValSuccess : styles.scoreValFail}`}>
                {score}%
              </span>
              <span className={styles.scoreLabel}>درجتك النهائية</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-light)' }} />
            <div className={styles.scoreItem}>
              <span className={styles.scoreVal} style={{ color: 'var(--text-main)' }}>
                {earnedPoints} / {totalPoints}
              </span>
              <span className={styles.scoreLabel}>مجموع النقاط</span>
            </div>
          </div>

          <div className={styles.actionRow}>
            {isPassed ? (
              <Link href={`/courses/${courseId}/certificate`} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" icon={Award}>
                  الحصول على الشهادة المعتمدة 📜
                </Button>
              </Link>
            ) : (
              <Button variant="primary" size="lg" icon={RotateCcw} onClick={handleStartQuiz}>
                إعادة المحاولة الآن 🔄
              </Button>
            )}

            <Link href={`/courses/${courseId}/learn`} style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="lg" icon={ArrowRight}>
                العودة للدروس
              </Button>
            </Link>
          </div>

          {/* Detailed Question Review Breakdown */}
          {questionResults.length > 0 && (
            <div style={{ width: '100%', marginTop: '2.5rem', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                مراجعة إجابات الاختبار:
              </h3>

              {questionResults.map((qr, index) => {
                const questionIsRight = qr.isCorrect;

                return (
                  <div
                    key={index}
                    style={{
                      background: questionIsRight ? '#F0FDF4' : '#FEF2F2',
                      border: `1.5px solid ${questionIsRight ? '#BBF7D0' : '#FECACA'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: questionIsRight ? '#166534' : '#991B1B' }}>
                        سؤال {index + 1}: {qr.questionText}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.65rem',
                          borderRadius: '999px',
                          backgroundColor: questionIsRight ? '#DCFCE7' : '#FEE2E2',
                          color: questionIsRight ? '#15803D' : '#DC2626',
                        }}
                      >
                        {questionIsRight ? 'إجابة صحيحة ✓' : 'إجابة خاطئة ✗'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                      <strong>إجابتك: </strong>
                      <span>{qr.options[qr.selectedOption] || 'لم يتم تحديد إجابة'}</span>
                    </div>

                    {!questionIsRight && qr.correctOptionIndex !== undefined && (
                      <div style={{ fontSize: '0.875rem', color: '#15803D' }}>
                        <strong>الإجابة الصحيحة: </strong>
                        <span>{qr.options[qr.correctOptionIndex]}</span>
                      </div>
                    )}

                    {qr.explanation && (
                      <p style={{ fontSize: '0.825rem', color: '#64748B', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        💡 {qr.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon helper
function PlayArrowIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
