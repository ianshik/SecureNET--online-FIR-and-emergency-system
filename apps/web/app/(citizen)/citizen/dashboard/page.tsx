"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";

interface Complaint {
  _id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED:    "badge-medium",
  UNDER_REVIEW: "badge-medium",
  ASSIGNED:     "badge-high",
  IN_PROGRESS:  "badge-high",
  RESOLVED:     "badge-low",
  CLOSED:       "badge-low",
  REJECTED:     "badge-critical",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW:      "badge-low",
  MEDIUM:   "badge-medium",
  HIGH:     "badge-high",
  CRITICAL: "badge-critical",
};

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const { connect, socket } = useSocketStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosServices, setSosServices] = useState<string[]>([]);
  const [sosMsg, setSosMsg] = useState("");
  const [sosIncident, setSosIncident] = useState<any>(null);

  useEffect(() => {
    connect();
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

  const toggleService = (svc: string) => {
    setSosServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const triggerSOS = async () => {
    if (sosServices.length === 0) {
      setSosMsg("Please select at least one service.");
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
      setSosMsg("✅ SOS sent! Responders are on their way.");
      socket?.emit("join_incident_room", res.data._id);
    } catch (err: any) {
      setSosMsg(err.message || "Failed to send SOS. Please try again.");
    } finally {
      setSosLoading(false);
    }
  };

  const statCards = [
    { label: "Total Complaints", value: complaints.length, icon: "📋", color: "#2d8cf0" },
    { label: "Pending", value: complaints.filter(c => !["RESOLVED","CLOSED"].includes(c.status)).length, icon: "⏳", color: "#f59e0b" },
    { label: "Resolved", value: complaints.filter(c => c.status === "RESOLVED").length, icon: "✅", color: "#10b981" },
    { label: "Active SOS", value: sosIncident ? 1 : 0, icon: "🚨", color: "#ef4444" },
  ];

  return (
    <div className="space-y-8 slide-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
            Good day, {user?.firstName} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--clr-text-secondary)" }}>
            Your safety dashboard — SecureNet NP-SERP
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
        >
          <span className="status-dot online" />
          Connected to SecureNet
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="glass-card stat-card p-5"
            style={{ borderColor: `${s.color}25` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--clr-text-muted)" }}>
                  {s.label}
                </p>
                <p className="text-3xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${s.color}15` }}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOS Panel */}
        <div className="glass-card p-6 flex flex-col items-center gap-5" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="text-center">
            <h2 className="text-base font-bold" style={{ color: "var(--clr-text-primary)" }}>
              Emergency SOS
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--clr-text-secondary)" }}>
              Tap to summon help immediately
            </p>
          </div>

          {/* SOS Button with pulse */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)",
                animation: "pulse-ring 2.5s ease-out infinite",
              }}
            />
            <button
              className="btn-sos pulse-ring relative z-10"
              onClick={triggerSOS}
              disabled={sosLoading}
              style={{ width: 88, height: 88, fontSize: "0.85rem" }}
            >
              {sosLoading ? "..." : "SOS"}
            </button>
          </div>

          {/* Service selector */}
          <div className="w-full space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-center" style={{ color: "var(--clr-text-muted)" }}>
              Select Services
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "POLICE",    icon: "👮", label: "Police" },
                { id: "AMBULANCE", icon: "🚑", label: "Ambulance" },
                { id: "FIRE",      icon: "🚒", label: "Fire" },
              ].map((svc) => {
                const active = sosServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: active ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? "rgba(239,68,68,0.4)" : "var(--clr-border)"}`,
                      color: active ? "#f87171" : "var(--clr-text-secondary)",
                    }}
                  >
                    <span className="text-xl">{svc.icon}</span>
                    {svc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {sosMsg && (
            <div
              className="w-full px-3 py-2.5 rounded-lg text-xs font-medium text-center"
              style={{
                background: sosMsg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${sosMsg.startsWith("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: sosMsg.startsWith("✅") ? "#34d399" : "#f87171",
              }}
            >
              {sosMsg}
            </div>
          )}

          {sosIncident && (
            <div className="w-full rounded-xl p-4 text-xs space-y-1.5" style={{ background: "rgba(7,20,38,0.8)", border: "1px solid var(--clr-border)" }}>
              <div className="font-bold text-sm" style={{ color: "#34d399" }}>SOS Acknowledged</div>
              <div className="flex justify-between"><span style={{ color: "var(--clr-text-muted)" }}>Incident ID</span><span style={{ color: "var(--clr-text-secondary)" }}>{sosIncident._id?.slice(-8)}</span></div>
              <div className="flex justify-between"><span style={{ color: "var(--clr-text-muted)" }}>Status</span><span className="badge badge-high">{sosIncident.status}</span></div>
            </div>
          )}
        </div>

        {/* Complaints List */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold" style={{ color: "var(--clr-text-primary)" }}>
              My Complaints
            </h2>
            <a
              href="/citizen/complaints/new"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.25)", color: "#60a5fa" }}
            >
              + File New
            </a>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-medium" style={{ color: "var(--clr-text-secondary)" }}>No complaints filed yet</p>
              <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>Your complaint history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id} className="cursor-pointer" onClick={() => (window.location.href = `/citizen/complaints/${c._id}`)}>
                      <td>
                        <span className="font-medium" style={{ color: "var(--clr-text-primary)" }}>
                          {c.title}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                          {c.type.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[c.status] || "badge-medium"}`}>
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/citizen/complaints/new", icon: "📝", label: "File Complaint", desc: "New civil/criminal report" },
          { href: "/citizen/fir",            icon: "📄", label: "FIR Status",    desc: "Track your FIRs" },
          { href: "/citizen/track",          icon: "📍", label: "Live Track",   desc: "Active responder location" },
          { href: "/citizen/profile",        icon: "🔐", label: "My Profile",   desc: "Verification & settings" },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="glass-card glass-card-hover p-4 flex flex-col gap-2"
          >
            <span className="text-2xl">{l.icon}</span>
            <div className="text-sm font-bold" style={{ color: "var(--clr-text-primary)" }}>{l.label}</div>
            <div className="text-xs" style={{ color: "var(--clr-text-muted)" }}>{l.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
