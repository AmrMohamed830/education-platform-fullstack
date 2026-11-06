'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';
import { useRegister } from '@/hooks/mutations/useAuthMutations';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../validations/register.schema';
import { useForm, Controller } from 'react-hook-form';

export default function RegisterForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const registerMutation = useRegister();
  const isLoading = registerMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    if (isLoading || isSuccess) return;
    setGeneralError('');

    try {
      await registerMutation.mutateAsync({
        name: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      setIsSuccess(true);

      setTimeout(() => {
        router.replace('/dashboard');
      }, 900);
    } catch (err) {
      if (err.response?.status === 409) {
        setGeneralError('هذا البريد الإلكتروني مسجل بالفعل');
      } else {
        setGeneralError('حدثت مشكلة أثناء إنشاء الحساب. حاول مرة أخرى');
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <CheckCircle2 size={42} strokeWidth={2.4} />
        </div>
        <h3 className="text-xl font-extrabold text-[var(--text-main)] mb-2">
          تم إنشاء الحساب بنجاح! 🎉
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
          مرحباً بك في مَنصّتِي! يتم الآن تجهيز مساحتك التعليمية ونقلك إلى لوحة التحكم...
        </p>
        <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
        </div>
        <span className="text-xs text-[var(--text-muted)]">لحظات وسنكون هناك...</span>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* General Alert */}
      {generalError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Full Name Input */}
      <Input
        label="الاسم الكامل"
        name="fullName"
        type="text"
        placeholder="أحمد محمد"
        error={errors.fullName?.message}
        icon={User}
        disabled={isLoading}
        required
        {...register('fullName')}
      />

      {/* Email Input */}
      <Input
        label="البريد الإلكتروني"
        name="email"
        type="email"
        placeholder="example@domain.com"
        error={errors.email?.message}
        icon={Mail}
        disabled={isLoading}
        required
        {...register('email')}
      />

      {/* Password Input */}
      <Input
        label="كلمة المرور"
        name="password"
        type="password"
        placeholder="8 أحرف على الأقل"
        error={errors.password?.message}
        icon={Lock}
        disabled={isLoading}
        required
        {...register('password')}
      />

      {/* Confirm Password Input */}
      <Input
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        type="password"
        placeholder="أعد إدخال كلمة المرور"
        error={errors.confirmPassword?.message}
        icon={ShieldCheck}
        disabled={isLoading}
        required
        {...register('confirmPassword')}
      />

      {/* Terms and Conditions Checkbox */}
      <div className="flex flex-col gap-1 my-1">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="أوافق على الشروط والأحكام وسياسة الخصوصية للمنصة"
              name={field.name}
              checked={field.value}
              disabled={isLoading}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          )}
        />

        {errors.acceptTerms && (
          <span className="text-xs text-red-500 font-semibold">{errors.acceptTerms.message}</span>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        icon={isLoading ? Loader2 : UserPlus}
        disabled={isLoading}
      >
        {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
      </Button>
    </form>
  );
}
