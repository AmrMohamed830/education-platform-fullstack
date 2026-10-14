"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Input from "../common/Input";
import Checkbox from "../common/Checkbox";
import Button from "../common/Button";
import styles from "./RegisterForm.module.css";
import { registerUser } from "../../services/auth.service";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validations/register.schema";
import { useForm, Controller } from "react-hook-form";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const { setUser } = useAuthStore();

  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setGeneralError("");
    setSuccessMessage("");

    try {
      const response = await registerUser({
        name: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      setUser(response.data.data.user);
      setSuccessMessage("تم إنشاء الحساب بنجاح!");

      router.push("/dashboard");
    } catch (err) {
      if (err.response?.status === 409) {
        setGeneralError("الإيميل ده مسجل بالفعل");
      } else {
        setGeneralError("حصلت مشكلة أثناء إنشاء الحساب. حاول مرة تانية");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
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
        error={errors.fullName?.message}
        icon={User}
        required
        {...register("fullName")}
      />
      {/* Email Input */}
      <Input
        label="البريد الإلكتروني"
        name="email"
        type="email"
        placeholder="example@domain.com"
        error={errors.email?.message}
        icon={Mail}
        required
        {...register("email")}
      />
      {/* Password Input */}
      <Input
        label="كلمة المرور"
        name="password"
        type="password"
        placeholder="8 أحرف على الأقل"
        error={errors.password?.message}
        icon={Lock}
        required
        {...register("password")}
      />

      {/* Confirm Password Input */}
      <Input
        label="تأكيد كلمة المرور"
        name="confirmPassword"
        type="password"
        placeholder="أعد إدخال كلمة المرور"
        error={errors.confirmPassword?.message}
        icon={ShieldCheck}
        required
        {...register("confirmPassword")}
      />
      {/* Terms and Conditions Checkbox */}
      <div className={styles.termsRow}>
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="أوافق على الشروط والأحكام وسياسة الخصوصية للمنصة"
              name={field.name}
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          )}
        />

        {errors.acceptTerms && (
          <span className={styles.errorMessage}>
            {errors.acceptTerms.message}
          </span>
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
        className={isLoading ? styles.loadingBtn : ""}
      >
        {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
      </Button>
    </form>
  );
}
