'use client';

import Link from 'next/link';
import { X, ArrowLeft, BookOpen, LayoutDashboard, ShieldAlert, GraduationCap } from 'lucide-react';
import Button from '../common/Button';
import useAuthStore from '../../store/auth.store';

export default function MobileMenu({ isOpen, onClose, navLinks }) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isOpen) return null;

  const isAdmin = ['ADMIN', 'MANAGER'].includes(user?.role);
  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || 'مستخدم'
    )}&background=4F46E5&color=fff&bold=true`;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[320px] max-w-[85vw] h-full bg-white flex flex-col p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-5 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-sm">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-extrabold text-[var(--text-main)]">مَنصّتِي</span>
          </div>
          <button
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-colors"
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Card in Mobile Drawer if logged in */}
        {!isLoading && user && (
          <div className="flex items-center gap-3 p-4 my-5 bg-slate-50 border border-[var(--border-light)] rounded-2xl">
            <div className="relative w-11 h-11 rounded-full shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={user.name || 'المستخدم'}
                className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex flex-col text-right overflow-hidden">
              <span className="font-bold text-[var(--text-main)] text-sm truncate">
                {user.name}
              </span>
              <span className="text-xs text-[var(--text-muted)] truncate">{user.email}</span>
              <div
                className={`inline-flex items-center gap-1 mt-1 text-[0.7rem] font-bold py-0.5 px-2 rounded-full w-fit ${
                  isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isAdmin ? <ShieldAlert size={12} /> : <GraduationCap size={12} />}
                <span>{isAdmin ? 'مشرف المنصة' : 'طالب مسجل'}</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-2 my-5 flex-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-2.5 px-3 rounded-xl font-bold text-[var(--text-body)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors text-base"
              onClick={onClose}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3 pt-5 border-t border-[var(--border-light)]">
          {!isLoading && user ? (
            <Link href="/dashboard" className="w-full no-underline" onClick={onClose}>
              <Button variant="primary" icon={LayoutDashboard} fullWidth>
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="w-full no-underline" onClick={onClose}>
                <Button variant="outline" fullWidth>
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/register" className="w-full no-underline" onClick={onClose}>
                <Button variant="primary" icon={ArrowLeft} fullWidth>
                  ابدأ التعلم الآن
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
