'use client';

import { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Container from '../../components/common/Container';
import useAuthStore from '../../store/auth.store';
import { updateProfile, changePassword } from '../../services/auth.service';
import { uploadAvatar } from '../../services/upload.service';
import { getMyCertificates } from '../../services/certificate.service';
import styles from './Profile.module.css';

export default function ProfileContent({ initialTab = 'profile' }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

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
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState({ text: '', type: 'success' });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState({ text: '', type: 'success' });

  // Certificates State
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  // Load certificates when tab is activated
  useEffect(() => {
    let ignore = false;
    if (activeTab === 'certificates') {
      const fetchCertificates = async () => {
        try {
          setLoadingCertificates(true);
          const res = await getMyCertificates();
          if (!ignore) {
            setCertificates(res.data.data.certificates || []);
          }
        } catch {
          // ignore error
        } finally {
          if (!ignore) {
            setLoadingCertificates(false);
          }
        }
      };
      fetchCertificates();
    }
    return () => {
      ignore = true;
    };
  }, [activeTab]);

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
      setProfileSaving(true);
      setProfileAlert({ text: '', type: 'success' });
      const res = await updateProfile({ name, avatar });
      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      setProfileAlert({ text: 'تم تحديث البيانات الشخصية بنجاح.', type: 'success' });
    } catch (err) {
      setProfileAlert({
        text: err?.response?.data?.message || 'تعذر تحديث البيانات الشخصية.',
        type: 'error',
      });
    } finally {
      setProfileSaving(false);
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
      setPasswordSaving(true);
      setPasswordAlert({ text: '', type: 'success' });
      await changePassword({ currentPassword, newPassword });
      setPasswordAlert({ text: 'تم تغيير كلمة المرور بنجاح!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordAlert({
        text: err?.response?.data?.message || 'تعذر تغيير كلمة المرور.',
        type: 'error',
      });
    } finally {
      setPasswordSaving(false);
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

  const displayAvatar =
    avatar ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || 'مستخدم'
    )}&background=4F46E5&color=fff&bold=true`;

  return (
    <div className={styles.profilePage} dir="rtl">
      <Container>
        {/* Profile Header Card */}
        <div className={styles.profileHeaderCard}>
          <div className={styles.userBasicInfo}>
            <div className={styles.avatarWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayAvatar} alt={name || 'صورة الحساب'} className={styles.avatarImg} />

              <button
                type="button"
                className={styles.avatarUploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="تغيير الصورة الشخصية"
              >
                {uploadingAvatar ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Camera size={16} />
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

            <div className={styles.nameBlock}>
              <h1 className={styles.profileName}>{user?.name || 'طالب متميز'}</h1>
              <span className={styles.profileEmail}>{user?.email}</span>
              <div className={styles.roleBadge}>
                <Shield size={14} />
                <span>{user?.role === 'ADMIN' ? 'مدير عام المنصة' : user?.role === 'MANAGER' ? 'مشرف محتوى' : 'طالب مسجل'}</span>
              </div>
            </div>
          </div>

          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '0.625rem',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              الذهاب للوحة التحكم
            </button>
          </Link>
        </div>

        {/* Tabs Bar */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>البيانات الشخصية</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Key size={18} />
            <span>الأمان وكلمة المرور</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'certificates' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={18} />
            <span>شهاداتي المكتسبة</span>
          </button>
        </div>

        {/* Tab 1: Profile Details Form */}
        {activeTab === 'profile' && (
          <div className={styles.cardContent}>
            {profileAlert.text && (
              <div
                className={`${styles.alertBox} ${
                  profileAlert.type === 'error' ? styles.alertError : styles.alertSuccess
                }`}
              >
                {profileAlert.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>الاسم بالكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.inputField}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>البريد الإلكتروني (غير قابل للتعديل)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>رابط الصورة الشخصية (أو ارفع من الزر أعلاه)</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className={styles.inputField}
                />
              </div>

              <button type="submit" disabled={profileSaving} className={styles.saveBtn}>
                {profileSaving ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
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
          <div className={styles.cardContent}>
            {passwordAlert.text && (
              <div
                className={`${styles.alertBox} ${
                  passwordAlert.type === 'error' ? styles.alertError : styles.alertSuccess
                }`}
              >
                {passwordAlert.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.inputField}
                  placeholder="أدخل كلمة المرور الحالية"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.inputField}
                  placeholder="على الأقل 6 أحرف"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.inputField}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  required
                />
              </div>

              <button type="submit" disabled={passwordSaving} className={styles.saveBtn}>
                {passwordSaving ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
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
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#4F46E5' }} />
              </div>
            ) : certificates.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '1rem',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: '#64748B',
                }}
              >
                <Award size={44} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  لم تحصل على أي شهادات بعد
                </h3>
                <p style={{ fontSize: '0.95rem' }}>
                  أكمل جميع دروس أحد الكورسات المسجل بها بنسبة 100% لإصدار شهادتك المعتمدة تلقائياً!
                </p>
              </div>
            ) : (
              <div className={styles.certList}>
                {certificates.map((cert) => (
                  <div key={cert._id} className={styles.certItem}>
                    <div className={styles.certItemLeft}>
                      <div className={styles.certIconBadge}>
                        <Award size={26} />
                      </div>
                      <div>
                        <div className={styles.certTitle}>{cert.courseTitle}</div>
                        <div className={styles.certDate}>
                          المدرب: {cert.instructor} • تم الإصدار في: {formatDate(cert.issueDate)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${cert.course}/certificate`}
                      className={styles.viewCertBtn}
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

