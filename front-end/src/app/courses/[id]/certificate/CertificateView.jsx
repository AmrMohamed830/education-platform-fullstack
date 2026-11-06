'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Printer,
  Share2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  HelpCircle,
  Download,
} from 'lucide-react';
import { useCourseCertificate } from '@/hooks/queries/useCertificates';

export default function CertificateView({ courseId }) {
  const { data: certificate, isLoading: loading, error: certError } = useCourseCertificate(courseId);
  const [copied, setCopied] = useState(false);

  const error = certError
    ? (certError?.response?.data?.message ||
        'لم يتم العثور على شهادة لهذا الكورس، يرجى التأكد من إكمال جميع الدروس أولاً.')
    : '';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] bg-slate-50 py-10 px-4 flex flex-col items-center justify-center text-center" dir="rtl">
        <Loader2 size={44} className="animate-spin text-[var(--primary)] mb-4" />
        <p className="text-slate-500 font-bold">جارٍ تجهيز واستخراج شهادة إتمام الدورة...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-[90vh] bg-slate-50 py-16 px-4 flex flex-col items-center" dir="rtl">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <Award size={48} className="text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">الشهادة غير متاحة حالياً</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/courses/${courseId}/quiz`}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-sm hover:opacity-95 transition-all no-underline"
            >
              <HelpCircle size={16} />
              <span>خوض الاختبار النهائي</span>
            </Link>
            <Link
              href={`/courses/${courseId}/learn`}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all no-underline"
            >
              <ArrowRight size={16} />
              <span>إكمال الدروس</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-slate-50 py-10 px-4 pb-20 flex flex-col items-center print:bg-white print:p-0 print:m-0" dir="rtl">
      {/* Top Toolbar (Hidden on print) */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-8 flex-wrap gap-4 print:hidden">
        <Link
          href={`/courses/${courseId}/learn`}
          className="inline-flex items-center gap-2 text-slate-600 font-bold text-sm hover:text-[var(--primary)] transition-colors no-underline"
        >
          <ArrowRight size={18} />
          <span>العودة إلى مشغل الدروس</span>
        </Link>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-sm cursor-pointer transition-all border bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <Share2 size={16} />
            <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-sm cursor-pointer transition-all border bg-[var(--primary)] text-white hover:bg-indigo-700 shadow-md border-transparent"
          >
            <Printer size={16} />
            <span>طباعة أو حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Certificate Document */}
      <div className="w-full max-w-4xl aspect-[1.414/1] bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none print:aspect-auto">
        <div className="border-4 border-double border-amber-600 rounded-xl h-full p-4 md:p-6 relative flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/20">
          <div className="border border-amber-200 rounded-lg h-full p-6 md:p-8 flex flex-col justify-between text-center relative">
            {/* Header */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-md mb-2">
                <Award size={28} />
              </div>
              <div className="text-lg font-extrabold text-slate-900 tracking-tight">مَنصّتِي التعليمية</div>
              <h1 className="text-2xl md:text-3xl font-black text-amber-700 tracking-wide mt-1">
                شهادة إتمام دورة تدريبية
              </h1>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Certificate of Course Completion
              </div>
            </div>

            {/* Body */}
            <div className="my-auto py-6">
              <div className="text-sm text-slate-500 font-medium mb-2">
                تشهد المنصة بأن الطالب / الطالبة:
              </div>
              <div className="text-2xl md:text-4xl font-black text-indigo-700 my-3 font-serif">
                {certificate.userName}
              </div>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                قد أتم بنجاح وبكفاءة عالية جميع متطلبات ومحاور الدورة التدريبية المتخصصة:
                <strong className="text-slate-900 font-bold block mt-1">
                  {certificate.courseTitle}
                </strong>
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between pt-6 border-t border-amber-100 flex-wrap gap-4 text-xs">
              {/* Instructor signature */}
              <div className="flex flex-col items-center min-w-[120px]">
                <div className="w-32 h-[1.5px] bg-slate-300 mb-2" />
                <div className="font-bold text-slate-800">{certificate.instructor}</div>
                <div className="text-slate-500">مدرب الدورة التدريبية</div>
              </div>

              {/* Official Seal */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 text-amber-600 flex items-center justify-center bg-amber-50">
                  <ShieldCheck size={32} />
                </div>
                <span className="text-[0.7rem] font-extrabold text-amber-800">معتمد إلكترونياً</span>
                <span className="text-[0.65rem] font-mono text-slate-400 font-bold">
                  {certificate.certificateCode}
                </span>
              </div>

              {/* Platform signature & Date */}
              <div className="flex flex-col items-center min-w-[120px]">
                <div className="w-32 h-[1.5px] bg-slate-300 mb-2" />
                <div className="font-bold text-slate-800">إدارة المنصة الأكاديمية</div>
                <div className="text-slate-500">
                  تاريخ الإصدار: {formatDate(certificate.issueDate)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
