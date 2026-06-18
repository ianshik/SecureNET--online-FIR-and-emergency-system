"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Radio, MapPin, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface Dispatch {
  _id: string;
  status: string;
  etaMinutes?: number;
  incidentId: {
    _id: string;
    severity: string;
    servicesRequired: string[];
    location: {
      coordinates: [number, number];
    };
  };
  createdAt: string;
  completedAt?: string;
}

export default function OfficerDispatches() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDispatches();
  }, []);

  const fetchDispatches = async () => {
    try {
      const res = await fetchApi("/dispatch/my-dispatches");
      const data = res.data || [];
      setDispatches(data);
      
      // Reverse geocode addresses
      data.forEach((d: Dispatch) => {
        if (d.incidentId?.location?.coordinates) {
          const [lng, lat] = d.incidentId.location.coordinates;
          fetchAddress(lat, lng, d._id);
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (lat: number, lng: number, dispatchId: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddresses(prev => ({ ...prev, [dispatchId]: data.display_name }));
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  const completed = dispatches.filter(d => d.status === "COMPLETED");

  return (
    <div className="max-w-7xl mx-auto space-y-8 slide-in pb-12">
      <div className="border-b border-surface-border pb-6">
        <h1 className="font-heading font-black text-3xl tracking-tighter text-white uppercase flex items-center gap-3">
          <Radio className="w-8 h-8 text-accent" /> MY DISPATCHES
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-widest mt-2">
          Historical record of completed tactical operations
        </p>
      </div>

      <div className="glass-card p-6 flex flex-col border border-surface-border">
        <h2 className="font-heading font-black text-xl text-white uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-surface-border">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> COMPLETED OPERATIONS
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded bg-black/50 border border-surface-border animate-pulse" />
            ))}
          </div>
        ) : completed.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3 text-muted">
            <Radio className="w-12 h-12 opacity-20" />
            <p className="text-xs font-mono uppercase tracking-widest">NO COMPLETED DISPATCHES</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completed.map((d) => (
              <div
                key={d._id}
                className="rounded p-5 flex flex-col md:flex-row md:items-center gap-5 transition-all bg-black/40 border border-surface-border hover:border-emerald-500/30 group"
              >
                <div className="w-1 self-stretch rounded flex-shrink-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-widest border border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
                      COMPLETED
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase">ID: {d.incidentId?._id}</span>
                  </div>
                  
                  <p className="text-base font-heading font-bold text-white uppercase tracking-widest">
                    {d.incidentId?.servicesRequired?.join(", ")} EMERGENCY
                  </p>
                  
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-accent shrink-0" /> 
                      <span className="text-accent/80">
                        [{d.incidentId?.location?.coordinates?.[1]?.toFixed(4)}, {d.incidentId?.location?.coordinates?.[0]?.toFixed(4)}]
                      </span>
                    </p>
                    {addresses[d._id] && (
                      <p className="text-[10px] text-muted font-mono pl-5 italic line-clamp-1">
                        ↳ {addresses[d._id]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-muted uppercase tracking-widest flex items-center justify-end gap-1 mb-1">
                    <Clock className="w-3 h-3" /> COMPLETED AT
                  </div>
                  <div className="text-sm font-heading font-bold text-white tracking-widest uppercase">
                    {d.completedAt ? new Date(d.completedAt).toLocaleTimeString() : new Date(d.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted font-mono mt-1">
                    {d.completedAt ? new Date(d.completedAt).toLocaleDateString() : new Date(d.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
