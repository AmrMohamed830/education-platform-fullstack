'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Award,
  Camera,
  Save,
  Key,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Container from '../../components/common/Container';
import useAuthStore from '../../store/auth.store';
import { useUpdateProfile, useChangePassword } from '@/hooks/mutations/useAuthMutations';
import { useMyCertificates } from '@/hooks/queries/useCertificates';
import { uploadAvatar } from '../../services/upload.service';

export default function ProfileContent({ initialTab = 'profile' }) {
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'security' | 'certificates'
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [prevUserId, setPrevUserId] = useState(user?._id || user?.id);

  if ((user?._id || user?.id) && (user?._id || user?.id) !== prevUserId) {
    setPrevUserId(user?._id || user?.id);
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
  }

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileAlert, setProfileAlert] = useState({ text: '', type: 'success' });

  // Mutations & Queries
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const { data: certificatesData, isLoading: loadingCertificates } = useMyCertificates(
    activeTab === 'certificates'
  );
  const certificates = certificatesData || [];

  const profileSaving = updateProfileMutation.isPending;
  const passwordSaving = changePasswordMutation.isPending;

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordAlert, setPasswordAlert] = useState({ text: '', type: 'success' });

  // Handle Avatar File Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setProfileAlert({ text: '', type: 'success' });
      const res = await uploadAvatar(file);
      const newAvatarUrl = res.data.data.url;
      setAvatar(newAvatarUrl);
      setProfileAlert({ text: 'تم رفع الصورة بنجاح! اضغط حفظ التغييرات لاعتمادها.', type: 'success' });
    } catch (err) {
      setProfileAlert({
        text: err?.response?.data?.message || 'فشل رفع الصورة الشخصية.',
        type: 'error',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileAlert({ text: 'الاسم مطلوب', type: 'error' });
      return;
    }

    try {
      setProfileAlert({ text: '', type: 'success' });
      await updateProfileMutation.mutateAsync({ name, avatar });
      setProfileAlert({ text: 'تم تحديث البيانات الشخصية بنجاح.', type: 'success' });
    } catch (err) {
      setProfileAlert({
        text: err?.response?.data?.message || 'تعذر تحديث البيانات الشخصية.',
        type: 'error',
      });
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordAlert({ text: 'يرجى ملء جميع الحقول', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordAlert({ text: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordAlert({ text: 'كلمة المرور الجديدة غير متطابقة مع التأكيد', type: 'error' });
      return;
    }

    try {
      setPasswordAlert({ text: '', type: 'success' });
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setPasswordAlert({ text: 'تم تغيير كلمة المرور بنجاح!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordAlert({
        text: err?.response?.data?.message || 'تعذر تغيير كلمة المرور.',
        type: 'error',
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const avatarUrl =
    avatar ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || 'مستخدم'
    )}&background=4F46E5&color=fff&bold=true`;

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 pb-20" dir="rtl">
      <Container>
        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex items-center justify-between shadow-sm mb-8 flex-wrap gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={user?.name || 'صورة الحساب'}
                className="w-full h-full rounded-full object-cover border-2 border-slate-200 bg-slate-100 shadow-sm"
              />
              <button
                type="button"
                className="absolute bottom-0 left-0 w-8 h-8 bg-[var(--primary)] text-white rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-700 hover:scale-110 transition-all"
                title="تغيير الصورة الشخصية"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Camera size={15} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFileChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.name || 'طالب متميز'}
              </h1>
              <span className="text-sm text-slate-500 font-medium">{user?.email}</span>
              <div className="inline-flex items-center gap-1.5 py-1 px-3 bg-indigo-50 text-[var(--primary)] rounded-full text-xs font-bold w-fit mt-1">
                <Shield size={14} />
                <span>
                  {user?.role === 'ADMIN'
                    ? 'مدير عام المنصة'
                    : user?.role === 'MANAGER'
                    ? 'مشرف محتوى'
                    : 'طالب مسجل'}
                </span>
              </div>
            </div>
          </div>

          <Link href="/dashboard" className="no-underline">
            <button
              type="button"
              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-sm cursor-pointer transition-colors"
            >
              الذهاب للوحة التحكم
            </button>
          </Link>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-2 sm:gap-3 mb-8 border-b border-slate-200 pb-3 flex-wrap">
          <button
            type="button"
            className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-colors border-none cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[var(--primary)] bg-indigo-50 hover:bg-indigo-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-transparent'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>البيانات الشخصية</span>
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-colors border-none cursor-pointer ${
              activeTab === 'security'
                ? 'text-[var(--primary)] bg-indigo-50 hover:bg-indigo-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-transparent'
            }`}
            onClick={() => setActiveTab('security')}
          >
            <Key size={18} />
            <span>الأمان وكلمة المرور</span>
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-colors border-none cursor-pointer ${
              activeTab === 'certificates'
                ? 'text-[var(--primary)] bg-indigo-50 hover:bg-indigo-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-transparent'
            }`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={18} />
            <span>شهاداتي المكتسبة</span>
          </button>
        </div>

        {/* Tab 1: Profile Details Form */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl">
            {profileAlert.text && (
              <div
                className={`p-3.5 rounded-xl mb-5 text-xs font-semibold ${
                  profileAlert.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {profileAlert.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">الاسم بالكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  البريد الإلكتروني (غير قابل للتعديل)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-100 opacity-60 outline-none cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  رابط الصورة الشخصية (أو ارفع من الزر أعلاه)
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[var(--primary)] text-white font-bold text-sm shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-2"
              >
                {profileSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جارٍ الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Change Password */}
        {activeTab === 'security' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl">
            {passwordAlert.text && (
              <div
                className={`p-3.5 rounded-xl mb-5 text-xs font-semibold ${
                  passwordAlert.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {passwordAlert.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="أدخل كلمة المرور الحالية"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="على الأقل 6 أحرف"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[var(--primary)] text-white font-bold text-sm shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-2"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جارٍ التحديث...</span>
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    <span>تحديث كلمة المرور</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: My Certificates */}
        {activeTab === 'certificates' && (
          <div>
            {loadingCertificates ? (
              <div className="text-center py-12">
                <Loader2 size={32} className="animate-spin text-[var(--primary)] mx-auto" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto">
                <Award size={44} className="text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">لم تحصل على أي شهادات بعد</h3>
                <p className="text-sm">
                  أكمل جميع دروس أحد الكورسات المسجل بها بنسبة 100% لإصدار شهادتك المعتمدة تلقائياً!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Award size={26} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-900">{cert.courseTitle}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          المدرب: {cert.instructor} • تم الإصدار في: {formatDate(cert.issueDate)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${cert.course}/certificate`}
                      className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-50 text-[var(--primary)] font-bold text-xs hover:bg-[var(--primary)] hover:text-white transition-all no-underline"
                    >
                      <span>عرض وطباعة الشهادة</span>
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
