import DashboardShell from "@/components/ui/DashboardShell";
import SOSButton from "@/components/sos/SOSButton";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
      <SOSButton />
    </DashboardShell>
  );
}
