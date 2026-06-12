"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const router = useRouter();

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((i) => i !== s) : [...prev, s]
    );
  };

  const handleSOS = async () => {
    if (services.length === 0) return;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetchApi("/sos/trigger", {
            method: "POST",
            body: JSON.stringify({
              coordinates: [pos.coords.longitude, pos.coords.latitude],
              servicesRequired: services,
            }),
          });
          
          setIsOpen(false);
          setServices([]);
          // Navigate to active SOS tracking screen
          if (res.data && res.data._id) {
            router.push(`/citizen/sos/${res.data._id}`);
          }
        } catch (error) {
          console.error("SOS Failed", error);
          alert("Failed to trigger SOS. Call 112 immediately.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        alert("GPS Access is required to trigger an SOS.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Button / Menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isOpen && (
          <div className="bg-slate-900 border border-red-500/30 p-5 rounded-2xl shadow-2xl w-72 slide-in mb-2">
            <h3 className="text-red-500 font-black text-lg mb-2">EMERGENCY SOS</h3>
            <p className="text-slate-400 text-xs mb-4">
              Select required services. GPS location will be captured automatically.
            </p>

            <div className="space-y-2 mb-4">
              {[
                { id: "POLICE", label: "Police", icon: "🚓", color: "blue" },
                { id: "AMBULANCE", label: "Ambulance", icon: "🚑", color: "emerald" },
                { id: "FIRE", label: "Fire Brigade", icon: "🚒", color: "orange" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    services.includes(s.id)
                      ? `bg-${s.color}-500/20 border-${s.color}-500/50 text-${s.color}-400`
                      : "bg-slate-800/50 border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-semibold text-sm">{s.label}</span>
                  {services.includes(s.id) && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </div>

            <button
              onClick={handleSOS}
              disabled={loading || services.length === 0}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
            >
              {loading ? "SENDING SOS..." : "SLIDE TO SOS ➔"}
            </button>
          </div>
        )}

        {/* The SOS Trigger Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-110 active:scale-95 ${
            isOpen ? "bg-slate-800 text-slate-400 border border-slate-700 shadow-none" : "bg-red-600 text-white animate-pulse"
          }`}
        >
          {isOpen ? "✕" : "🆘"}
        </button>
      </div>
    </>
  );
}
