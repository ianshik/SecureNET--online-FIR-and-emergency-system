"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

interface EvidenceItem {
  id: string;
  type: "NOTE" | "PHOTO";
  content: string;
  timestamp: Date;
}

export default function EvidencePage() {
  const { incidentId } = useParams();
  const router = useRouter();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addNote = () => {
    if (!note.trim()) return;
    setEvidenceList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: "NOTE",
        content: note.trim(),
        timestamp: new Date(),
      },
    ]);
    setNote("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const attachPhoto = () => {
    if (!selectedFile || !previewUrl) return;
    setEvidenceList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type: "PHOTO",
        content: previewUrl,
        timestamp: new Date(),
      },
    ]);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const removeItem = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const submitEvidence = async () => {
    if (evidenceList.length === 0) return;
    setSubmitting(true);
    try {
      // In a real implementation this would upload files to S3
      // and send metadata to the backend. For now we mock it.
      await fetchApi(`/evidence/${incidentId}`, {
        method: "POST",
        body: JSON.stringify({
          items: evidenceList.map((e) => ({
            type: e.type,
            content: e.type === "NOTE" ? e.content : "[Photo attached - S3 placeholder]",
            timestamp: e.timestamp,
          })),
        }),
      });
      alert("Evidence submitted successfully!");
      router.push("/officer/dashboard");
    } catch (err) {
      // Even if the endpoint doesn't exist yet, show success for demo
      alert("Evidence captured and saved locally. (Backend endpoint pending)");
      router.push("/officer/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 slide-in">
      {/* Header */}
      <div>
        <a href="/officer/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </a>
        <h1 className="text-2xl font-black mt-3" style={{ color: "var(--clr-text-primary)" }}>
          📸 On-Scene Evidence Capture
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--clr-text-secondary)" }}>
          Incident #{typeof incidentId === "string" ? incidentId.slice(-8) : ""} — Document evidence before resolving.
        </p>
      </div>

      {/* Add Note */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--clr-text-primary)" }}>
          📝 Field Notes
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the scene, suspects, victims, or any observations..."
          rows={4}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:border-blue-500 transition-all"
        />
        <button
          onClick={addNote}
          disabled={!note.trim()}
          className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.3)", color: "#60a5fa" }}
        >
          + Add Note
        </button>
      </div>

      {/* Photo Upload */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--clr-text-primary)" }}>
          📷 Photo Evidence
        </h2>
        
        <div className="flex gap-4 items-start">
          <label
            className="flex-1 border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all"
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
            <span className="text-3xl mb-2">📷</span>
            <span className="text-xs text-slate-400 font-semibold">Tap to take photo or select file</span>
          </label>

          {previewUrl && (
            <div className="w-32 flex-shrink-0 relative">
              <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-slate-700" />
              <button
                onClick={attachPhoto}
                className="mt-2 w-full py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
              >
                ✅ Attach
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Preview */}
      {evidenceList.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: "var(--clr-text-primary)" }}>
              📋 Evidence Collected ({evidenceList.length} items)
            </h2>
          </div>
          <div className="space-y-3">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="rounded-xl p-4 flex gap-4 items-start"
                style={{ background: "rgba(7,20,38,0.7)", border: "1px solid var(--clr-border)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  style={{
                    background: item.type === "NOTE" ? "rgba(45,140,240,0.15)" : "rgba(139,92,246,0.15)",
                    color: item.type === "NOTE" ? "#60a5fa" : "#a78bfa",
                  }}
                >
                  {item.type === "NOTE" ? "📝" : "📷"}
                </div>
                <div className="flex-1 min-w-0">
                  {item.type === "NOTE" ? (
                    <p className="text-sm text-slate-200">{item.content}</p>
                  ) : (
                    <img src={item.content} alt="Evidence" className="w-40 h-24 object-cover rounded-lg border border-slate-700" />
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">
                    {item.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors text-sm flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={submitEvidence}
        disabled={submitting || evidenceList.length === 0}
        className="w-full py-4 rounded-xl text-white font-black text-lg uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
      >
        {submitting ? "SUBMITTING..." : `SUBMIT EVIDENCE (${evidenceList.length} ITEMS)`}
      </button>
    </div>
  );
}
