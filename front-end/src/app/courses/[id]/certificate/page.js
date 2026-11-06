import { Suspense } from 'react';
import CertificateView from './CertificateView';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata = {
  title: 'شهادة إتمام الكورس | مَنصّتِي التعليمية',
  description: 'عرض وطباعة شهادة إتمام الدورة التدريبية المعتمدة إلكترونياً.',
};

export default async function CertificatePage({ params }) {
  const resolvedParams = await params;
  const courseId = resolvedParams?.id;

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Loader2 size={42} style={{ animation: 'spin 1s linear infinite', color: '#4F46E5' }} />
          <p style={{ color: '#64748B', fontWeight: 600 }}>جارٍ تجهيز الشهادة...</p>
        </div>
      }
    >
      <CertificateView courseId={courseId} />
    </Suspense>
  );
}

