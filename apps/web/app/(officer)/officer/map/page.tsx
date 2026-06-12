"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useSocketStore } from "@/store/socketStore";
import LiveMap from "@/components/maps/LiveMap";

interface Dispatch {
  _id: string;
  status: string;
  etaMinutes?: number;
  incidentId: {
    _id: string;
    severity: string;
    status: string;
    location: { coordinates: [number, number] };
    servicesRequired: string[];
  };
}

export default function OfficerFieldMap() {
  const [activeDispatch, setActiveDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(true);
  const { connect } = useSocketStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) connect(token);
    fetchActiveDispatch();
  }, []);

  const fetchActiveDispatch = async () => {
    try {
      const res = await fetchApi("/dispatch/my-dispatches");
      const dispatches = res.data || [];
      // Find the first active dispatch (ACCEPTED or EN_ROUTE)
      const active = dispatches.find(
        (d: Dispatch) => d.status === "ACCEPTED" || d.status === "EN_ROUTE" || d.status === "ON_SCENE"
      );
      setActiveDispatch(active || null);
    } catch {
      setActiveDispatch(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!activeDispatch) return;
    try {
      await fetchApi(`/dispatch/${activeDispatch._id}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      fetchActiveDispatch();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <span className="text-4xl block mb-3">🗺️</span>
          <p className="text-slate-400 font-semibold">Loading Field Map...</p>
        </div>
      </div>
    );
  }

  if (!activeDispatch) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">✅</span>
          <h2 className="text-xl font-black text-white mb-2">No Active Assignment</h2>
          <p className="text-sm text-slate-400 mb-6">You don't have any active dispatches requiring navigation.</p>
          <a
            href="/officer/dashboard"
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.3)", color: "#60a5fa" }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const incident = activeDispatch.incidentId;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col -m-4 slide-in">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: "rgba(7,20,38,0.9)", borderBottom: "1px solid var(--clr-border)" }}
      >
        <div className="flex items-center gap-3">
          <a href="/officer/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Back
          </a>
          <div className="w-px h-5 bg-slate-700" />
          <h1 className="text-base font-black text-white">Field Navigation</h1>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            style={{
              background: incident.severity === "CRITICAL" ? "rgba(220,38,38,0.15)" : "rgba(239,68,68,0.15)",
              color: incident.severity === "CRITICAL" ? "#dc2626" : "#f87171",
              border: `1px solid ${incident.severity === "CRITICAL" ? "rgba(220,38,38,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            {incident.severity}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {incident.servicesRequired.join(" + ")} | ETA: {activeDispatch.etaMinutes || "--"} min
          </span>
          {activeDispatch.status === "ACCEPTED" && (
            <button
              onClick={() => updateStatus("EN_ROUTE")}
              className="btn-primary text-xs py-1.5 px-4"
            >
              🚗 Go En Route
            </button>
          )}
          {activeDispatch.status === "EN_ROUTE" && (
            <button
              onClick={() => updateStatus("ON_SCENE")}
              className="btn-primary text-xs py-1.5 px-4"
            >
              📍 Arrived On Scene
            </button>
          )}
          {activeDispatch.status === "ON_SCENE" && (
            <div className="flex gap-2">
              <a
                href={`/officer/evidence/${incident._id}`}
                className="text-xs py-1.5 px-4 rounded-lg font-semibold transition-all"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
              >
                📸 Evidence
              </a>
              <button
                onClick={() => updateStatus("COMPLETED")}
                className="btn-primary text-xs py-1.5 px-4"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
              >
                ✅ Resolve
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <LiveMap
          incidentId={incident._id}
          initialLocation={incident.location.coordinates}
          role="OFFICER"
        />

        {/* Floating Info Card */}
        <div
          className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 rounded-2xl p-5 shadow-2xl z-[1000]"
          style={{ background: "rgba(7,20,38,0.95)", border: "1px solid var(--clr-border)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {activeDispatch.status.replace("_", " ")}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {incident.servicesRequired.join(" + ")} Emergency
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            📍 {incident.location.coordinates[1].toFixed(5)}°N, {incident.location.coordinates[0].toFixed(5)}°E
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Your GPS location is being shared with the citizen and control room in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
