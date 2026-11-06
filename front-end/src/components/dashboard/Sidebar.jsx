'use client';

import Link from 'next/link';
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Compass,
  Award,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth.store';
import { useLogout } from '@/hooks/mutations/useAuthMutations';

export default function Sidebar({
  role,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    if (logoutMutation.isPending) return;

    try {
      await logoutMutation.mutateAsync();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const studentNav = [
    { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'my-courses', label: 'كورساتي', icon: GraduationCap },
    { id: 'explore', label: 'استكشاف الكورسات', icon: Compass },
    { id: 'certificates', label: 'الشهادات', icon: Award },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const adminNav = [
    { id: 'overview', label: 'لوحة الإدارة', icon: LayoutDashboard },
    { id: 'courses-manage', label: 'إدارة الكورسات', icon: FolderKanban },
    { id: 'students-manage', label: 'إدارة الطلاب', icon: Users },
    { id: 'settings', label: 'إعدادات المنصة', icon: Settings },
  ];

  const navItems = role === 'admin' ? adminNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[799] lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-[270px] h-screen fixed top-0 right-0 bg-white border-l border-[var(--border-light)] flex flex-col z-[800] transition-transform duration-300 max-lg:translate-x-full ${
          isOpen ? 'max-lg:translate-x-0' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="h-[76px] px-6 flex items-center justify-between border-b border-[var(--border-light)]">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white shadow-sm">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-extrabold text-[var(--text-main)]">مَنصّتِي</span>
          </Link>
          <button
            className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg bg-transparent border-none cursor-pointer"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card in Sidebar */}
        <div className="m-3 p-3.5 bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || 'مستخدم'
                  )}&background=4F46E5&color=fff&bold=true`
                }
                alt={user?.name || 'المستخدم'}
                className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex flex-col overflow-hidden text-right leading-tight">
              <span className="text-sm font-bold text-[var(--text-main)] truncate">
                {user?.name || 'المستخدم'}
              </span>
              <span className="text-[0.7rem] text-[var(--text-muted)] truncate dir-ltr text-right mt-0.5">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[0.7rem] font-bold w-fit ${
              role === 'admin'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-[var(--primary-light)] text-[var(--primary)] border border-indigo-600/15'
            }`}
          >
            {role === 'admin' ? (
              <ShieldAlert size={14} />
            ) : (
              <GraduationCap size={14} />
            )}
            <span>
              {role === 'admin' ? 'مشرف المنصة (Admin)' : 'حساب طالب (Student)'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5 p-4 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all w-full text-right cursor-pointer border-none ${
                  isActive
                    ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white! shadow-[0_4px_12px_rgba(79,70,229,0.25)]'
                    : 'text-[var(--text-body)] hover:bg-[var(--bg-main)] hover:text-[var(--primary)] bg-transparent'
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--border-light)]">
          <button
            type="button"
            className="flex items-center gap-2.5 py-3 px-4 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors w-full text-right cursor-pointer border-none bg-transparent disabled:opacity-50"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={18} />
            <span>
              {logoutMutation.isPending ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
