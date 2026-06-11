"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

const COMPLAINT_TYPES = [
  { id: "CIVIL",             icon: "⚖️",  label: "Civil Dispute",     color: "#2d8cf0" },
  { id: "CRIMINAL",          icon: "🔫",  label: "Criminal",           color: "#ef4444" },
  { id: "CYBER_CRIME",       icon: "💻",  label: "Cyber Crime",        color: "#8b5cf6" },
  { id: "MISSING_PERSON",    icon: "🔍",  label: "Missing Person",     color: "#f59e0b" },
  { id: "TRAFFIC",           icon: "🚗",  label: "Traffic Incident",   color: "#06b6d4" },
  { id: "WOMEN_SAFETY",      icon: "👩",  label: "Women Safety",       color: "#ec4899" },
  { id: "CHILD_SAFETY",      icon: "👶",  label: "Child Safety",       color: "#f97316" },
  { id: "DOMESTIC_VIOLENCE", icon: "🏠",  label: "Domestic Violence",  color: "#ef4444" },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [form, setForm]       = useState({
    type:         "",
    title:        "",
    description:  "",
    incidentDate: "",
    address:      "",
    latitude:     "",
    longitude:    "",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const getAiSuggestion = async () => {
    if (!form.description) return;
    try {
      const res = await fetchApi("/ai/classify", {
        method: "POST",
        body: JSON.stringify({ description: form.description }),
      });
      setAiSuggestion(res.data);
      if (res.data.suggestedType && !form.type) update("type", res.data.suggestedType);
    } catch {}
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      update("latitude",  String(pos.coords.latitude));
      update("longitude", String(pos.coords.longitude));
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchApi("/complaints", {
        method: "POST",
        body: JSON.stringify({
          type:         form.type,
          title:        form.title,
          description:  form.description,
          incidentDate: new Date(form.incidentDate).toISOString(),
          location: {
            coordinates: [parseFloat(form.longitude) || 77.2090, parseFloat(form.latitude) || 28.6139],
            address: form.address,
          },
        }),
      });
      router.push("/citizen/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to file complaint");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Type", "Details", "Location", "Review"];

  return (
    <div className="max-w-2xl mx-auto space-y-6 slide-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
          📋 File a Complaint
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--clr-text-secondary)" }}>
          Your complaint will be reviewed and acted upon promptly
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{
              background: i < step ? "#2d8cf0" : i === step ? "#60a5fa" : "rgba(255,255,255,0.08)"
            }} />
            <p className="text-xs mt-1 font-medium" style={{ color: i === step ? "#60a5fa" : "var(--clr-text-muted)" }}>{s}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-7">
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 0 — Type Selection */}
        {step === 0 && (
          <div>
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--clr-text-secondary)" }}>
              Select the nature of your complaint:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {COMPLAINT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { update("type", t.id); setStep(1); }}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: form.type === t.id ? `${t.color}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${form.type === t.id ? t.color + "40" : "var(--clr-border)"}`,
                  }}
                >
                  <span className="text-2xl flex-shrink-0">{t.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: form.type === t.id ? t.color : "var(--clr-text-secondary)" }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="form-control">
              <label className="form-label">Complaint Title</label>
              <input className="form-input" placeholder="Brief title of the incident"
                value={form.title} onChange={e => update("title", e.target.value)} />
            </div>
            <div className="form-control">
              <label className="form-label">Detailed Description</label>
              <textarea
                rows={5}
                className="form-input resize-none"
                placeholder="Describe what happened in detail..."
                value={form.description}
                onChange={e => update("description", e.target.value)}
                onBlur={getAiSuggestion}
              />
            </div>

            {aiSuggestion && (
              <div className="p-4 rounded-xl text-sm space-y-2" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <p className="font-semibold" style={{ color: "#a78bfa" }}>🧠 AI Suggestion</p>
                <p style={{ color: "var(--clr-text-secondary)" }}>
                  Type: <strong>{aiSuggestion.suggestedType?.replace("_"," ")}</strong> · Priority: <strong>{aiSuggestion.suggestedPriority}</strong>
                </p>
                <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>{aiSuggestion.summary}</p>
              </div>
            )}

            <div className="form-control">
              <label className="form-label">Date & Time of Incident</label>
              <input type="datetime-local" className="form-input"
                value={form.incidentDate} onChange={e => update("incidentDate", e.target.value)} />
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--clr-border)", color: "var(--clr-text-secondary)" }}>← Back</button>
              <button onClick={() => setStep(2)} className="flex-[2] btn-primary" disabled={!form.title || !form.description}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="form-control">
              <label className="form-label">Address / Area</label>
              <input className="form-input" placeholder="Street, Area, City..."
                value={form.address} onChange={e => update("address", e.target.value)} />
            </div>
            <button
              onClick={getLocation}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
            >
              📍 Capture Current GPS Location
            </button>
            {form.latitude && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
                ✅ GPS captured: {parseFloat(form.latitude).toFixed(6)}°N, {parseFloat(form.longitude).toFixed(6)}°E
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--clr-border)", color: "var(--clr-text-secondary)" }}>← Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] btn-primary">Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-bold" style={{ color: "var(--clr-text-primary)" }}>Review before submitting</h3>
            <div className="space-y-3 rounded-xl p-5 text-sm" style={{ background: "rgba(7,20,38,0.8)", border: "1px solid var(--clr-border)" }}>
              {[
                ["Type",    COMPLAINT_TYPES.find(t => t.id === form.type)?.label || form.type],
                ["Title",   form.title],
                ["Date",    form.incidentDate ? new Date(form.incidentDate).toLocaleString("en-IN") : "—"],
                ["Address", form.address || "Not specified"],
                ["GPS",     form.latitude ? `${parseFloat(form.latitude).toFixed(4)}°N` : "Not captured"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4">
                  <span style={{ color: "var(--clr-text-muted)" }}>{l}</span>
                  <span className="text-right font-medium" style={{ color: "var(--clr-text-primary)" }}>{v}</span>
                </div>
              ))}
              <div>
                <span style={{ color: "var(--clr-text-muted)" }}>Description</span>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--clr-text-secondary)" }}>
                  {form.description.slice(0, 120)}{form.description.length > 120 ? "…" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--clr-border)", color: "var(--clr-text-secondary)" }}>← Back</button>
              <button onClick={handleSubmit} className="flex-[2] btn-primary" disabled={loading}>
                {loading ? "Submitting…" : "✅ Submit Complaint"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
