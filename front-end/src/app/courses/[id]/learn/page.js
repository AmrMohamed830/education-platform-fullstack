import { Suspense } from 'react';
import CoursePlayerContent from './CoursePlayerContent';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata = {
  title: 'مساحة التعلم ومشاهدة الدروس | مَنصّتِي التعليمية',
  description: 'شاهد دروس الكورس التدريبي وطبق المشاريع وتابع تقدمك التعليمي مباشرة.',
};

export default async function LearnPage({ params }) {
  const resolvedParams = await params;
  const courseId = resolvedParams?.id;

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
          }}
        >
          <Loader2 size={46} style={{ animation: 'spin 1s linear infinite', color: '#6366F1' }} />
        </div>
      }
    >
      <CoursePlayerContent courseId={courseId} />
    </Suspense>
  );
}

