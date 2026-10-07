import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata = {
  title: 'لوحة التحكم | مَنصّتِي التعليمية',
  description: 'لوحة التحكم الشاملة للطلاب والمشرفين لمتابعة الكورسات والتقدم التعليمي والإحصائيات.',
};

export default function DashboardPage() {
  return <DashboardLayout />;
}
