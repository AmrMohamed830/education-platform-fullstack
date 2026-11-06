'use client';

import { ArrowLeft, Sparkles, PlayCircle, Users, Star, Code, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Container from '../common/Container';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden py-16 lg:py-24 bg-[var(--bg-main)]">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-36 -right-36 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Right Column: Hero Content */}
          <div className="flex flex-col items-start text-right">
            <Badge variant="glow" icon={Sparkles} className="mb-5">
              الجيل الجديد من التعليم التقني العربي
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] leading-tight tracking-tight mb-5">
              طوّر مهاراتك التقنية مع منصة{' '}
              <span className="gradient-text">تفاعلية تُعدّك لسوق العمل</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-body)] leading-relaxed mb-8 max-w-xl">
              تعلم البرمجة، الذكاء الاصطناعي، وتصميم الواجهات عبر مسارات عملية وشاملة مع إمكانية الوصول مدى الحياة ومتابعة مباشرة من نخبة من الخبراء.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href="/register" className="no-underline">
                <Button variant="primary" size="lg" icon={ArrowLeft}>
                  ابدأ التعلم الآن
                </Button>
              </Link>
              <Link href="/courses" className="no-underline">
                <Button variant="outline" size="lg" icon={PlayCircle} iconPosition="start">
                  استكشف المسارات
                </Button>
              </Link>
            </div>

            {/* Highlights List */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span>مشاريع عملية 100%</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span>شهادات إنجاز معتمدة</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span>دعم وتوجيه مهني</span>
              </div>
            </div>
          </div>

          {/* Left Column: UI Visual Reference & Dynamic Preview Mockup */}
          <div className="relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main Card Graphic */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative z-10 text-white font-mono text-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-sans font-semibold bg-indigo-500/10 border border-indigo-500/20 py-1 px-3 rounded-full">
                    <Code size={14} />
                    <span>تطبيق عملي: React & Node.js</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mb-6 text-[0.85rem] leading-relaxed" dir="ltr">
                  <div>
                    <span className="text-indigo-400">const</span>{' '}
                    <span className="text-sky-300">student</span> ={' '}
                    <span className="text-indigo-400">new</span>{' '}
                    <span className="text-amber-300">Developer</span>();
                  </div>
                  <div>
                    <span className="text-sky-300">student</span>.
                    <span className="text-emerald-400">learnPath</span>(
                    <span className="text-teal-300">&apos;Full-Stack Web&apos;</span>);
                  </div>
                  <div>
                    <span className="text-sky-300">student</span>.
                    <span className="text-emerald-400">buildRealProjects</span>();
                  </div>
                  <div className="text-slate-500 font-sans" dir="rtl">
                    {'// 🎉 النتيجة: جاهز لوظيفتك الأولى!'}
                  </div>
                </div>

                {/* Progress Bar Mock */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between text-xs font-sans font-semibold text-slate-300 mb-2">
                    <span>إنجاز المسار التعليمي</span>
                    <span className="text-indigo-400 font-bold">85%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-[85%]"></div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Active Students */}
              <div className="hidden sm:flex items-center gap-3 p-3.5 bg-white/95 backdrop-blur-md border border-[var(--border-light)] rounded-2xl shadow-xl absolute -top-6 -right-6 z-20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">+50,000 طالب</div>
                  <div className="text-xs text-[var(--text-muted)]">يتعلمون الآن في المنصة</div>
                </div>
              </div>

              {/* Floating Badge 2: Ratings */}
              <div className="hidden sm:flex items-center gap-3 p-3.5 bg-white/95 backdrop-blur-md border border-[var(--border-light)] rounded-2xl shadow-xl absolute -bottom-6 -left-6 z-20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Star size={20} className="fill-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">4.9 / 5.0</div>
                  <div className="text-xs text-[var(--text-muted)]">تقييم +12,000 متعلم</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
