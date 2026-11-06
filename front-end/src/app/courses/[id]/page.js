import { Suspense } from 'react';
import CourseDetailsContent from './CourseDetailsContent';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata = {
  title: 'تفاصيل الكورس | مَنصّتِي التعليمية',
  description: 'تعرف على تفاصيل ومنهج الكورس التدريبي واشترك الآن في الدورة.',
};

export default async function CourseDetailsPage({ params }) {
  const resolvedParams = await params;
  const courseId = resolvedParams?.id;

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Loader2 size={42} style={{ animation: 'spin 1s linear infinite', color: '#4F46E5' }} />
          <p style={{ color: '#64748B', fontWeight: 600 }}>جارٍ تحميل تفاصيل الكورس...</p>
        </div>
      }
    >
      <CourseDetailsContent courseId={courseId} />
    </Suspense>
  );
}
