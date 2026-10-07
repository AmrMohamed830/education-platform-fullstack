import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'تسجيل الدخول | مَنصّتِي التعليمية',
  description: 'سجل دخولك لمتابعة التعلم واستكمال مساراتك البرمجية والتقنية.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="أهلاً بك مجدداً! أدخل بياناتك لمتابعة رحلتك التعليمية."
      footerText="ليس لديك حساب؟"
      footerLinkText="أنشئ حساباً جديداً"
      footerLinkHref="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}
