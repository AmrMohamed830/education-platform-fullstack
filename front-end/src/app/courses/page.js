import { Suspense } from 'react';
import CoursesCatalogContent from './CoursesCatalogContent';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata = {
  title: 'استكشف الكورسات والدورات التعليمية | مَنصّتِي',
  description: 'تصفح باقة من أفضل الدورات والكورسات البرمجية والتقنية مع إمكانية البحث والفلترة حسب التخصص والسعر.',
};

export default function CoursesPage() {
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
          <p style={{ color: '#64748B', fontWeight: 600 }}>جارٍ تحميل الكورسات...</p>
        </div>
      }
    >
      <CoursesCatalogContent />
    </Suspense>
  );
}

