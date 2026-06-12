"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import LiveMap from "@/components/maps/LiveMap";
import SOSChat from "@/components/sos/SOSChat";
import { useSocketStore } from "@/store/socketStore";

export default function SOSTrackingPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { connect } = useSocketStore();

  useEffect(() => {
    // Connect to real-time socket server
    const token = localStorage.getItem("token");
    if (token) connect(token);
    
    // Fetch incident details
    fetchIncident();
  }, []);

  const fetchIncident = async () => {
    try {
      // Assuming a GET /api/sos/:id exists or using generic fetch
      const res = await fetchApi(`/sos/${id}`);
      setIncident(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-red-500">Loading Emergency Status...</div>;
  if (!incident) return <div className="p-8 text-center text-red-500 font-bold">Emergency record not found.</div>;

  const responderEta = incident.dispatchedUnits?.[0]?.etaMinutes || "--";
  const status = incident.status.replace("_", " ");

  return (
    <div className="max-w-6xl mx-auto space-y-6 slide-in">
      {/* Header Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="animate-ping w-3 h-3 bg-red-500 rounded-full inline-block" />
            <h1 className="text-2xl font-black text-red-500 uppercase">Emergency Active</h1>
          </div>
          <p className="text-slate-300 text-sm">Help is on the way. Please stay calm and safe.</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase">Status</p>
            <p className="text-xl font-bold text-white">{status}</p>
          </div>
          <div className="text-center border-l border-slate-700 pl-6">
            <p className="text-xs text-slate-400 font-semibold uppercase">ETA</p>
            <p className="text-2xl font-black text-emerald-400">{responderEta} MIN</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map View */}
        <div className="lg:col-span-2 h-full">
          <LiveMap
            incidentId={id as string}
            initialLocation={incident.location.coordinates}
            role="CITIZEN"
          />
        </div>

        {/* Chat & Details */}
        <div className="h-full flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3">Incident Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Services Requested</span>
                <span className="font-semibold text-slate-200">{incident.servicesRequired.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp</span>
                <span className="font-semibold text-slate-200">{new Date(incident.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <SOSChat incidentId={id as string} />
          </div>
        </div>
      </div>
    </div>
  );
}
