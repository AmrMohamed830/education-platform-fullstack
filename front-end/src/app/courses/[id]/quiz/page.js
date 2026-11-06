import { Suspense } from 'react';
import QuizPlayerContent from './QuizPlayerContent';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata = {
  title: 'الاختبار النهائي للدورة | مَنصّتِي التعليمية',
  description: 'خوض الاختبار النهائي للدورة والحصول على الشهادة المعتمدة.',
};

export default async function QuizPage({ params }) {
  const resolvedParams = await params;
  const courseId = resolvedParams?.id;

  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center p-6" dir="rtl">
          <Loader2 size={44} className="text-primary animate-spin mb-4" />
          <p className="text-slate-600 font-bold text-base">جارٍ تجهيز الاختبار...</p>
        </div>
      }
    >
      <QuizPlayerContent courseId={courseId} />
    </Suspense>
  );
}
