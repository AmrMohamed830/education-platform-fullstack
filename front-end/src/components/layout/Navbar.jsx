'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Menu, User, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Container from '../common/Container';
import Button from '../common/Button';
import MobileMenu from './MobileMenu';
import useAuthStore from '../../store/auth.store';

const NAV_LINKS = [
  { label: 'الرئيسية', href: '/' },
  { label: 'لماذا نحن؟', href: '/#features' },
  { label: 'المجالات', href: '/#categories' },
  { label: 'الكورسات', href: '/courses' },
  { label: 'آراء الطلاب', href: '/#testimonials' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-[900] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[var(--border-light)] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
            : 'bg-slate-50/85 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 no-underline">
              <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
                <BookOpen size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-[var(--text-main)] leading-tight tracking-tight">
                  مَنصّتِي
                </span>
                <span className="text-xs text-[var(--text-muted)] font-semibold">
                  المنصة التعليمية
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[0.975rem] font-semibold text-[var(--text-body)] hover:text-[var(--primary)] transition-colors relative py-1"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {!isLoading && !user && (
                <>
                  <Link href="/login" className="no-underline">
                    <Button variant="ghost" icon={User} iconPosition="start">
                      تسجيل الدخول
                    </Button>
                  </Link>

                  <Link href="/register" className="no-underline">
                    <Button variant="primary" icon={ArrowLeft}>
                      ابدأ التعلم
                    </Button>
                  </Link>
                </>
              )}

              {!isLoading && user && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 py-1.5 px-3.5 bg-white border border-[var(--border-light)] rounded-full no-underline shadow-sm hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:shadow-md hover:-translate-y-0.5 transition-all"
                  title="الانتقال إلى لوحة التحكم"
                >
                  <div className="relative w-[38px] h-[38px] rounded-full shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || 'مستخدم'
                        )}&background=4F46E5&color=fff&bold=true`
                      }
                      alt={user.name || 'المستخدم'}
                      className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-bold text-[var(--text-main)] leading-tight">
                      {user.name}
                    </span>
                    <span
                      className={`text-[0.7rem] font-bold ${
                        ['ADMIN', 'MANAGER'].includes(user.role)
                          ? 'text-amber-600'
                          : 'text-[var(--primary)]'
                      }`}
                    >
                      {['ADMIN', 'MANAGER'].includes(user.role) ? 'مشرف' : 'طالب'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[var(--text-muted)] mr-1">
                    <LayoutDashboard size={16} />
                  </div>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-[var(--text-main)] hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="القائمة الرئيسية"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
