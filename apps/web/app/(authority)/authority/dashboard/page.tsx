"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface KPI {
  totalComplaints: number;
  activeIncidents: number;
  totalFIRs: number;
  avgResponseTimeMin: number;
  resolutionRate: string;
}

interface CrimeTrend { name: string; value: number; }
interface Officer { name: string; badge: string; status: string; casesResolved: number; avgTime: number; }

const CHART_COLORS = ["#2d8cf0","#ef4444","#10b981","#f59e0b","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const TYPE_ICONS: Record<string, string> = {
  CIVIL: "⚖️", CRIMINAL: "🔫", CYBER_CRIME: "💻", MISSING_PERSON: "🔍",
  TRAFFIC: "🚗", WOMEN_SAFETY: "👩", CHILD_SAFETY: "👶", DOMESTIC_VIOLENCE: "🏠",
};

export default function AuthorityDashboard() {
  const [kpi, setKpi]           = useState<KPI | null>(null);
  const [trends, setTrends]     = useState<CrimeTrend[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [kpiRes, trendsRes, officersRes] = await Promise.all([
        fetchApi("/analytics/kpis"),
        fetchApi("/analytics/trends"),
        fetchApi("/analytics/officers"),
      ]);
      setKpi(kpiRes.data);
      setTrends(trendsRes.data || []);
      setOfficers(officersRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const maxVal = Math.max(...trends.map(t => t.value), 1);

  const kpiCards = kpi ? [
    { label: "Total Complaints",    value: kpi.totalComplaints,              suffix: "",    icon: "📋", color: "#2d8cf0" },
    { label: "Active Incidents",    value: kpi.activeIncidents,              suffix: "",    icon: "🚨", color: "#ef4444" },
    { label: "Total FIRs",          value: kpi.totalFIRs,                    suffix: "",    icon: "📄", color: "#8b5cf6" },
    { label: "Avg Response Time",   value: kpi.avgResponseTimeMin,           suffix: " min",icon: "⏱️", color: "#f59e0b" },
    { label: "Resolution Rate",     value: kpi.resolutionRate,               suffix: "%",   icon: "✅", color: "#10b981" },
  ] : [];

  return (
    <div className="space-y-8 slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
            Analytics & Oversight
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--clr-text-secondary)" }}>
            State-level crime intelligence and resource overview
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.25)", color: "#60a5fa" }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiCards.map((k) => (
            <div key={k.label} className="glass-card stat-card p-5" style={{ borderColor: `${k.color}25` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${k.color}15` }}>
                  {k.icon}
                </div>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: k.color, boxShadow: `0 0 6px ${k.color}` }}
                />
              </div>
              <p className="text-2xl font-black" style={{ color: k.color }}>
                {k.value}{k.suffix}
              </p>
              <p className="text-xs font-medium mt-0.5 uppercase tracking-widest" style={{ color: "var(--clr-text-muted)" }}>
                {k.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Type Distribution Bar Chart */}
        <div className="glass-card p-6">
          <h2 className="text-base font-bold mb-5" style={{ color: "var(--clr-text-primary)" }}>
            📊 Crime Type Distribution
          </h2>
          {trends.length === 0 ? (
            <div className="flex items-center justify-center py-12" style={{ color: "var(--clr-text-muted)" }}>
              No data available
            </div>
          ) : (
            <div className="space-y-3">
              {trends.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="w-7 text-sm text-center flex-shrink-0">{TYPE_ICONS[t.name] || "📁"}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--clr-text-secondary)" }}>{t.name.replace("_", " ")}</span>
                      <span className="font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>{t.value}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(t.value / maxVal) * 100}%`,
                          background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Officer Performance Table */}
        <div className="glass-card p-6">
          <h2 className="text-base font-bold mb-5" style={{ color: "var(--clr-text-primary)" }}>
            👮 Officer Performance
          </h2>
          {officers.length === 0 ? (
            <div className="flex items-center justify-center py-12" style={{ color: "var(--clr-text-muted)" }}>
              No officer data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Badge</th>
                    <th>Status</th>
                    <th>Resolved</th>
                    <th>Avg (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, i) => (
                    <tr key={i}>
                      <td>
                        <span className="font-medium" style={{ color: "var(--clr-text-primary)" }}>{o.name}</span>
                      </td>
                      <td className="font-mono text-xs">{o.badge}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: o.status === "AVAILABLE" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                            color: o.status === "AVAILABLE" ? "#34d399" : "#fbbf24",
                            border: `1px solid ${o.status === "AVAILABLE" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="font-bold" style={{ color: "#10b981" }}>{o.casesResolved}</td>
                      <td style={{ color: o.avgTime < 20 ? "#10b981" : "#f59e0b" }}>{o.avgTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/authority/reports",  icon: "📑", label: "Generate PDF Report", desc: "Download incident summary" },
          { href: "/authority/audit",    icon: "🔍", label: "Audit Logs",          desc: "Track all user actions" },
          { href: "/authority/officers", icon: "👮", label: "Manage Officers",     desc: "CRUD officer accounts" },
        ].map((l) => (
          <a key={l.href} href={l.href} className="glass-card glass-card-hover p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(139,92,246,0.1)" }}>
              {l.icon}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--clr-text-primary)" }}>{l.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--clr-text-muted)" }}>{l.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
