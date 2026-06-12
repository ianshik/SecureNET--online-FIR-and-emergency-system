"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface AuditLogEntry {
  _id: string;
  action: string;
  actor: { firstName: string; lastName: string; role: string };
  target: string;
  details: any;
  ipAddress: string;
  timestamp: string;
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  LOGIN: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa" }, // Blue
  FIR_CREATED: { bg: "rgba(139,92,246,0.1)", text: "#a78bfa" }, // Purple
  INCIDENT_DISPATCHED: { bg: "rgba(245,158,11,0.1)", text: "#fbbf24" }, // Amber
  STATUS_UPDATED: { bg: "rgba(16,185,129,0.1)", text: "#34d399" }, // Emerald
  EVIDENCE_DOWNLOADED: { bg: "rgba(236,72,153,0.1)", text: "#f472b6" }, // Pink
  SECURITY_ALERT: { bg: "rgba(239,68,68,0.15)", text: "#f87171" }, // Red
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetchApi("/analytics/audit-logs");
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === "ALL" ? logs : logs.filter(l => l.action === filter);

  return (
    <div className="space-y-6 slide-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
            System Audit Logs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--clr-text-secondary)" }}>
            Immutable record of all platform activities and security events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500 transition-all"
          >
            <option value="ALL">All Actions</option>
            {Object.keys(ACTION_COLORS).map(action => (
              <option key={action} value={action}>{action.replace("_", " ")}</option>
            ))}
          </select>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.25)", color: "#60a5fa" }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse bg-slate-800/50" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <span className="text-4xl mb-3">📭</span>
            <p className="font-semibold">No audit logs found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-4 px-6 font-medium">Timestamp</th>
                  <th className="py-4 px-6 font-medium">Actor</th>
                  <th className="py-4 px-6 font-medium">Action</th>
                  <th className="py-4 px-6 font-medium">Target / Details</th>
                  <th className="py-4 px-6 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const color = ACTION_COLORS[log.action] || { bg: "rgba(100,116,139,0.1)", text: "#94a3b8" };
                  return (
                    <tr key={log._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="text-slate-300 font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString("en-IN", { 
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" 
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="font-medium text-slate-200 block">
                          {log.actor?.firstName} {log.actor?.lastName}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{log.actor?.role}</span>
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 rounded text-[10px] font-bold border"
                          style={{
                            background: color.bg,
                            color: color.text,
                            borderColor: `${color.text}30`,
                          }}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-slate-300 block truncate max-w-xs" title={log.target}>
                          {log.target || "System"}
                        </span>
                        {log.details && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs mt-0.5" title={JSON.stringify(log.details)}>
                            {JSON.stringify(log.details)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <span className="text-xs text-slate-400 font-mono">{log.ipAddress}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
