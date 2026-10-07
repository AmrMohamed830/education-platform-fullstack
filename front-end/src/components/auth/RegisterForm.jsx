'use client';

import { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'يرجى إدخال الاسم الكامل';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'يرجى إدخال كلمة المرور';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'يرجى تأكيد كلمة المرور';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'يجب الموافقة على الشروط والأحكام للمتابعة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    // Simulate register API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.');
    }, 1300);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* General Alert */}
      {generalError && (
        <div className={styles.alertError}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      {successMessage && (
        <div className={styles.alertSuccess}>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Full Name Input */}
      <Input
        label="الاسم الكامل"
        name="fullName"
        type="text"
        placeholder="أحمد محمد"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        icon={User}
        required
      />

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
        required
      />

      {/* Password Input */}
      <Input
        label="كلمة المرور"
        name="password"
        type="password"
        placeholder="8 أحرف على الأقل"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={Lock}
        required
      />

      {/* Confirm Password Input */}
      <Input
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        type="password"
        placeholder="أعد إدخال كلمة المرور"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        icon={ShieldCheck}
        required
      />

      {/* Terms and Conditions Checkbox */}
      <div className={styles.termsRow}>
        <Checkbox
          label="أوافق على الشروط والأحكام وسياسة الخصوصية للمنصة"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
        />
        {errors.acceptTerms && (
          <span className={styles.errorMessage}>{errors.acceptTerms}</span>
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
        className={isLoading ? styles.loadingBtn : ''}
      >
        {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
      </Button>
    </form>
  );
}
