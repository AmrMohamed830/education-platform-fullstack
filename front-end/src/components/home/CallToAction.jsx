'use client';

import Link from 'next/link';
import Container from '../common/Container';
import Button from '../common/Button';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-10 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-sky-400 mb-6">
              <Sparkles size={16} />
              <span>ابدأ الآن بخصم لفترة محدودة</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 max-w-2xl mx-auto leading-tight">
              هل أنت جاهز للبدء في بناء مستقبل تقني واعد؟
            </h2>

            <p className="text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              انضم اليوم لأكثر من 50,000 متعلم عربي، واحصل على الوصول المباشر لكافة المسارات والكورسات التفاعلية.
            </p>

            <div className="flex justify-center mb-10">
              <Link href="/register" className="no-underline">
                <Button variant="primary" size="lg" icon={ArrowLeft}>
                  انضم إلينا وابدأ التعلم المجاني
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>وصول فوري لكافة الدروس</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>ضمان استرجاع لمدة 14 يوماً</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>دعم فني وتوجيه 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
