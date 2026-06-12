"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export default function OfficerCasesPage() {
  const [firs, setFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyFIRs();
  }, []);

  const fetchMyFIRs = async () => {
    try {
      const res = await fetchApi("/fir/my-firs");
      setFirs(res.data || []);
    } catch (error) {
      console.error("Failed to fetch FIRs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (firId: string, firNumber: string) => {
    try {
      // Direct fetch to handle the binary stream
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/fir/${firId}/export`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `FIR-${firNumber.replace(/\//g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("Failed to download the PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl animate-pulse mb-4">📂</span>
        <p>Loading your cases...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 slide-in">
      {/* Header */}
      <div>
        <a href="/officer/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </a>
        <h1 className="text-2xl font-black mt-3 text-white">
          📂 My Cases (FIRs)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          View and export all the First Information Reports you have drafted.
        </p>
      </div>

      {firs.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4">📝</span>
          <h2 className="text-xl font-bold text-white mb-2">No Cases Found</h2>
          <p className="text-slate-400 max-w-sm">
            You haven't drafted any FIRs yet. Once you draft an FIR using the Smart Drafter, it will appear here.
          </p>
          <a href="/officer/fir" className="mt-6 btn-primary px-6 py-2">
            Draft a New FIR
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firs.map((fir) => (
            <div key={fir._id} className="glass-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    FIR Number
                  </p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {fir.firNumber}
                  </p>
                </div>
                <span
                  className="px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase"
                  style={{
                    background: fir.status === "FINALIZED" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                    color: fir.status === "FINALIZED" ? "#10b981" : "#f59e0b",
                    border: `1px solid ${fir.status === "FINALIZED" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`
                  }}
                >
                  {fir.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400 line-clamp-3">
                  {fir.incidentDetails}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-700/50 flex gap-3">
                <button
                  onClick={() => handleDownloadPDF(fir._id, fir.firNumber)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                >
                  📄 Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
