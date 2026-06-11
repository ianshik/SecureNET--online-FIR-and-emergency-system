import DashboardShell from "@/components/ui/DashboardShell";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
