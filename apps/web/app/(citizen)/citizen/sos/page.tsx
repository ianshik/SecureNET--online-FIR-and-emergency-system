"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useSocketStore } from "@/store/socketStore";
import { 
  AlertTriangle, ShieldAlert, Activity, Flame, Wifi, Radio
} from "lucide-react";

export default function SOSPage() {
  const { socket } = useSocketStore();
  const [sosLoading, setSosLoading] = useState(false);
  const [sosServices, setSosServices] = useState<string[]>([]);
  const [sosMsg, setSosMsg] = useState("");
  const [sosIncident, setSosIncident] = useState<any>(null);

  const toggleService = (svc: string) => {
    setSosServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const triggerSOS = async () => {
    if (sosServices.length === 0) {
      setSosMsg("ERROR: SELECT EMERGENCY VECTOR.");
      return;
    }
    setSosLoading(true);
    setSosMsg("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const res = await fetchApi("/sos/trigger", {
        method: "POST",
        body: JSON.stringify({
          coordinates: [pos.coords.longitude, pos.coords.latitude],
          servicesRequired: sosServices,
        }),
      });
      setSosIncident(res.data);
      setSosMsg("TRANSMISSION SUCCESS: RESPONDERS DISPATCHED.");
      socket?.emit("join_incident_room", res.data._id);
    } catch (err: any) {
      setSosMsg(err.message?.toUpperCase() || "TRANSMISSION FAILED. RETRY.");
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <div className="space-y-8 slide-in max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="glass-card p-10 flex flex-col items-center gap-8 border-red-500/30 relative overflow-hidden bg-gradient-to-b from-transparent to-red-950/20 w-full max-w-2xl shadow-[0_0_50px_rgba(220,38,38,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
        
        <div className="text-center w-full">
          <h2 className="font-heading font-black text-3xl text-red-500 uppercase tracking-widest flex items-center justify-center gap-3">
            <AlertTriangle className="w-8 h-8" /> EMERGENCY OVERRIDE
          </h2>
          <p className="text-xs font-mono text-muted uppercase mt-3 tracking-widest">
            Engage for immediate dispatch sequence
          </p>
        </div>

        {/* SOS Button */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75" />
          <div className="absolute inset-0 rounded-full border border-red-500/50 scale-125 animate-pulse" />
          <button
            className="relative z-10 w-40 h-40 rounded-full bg-red-600 hover:bg-red-500 border-8 border-red-900 shadow-[0_0_60px_rgba(220,38,38,0.6)] flex flex-col items-center justify-center text-white transition-all active:scale-95 disabled:opacity-50"
            onClick={triggerSOS}
            disabled={sosLoading}
          >
            <Radio className={`w-12 h-12 mb-2 ${sosLoading ? 'animate-spin' : 'animate-pulse'}`} />
            <span className="font-heading font-black text-3xl tracking-widest uppercase">
              {sosLoading ? "INIT..." : "SOS"}
            </span>
          </button>
        </div>

        {/* Service selector */}
        <div className="w-full space-y-4">
          <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted text-center border-b border-surface-border pb-3">
            Select Dispatch Vectors
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "POLICE",    icon: <ShieldAlert className="w-6 h-6 mb-2" />, label: "POLICE" },
              { id: "AMBULANCE", icon: <Activity className="w-6 h-6 mb-2" />, label: "MEDICAL" },
              { id: "FIRE",      icon: <Flame className="w-6 h-6 mb-2" />, label: "FIRE" },
            ].map((svc) => {
              const active = sosServices.includes(svc.id);
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleService(svc.id)}
                  className={`flex flex-col items-center py-4 rounded text-xs font-heading font-bold tracking-widest transition-all
                    ${active 
                      ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)] scale-105" 
                      : "bg-surface border-surface-border text-muted hover:border-red-500/30 hover:text-white"
                    } border`}
                >
                  {svc.icon}
                  {svc.label}
                </button>
              );
            })}
          </div>
        </div>

        {sosMsg && (
          <div className={`w-full px-5 py-4 rounded text-xs font-mono uppercase tracking-widest text-center border
              ${sosMsg.includes("SUCCESS") || sosMsg.includes("✅")
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-red-500/10 border-red-500/30 text-red-400"}`}
          >
            {sosMsg}
          </div>
        )}

        {sosIncident && (
          <div className="w-full bg-black/60 border border-surface-border rounded-lg p-5 text-sm font-mono space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase pb-3 border-b border-surface-border">
              <Wifi className="w-5 h-5" /> SECURE LINK ESTABLISHED
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">INCIDENT_ID</span>
              <span className="text-slate-300 font-bold">{sosIncident._id?.slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">STATUS</span>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold">
                {sosIncident.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
