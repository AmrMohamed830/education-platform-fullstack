import { Suspense } from 'react';
import VerifyCertificateContent from './VerifyCertificateContent';

export const instant = false;

export const metadata = {
  title: 'التحقق من صحة الشهادات | مَنصّتِي',
  description: 'التحقق الرسمي من مصداقية وصحة الشهادات الصادرة من منصتي التعليمية.',
};

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">جارٍ التحميل...</div>}>
      <VerifyCertificateContent />
    </Suspense>
  );
}
