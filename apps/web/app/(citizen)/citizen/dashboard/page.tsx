"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { 
  FileText, Hourglass, CheckCircle2, 
  Inbox, PenTool, FileSearch, MapPin, ShieldCheck, Wifi
} from "lucide-react";

interface Complaint {
  _id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED:    "bg-slate-800 text-slate-300 border-slate-700",
  UNDER_REVIEW: "bg-blue-900/30 text-blue-400 border-blue-500/30",
  ASSIGNED:     "bg-amber-900/30 text-amber-400 border-amber-500/30",
  IN_PROGRESS:  "bg-amber-900/30 text-amber-400 border-amber-500/30",
  RESOLVED:     "bg-emerald-900/30 text-emerald-400 border-emerald-500/30",
  CLOSED:       "bg-slate-800/50 text-slate-500 border-slate-700",
  REJECTED:     "bg-red-900/30 text-red-400 border-red-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW:      "text-emerald-400",
  MEDIUM:   "text-amber-400",
  HIGH:     "text-orange-500",
  CRITICAL: "text-red-500 font-bold",
};

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetchApi("/complaints/my-complaints");
      setComplaints(res.data || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Complaints", value: complaints.length, icon: <FileText className="w-5 h-5"/>, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Pending Review", value: complaints.filter(c => !["RESOLVED","CLOSED"].includes(c.status)).length, icon: <Hourglass className="w-5 h-5"/>, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Resolved", value: complaints.filter(c => c.status === "RESOLVED").length, icon: <CheckCircle2 className="w-5 h-5"/>, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Network Status", value: "SECURE", icon: <Wifi className="w-5 h-5"/>, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-8 slide-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
            CITIZEN TERMINAL <span className="text-accent opacity-50">//</span> {user?.firstName}
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">
            National Emergency Response Platform — Secure Access
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Wifi className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-heading font-bold uppercase tracking-widest">Network Secure</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`glass-card p-5 border ${s.border} relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-110 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-2 relative z-10">
              {s.label}
            </p>
            <p className={`text-4xl font-black font-heading ${s.color} relative z-10`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Complaints List (Now Full Width) */}
      <div className="glass-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
          <h2 className="font-heading font-black text-xl text-white uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> FILED REPORTS
          </h2>
          <a
            href="/citizen/complaints/new"
            className="text-[10px] font-heading font-bold px-3 py-1.5 rounded bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <PenTool className="w-3 h-3" /> INITIALIZE REPORT
          </a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-surface border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-muted">
            <Inbox className="w-12 h-12 opacity-20" />
            <p className="text-xs font-mono uppercase tracking-widest">NO RECORDS FOUND IN DATABASE</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest border-b border-surface-border">
                  <th className="pb-3 font-medium">Designation</th>
                  <th className="pb-3 font-medium">Class</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {complaints.map((c) => (
                  <tr key={c._id} 
                    className="border-b border-surface-border hover:bg-white/5 transition-colors cursor-pointer group" 
                    onClick={() => (window.location.href = `/citizen/complaints/${c._id}`)}
                  >
                    <td className="py-4">
                      <span className="text-white font-medium group-hover:text-accent transition-colors">
                        {c.title}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">
                      {c.type.replace("_", " ")}
                    </td>
                    <td className="py-4">
                      <span className={`${PRIORITY_COLORS[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${STATUS_COLORS[c.status] || "bg-slate-800 text-slate-300 border-slate-700"}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 text-right">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/citizen/complaints/new", icon: <PenTool className="w-6 h-6"/>, label: "FILE REPORT", desc: "Initialize incident record" },
          { href: "/citizen/fir",            icon: <FileSearch className="w-6 h-6"/>, label: "FIR ARCHIVE", desc: "Access official logs" },
          { href: "/citizen/track",          icon: <MapPin className="w-6 h-6"/>, label: "LIVE TRACKING", desc: "Monitor responder units" },
          { href: "/citizen/profile",        icon: <ShieldCheck className="w-6 h-6"/>, label: "SECURITY PROFILE", desc: "Identity & clearance" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="glass-card p-5 border border-surface-border hover:border-accent/50 hover:bg-accent/5 transition-all flex flex-col gap-3 group"
          >
            <div className="text-muted group-hover:text-accent transition-colors">
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
