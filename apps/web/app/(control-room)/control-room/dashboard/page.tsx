"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { useSocketStore } from "@/store/socketStore";
import dynamic from "next/dynamic";

const ControlRoomMap = dynamic(
  () => import("@/components/maps/ControlRoomMap"),
  {
    ssr: false,
  }
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

const SEV_COLOR: Record<string, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

const SEV_BG: Record<string, string> = {
  LOW: "rgba(16,185,129,0.12)",
  MEDIUM: "rgba(245,158,11,0.12)",
  HIGH: "rgba(239,68,68,0.12)",
  CRITICAL: "rgba(220,38,38,0.15)",
};

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
    } catch (err) {
      console.error("Failed to load incidents", err);
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
        body: JSON.stringify({
          incidentId: selected._id,
          unitType,
        }),
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
    <div className="h-screen flex flex-col gap-0" style={{ background: "var(--clr-bg-primary)" }}>
      {/* Top bar */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid var(--clr-border)", background: "rgba(7,20,38,0.9)" }}
      >
        <div className="flex items-center gap-3">
          <div className="text-lg font-black" style={{ color: "var(--clr-text-primary)" }}>
            🖥️ Command Center
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* KPI pills */}
          {[
            { label: "Active", value: activeCount, color: "#ef4444" },
            { label: "Critical", value: criticalCount, color: "#dc2626" },
            { label: "Total", value: incidents.length, color: "#2d8cf0" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-1.5 text-sm">
              <span className="font-black text-lg" style={{ color: k.color }}>{k.value}</span>
              <span style={{ color: "var(--clr-text-muted)" }}>{k.label}</span>
            </div>
          ))}
          <div
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
          >
            <span className="status-dot online" />
            System Operational
          </div>
        </div>
      </div>

      {/* Body: Incidents feed + Detail panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Incident Feed */}
        <div
          className="w-96 flex flex-col flex-shrink-0 overflow-y-auto"
          style={{ borderRight: "1px solid var(--clr-border)", background: "rgba(7,20,38,0.5)" }}
        >
          {/* Filter tabs */}
          <div className="flex gap-1 p-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--clr-border)" }}>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filter === f ? (SEV_BG[f] || "rgba(45,140,240,0.15)") : "transparent",
                  color: filter === f ? (SEV_COLOR[f] || "#60a5fa") : "var(--clr-text-muted)",
                  border: filter === f ? `1px solid ${SEV_COLOR[f] || "var(--clr-accent)"}30` : "1px solid transparent",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Incident Cards */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <span className="text-3xl">✅</span>
                <p className="text-sm" style={{ color: "var(--clr-text-secondary)" }}>No active incidents</p>
              </div>
            ) : (
              filtered.map((incident) => (
                <div
                  key={incident._id}
                  onClick={() => setSelected(incident)}
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    background: selected?._id === incident._id
                      ? SEV_BG[incident.severity]
                      : "rgba(11,29,51,0.5)",
                    border: `1px solid ${selected?._id === incident._id ? SEV_COLOR[incident.severity] + "40" : "var(--clr-border)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: SEV_BG[incident.severity],
                        color: SEV_COLOR[incident.severity],
                        border: `1px solid ${SEV_COLOR[incident.severity]}35`,
                      }}
                    >
                      {incident.severity === "CRITICAL" && "⚠️ "}
                      {incident.severity}
                    </div>
                    <span className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                      {new Date(incident.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--clr-text-primary)" }}>
                    {incident.servicesRequired.join(" + ")} Emergency
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--clr-text-muted)" }}>
                    📍 {incident.location.coordinates[1].toFixed(4)}°N {incident.location.coordinates[0].toFixed(4)}°E
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(45,140,240,0.1)", color: "#60a5fa" }}
                    >
                      {incident.status.replace("_", " ")}
                    </span>
                    <span className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                      {incident.dispatchedUnits?.length || 0} units
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Map + Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <ControlRoomMap incidents={filtered} />
          </div>

          {/* Incident Detail Panel */}
          {selected && (
            <div
              className="flex-shrink-0 p-5"
              style={{ borderTop: "1px solid var(--clr-border)", background: "rgba(7,20,38,0.8)", maxHeight: "220px" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded-full"
                      style={{ background: SEV_BG[selected.severity], color: SEV_COLOR[selected.severity], border: `1px solid ${SEV_COLOR[selected.severity]}30` }}
                    >
                      {selected.severity}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--clr-text-muted)" }}>#{selected._id.slice(-8)}</span>
                  </div>
                  <p className="text-base font-bold mt-1" style={{ color: "var(--clr-text-primary)" }}>
                    {selected.servicesRequired.join(" + ")} Emergency
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-lg"
                  style={{ color: "var(--clr-text-muted)" }}
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p style={{ color: "var(--clr-text-muted)" }}>Status</p>
                  <p className="font-semibold mt-0.5" style={{ color: "var(--clr-text-primary)" }}>{selected.status.replace("_", " ")}</p>
                </div>
                <div>
                  <p style={{ color: "var(--clr-text-muted)" }}>Units Dispatched</p>
                  <p className="font-semibold mt-0.5" style={{ color: "var(--clr-text-primary)" }}>{selected.dispatchedUnits?.length || 0}</p>
                </div>
                <div>
                  <p style={{ color: "var(--clr-text-muted)" }}>Reported</p>
                  <p className="font-semibold mt-0.5" style={{ color: "var(--clr-text-primary)" }}>
                    {new Date(selected.createdAt).toLocaleTimeString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Manual Override Dispatch Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Manual Override</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDispatch("POLICE")}
                    disabled={isDispatching || selected.status === "RESOLVED"}
                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 border border-blue-500/30 text-blue-400 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    🚓 Dispatch Police
                  </button>
                  <button
                    onClick={() => handleDispatch("MEDICAL")}
                    disabled={isDispatching || selected.status === "RESOLVED"}
                    className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-50 border border-emerald-500/30 text-emerald-400 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    🚑 Dispatch Medics
                  </button>
                  <button
                    onClick={() => handleDispatch("FIRE")}
                    disabled={isDispatching || selected.status === "RESOLVED"}
                    className="flex-1 bg-orange-600/20 hover:bg-orange-600/30 disabled:opacity-50 border border-orange-500/30 text-orange-400 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    🚒 Dispatch Fire
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
