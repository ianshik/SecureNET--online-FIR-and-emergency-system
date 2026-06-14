"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useSocketStore } from "@/store/socketStore";
import dynamic from "next/dynamic";
import { Activity, ShieldAlert, CheckCircle2, Siren, Plane, Flame, Shield, X, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ControlRoomMap = dynamic(
  () => import("@/components/maps/ControlRoomMap"),
  { ssr: false }
);

interface Incident {
  _id: string;
  severity: string;
  status: string;
  servicesRequired: string[];
  location: { coordinates: [number, number] };
  citizenId: string;
  createdAt: string;
  dispatchedUnits: any[];
}

export default function ControlRoomDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [liveCount, setLiveCount] = useState(0);
  const [isDispatching, setIsDispatching] = useState(false);
  const { connect, socket } = useSocketStore();

  useEffect(() => {
    connect();
    fetchIncidents();
    const timer = setInterval(fetchIncidents, 15000); // poll every 15s
    return () => clearInterval(timer);
  }, []);

  // Listen for real-time SOS events
  useEffect(() => {
    if (!socket) return;
    socket.on("sos:new", () => {
      setLiveCount((n) => n + 1);
      fetchIncidents();
    });
    return () => { socket.off("sos:new"); };
  }, [socket]);

  const fetchIncidents = async () => {
    try {
      const res = await fetchApi("/dispatch/active-incidents");
      setIncidents(res.data || []);
    } catch (err: any) {
      console.error("Failed to load incidents:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (unitType: string) => {
    if (!selected) return;
    setIsDispatching(true);
    try {
      const res = await fetchApi("/dispatch", {
        method: "POST",
        body: JSON.stringify({ incidentId: selected._id, unitType }),
      });

      if (res.success) {
        alert(`${unitType} unit successfully dispatched!`);
        fetchIncidents();
        setSelected((prev) => prev ? { ...prev, status: "UNIT_DISPATCHED", dispatchedUnits: [...(prev.dispatchedUnits || []), res.data._id] } : null);
      } else {
        alert(res.message || `Failed to dispatch ${unitType}`);
      }
    } catch (err: any) {
      alert(`Error dispatching unit: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const filtered = filter === "ALL"
    ? incidents
    : incidents.filter((i) => i.severity === filter);

  const criticalCount = incidents.filter(i => i.severity === "CRITICAL").length;
  const activeCount = incidents.filter(i => i.status !== "RESOLVED").length;

  return (
    <div className="h-screen flex flex-col bg-black text-foreground font-sans">
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Activity className="w-6 h-6 text-accent" />
          <div className="font-heading font-black text-xl uppercase tracking-wider text-white">
            Command Center
          </div>
          <Badge variant="critical" className="ml-2 animate-pulse">
            LIVE SYSTEM
          </Badge>
        </div>
        <div className="flex items-center gap-8">
          {/* KPI pills */}
          {[
            { label: "Active", value: activeCount, class: "text-danger" },
            { label: "Critical", value: criticalCount, class: "text-danger font-black" },
            { label: "Total", value: incidents.length, class: "text-primary" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-2">
              <span className={`font-heading text-2xl ${k.class}`}>{k.value}</span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted">{k.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 rounded border border-success/30 bg-success/10 text-success text-[10px] font-heading font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Operational
          </div>
        </div>
      </div>

      {/* Body: Incidents feed + Detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Incident Feed */}
        <div className="w-[400px] flex flex-col flex-shrink-0 border-r border-surface-border bg-surface/40 backdrop-blur-sm">
          {/* Filter tabs */}
          <div className="flex gap-1 p-4 border-b border-surface-border">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded text-[10px] font-heading font-bold uppercase tracking-widest transition-all ${
                  filter === f 
                    ? f === "CRITICAL" ? "bg-danger text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "bg-accent text-black"
                    : "text-muted hover:bg-surface-hover border border-surface-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Incident Cards */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded border border-surface-border bg-surface animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <CheckCircle2 className="w-12 h-12 text-success" />
                <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted">No active incidents</p>
              </div>
            ) : (
              filtered.map((incident) => {
                const isSelected = selected?._id === incident._id;
                const isCritical = incident.severity === "CRITICAL";
                
                return (
                  <div
                    key={incident._id}
                    onClick={() => setSelected(incident)}
                    className={`rounded p-4 cursor-pointer transition-all border ${
                      isSelected 
                        ? isCritical ? "bg-danger/20 border-danger shadow-[0_0_20px_rgba(220,38,38,0.2)]" : "bg-accent/10 border-accent shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                        : "bg-surface border-surface-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant={incident.severity.toLowerCase() as any}>
                        {isCritical && <ShieldAlert className="w-3 h-3 mr-1" />}
                        {incident.severity}
                      </Badge>
                      <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted">
                        {new Date(incident.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-heading font-bold uppercase tracking-wider text-white mb-2">
                      {incident.servicesRequired.join(" + ")}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-3 font-mono">
                      <Crosshair className="w-3 h-3 text-accent" />
                      {incident.location.coordinates[1].toFixed(4)}°N {incident.location.coordinates[0].toFixed(4)}°E
                    </div>
                    <div className="flex items-center justify-between border-t border-surface-border/50 pt-3">
                      <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-primary">
                        {incident.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted">
                        {incident.dispatchedUnits?.length || 0} UNITS
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right — Map + Detail */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative bg-black">
            <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            <ControlRoomMap incidents={filtered} />
          </div>

          {/* Incident Detail Panel */}
          {selected && (
            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col">
              <div className="glass-card border-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={selected.severity.toLowerCase() as any}>
                        {selected.severity}
                      </Badge>
                      <span className="text-xs font-mono text-muted">ID: {selected._id}</span>
                    </div>
                    <p className="font-heading font-black text-2xl uppercase tracking-wide text-white">
                      {selected.servicesRequired.join(" + ")} EMERGENCY
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded hover:bg-surface-hover text-muted hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-xs mb-6 p-4 rounded bg-black/40 border border-surface-border">
                  <div>
                    <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-1">Status</p>
                    <p className="font-medium text-white">{selected.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-1">Units Active</p>
                    <p className="font-medium text-white">{selected.dispatchedUnits?.length || 0} DEPLOYED</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted mb-1">Time Logged</p>
                    <p className="font-medium font-mono text-white">
                      {new Date(selected.createdAt).toLocaleTimeString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Manual Override Dispatch Buttons */}
                <div>
                  <h3 className="text-[10px] font-heading font-bold text-danger uppercase tracking-widest mb-3">
                    [OVERRIDE] Tactical Dispatch
                  </h3>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleDispatch("POLICE")}
                      disabled={isDispatching || selected.status === "RESOLVED"}
                      variant="outline"
                      className="flex-1 border-primary/50 text-primary hover:bg-primary/20 hover:text-primary"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      DISPATCH POLICE
                    </Button>
                    <Button
                      onClick={() => handleDispatch("MEDICAL")}
                      disabled={isDispatching || selected.status === "RESOLVED"}
                      variant="outline"
                      className="flex-1 border-success/50 text-success hover:bg-success/20 hover:text-success"
                    >
                      <Siren className="w-4 h-4 mr-2" />
                      DISPATCH MEDICS
                    </Button>
                    <Button
                      onClick={() => handleDispatch("FIRE")}
                      disabled={isDispatching || selected.status === "RESOLVED"}
                      variant="outline"
                      className="flex-1 border-orange-500/50 text-orange-500 hover:bg-orange-500/20 hover:text-orange-500"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      DISPATCH FIRE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
