'use client';

import { useState } from 'react';
import { useCourseQuiz } from '@/hooks/queries/useQuizzes';
import { useUpsertQuiz } from '@/hooks/mutations/useQuizMutations';
import Button from '../common/Button';
import Input from '../common/Input';
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

  // Update option text
  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOptions = [...copy[qIndex].options];
      newOptions[optIndex] = value;
      copy[qIndex] = { ...copy[qIndex], options: newOptions };
      return copy;
    });
  };

  // Add option to question
  const handleAddOption = (qIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length >= 6) return copy;
      copy[qIndex] = {
        ...copy[qIndex],
        options: [...copy[qIndex].options, ''],
      };
      return copy;
    });
  };

  // Remove option from question
  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIndex].options.length <= 2) {
        showAlert('يجب أن يحتوي السؤال على خيارين على الأقل.', 'error');
        return copy;
      }
      const newOptions = copy[qIndex].options.filter((_, i) => i !== optIndex);
      let newCorrect = copy[qIndex].correctOptionIndex;
      if (newCorrect >= newOptions.length) {
        newCorrect = newOptions.length - 1;
      }
      copy[qIndex] = {
        ...copy[qIndex],
        options: newOptions,
        correctOptionIndex: newCorrect,
      };
      return copy;
    });
  };

  // Save Quiz
  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      showAlert('يرجى إدخال عنوان للاختبار.', 'error');
      return;
    }

    if (questions.length === 0) {
      showAlert('يجب إضافة سؤال واحد على الأقل للاختبار.', 'error');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showAlert(`يرجى كتابة نص السؤال رقم ${i + 1}.`, 'error');
        return;
      }
      const emptyOpts = q.options.filter((opt) => !opt.trim());
      if (emptyOpts.length > 0) {
        showAlert(`يرجى ملء جميع خيارات الإجابة للسؤال رقم ${i + 1}.`, 'error');
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
          options: q.options.map((opt) => opt.trim()),
          correctOptionIndex: Number(q.correctOptionIndex) || 0,
          points: Number(q.points) || 10,
          explanation: (q.explanation || '').trim(),
        })),
      });

      showAlert('تم حفظ إعدادات وأسئلة الاختبار بنجاح! 🎉');
    } catch (err) {
      showAlert(err?.response?.data?.message || 'تعذر حفظ الاختبار.', 'error');
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const isSaving = upsertMutation.isPending;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center gap-4 text-slate-500">
        <Loader2 size={36} className="text-primary animate-spin" />
        <span className="font-bold">جارٍ تحميل بيانات الاختبار...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
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
              إدارة اختبار كورس: {course.title}
            </h2>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
                <HelpCircle size={14} />
                {questions.length} أسئلة
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                <Award size={14} />
                {totalPoints} درجة إجمالية
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={14} />
                درجة النجاح: {passingScore}%
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
                <Clock size={14} />
                {timeLimit > 0 ? `${timeLimit} دقيقة` : 'بدون وقت محدد'}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Save}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
        </Button>
      </div>

      {/* ── Alerts ── */}
      {alertMsg.text && (
        <div
          className={`flex items-center gap-2.5 p-3.5 px-5 rounded-lg text-sm font-bold ${
            alertMsg.type === 'error'
              ? 'bg-red-50 border border-red-300 text-red-800'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
          }`}
        >
          {alertMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* ── General Quiz Settings Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3">
          الإعدادات العامة للاختبار
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="عنوان الاختبار"
            placeholder="مثال: الاختبار النهائي لدورة Full-Stack Node.js"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="نسبة النجاح (%)"
              type="number"
              min="10"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              required
            />

            <Input
              label="المدة الزمنية (بالدقائق)"
              type="number"
              min="0"
              placeholder="0 يعني بدون حد زمني"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-slate-800">وصف وتعليمات الاختبار</label>
          <textarea
            rows={2}
            className="w-full p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg outline-none resize-y focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="اكتب تعليمات الاختبار، مثل عدد الأسئلة والشروط اللازمة لاجتيازه..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2.5 p-3 px-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer self-start">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary cursor-pointer"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="text-sm font-bold text-slate-800">
            الاختبار نشط ومتاح للطلاب بعد إكمال المنهج
          </span>
        </label>
      </div>

      {/* ── Questions List ── */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">
            أسئلة الاختبار ({questions.length})
          </h3>
          <Button variant="outline" size="sm" icon={Plus} onClick={handleAddQuestion}>
            إضافة سؤال جديد
          </Button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  {qIndex + 1}
                </span>
                <span className="font-extrabold text-slate-900 text-base">
                  السؤال رقم {qIndex + 1}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>الدرجة:</span>
                  <input
                    type="number"
                    min="1"
                    className="w-12 text-center bg-white border border-slate-300 rounded font-bold text-primary p-0.5"
                    value={q.points}
                    onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center cursor-pointer transition"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  title="حذف هذا السؤال"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-800">نص السؤال</label>
              <input
                type="text"
                placeholder="اكتب صيغة السؤال هنا..."
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                className="w-full p-3 text-sm text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-2.5 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  خيارات الإجابة (حدد الدائرة الخضراء بجانب الإجابة الصحيحة):
                </span>
                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIndex)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>إضافة خيار إضافي</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctOptionIndex === optIndex;

                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 p-2.5 px-3 rounded-xl border transition-all ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleQuestionChange(qIndex, 'correctOptionIndex', optIndex)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 hover:border-emerald-500'
                        }`}
                        title={isCorrect ? 'الإجابة الصحيحة' : 'تعيين كإجابة صحيحة'}
                      >
                        {isCorrect && <Check size={14} />}
                      </button>

                      <input
                        type="text"
                        placeholder={`الخيار ${optIndex + 1}...`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm font-medium text-slate-800 outline-none"
                      />

                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIndex, optIndex)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                          title="حذف هذا الخيار"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-xs font-semibold text-slate-500">
                توضيح الإجابة الصحيحة للطالب بعد إنهاء الاختبار (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: دالة useMemo تستخدم لتخزين القيم المحسوبة المؤقتة لمنع إعادة الحسابات المكلفة..."
                value={q.explanation}
                onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                className="w-full p-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" icon={Plus} onClick={handleAddQuestion}>
            إضافة سؤال جديد
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
          </Button>
        </div>
      </div>
    </div>
  );
}

