"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import Input from "../common/Input";
import Checkbox from "../common/Checkbox";
import Button from "../common/Button";
import styles from "./LoginForm.module.css";
import { loginUser } from "../../services/auth.service";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (!formData.password) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isLoading || isSuccess) return;

    setIsLoading(true);
    setGeneralError("");
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      setIsSuccess(true);

      // Smooth transition to dashboard without leaving /login in browser history
      setTimeout(() => {
        setUser(response.data.data.user);
        router.replace("/dashboard");
      }, 900);
    } catch {
      setGeneralError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setIsLoading(false);
    }
  };

  // ── Success Creative Screen ─────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className={styles.successCard}>
        <div className={styles.successIconWrapper}>
          <CheckCircle2 size={42} strokeWidth={2.4} />
        </div>
        <h3 className={styles.successTitle}>تم تسجيل الدخول بنجاح! 🎉</h3>
        <p className={styles.successSubtitle}>
          أهلاً بك مجدداً! يتم الآن تجهيز حسابك ونقلك إلى لوحة التحكم...
        </p>
        <div className={styles.redirectBarContainer}>
          <div className={styles.redirectBarFill} />
        </div>
        <span className={styles.redirectHint}>لحظات وسنكون هناك...</span>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* General Messages */}
      {generalError && (
        <div className={styles.alertError}>
          <AlertCircle size={18} />
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
      <div className={styles.optionsRow}>
        <Checkbox
          label="تذكرني على هذا الجهاز"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          disabled={isLoading}
        />

        <button
          type="button"
          className={styles.forgotLink}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
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
        className={isLoading ? styles.loadingBtn : ""}
      >
        {isLoading ? "جاري التحقق من الحساب..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
