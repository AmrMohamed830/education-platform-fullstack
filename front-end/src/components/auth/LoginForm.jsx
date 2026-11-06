'use client';

import { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';
import { useLogin } from '@/hooks/mutations/useAuthMutations';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'يرجى إدخال كلمة المرور';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isLoading || isSuccess) return;

    setGeneralError('');
    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      setIsSuccess(true);

      setTimeout(() => {
        router.replace('/dashboard');
      }, 900);
    } catch {
      setGeneralError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <CheckCircle2 size={42} strokeWidth={2.4} />
        </div>
        <h3 className="text-xl font-extrabold text-[var(--text-main)] mb-2">
          تم تسجيل الدخول بنجاح! 🎉
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
          أهلاً بك مجدداً! يتم الآن تجهيز حسابك ونقلك إلى لوحة التحكم...
        </p>
        <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
        </div>
        <span className="text-xs text-[var(--text-muted)]">لحظات وسنكون هناك...</span>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {/* General Messages */}
      {generalError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Email Input */}
      <Input
        label="البريد الإلكتروني"
        name="email"
        type="email"
        placeholder="example@domain.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={Mail}
        disabled={isLoading}
        required
      />

      {/* Password Input */}
      <Input
        label="كلمة المرور"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={Lock}
        disabled={isLoading}
        required
      />

      {/* Options Row: Remember me & Forgot Password */}
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <Checkbox
          label="تذكرني على هذا الجهاز"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={isLoading}
        />

        <button
          type="button"
          className="text-xs text-[var(--primary)] hover:underline font-semibold bg-transparent border-none cursor-pointer"
          onClick={() =>
            alert(
              'لاستعادة أو إعادة تعيين كلمة المرور، يرجى التواصل مع إدارة المنصة عبر البريد: support@platform.com'
            )
          }
        >
          هل نسيت كلمة المرور؟
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        icon={isLoading ? Loader2 : LogIn}
        disabled={isLoading}
      >
        {isLoading ? 'جاري التحقق من الحساب...' : 'تسجيل الدخول'}
      </Button>
    </form>
  );
}
