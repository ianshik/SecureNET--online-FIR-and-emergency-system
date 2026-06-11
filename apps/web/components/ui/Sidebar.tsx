"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const CITIZEN_NAV: NavItem[] = [
  { href: "/citizen/dashboard",  icon: "🏠", label: "Dashboard" },
  { href: "/citizen/sos",        icon: "🆘", label: "SOS Emergency" },
  { href: "/citizen/complaints", icon: "📋", label: "My Complaints" },
  { href: "/citizen/fir",        icon: "📄", label: "FIR Status" },
  { href: "/citizen/track",      icon: "📍", label: "Live Tracking" },
  { href: "/citizen/profile",    icon: "👤", label: "Profile" },
];

const OFFICER_NAV: NavItem[] = [
  { href: "/officer/dashboard",  icon: "🏠", label: "Dashboard" },
  { href: "/officer/dispatches", icon: "🚨", label: "My Dispatches" },
  { href: "/officer/cases",      icon: "📂", label: "Active Cases" },
  { href: "/officer/fir",        icon: "📝", label: "FIR Workspace" },
  { href: "/officer/map",        icon: "🗺️", label: "Field Map" },
];

const CONTROL_NAV: NavItem[] = [
  { href: "/control-room/dashboard", icon: "🖥️", label: "Command Center" },
  { href: "/control-room/incidents", icon: "🚨", label: "Live Incidents" },
  { href: "/control-room/dispatch",  icon: "📡", label: "Dispatch Panel" },
  { href: "/control-room/map",       icon: "🗺️", label: "City Map" },
];

const AUTHORITY_NAV: NavItem[] = [
  { href: "/authority/dashboard", icon: "⚖️", label: "Analytics" },
  { href: "/authority/reports",   icon: "📊", label: "Reports" },
  { href: "/authority/audit",     icon: "🔍", label: "Audit Logs" },
  { href: "/authority/officers",  icon: "👮", label: "Officers" },
];

const NAV_MAP: Record<string, NavItem[]> = {
  CITIZEN:      CITIZEN_NAV,
  OFFICER:      OFFICER_NAV,
  CONTROL_ROOM: CONTROL_NAV,
  AUTHORITY:    AUTHORITY_NAV,
};

const ROLE_META: Record<string, { label: string; color: string; icon: string }> = {
  CITIZEN:      { label: "Citizen",       color: "#10b981", icon: "👤" },
  OFFICER:      { label: "Officer",       color: "#2d8cf0", icon: "👮" },
  CONTROL_ROOM: { label: "Control Room", color: "#8b5cf6", icon: "🖥️" },
  AUTHORITY:    { label: "Authority",    color: "#f59e0b", icon: "⚖️" },
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const role = user?.role || "CITIZEN";
  const nav = NAV_MAP[role] || CITIZEN_NAV;
  const meta = ROLE_META[role] || ROLE_META.CITIZEN;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className="sidebar w-60 flex flex-col py-5 px-3"
      style={{ position: "sticky", top: 0, height: "100vh" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
        >
          🛡️
        </div>
        <div>
          <div className="font-bold text-sm leading-tight" style={{ color: "var(--clr-text-primary)" }}>SecureNet</div>
          <div className="text-xs" style={{ color: "var(--clr-text-muted)" }}>NP-SERP</div>
        </div>
      </Link>

      {/* Role badge */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-6"
        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}
      >
        <span>{meta.icon}</span>
        <div>
          <div className="text-xs font-bold" style={{ color: meta.color }}>{meta.label} Portal</div>
          <div className="text-xs truncate max-w-[140px]" style={{ color: "var(--clr-text-muted)" }}>
            {user?.firstName} {user?.lastName}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              style={isActive ? { background: "rgba(45,140,240,0.12)", color: "#60a5fa" } : {}}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "#60a5fa" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t" style={{ borderColor: "var(--clr-border)" }}>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full"
          style={{ color: "#ef4444" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
