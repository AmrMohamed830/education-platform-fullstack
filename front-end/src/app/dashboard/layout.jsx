import ProtectedLayout from "@/components/providers/ProtectedLayout";

export const instant = false;

export default function DashboardRouteLayout({ children }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
