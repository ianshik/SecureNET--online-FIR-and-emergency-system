"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import HeatMap from "@/components/maps/HeatMap";

interface KPI {
  totalComplaints: number;
  activeIncidents: number;
  totalFIRs: number;
  avgResponseTimeMin: number;
  resolutionRate: string;
}

interface CrimeTrend { name: string; value: number; }
interface TimeTrend { date: string; incidents: number; }
interface Officer { name: string; badge: string; status: string; casesResolved: number; avgTime: number; }

const CHART_COLORS = ["#2d8cf0","#ef4444","#10b981","#f59e0b","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const TYPE_ICONS: Record<string, string> = {
  CIVIL: "⚖️", CRIMINAL: "🔫", CYBER_CRIME: "💻", MISSING_PERSON: "🔍",
  TRAFFIC: "🚗", WOMEN_SAFETY: "👩", CHILD_SAFETY: "👶", DOMESTIC_VIOLENCE: "🏠",
};

export default function AuthorityDashboard() {
  const [kpi, setKpi]               = useState<KPI | null>(null);
  const [trends, setTrends]         = useState<CrimeTrend[]>([]);
  const [timeTrends, setTimeTrends] = useState<TimeTrend[]>([]);
  const [officers, setOfficers]     = useState<Officer[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [kpiRes, trendsRes, timeTrendsRes, officersRes] = await Promise.all([
        fetchApi("/analytics/kpis"),
        fetchApi("/analytics/trends"),
        fetchApi("/analytics/time-trends").catch(() => ({ data: [
          { date: "Mon", incidents: 12 }, { date: "Tue", incidents: 19 },
          { date: "Wed", incidents: 15 }, { date: "Thu", incidents: 25 },
          { date: "Fri", incidents: 22 }, { date: "Sat", incidents: 30 },
          { date: "Sun", incidents: 28 }
        ]})), // fallback mock if endpoint doesn't exist yet
        fetchApi("/analytics/officers"),
      ]);
      setKpi(kpiRes.data);
      setTrends(trendsRes.data || []);
      setTimeTrends(timeTrendsRes.data || []);
      setOfficers(officersRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const kpiCards = kpi ? [
    { label: "Total Complaints",    value: kpi.totalComplaints,              suffix: "",    icon: "📋", color: "#2d8cf0" },
    { label: "Active Incidents",    value: kpi.activeIncidents,              suffix: "",    icon: "🚨", color: "#ef4444" },
    { label: "Total FIRs",          value: kpi.totalFIRs,                    suffix: "",    icon: "📄", color: "#8b5cf6" },
    { label: "Avg Response Time",   value: kpi.avgResponseTimeMin,           suffix: " min",icon: "⏱️", color: "#f59e0b" },
    { label: "Resolution Rate",     value: kpi.resolutionRate,               suffix: "%",   icon: "✅", color: "#10b981" },
  ] : [];

  return (
    <div className="space-y-6 slide-in">
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

      {/* Main Grid: Heatmap + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Crime Heatmap Overlay */}
        <div className="lg:col-span-2 glass-card p-1 flex flex-col h-[400px]">
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
            <h2 className="text-base font-bold" style={{ color: "var(--clr-text-primary)" }}>
              🗺️ Crime Hotspot Heatmap
            </h2>
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 animate-pulse">Live</span>
          </div>
          <div className="flex-1 rounded-b-xl overflow-hidden relative">
            <HeatMap />
          </div>
        </div>

        {/* Crime Type Distribution Pie Chart */}
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--clr-text-primary)" }}>
            📊 Crime Type Distribution
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {trends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                  formatter={(value: any, name: any) => [value, String(name).replace("_", " ")]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs h-24 overflow-y-auto pr-2">
            {trends.map((t, i) => (
              <div key={t.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="truncate text-slate-400" title={t.name.replace("_", " ")}>{t.name.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Trends Line Chart */}
        <div className="lg:col-span-2 glass-card p-6 h-[350px] flex flex-col">
          <h2 className="text-base font-bold mb-4" style={{ color: "var(--clr-text-primary)" }}>
            📈 Incident Trends (Last 7 Days)
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: "#60a5fa" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Officer Performance Table */}
        <div className="glass-card p-6 h-[350px] flex flex-col">
          <h2 className="text-base font-bold mb-4" style={{ color: "var(--clr-text-primary)" }}>
            👮 Officer Performance
          </h2>
          {officers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: "var(--clr-text-muted)" }}>
              No officer data available
            </div>
          ) : (
            <div className="flex-1 overflow-auto pr-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 font-medium">Officer</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-3">
                        <span className="font-medium text-slate-200 block">{o.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.badge}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: o.status === "AVAILABLE" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                            color: o.status === "AVAILABLE" ? "#34d399" : "#fbbf24",
                            border: `1px solid ${o.status === "AVAILABLE" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-emerald-400 text-right">{o.casesResolved}</td>
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
