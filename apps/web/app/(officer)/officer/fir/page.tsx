"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function SmartFIRDrafter() {
  const router = useRouter();
  
  // Step 1: Input
  const [complaintId, setComplaintId] = useState("");
  const [informalDescription, setInformalDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Step 2: Generated Draft
  const [draft, setDraft] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateDraft = async () => {
    if (!informalDescription || informalDescription.length < 10) {
      setError("Please provide a more detailed description (at least 10 characters).");
      return;
    }
    
    setIsGenerating(true);
    setError("");
    
    try {
      const res = await fetchApi("/fir/ai-draft", {
        method: "POST",
        body: JSON.stringify({ informalDescription }),
      });
      
      if (res.success) {
        setDraft(res.data);
      } else {
        setError(res.message || "Failed to generate draft.");
      }
    } catch (err) {
      setError("An error occurred while generating the draft. Please ensure the backend and Gemini API are properly configured.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDraft = async () => {
    if (!complaintId) {
      setError("Please provide a valid Complaint ID to attach this FIR to.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload = {
        complaintId,
        incidentDetails: draft.formalIncidentDetails,
        accusedDetails: draft.accusedDetails,
        witnesses: draft.witnesses || [],
        officerRemarks: `AI Suggested IPC Sections: ${draft.suggestedIPCSections?.join(", ")}`,
      };

      const res = await fetchApi("/fir/draft", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        alert(`FIR Draft Saved Successfully! FIR No: ${res.data.firNumber}`);
        router.push("/officer/dashboard");
      } else {
        setError(res.message || "Failed to save FIR draft.");
      }
    } catch (err) {
      setError("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 slide-in">
      <div>
        <h1 className="text-2xl font-black text-white">
          🤖 AI-Powered FIR Drafter
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Convert messy citizen statements into formal, legally sound First Information Reports.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-2">Step 1: Citizen Statement</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Related Complaint ID (Required)
            </label>
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="e.g. 64b8f... (Check Active Cases)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Raw Informal Statement
            </label>
            <textarea
              value={informalDescription}
              onChange={(e) => setInformalDescription(e.target.value)}
              placeholder="Type exactly what the citizen is saying. Don't worry about formatting, grammar, or legal terms..."
              className="w-full flex-1 min-h-[200px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={generateDraft}
            disabled={isGenerating || !informalDescription}
            className="w-full py-4 rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
          >
            {isGenerating ? "🤖 Analyzing & Drafting..." : "✨ Generate Formal Draft"}
          </button>
        </div>

        {/* Right Column: AI Output */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-2">Step 2: Review & Finalize</h2>
          
          {!draft ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl">
              <p className="text-slate-500 text-sm">Waiting for AI generation...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Formal Incident Details
                </label>
                <textarea
                  value={draft.formalIncidentDetails}
                  onChange={(e) => setDraft({ ...draft, formalIncidentDetails: e.target.value })}
                  className="w-full min-h-[150px] bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-slate-200 resize-y focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Accused Details
                </label>
                <textarea
                  value={draft.accusedDetails}
                  onChange={(e) => setDraft({ ...draft, accusedDetails: e.target.value })}
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-slate-200 resize-y focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Suggested IPC Sections
                </label>
                <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                  {draft.suggestedIPCSections?.map((section: string, i: number) => (
                     <li key={i}>{section}</li>
                  ))}
                  {(!draft.suggestedIPCSections || draft.suggestedIPCSections.length === 0) && (
                    <li className="text-slate-500">None detected.</li>
                  )}
                </ul>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Identified Witnesses
                </label>
                <p className="text-sm text-slate-300">
                  {draft.witnesses?.join(", ") || "None mentioned."}
                </p>
              </div>

              <button
                onClick={saveDraft}
                disabled={isSaving}
                className="w-full py-4 mt-auto rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
              >
                {isSaving ? "Saving..." : "💾 Save Official Draft"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
