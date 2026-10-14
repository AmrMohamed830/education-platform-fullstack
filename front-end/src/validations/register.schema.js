import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "يرجى إدخال الاسم الكامل")
      .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
      .max(50, "الاسم لا يمكن أن يتجاوز 50 حرفًا"),

    email: z
      .string()
      .trim()
      .min(1, "يرجى إدخال البريد الإلكتروني")
      .max(254, "البريد الإلكتروني طويل جدًا")
      .email("يرجى إدخال بريد إلكتروني صحيح"),

    password: z
      .string()
      .min(1, "يرجى إدخال كلمة المرور")
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      .max(64, "كلمة المرور لا يمكن أن تتجاوز 64 حرفًا"),

    confirmPassword: z
      .string()
      .min(1, "يرجى تأكيد كلمة المرور")
      .max(64, "كلمة المرور لا يمكن أن تتجاوز 64 حرفًا"),

    acceptTerms: z
      .boolean()
      .refine(
        (value) => value === true,
        "يجب الموافقة على الشروط والأحكام للمتابعة",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });
