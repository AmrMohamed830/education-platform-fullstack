'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '../common/Container';
import Button from '../common/Button';
import { BookOpen, Send, Mail, Phone, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[var(--bg-dark)] text-slate-400 pt-20 pb-8 border-t border-white/5">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.8fr] gap-10 md:gap-12 pb-14 border-b border-white/10">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-md">
                <BookOpen size={24} />
              </div>
              <span className="text-2xl font-extrabold text-white">مَنصّتِي</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              المنصة التعليمية العربية المتقدمة لبناء مهارات المستقبل في مجالات البرمجة، الذكاء الاصطناعي والتصميم بخبرات عمليّة حقيقية.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail size={16} className="text-[var(--secondary)]" />
                <span>support@platform.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone size={16} className="text-[var(--secondary)]" />
                <span>+966 50 123 4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-5">روابط سريعة</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0 text-sm">
              <li>
                <a href="#hero" className="text-slate-400 hover:text-white transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                  لماذا نتميز؟
                </a>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  المجالات التعليمية
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  الكورسات المتاحة
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="text-slate-400 hover:text-white transition-colors">
                  التحقق من الشهادات
                </Link>
              </li>
              <li>
                <a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">
                  قصص النجاح
                </a>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-5">أبرز المسارات</h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0 text-sm">
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  تطوير الويب الكامل
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  الذكاء الاصطناعي
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  تصميم الواجهات UX/UI
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  تطوير الجوال
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-slate-400 hover:text-white transition-colors">
                  الأمن السيبراني
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="flex flex-col">
            <h4 className="text-white text-lg font-bold mb-5">النشرة البريدية</h4>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              اشترك للحصول على أحدث المقالات والمقاعد المجانية في الدورات الجديدة.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm py-2">
                <CheckCircle2 size={18} />
                <span>تم الاشتراك في النشرة بنجاح! 💌</span>
              </div>
            ) : (
              <form className="flex gap-2" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 py-2 px-3.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm outline-none focus:border-[var(--primary)] transition-colors placeholder:text-slate-500"
                  required
                />
                <Button type="submit" variant="primary" size="sm" icon={Send} iconPosition="start">
                  اشترك
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © 2026 مَنصّتِي. صُنع بكل</span>
            <Heart size={14} className="text-red-500 fill-red-500 inline mx-0.5" />
            <span>لخدمة التعليم العربي.</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/" className="text-slate-500 hover:text-slate-400 transition-colors">
              شروط الاستخدام
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-400 transition-colors">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
