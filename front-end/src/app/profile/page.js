import { Suspense } from 'react';
import ProfileContent from './ProfileContent';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata = {
  title: 'الملف الشخصي والإعدادات | مَنصّتِي التعليمية',
  description: 'إدارة وتعديل البيانات الشخصية، الصورة، كلمة المرور، واستعراض الشهادات المكتسبة.',
};

export default function ProfilePage() {
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
          <p style={{ color: '#64748B', fontWeight: 600 }}>جارٍ تحميل الملف الشخصي...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

