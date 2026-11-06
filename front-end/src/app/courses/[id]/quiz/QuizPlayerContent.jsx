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
      const answersPayload = Object.entries(answersMap).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const res = await submitMutation.mutateAsync(answersPayload);
      setSubmissionResult(res.data.data);
      setQuizState('result');
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'حدث خطأ أثناء تصحيح الاختبار.');
    }
  }, [selectedAnswers, submitMutation]);

  // Timer countdown
  useEffect(() => {
    if (quizState !== 'taking' || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
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
    }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100) : 0;

  if (courseLoading || quizLoading) {
    return (
      <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center p-6" dir="rtl">
        <Loader2 size={44} className="text-primary animate-spin mb-4" />
        <p className="text-slate-600 font-bold text-base">جارٍ تجهيز الاختبار النهائي للدورة...</p>
      </div>
    );
  }

  if (!quiz || !quiz.isActive || totalQuestions === 0) {
    return (
      <div className="min-h-[85vh] bg-slate-50 py-16 px-4 flex flex-col items-center" dir="rtl">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <HelpCircle size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">لا يوجد اختبار متاح حالياً</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            لم يقم مدرّب الكورس بإضافة اختبار نهائي لهذا المسار بعد. يمكنك إكمال الدروس ومتابعة التعلم.
          </p>
          <Link
            href={`/courses/${courseId}/learn`}
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:opacity-95 transition-all no-underline"
          >
            <ArrowRight size={16} />
            <span>العودة لمحتوى الدورة</span>
          </Link>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 1: QUIZ INTRO / IDLE
  // ──────────────────────────────────────────────────────────────────────────
  if (quizState === 'idle') {
    return (
      <div className="min-h-[85vh] bg-slate-50 py-12 px-4" dir="rtl">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Back link */}
          <Link
            href={`/courses/${courseId}/learn`}
            className="inline-flex items-center gap-2 text-slate-600 font-bold text-sm hover:text-primary transition-colors self-start"
          >
            <ArrowRight size={18} />
            <span>العودة إلى دروس الكورس</span>
          </Link>

          {/* Main Intro Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-primary via-indigo-600 to-accent" />

            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 self-start">
                <Sparkles size={14} />
                التقييم النهائي للدورة
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {quiz.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {quiz.description || 'أكمل هذا الاختبار لقياس فهمك لمفاهيم الكورس والحصول على شهادتك المعتمدة.'}
              </p>
            </div>

            {/* Course Meta */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-0.5">الكورس</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">{course?.title}</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                بإشراف: <span className="font-bold text-slate-700">{course?.instructor}</span>
              </div>
            </div>

            {/* Quiz Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center">
                <HelpCircle size={22} className="text-primary mb-1" />
                <span className="text-lg font-extrabold text-slate-900">{totalQuestions}</span>
                <span className="text-xs text-slate-500 font-semibold">عدد الأسئلة</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-600 mb-1" />
                <span className="text-lg font-extrabold text-slate-900">{quiz.passingScore}%</span>
                <span className="text-xs text-slate-500 font-semibold">درجة النجاح</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center">
                <Clock size={22} className="text-sky-600 mb-1" />
                <span className="text-lg font-extrabold text-slate-900">
                  {quiz.timeLimit > 0 ? `${quiz.timeLimit} د` : 'مفتوح'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">الوقت المتاح</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center">
                <Award size={22} className="text-amber-600 mb-1" />
                <span className="text-lg font-extrabold text-slate-900">شهادة</span>
                <span className="text-xs text-slate-500 font-semibold">تمنح فور الاجتياز</span>
              </div>
            </div>

            {/* Past Attempt Notice if any */}
            {hasPassedPreviously && bestAttempt && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold shrink-0">
                    <Check size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-900">
                      لقد اجتزت هذا الاختبار مسبقاً بنسبة {bestAttempt.score}%! 🎉
                    </h4>
                    <p className="text-xs text-emerald-700">
                      شهادتك جاهزة للاستعراض والتحميل في أي وقت. يمكنك إعادة المحاولة إذا رغبت بتحسين درجتك.
                    </p>
                  </div>
                </div>

                <Link href={`/courses/${courseId}/certificate`}>
                  <Button variant="primary" size="sm" icon={Award}>
                    عرض الشهادة
                  </Button>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                تأكد من استقرار اتصالك بالإنترنت قبل بدء المحاولة.
              </span>

              <Button
                variant="primary"
                size="lg"
                icon={Sparkles}
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-8"
              >
                {hasPassedPreviously ? 'إعادة خوض الاختبار' : 'بدء الاختبار الآن'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 2: QUIZ IN PROGRESS
  // ──────────────────────────────────────────────────────────────────────────
  if (quizState === 'taking') {
    const isLastQuestion = currentQuestionIdx === totalQuestions - 1;
    const isFirstQuestion = currentQuestionIdx === 0;
    const currentSelected = selectedAnswers[currentQuestion?._id];

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-4 flex flex-col" dir="rtl">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 bg-slate-800/80 backdrop-blur-md p-4 sm:px-6 rounded-2xl border border-slate-700">
            <div>
              <span className="text-xs text-indigo-400 font-bold block">{course?.title}</span>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
                {quiz.title}
              </h2>
            </div>

            {/* Timer countdown if active */}
            {quiz.timeLimit > 0 && (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                  timeLeftSeconds < 120
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                    : 'bg-slate-700/60 border-slate-600 text-indigo-300'
                }`}
              >
                <Clock size={16} />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>السؤال {currentQuestionIdx + 1} من {totalQuestions}</span>
              <span>{answeredCount} من {totalQuestions} تم الإجابة</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-9 flex flex-col gap-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  {currentQuestionIdx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQuestion?.questionText}
                </h3>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 shrink-0">
                {currentQuestion?.points || 10} درجات
              </span>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3">
              {currentQuestion?.options.map((option, optIdx) => {
                const isSelected = currentSelected === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion._id, optIdx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/60 ring-2 ring-indigo-500/40 text-white'
                        : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'border-2 border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className="text-sm font-medium leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message if submit failed */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold">
              {submitError}
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={isFirstQuestion}
              onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
              <span>السابق</span>
            </button>

            {/* Quick Question Navigator chips */}
            <div className="hidden sm:flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = selectedAnswers[q._id] !== undefined;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                        : isAnswered
                        ? 'bg-slate-700 text-emerald-400'
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {isLastQuestion ? (
              <Button
                variant="primary"
                size="md"
                icon={Send}
                onClick={handleSubmitQuiz}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'جارٍ التصحيح...' : 'إرسال الإجابات'}
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-95 transition-all"
              >
                <span>التالي</span>
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 3: QUIZ RESULT SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  if (quizState === 'result' && submissionResult) {
    const { attempt, questionResults } = submissionResult;
    const passed = attempt.passed;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4" dir="rtl">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Result Banner Card */}
          <div
            className={`border rounded-3xl p-6 sm:p-10 shadow-lg text-center flex flex-col items-center gap-4 relative overflow-hidden ${
              passed
                ? 'bg-white border-emerald-300'
                : 'bg-white border-amber-300'
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                passed
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {passed ? <Award size={44} /> : <RotateCcw size={40} />}
            </div>

            <div className="flex flex-col gap-1">
              <span
                className={`text-xs font-extrabold uppercase tracking-wide px-3 py-1 rounded-full self-center ${
                  passed
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {passed ? '🎉 تهانينا! اجتزت الاختبار' : 'لم تحقق درجة النجاح المطلوبة'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                درجتك النهائية: {attempt.score}%
              </h2>

              <p className="text-sm text-slate-500 font-medium">
                حصلت على {attempt.earnedPoints} من أصل {attempt.totalPoints} نقطة (نسبة النجاح المطلوبة: {attempt.passingScore}%)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
              {passed ? (
                <Link href={`/courses/${courseId}/certificate`} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" icon={Award} className="w-full sm:w-auto px-8">
                    عرض واستلام الشهادة المعتمدة 🎓
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={RotateCcw}
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto px-8"
                >
                  إعادة المحاولة الآن
                </Button>
              )}

              <Link href={`/courses/${courseId}/learn`} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  العودة للدروس
                </Button>
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          {questionResults && questionResults.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  مراجعة الإجابات والتوضيحات
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {questionResults.filter((q) => q.isCorrect).length} صحيحة من {questionResults.length}
                </span>
              </div>

              <div className="flex flex-col gap-6">
                {questionResults.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border flex flex-col gap-3 ${
                      q.isCorrect
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-red-200 bg-red-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {q.isCorrect ? (
                          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle size={18} className="text-red-500 shrink-0" />
                        )}
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {idx + 1}. {q.questionText}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          q.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {q.isCorrect ? `+${q.points} درجة` : '0 درجة'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = q.selectedOption === oIdx;
                        const isCorrectOption = q.correctOptionIndex === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                              isCorrectOption
                                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 font-bold'
                                : isSelected && !isCorrectOption
                                ? 'bg-red-100/80 border-red-300 text-red-900 line-through'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrectOption && (
                              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                الإجابة الصحيحة
                              </span>
                            )}
                            {isSelected && !isCorrectOption && (
                              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                                إجابتك
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-600 mt-1">
                        <strong className="text-slate-800 ml-1">توضيح:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
