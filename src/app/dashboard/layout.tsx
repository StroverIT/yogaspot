import { DashboardShell } from '@/views/Dashboard/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
