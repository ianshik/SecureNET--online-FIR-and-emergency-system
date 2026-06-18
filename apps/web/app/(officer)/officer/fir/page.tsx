"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Bot, FileText, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-8 slide-in pb-12">
      <div className="border-b border-surface-border pb-6">
        <h1 className="text-3xl font-heading font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Bot className="w-8 h-8 text-accent" /> AI-POWERED FIR DRAFTER
        </h1>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-2">
          Convert raw citizen statements into formal, legally sound First Information Reports
        </p>
      </div>

      {error && (
        <div className="p-4 rounded border border-red-500/30 bg-red-500/10 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs font-mono text-red-400 uppercase tracking-wider leading-relaxed">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Input */}
        <div className="glass-card p-6 flex flex-col gap-6 border border-surface-border">
          <h2 className="text-lg font-heading font-black text-white tracking-widest uppercase flex items-center gap-2">
            <span className="text-accent">01 //</span> CITIZEN STATEMENT
          </h2>
          
          <div className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">
                Related Complaint ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder="e.g. 64b8f... (CHECK ACTIVE CASES)"
                className="w-full bg-black/50 border border-surface-border rounded p-4 text-xs font-mono text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[250px]">
              <label className="block text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">
                Raw Informal Statement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={informalDescription}
                onChange={(e) => setInformalDescription(e.target.value)}
                placeholder="TYPE EXACTLY WHAT THE CITIZEN IS SAYING. DON'T WORRY ABOUT FORMATTING, GRAMMAR, OR LEGAL TERMS..."
                className="w-full flex-1 bg-black/50 border border-surface-border rounded p-4 text-xs font-mono text-slate-300 resize-none focus:outline-none focus:border-accent transition-colors leading-relaxed"
              />
            </div>
          </div>

          <button
            onClick={generateDraft}
            disabled={isGenerating || !informalDescription}
            className="w-full py-4 mt-2 rounded bg-accent hover:bg-amber-400 text-black font-heading font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-accent flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            {isGenerating ? (
               <><Bot className="w-4 h-4 animate-spin" /> ANALYZING & DRAFTING...</>
            ) : (
               <><Bot className="w-4 h-4" /> GENERATE FORMAL DRAFT</>
            )}
          </button>
        </div>

        {/* Right Column: AI Output */}
        <div className="glass-card p-6 flex flex-col gap-6 border border-surface-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FileText className="w-64 h-64" />
          </div>
          
          <h2 className="text-lg font-heading font-black text-white tracking-widest uppercase flex items-center gap-2 relative z-10">
            <span className="text-emerald-500">02 //</span> REVIEW & FINALIZE
          </h2>
          
          {!draft ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-surface-border rounded gap-4 text-muted relative z-10 p-8 text-center bg-black/20">
              <FileText className="w-8 h-8 opacity-20" />
              <p className="text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                SYSTEM STANDING BY<br/>WAITING FOR AI GENERATION MODULE
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-heading font-bold text-emerald-500 uppercase tracking-widest mb-2">
                    Formal Incident Details
                  </label>
                  <textarea
                    value={draft.formalIncidentDetails}
                    onChange={(e) => setDraft({ ...draft, formalIncidentDetails: e.target.value })}
                    className="w-full min-h-[150px] bg-emerald-500/5 border border-emerald-500/20 rounded p-4 text-xs font-mono text-emerald-50 leading-relaxed resize-y focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-heading font-bold text-emerald-500 uppercase tracking-widest mb-2">
                    Accused Details
                  </label>
                  <textarea
                    value={draft.accusedDetails}
                    onChange={(e) => setDraft({ ...draft, accusedDetails: e.target.value })}
                    className="w-full min-h-[80px] bg-emerald-500/5 border border-emerald-500/20 rounded p-4 text-xs font-mono text-emerald-50 leading-relaxed resize-y focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>

                <div className="bg-blue-500/5 p-4 rounded border border-blue-500/20">
                  <label className="block text-[10px] font-heading font-bold text-blue-400 uppercase tracking-widest mb-3">
                    Suggested IPC Sections
                  </label>
                  <ul className="list-disc pl-5 text-xs font-mono text-blue-100/70 space-y-2">
                    {draft.suggestedIPCSections?.map((section: string, i: number) => (
                       <li key={i} className="leading-relaxed">{section}</li>
                    ))}
                    {(!draft.suggestedIPCSections || draft.suggestedIPCSections.length === 0) && (
                      <li className="text-blue-500/50">NONE DETECTED</li>
                    )}
                  </ul>
                </div>

                <div className="bg-purple-500/5 p-4 rounded border border-purple-500/20">
                  <label className="block text-[10px] font-heading font-bold text-purple-400 uppercase tracking-widest mb-2">
                    Identified Witnesses
                  </label>
                  <p className="text-xs font-mono text-purple-100/70 leading-relaxed uppercase">
                    {draft.witnesses?.join(", ") || "NONE MENTIONED"}
                  </p>
                </div>
              </div>

              <button
                onClick={saveDraft}
                disabled={isSaving}
                className="w-full py-4 mt-auto rounded bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {isSaving ? (
                  <>SAVING DOCUMENT TO SECURE LEDGER...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> SAVE OFFICIAL DRAFT</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
