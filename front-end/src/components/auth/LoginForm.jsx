"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
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
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    if (!validate()) return;

    setIsLoading(true);
    setGeneralError("");
    setSuccessMessage("");
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      setUser(response.data.data.user);

      setSuccessMessage("تم تسجيل الدخول بنجاح! جاري تحويلك...");
      router.push("/dashboard");
    } catch {
      setGeneralError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* General Messages */}
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
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={Lock}
        required
      />

      {/* Options Row: Remember me & Forgot Password */}
      <div className={styles.optionsRow}>
        <Checkbox
          label="تذكرني على هذا الجهاز"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
        />

        <a
          href="#"
          className={styles.forgotLink}
          onClick={(e) => e.preventDefault()}
        >
          هل نسيت كلمة المرور؟
        </a>
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
        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
