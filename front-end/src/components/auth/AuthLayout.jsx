'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, CheckCircle2, Star, Sparkles } from 'lucide-react';
import useAuthStore from '@/store/auth.store';

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (!isLoading && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[var(--bg-main)] relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-36 -right-36 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1100px] bg-white rounded-3xl border border-[var(--border-light)] shadow-2xl grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] overflow-hidden relative z-10">
        {/* Sidebar Info Panel */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 sm:p-12 hidden lg:flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 no-underline">
              <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-lg">
                <BookOpen size={24} />
              </div>
              <span className="text-2xl font-extrabold text-white">مَنصّتِي</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-sky-400 mb-5 w-fit">
              <Sparkles size={16} />
              <span>انضم لأكبر تجمع تعليمي عربي</span>
            </div>

            <h2 className="text-2xl xl:text-3xl font-extrabold leading-snug mb-8 text-white">
              ابدأ رحلة تطوير مهاراتك التقنية مع خبرات عمليّة حقيقية
            </h2>

            <div className="flex flex-col gap-3.5 mb-10">
              <div className="flex items-center gap-2.5 text-[0.95rem] text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>+140 مسار ودورة تعليمية محدثة</span>
              </div>
              <div className="flex items-center gap-2.5 text-[0.95rem] text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>تطبيق عملي وبناء مشاريع حقيقية</span>
              </div>
              <div className="flex items-center gap-2.5 text-[0.95rem] text-slate-300">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>شهادات إنجاز معتمدة تزيد فرص عملك</span>
              </div>
            </div>

            {/* Quote Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-2">
                &ldquo;المنصة غيّرت مساري المهني بالكامل في أقل من 6 أشهر وتمكنت من الالتحاق بوظيفتي كـ Full Stack Developer.&rdquo;
              </p>
              <div className="text-xs text-slate-400 font-semibold">- عبدالله الشمري، مطور برمجيات</div>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="p-6 sm:p-12 flex flex-col justify-between">
          <div className="flex justify-end mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] font-semibold transition-colors no-underline"
            >
              <ArrowLeft size={16} />
              <span>العودة للرئيسية</span>
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            <div className="text-center mt-8 pt-6 border-t border-[var(--border-light)] text-sm text-[var(--text-muted)]">
              <span>{footerText}</span>{' '}
              <Link
                href={footerLinkHref}
                className="font-bold text-[var(--primary)] hover:underline mr-1"
              >
                {footerLinkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
