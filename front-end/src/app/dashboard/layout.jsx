import ProtectedLayout from "@/components/providers/ProtectedLayout";

export default function DashboardRouteLayout({ children }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
