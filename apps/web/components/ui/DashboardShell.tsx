"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/ui/Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!user) return;

    let allowed = false;
    if (pathname.startsWith("/authority") && user.role === "AUTHORITY") allowed = true;
    else if (pathname.startsWith("/control-room") && ["CONTROL_ROOM", "AUTHORITY"].includes(user.role)) allowed = true;
    else if (pathname.startsWith("/officer") && user.role === "OFFICER") allowed = true;
    else if (pathname.startsWith("/citizen") && user.role === "CITIZEN") allowed = true;

    if (!allowed) {
      const targetRole = user.role.toLowerCase().replace("_", "-");
      router.push(`/${targetRole}/dashboard`);
    } else {
      setAuthorized(true);
    }
  }, [pathname, user, isAuthenticated, router]);

  if (!authorized) {
    return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-muted text-xs uppercase tracking-widest animate-pulse">Establishing Secure Connection...</div>;
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-black">
      {/* Cinematic Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-[url('/dashboard-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed opacity-80"
      />
      <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
