"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

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
  PENDING:   "#f59e0b",
  ACCEPTED:  "#2d8cf0",
  EN_ROUTE:  "#8b5cf6",
  ON_SCENE:  "#10b981",
  COMPLETED: "#6b7280",
  REJECTED:  "#ef4444",
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444", CRITICAL: "#dc2626",
};

export default function OfficerDashboard() {
  const { user } = useAuthStore();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchDispatches(); }, []);

  const fetchDispatches = async () => {
    try {
      const res = await fetchApi("/dispatch/my-dispatches");
      setDispatches(res.data || []);
    } catch { setDispatches([]); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetchApi(`/dispatch/${id}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await fetchDispatches();
    } catch {}
    finally { setUpdating(null); }
  };

  const active    = dispatches.filter(d => !["COMPLETED","REJECTED"].includes(d.status));
  const completed = dispatches.filter(d => d.status === "COMPLETED");

  const stats = [
    { label: "Active Dispatches", value: active.length,     icon: "🚨", color: "#ef4444" },
    { label: "Completed Today",   value: completed.length,  icon: "✅", color: "#10b981" },
    { label: "Total Assigned",    value: dispatches.length, icon: "📂", color: "#2d8cf0" },
    { label: "Avg ETA",           value: "8 min",           icon: "⏱️", color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-8 slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
            Officer Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--clr-text-secondary)" }}>
            Officer {user?.firstName} {user?.lastName} — Field Operations
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.3)", color: "#60a5fa" }}
        >
          <span className="status-dot online" />
          On Duty
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card stat-card p-5" style={{ borderColor: `${s.color}25` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--clr-text-muted)" }}>{s.label}</p>
                <p className="text-3xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${s.color}15` }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Dispatches */}
      <div className="glass-card p-6">
        <h2 className="text-base font-bold mb-5" style={{ color: "var(--clr-text-primary)" }}>
          🚨 Active Dispatches
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-4xl">✅</span>
            <p className="text-sm font-medium" style={{ color: "var(--clr-text-secondary)" }}>No active dispatches</p>
            <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>All clear — waiting for new assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {active.map((d) => (
              <div
                key={d._id}
                className="rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-5 transition-all"
                style={{
                  background: "rgba(7,20,38,0.7)",
                  border: `1px solid ${STATUS_COLOR[d.status]}30`,
                }}
              >
                {/* Severity indicator */}
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ background: SEVERITY_COLOR[d.incidentId?.severity] || "#2d8cf0" }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="badge"
                      style={{
                        background: `${STATUS_COLOR[d.status]}15`,
                        color: STATUS_COLOR[d.status],
                        border: `1px solid ${STATUS_COLOR[d.status]}30`,
                      }}
                    >
                      {d.status.replace("_", " ")}
                    </span>
                    <span className={`badge badge-${d.incidentId?.severity?.toLowerCase()}`}>
                      {d.incidentId?.severity}
                    </span>
                    <span className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                      #{d._id.slice(-6)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--clr-text-primary)" }}>
                    {d.incidentId?.servicesRequired?.join(", ")} Emergency
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--clr-text-muted)" }}>
                    📍 [{d.incidentId?.location?.coordinates?.[1]?.toFixed(4)}, {d.incidentId?.location?.coordinates?.[0]?.toFixed(4)}]
                    {d.etaMinutes && <span className="ml-3">⏱️ ETA: {d.etaMinutes} min</span>}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {d.status === "PENDING" && (
                    <>
                      <button
                        className="btn-primary text-xs py-1.5 px-4"
                        onClick={() => updateStatus(d._id, "ACCEPTED")}
                        disabled={updating === d._id}
                        style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
                      >
                        ✅ Accept
                      </button>
                      <button
                        className="text-xs py-1.5 px-4 rounded-lg font-semibold transition-all"
                        onClick={() => updateStatus(d._id, "REJECTED")}
                        disabled={updating === d._id}
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {d.status === "ACCEPTED" && (
                    <button
                      className="btn-primary text-xs py-1.5 px-4"
                      onClick={() => updateStatus(d._id, "EN_ROUTE")}
                      disabled={updating === d._id}
                    >
                      🚗 En Route
                    </button>
                  )}
                  {d.status === "EN_ROUTE" && (
                    <button
                      className="btn-primary text-xs py-1.5 px-4"
                      onClick={() => updateStatus(d._id, "ON_SCENE")}
                      disabled={updating === d._id}
                    >
                      📍 On Scene
                    </button>
                  )}
                  {d.status === "ON_SCENE" && (
                    <button
                      className="btn-primary text-xs py-1.5 px-4"
                      onClick={() => updateStatus(d._id, "COMPLETED")}
                      disabled={updating === d._id}
                      style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
                    >
                      ✅ Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/officer/fir",       icon: "📝", label: "Draft FIR",    desc: "Start or continue an FIR" },
          { href: "/officer/map",       icon: "🗺️", label: "Field Map",   desc: "Navigate to incident location" },
          { href: "/officer/cases",     icon: "📂", label: "All Cases",   desc: "Investigation timeline" },
        ].map((l) => (
          <a key={l.href} href={l.href} className="glass-card glass-card-hover p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(45,140,240,0.1)" }}>
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
