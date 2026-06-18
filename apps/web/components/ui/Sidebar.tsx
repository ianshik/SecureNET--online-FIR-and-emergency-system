"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Home, AlertTriangle, FileText, Map, User, Shield, Radio, Activity, Database, Users, LogOut } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const CITIZEN_NAV: NavItem[] = [
  { href: "/citizen/dashboard",  icon: <Home className="w-5 h-5" />, label: "Dashboard" },
  { href: "/citizen/sos",        icon: <AlertTriangle className="w-5 h-5" />, label: "SOS Emergency" },
  { href: "/citizen/complaints", icon: <FileText className="w-5 h-5" />, label: "My Complaints" },
  { href: "/citizen/fir",        icon: <FileText className="w-5 h-5" />, label: "FIR Status" },
  { href: "/citizen/track",      icon: <Map className="w-5 h-5" />, label: "Live Tracking" },
  { href: "/citizen/profile",    icon: <User className="w-5 h-5" />, label: "Profile" },
];

const OFFICER_NAV: NavItem[] = [
  { href: "/officer/dashboard",  icon: <Home className="w-5 h-5" />, label: "Dashboard" },
  { href: "/officer/dispatches", icon: <Radio className="w-5 h-5" />, label: "My Dispatches" },
  { href: "/officer/cases",      icon: <FileText className="w-5 h-5" />, label: "Active Cases" },
  { href: "/officer/fir",        icon: <FileText className="w-5 h-5" />, label: "FIR Workspace" },
  { href: "/officer/map",        icon: <Map className="w-5 h-5" />, label: "Field Map" },
];

const CONTROL_NAV: NavItem[] = [
  { href: "/control-room/dashboard", icon: <Activity className="w-5 h-5" />, label: "Command Center" },
  { href: "/control-room/incidents", icon: <AlertTriangle className="w-5 h-5" />, label: "Live Incidents" },
  { href: "/control-room/dispatch",  icon: <Radio className="w-5 h-5" />, label: "Dispatch Panel" },
  { href: "/control-room/map",       icon: <Map className="w-5 h-5" />, label: "City Map" },
];

const AUTHORITY_NAV: NavItem[] = [
  { href: "/authority/dashboard", icon: <Activity className="w-5 h-5" />, label: "Analytics" },
  { href: "/authority/reports",   icon: <Database className="w-5 h-5" />, label: "Reports" },
  { href: "/authority/audit",     icon: <Shield className="w-5 h-5" />, label: "Audit Logs" },
  { href: "/authority/officers",  icon: <Users className="w-5 h-5" />, label: "Officers" },
];

const NAV_MAP: Record<string, NavItem[]> = {
  CITIZEN:      CITIZEN_NAV,
  OFFICER:      OFFICER_NAV,
  CONTROL_ROOM: CONTROL_NAV,
  AUTHORITY:    AUTHORITY_NAV,
};

const ROLE_META: Record<string, { label: string; bgClass: string; textClass: string; icon: React.ReactNode }> = {
  CITIZEN:      { label: "Citizen",       bgClass: "bg-success/10 border-success/20", textClass: "text-success", icon: <User className="w-4 h-4" /> },
  OFFICER:      { label: "Officer",       bgClass: "bg-primary/10 border-primary/20", textClass: "text-primary", icon: <Shield className="w-4 h-4" /> },
  CONTROL_ROOM: { label: "Control Room", bgClass: "bg-accent/10 border-accent/20", textClass: "text-accent", icon: <Activity className="w-4 h-4" /> },
  AUTHORITY:    { label: "Authority",    bgClass: "bg-danger/10 border-danger/20", textClass: "text-danger", icon: <Database className="w-4 h-4" /> },
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  let portalRole = "CITIZEN";
  if (pathname.startsWith("/officer")) portalRole = "OFFICER";
  else if (pathname.startsWith("/control-room")) portalRole = "CONTROL_ROOM";
  else if (pathname.startsWith("/authority")) portalRole = "AUTHORITY";
  else if (user?.role) portalRole = user.role;

  let nav = NAV_MAP[portalRole] || CITIZEN_NAV;
  if (portalRole === "OFFICER" && user?.officerType !== "POLICE") {
    nav = nav.filter(item => item.href !== "/officer/fir");
  }
  
  const meta = ROLE_META[portalRole] || ROLE_META.CITIZEN;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <aside className="sidebar w-64 flex flex-col py-6 px-4 sticky top-0 h-screen font-sans">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-2 mb-10">
        <Shield className="w-8 h-8 text-white" />
        <div>
          <div className="font-heading font-black text-lg uppercase tracking-wider text-white leading-none">SecureNet</div>
          <div className="text-[9px] font-heading font-bold text-muted uppercase tracking-widest mt-1">NP-SERP</div>
        </div>
      </Link>

      {/* Role badge */}
      <div className={`flex items-center gap-3 px-3 py-3 rounded border ${meta.bgClass} mb-8`}>
        <div className={meta.textClass}>{meta.icon}</div>
        <div>
          <div className={`text-[10px] font-heading font-bold uppercase tracking-wider ${meta.textClass}`}>{meta.label} Portal</div>
          <div className="text-xs text-muted truncate max-w-[140px] mt-0.5 min-h-[16px]">
            {mounted && user ? `${user.firstName} ${user.lastName}` : " "}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-2">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <div className="opacity-70">{item.icon}</div>
              <span className="font-heading font-bold text-xs tracking-wider uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-6 mt-6 border-t border-surface-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded w-full text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          <span className="font-heading font-bold text-xs tracking-wider uppercase">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
