"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle2, Clock, Folder, MapPin,
  Navigation, Camera, X, Check, FileText, Wifi, Crosshair
} from "lucide-react";

interface Dispatch {
  _id: string;
  status: string;
  etaMinutes?: number;
  unitType: string;
  incidentId: {
    _id: string;
    severity: string;
    status: string;
    location: { coordinates: [number, number] };
    servicesRequired: string[];
  };
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  ACCEPTED: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  EN_ROUTE: "text-purple-500 border-purple-500/30 bg-purple-500/10",
  ON_SCENE: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  COMPLETED: "text-slate-500 border-slate-500/30 bg-slate-500/10",
  REJECTED: "text-red-500 border-red-500/30 bg-red-500/10",
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "text-emerald-500", MEDIUM: "text-amber-500", HIGH: "text-orange-500", CRITICAL: "text-red-500",
};
const SEVERITY_HEX: Record<string, string> = {
  LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444",
};

export default function OfficerDashboard() {
  const { user } = useAuthStore();
  const { connect, socket, isConnected } = useSocketStore();
  const router = useRouter();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<Dispatch | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) connect();
    fetchDispatches();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on("dispatch:new", (data: any) => {
      setIncomingAlert(data);
      fetchDispatches();
    });
    return () => { socket.off("dispatch:new"); };
  }, [socket, isConnected]);

  const fetchDispatches = async () => {
    try {
      const res = await fetchApi("/dispatch/my-dispatches");
      setDispatches(res.data || []);
    } catch { setDispatches([]); }
    finally { setLoading(false); }
  };

  const updateStatus = useCallback(async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetchApi(`/dispatch/${id}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setIncomingAlert(null);
      await fetchDispatches();
      if (status === "EN_ROUTE") router.push("/officer/map");
    } catch (err: any) { 
      console.error(err);
      alert(`Failed to update status: ${err.message || 'Unknown error'}`);
    }
    finally { setUpdating(null); }
  }, [router]);

  const active = dispatches.filter(d => !["COMPLETED", "REJECTED"].includes(d.status));
  const completed = dispatches.filter(d => d.status === "COMPLETED");

  const stats = [
    { label: "Active Dispatches", value: active.length, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Completed Today", value: completed.length, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Total Assigned", value: dispatches.length, icon: <Folder className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Avg ETA", value: "8 min", icon: <Clock className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <>
      {/* ═══════════ INCOMING DISPATCH ALERT OVERLAY ═══════════ */}
      {incomingAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 animate-bounce-in">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl opacity-40 animate-ping"
                style={{ background: SEVERITY_HEX[incomingAlert.incidentId?.severity] || "#ef4444" }} />

              <div className="relative bg-[#050505] border-2 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                style={{ borderColor: SEVERITY_HEX[incomingAlert.incidentId?.severity] || "#ef4444" }}>

                <div className="p-8 text-center flex flex-col items-center border-b border-surface-border"
                  style={{ background: `${SEVERITY_HEX[incomingAlert.incidentId?.severity] || "#ef4444"}15` }}>
                  <AlertTriangle className="w-16 h-16 mb-4 animate-pulse" style={{ color: SEVERITY_HEX[incomingAlert.incidentId?.severity] || "#ef4444" }} />
                  <h2 className="text-3xl font-heading font-black text-white uppercase tracking-widest leading-none">
                    INCOMING DISPATCH
                  </h2>
                  <p className="text-xs font-mono mt-2 uppercase tracking-widest" style={{ color: SEVERITY_HEX[incomingAlert.incidentId?.severity] }}>
                    {incomingAlert.incidentId?.severity} PRIORITY
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] text-muted uppercase font-heading font-bold tracking-widest">Required Units</p>
                      <p className="text-sm font-bold text-white mt-1 uppercase tracking-widest">
                        {incomingAlert.incidentId?.servicesRequired?.join(", ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase font-heading font-bold tracking-widest">Est. Time</p>
                      <p className="text-sm font-bold text-white mt-1 uppercase tracking-widest">
                        {incomingAlert.etaMinutes || "--"} MIN
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted uppercase font-heading font-bold tracking-widest">GPS Coordinates</p>
                      <p className="text-sm text-slate-300 mt-1 font-mono tracking-widest flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        {incomingAlert.incidentId?.location?.coordinates?.[1]?.toFixed(4)}°N, {incomingAlert.incidentId?.location?.coordinates?.[0]?.toFixed(4)}°E
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => incomingAlert && updateStatus(incomingAlert._id, "ACCEPTED")}
                      disabled={updating === incomingAlert._id}
                      className="flex-1 py-4 flex items-center justify-center gap-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-lg uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    >
                      <Check className="w-5 h-5" /> ACCEPT
                    </button>
                    <button
                      onClick={() => incomingAlert && updateStatus(incomingAlert._id, "REJECTED")}
                      disabled={updating === incomingAlert._id}
                      className="flex-1 py-4 flex items-center justify-center gap-2 rounded font-heading font-black text-lg uppercase tracking-widest transition-all active:scale-95 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20"
                    >
                      <X className="w-5 h-5" /> REJECT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MAIN DASHBOARD ═══════════ */}
      <div className="space-y-8 slide-in max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
              UNIT COMMAND <span className="text-accent opacity-50">//</span> {user?.lastName}
            </h1>
            <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">
              Field Operations Interface — Terminal Active
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest">
              {isConnected ? "NETWORK SECURE : ON DUTY" : "OFFLINE"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
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

        <div className="glass-card p-6 flex flex-col">
          <h2 className="font-heading font-black text-xl text-white uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-surface-border">
            <AlertTriangle className="w-5 h-5 text-accent" /> ACTIVE DISPATCH TACTICAL FEED
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded bg-surface border border-surface-border animate-pulse" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-muted">
              <CheckCircle2 className="w-12 h-12 opacity-20 text-emerald-500" />
              <p className="text-xs font-mono uppercase tracking-widest">NO ACTIVE DISPATCHES</p>
              <p className="text-[10px] font-heading font-bold text-emerald-500 tracking-widest uppercase">ALL CLEAR — STANDING BY</p>
            </div>
          ) : (
            <div className="space-y-4">
              {active.map((d) => (
                <div
                  key={d._id}
                  className="rounded p-5 flex flex-col md:flex-row md:items-center gap-5 transition-all bg-black/40 border border-surface-border hover:border-accent/30 group"
                >
                  <div className="w-1 self-stretch rounded flex-shrink-0"
                    style={{ background: SEVERITY_HEX[d.incidentId?.severity] || "#2d8cf0", boxShadow: `0 0 10px ${SEVERITY_HEX[d.incidentId?.severity] || "#2d8cf0"}` }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-widest border ${STATUS_COLOR[d.status]}`}>
                        {d.status.replace("_", " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-widest border border-slate-700 bg-slate-800 ${SEVERITY_COLOR[d.incidentId?.severity]}`}>
                        {d.incidentId?.severity}
                      </span>
                      <span className="text-[10px] font-mono text-muted uppercase">ID: {d._id.slice(-6)}</span>
                    </div>
                    <p className="text-base font-heading font-bold text-white uppercase tracking-widest">
                      {d.incidentId?.servicesRequired?.join(", ")} EMERGENCY PROTOCOL
                    </p>
                    <p className="text-xs mt-1 text-slate-400 font-mono flex items-center gap-4">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" /> [{d.incidentId?.location?.coordinates?.[1]?.toFixed(4)}, {d.incidentId?.location?.coordinates?.[0]?.toFixed(4)}]</span>
                      {d.etaMinutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-purple-400" /> ETA: {d.etaMinutes} MIN</span>}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {d.status === "PENDING" && (
                      <>
                        <button className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors" onClick={() => updateStatus(d._id, "ACCEPTED")} disabled={updating === d._id}>
                          <Check className="w-3 h-3" /> ACCEPT
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-colors" onClick={() => updateStatus(d._id, "REJECTED")} disabled={updating === d._id}>
                          <X className="w-3 h-3" /> REJECT
                        </button>
                      </>
                    )}
                    {d.status === "ACCEPTED" && (
                      <button className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => updateStatus(d._id, "EN_ROUTE")} disabled={updating === d._id}>
                        <Navigation className="w-3 h-3" /> EN ROUTE
                      </button>
                    )}
                    {d.status === "EN_ROUTE" && (
                      <>
                        <a href="/officer/map" className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors">
                          <MapPin className="w-3 h-3" /> OPEN MAP
                        </a>
                        <button className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors" onClick={() => updateStatus(d._id, "ON_SCENE")} disabled={updating === d._id}>
                          <Crosshair className="w-3 h-3" /> ON SCENE
                        </button>
                      </>
                    )}
                    {d.status === "ON_SCENE" && (
                      <>
                        <a href={`/officer/evidence/${d.incidentId?._id}`} className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors">
                          <Camera className="w-3 h-3" /> 
                          {user?.officerType === "AMBULANCE" ? "MEDICAL REPORT" : user?.officerType === "FIRE" ? "DAMAGE REPORT" : "EVIDENCE"}
                        </a>
                        <button className="flex items-center gap-2 text-[10px] font-heading font-bold uppercase tracking-widest py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors" onClick={() => updateStatus(d._id, "COMPLETED")} disabled={updating === d._id}>
                          <CheckCircle2 className="w-3 h-3" /> COMPLETE
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { href: "/officer/fir", icon: <FileText className="w-6 h-6" />, label: "DRAFT FIR", desc: "Initiate official report", show: user?.officerType === "POLICE" },
            { href: "/officer/map", icon: <Navigation className="w-6 h-6" />, label: "TACTICAL MAP", desc: "Live navigation interface", show: true },
            { href: "/officer/cases", icon: <Folder className="w-6 h-6" />, label: "CASE ARCHIVE", desc: "Historical investigation logs", show: true },
          ].filter(l => l.show).map((l) => (
            <a key={l.href} href={l.href} className="glass-card p-5 border border-surface-border hover:border-accent/50 hover:bg-accent/5 transition-all flex flex-col gap-3 group">
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

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.4s ease-out; }
      `}} />
    </>
  );
}
