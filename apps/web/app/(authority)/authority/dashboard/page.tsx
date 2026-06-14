"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import HeatMap from "@/components/maps/HeatMap";
import { 
  FileText, AlertTriangle, FileArchive, Timer, CheckCircle2, 
  RefreshCw, MapPin, PieChart as PieChartIcon, TrendingUp, Users, 
  Download, Search, Shield, Wifi
} from "lucide-react";

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

const CHART_COLORS = ["#3b82f6","#ef4444","#10b981","#f59e0b","#8b5cf6","#06b6d4","#f97316","#ec4899"];

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
    { label: "Total Complaints",    value: kpi.totalComplaints,              suffix: "",    icon: <FileText className="w-5 h-5"/>, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "#3b82f6" },
    { label: "Active Incidents",    value: kpi.activeIncidents,              suffix: "",    icon: <AlertTriangle className="w-5 h-5"/>, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", glow: "#ef4444" },
    { label: "Total FIRs",          value: kpi.totalFIRs,                    suffix: "",    icon: <FileArchive className="w-5 h-5"/>, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "#8b5cf6" },
    { label: "Avg Response Time",   value: kpi.avgResponseTimeMin,           suffix: " min",icon: <Timer className="w-5 h-5"/>, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "#f59e0b" },
    { label: "Resolution Rate",     value: kpi.resolutionRate,               suffix: "%",   icon: <CheckCircle2 className="w-5 h-5"/>, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "#10b981" },
  ] : [];

  return (
    <div className="space-y-6 slide-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
            CENTRAL INTELLIGENCE <span className="text-accent opacity-50">//</span> AUTHORITY
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">
            State-Level Crime Intelligence and Resource Oversight
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest">Global Link Active</span>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-heading font-bold uppercase tracking-widest rounded transition-all bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> SYNC DATA
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded bg-surface border border-surface-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiCards.map((k) => (
            <div key={k.label} className={`glass-card p-5 border ${k.border} relative overflow-hidden group`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${k.color} ${k.bg}`}>
                  {k.icon}
                </div>
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: k.glow, boxShadow: `0 0 10px ${k.glow}` }}
                />
              </div>
              <p className={`text-3xl font-black font-heading ${k.color}`}>
                {k.value}<span className="text-sm ml-1 opacity-70">{k.suffix}</span>
              </p>
              <p className="text-[10px] font-mono mt-1 uppercase tracking-widest text-muted">
                {k.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Heatmap + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Crime Heatmap Overlay */}
        <div className="lg:col-span-2 glass-card p-1 flex flex-col h-[450px]">
          <div className="px-5 py-4 border-b border-surface-border flex justify-between items-center bg-black/60 rounded-t">
            <h2 className="font-heading font-black text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" /> TACTICAL HEATMAP
            </h2>
            <span className="text-[10px] font-heading font-bold px-2 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/30 animate-pulse uppercase tracking-widest">LIVE TRACKING</span>
          </div>
          <div className="flex-1 rounded-b overflow-hidden relative border-t border-surface-border">
            {/* The HeatMap component internally handles the map rendering. Assuming it has dark mode tiles, but we'll dim it slightly here just in case. */}
            <div className="w-full h-full brightness-75 contrast-125 saturate-50">
              <HeatMap />
            </div>
          </div>
        </div>

        {/* Crime Type Distribution Pie Chart */}
        <div className="glass-card p-6 h-[450px] flex flex-col">
          <h2 className="font-heading font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4 pb-4 border-b border-surface-border">
            <PieChartIcon className="w-5 h-5 text-accent" /> INCIDENT CLASSIFICATION
          </h2>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {trends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#050505", borderColor: "#1e293b", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px", textTransform: "uppercase" }}
                  itemStyle={{ color: "#e2e8f0" }}
                  formatter={(value: any, name: any) => [value, String(name).replace("_", " ")]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest">TOTAL</p>
                <p className="text-2xl font-heading font-black text-white">{kpi?.totalComplaints || 0}</p>
              </div>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] font-mono h-24 overflow-y-auto pr-2">
            {trends.map((t, i) => (
              <div key={t.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="truncate text-slate-400 uppercase tracking-widest" title={t.name.replace("_", " ")}>{t.name.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Trends Line Chart */}
        <div className="lg:col-span-2 glass-card p-6 h-[400px] flex flex-col">
          <h2 className="font-heading font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-surface-border">
            <TrendingUp className="w-5 h-5 text-accent" /> INCIDENT FREQUENCY (7-DAY TRAJECTORY)
          </h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeTrends} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} dy={10} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} dx={-10} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#050505", borderColor: "#1e293b", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px", textTransform: "uppercase" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ fill: "#050505", stroke: "#3b82f6", strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: "#60a5fa", stroke: "#050505", strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Officer Performance Table */}
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h2 className="font-heading font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-surface-border">
            <Users className="w-5 h-5 text-accent" /> FIELD OPERATIVES
          </h2>
          {officers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[10px] font-mono text-muted uppercase tracking-widest">
              NO OPERATIVE DATA
            </div>
          ) : (
            <div className="flex-1 overflow-auto pr-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-muted text-[10px] font-heading font-bold uppercase tracking-widest">
                    <th className="pb-3 font-medium">Operative</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Resolved</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {officers.map((o, i) => (
                    <tr key={i} className="border-b border-surface-border/50 hover:bg-white/5 transition-colors group">
                      <td className="py-4">
                        <span className="font-bold text-slate-200 block group-hover:text-accent transition-colors">{o.name.toUpperCase()}</span>
                        <span className="text-[9px] text-slate-500 mt-1 block">ID: {o.badge}</span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border
                            ${o.status === "AVAILABLE" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-accent text-right">{o.casesResolved}</td>
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
          { href: "/authority/reports",  icon: <Download className="w-6 h-6"/>, label: "GENERATE REPORT", desc: "Download incident summary PDF" },
          { href: "/authority/audit",    icon: <Search className="w-6 h-6"/>,   label: "SYSTEM AUDIT",    desc: "Track all network actions" },
          { href: "/authority/officers", icon: <Shield className="w-6 h-6"/>,   label: "MANAGE OPERATIVES",desc: "CRUD officer credentials" },
        ].map((l) => (
          <a key={l.href} href={l.href} className="glass-card p-5 border border-surface-border hover:border-accent/50 hover:bg-accent/5 transition-all flex gap-4 items-center group">
            <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
              {l.icon}
            </div>
            <div>
              <div className="text-sm font-heading font-black text-white tracking-widest">{l.label}</div>
              <div className="text-[10px] font-mono text-muted uppercase mt-1">{l.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
