'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, CheckCircle2, Sparkles, X } from 'lucide-react';

export default function DashboardNavbar({ onToggleSidebar, user }) {
  const router = useRouter();
  const isAdmin = ['ADMIN', 'MANAGER'].includes(user?.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/courses`);
    }
  };

  return (
    <header className="h-[76px] bg-white border-b border-[var(--border-light)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-[700]">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-[var(--text-main)] p-2 rounded-lg hover:bg-slate-100 bg-transparent border-none cursor-pointer"
          onClick={onToggleSidebar}
          aria-label="القائمة"
        >
          <Menu size={22} />
        </button>

        {/* Search Bar */}
        <div className="hidden lg:flex relative w-80 items-center">
          <Search size={18} className="absolute right-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن الكورسات واضغط Enter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full py-2.5 pr-11 pl-4 rounded-full border border-[var(--border-light)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            className="relative text-[var(--text-body)] p-2 rounded-full hover:bg-[var(--bg-main)] transition-colors bg-transparent border-none cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="الإشعارات"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[0.65rem] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              2
            </span>
          </button>

          {showNotifications && (
            <div
              className="absolute top-[120%] left-0 w-72 bg-white rounded-2xl border border-[var(--border-light)] shadow-xl p-4 z-[100] animate-in fade-in zoom-in-95 duration-200"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                <span className="font-extrabold text-sm text-[var(--text-main)]">
                  الإشعارات والتنبيهات
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex gap-2.5 items-start">
                  <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block mb-0.5">نظام الشهادات الرقمية</strong>
                    <span className="text-slate-500 leading-relaxed">
                      أكمل مساراتك التدريبية بنسبة 100% واحصل على شهادة إلكترونية معتمدة!
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block mb-0.5">تقييمات المناهج</strong>
                    <span className="text-slate-500 leading-relaxed">
                      يمكنك الآن تقييم الكورسات المشترك بها ومساعدة زملائك برأيك.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Snippet (Clickable to profile) */}
        <Link href="/profile" className="no-underline text-inherit">
          <div className="flex items-center gap-3 pr-3 sm:border-r border-[var(--border-light)] cursor-pointer" title="عرض الملف الشخصي والإعدادات">
            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden shadow-sm border-2 border-[var(--border-light)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'مستخدم'
                  )}&background=4F46E5&color=fff&bold=true`
                }
                alt={user?.name || 'المستخدم'}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-sm font-bold text-[var(--text-main)] truncate max-w-[120px]">
                {user?.name || user?.email || 'المستخدم'}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {isAdmin ? 'مشرف النظام' : 'طالب مسجل'}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
