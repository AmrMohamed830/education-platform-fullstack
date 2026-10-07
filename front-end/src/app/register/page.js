import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'إنشاء حساب جديد | مَنصّتِي التعليمية',
  description: 'أنشئ حساباً جديداً وانضم لأكثر من 50,000 متعلم عربي للبدء في تعلم البرمجة والتقنية.',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="انضم لأكثر من 50,000 متعلم عربي وابدأ رحلتك التفاعلية اليوم."
      footerText="لديك حساب بالفعل؟"
      footerLinkText="تسجيل الدخول"
      footerLinkHref="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
