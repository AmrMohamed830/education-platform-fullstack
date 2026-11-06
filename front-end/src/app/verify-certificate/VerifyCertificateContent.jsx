'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyCertificate } from '@/hooks/queries/useCertificates';
import Button from '@/components/common/Button';
import Container from '@/components/common/Container';
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  Share2,
} from 'lucide-react';

export default function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get('code') || '').toUpperCase().trim();

  const [inputCode, setInputCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [hasSearched, setHasSearched] = useState(Boolean(initialCode));
  const [copied, setCopied] = useState(false);

  const { data: certData, isLoading: loading, error: verifyError } = useVerifyCertificate(
    activeCode,
    hasSearched && Boolean(activeCode)
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = inputCode.toUpperCase().trim();
    if (!clean) return;
    setActiveCode(clean);
    setHasSearched(true);
  };

  const handleCopyVerificationLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/verify-certificate?code=${activeCode}`;
      navigator.clipboard.writeText(url);
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

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 md:py-16" dir="rtl">
      <Container>
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shadow-sm mb-1">
              <ShieldCheck size={36} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              التحقق من صحة ومصداقية الشهادة
            </h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg">
              خدمة التحقق الرقمي الرسمية للتأكد من صحة الشهادات الصادرة من منصتي وتطابقها التام مع سجلاتنا الأكاديمية.
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="أدخل رمز الشهادة (مثال: CERT-ABC12345)..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:bg-white focus:border-primary transition"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Search}
              className="w-full sm:w-auto px-6 whitespace-nowrap"
            >
              تحقق الآن
            </Button>
          </form>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center flex flex-col items-center gap-3 text-slate-500">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-bold text-sm">جارٍ مطابقة رمز الشهادة بالسجلات الرسمية...</span>
            </div>
          )}

          {/* Valid Certificate Result */}
          {!loading && hasSearched && certData && (
            <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 sm:p-9 shadow-lg flex flex-col gap-6 relative overflow-hidden animate-[fadeIn_0.3s_ease]">
              <div className="absolute top-0 right-0 left-0 h-2 bg-emerald-500" />

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      شهادة معتمدة وموثوقة
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      هذه الشهادة صالحة ومطابقة للسجلات الأكاديمية
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyVerificationLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer self-end sm:self-center"
                >
                  <Share2 size={14} />
                  <span>{copied ? 'تم نسخ الرابط!' : 'نسخ رابط التحقق'}</span>
                </button>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">اسم الخريج / الطالب</span>
                    <span className="text-base font-extrabold text-slate-900">{certData.userName}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">الدورة التدريبية</span>
                    <span className="text-base font-extrabold text-slate-900">{certData.courseTitle}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">المدرّب المعتمد</span>
                    <span className="text-base font-extrabold text-slate-900">{certData.instructor}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">تاريخ الإصدار الرسمي</span>
                    <span className="text-base font-extrabold text-slate-900">{formatDate(certData.issueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Code display banner */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
                <span className="text-slate-400">الرقم التعريفي للشهادة (Verification Code):</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm tracking-wider">
                  {certData.certificateCode}
                </span>
              </div>
            </div>
          )}

          {/* Invalid Certificate Result */}
          {!loading && hasSearched && verifyError && (
            <div className="bg-white rounded-3xl border-2 border-red-300 p-6 sm:p-8 shadow-md flex items-center gap-4 animate-[fadeIn_0.3s_ease]">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle size={28} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-900 mb-1">
                  الشهادة غير مسجلة أو الرمز غير صحيح
                </h3>
                <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                  لم نتمكن من العثور على أي شهادة مرتبطة بالرمز &quot;{activeCode}&quot;. يُرجى التأكد من كتابة الرمز كاملاً بصيغة صحيحة (مثال: CERT-ABC12345).
                </p>
              </div>
            </div>
          )}

          {/* Return Home */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition"
            >
              <ArrowRight size={16} />
              <span>العودة إلى الصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

