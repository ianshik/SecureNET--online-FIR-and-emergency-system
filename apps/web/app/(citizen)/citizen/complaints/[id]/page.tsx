"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { FileText, ShieldAlert, CheckCircle2, Clock, MapPin, User, AlertTriangle, PenTool } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface ComplaintDetails {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: {
    firstName: string;
    lastName: string;
    badgeNumber: string;
    phone: string;
  };
  location: {
    address: string;
    coordinates: [number, number];
  };
  evidenceUrls: string[];
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/complaints/${id}`)
      .then((res) => {
        if (res.success) {
          setComplaint(res.data);
        } else {
          router.push("/citizen/complaints");
        }
      })
      .catch(() => router.push("/citizen/complaints"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 space-y-6">
        <div className="h-32 glass-card animate-pulse border-surface-border"></div>
        <div className="h-64 glass-card animate-pulse border-surface-border"></div>
      </div>
    );
  }

  if (!complaint) return null;

  const STATUS_COLORS: Record<string, string> = {
    SUBMITTED:    "text-slate-300 border-slate-700 bg-slate-800/50",
    UNDER_REVIEW: "text-blue-400 border-blue-500/30 bg-blue-900/20",
    ASSIGNED:     "text-amber-400 border-amber-500/30 bg-amber-900/20",
    IN_PROGRESS:  "text-amber-400 border-amber-500/30 bg-amber-900/20",
    RESOLVED:     "text-emerald-400 border-emerald-500/30 bg-emerald-900/20",
    CLOSED:       "text-slate-500 border-slate-700 bg-slate-800/30",
    REJECTED:     "text-red-400 border-red-500/30 bg-red-900/20",
  };

  const PRIORITY_COLORS: Record<string, string> = {
    LOW:      "text-emerald-400 border-emerald-500/30 bg-emerald-900/20",
    MEDIUM:   "text-amber-400 border-amber-500/30 bg-amber-900/20",
    HIGH:     "text-orange-500 border-orange-500/30 bg-orange-900/20",
    CRITICAL: "text-red-500 border-red-500/30 bg-red-900/20 font-bold",
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      
      {/* Header Banner */}
      <div className="glass-card p-6 border-l-4 border-l-accent flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none -translate-y-1/4 translate-x-1/4">
          <FileText className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded text-[10px] font-heading font-black uppercase tracking-widest border ${STATUS_COLORS[complaint.status] || STATUS_COLORS.SUBMITTED}`}>
              {complaint.status.replace("_", " ")}
            </span>
            <span className={`px-3 py-1 rounded text-[10px] font-heading font-black uppercase tracking-widest border ${PRIORITY_COLORS[complaint.priority] || PRIORITY_COLORS.LOW}`}>
              {complaint.priority} PRIORITY
            </span>
          </div>
          <h1 className="font-heading font-black text-3xl uppercase tracking-wider text-white">
            {complaint.title}
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
            <Clock className="w-3 h-3" /> FILED ON {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="relative z-10 text-left md:text-right border-t md:border-t-0 md:border-l border-surface-border pt-4 md:pt-0 md:pl-6">
          <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Official Record ID</p>
          <p className="font-mono text-white text-lg tracking-widest">#{complaint._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Details Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-surface-border">
            <h2 className="font-heading font-black text-lg uppercase tracking-wider text-white flex items-center gap-2 mb-4 pb-4 border-b border-surface-border">
              <PenTool className="w-5 h-5 text-accent" /> Incident Statement
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Classification</p>
                <p className="font-mono text-white text-sm bg-surface p-2 rounded inline-block">{complaint.type.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-1">Full Description</p>
                <p className="text-slate-300 text-sm leading-relaxed bg-surface/50 p-4 rounded border border-surface-border">
                  {complaint.description}
                </p>
              </div>
              {complaint.evidenceUrls && complaint.evidenceUrls.length > 0 && (
                <div>
                  <p className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mb-2">Attached Evidence</p>
                  <div className="grid grid-cols-3 gap-3">
                    {complaint.evidenceUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square bg-surface border border-surface-border rounded overflow-hidden hover:border-accent transition-colors relative group">
                        {/* Assuming images for now, could be files */}
                        <img src={url} alt={`Evidence ${i+1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel Column */}
        <div className="space-y-6">
          
          <div className="glass-card p-6 border border-surface-border">
            <h2 className="font-heading font-black text-sm uppercase tracking-wider text-white flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <MapPin className="w-4 h-4 text-accent" /> Location Data
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {complaint.location.address}
            </p>
            <div className="h-32 bg-black border border-surface-border rounded flex items-center justify-center relative overflow-hidden">
              {/* Very simple static map mockup or coords */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
              <div className="text-center relative z-10">
                <MapPin className="w-6 h-6 text-primary mx-auto mb-1 animate-bounce" />
                <p className="text-[10px] font-mono text-white tracking-widest">
                  {complaint.location.coordinates[1].toFixed(4)}°N<br/>
                  {complaint.location.coordinates[0].toFixed(4)}°E
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-surface-border">
            <h2 className="font-heading font-black text-sm uppercase tracking-wider text-white flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <ShieldAlert className="w-4 h-4 text-accent" /> Investigating Officer
            </h2>
            
            {complaint.assignedTo ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-white uppercase tracking-wider">
                    {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                  </p>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-1">
                    Badge: {complaint.assignedTo.badgeNumber}
                  </p>
                  <p className="text-[10px] font-mono text-primary uppercase tracking-widest mt-0.5">
                    {complaint.assignedTo.phone}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="w-8 h-8 text-amber-500/50 mx-auto mb-2" />
                <p className="text-xs font-mono text-muted uppercase tracking-widest">
                  Awaiting Officer Assignment
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
