"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Incident {
  _id: string;
  severity: string;
  status: string;
  servicesRequired: string[];
  location: { coordinates: [number, number] };
}

const SEV_COLOR: Record<string, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

export default function ControlRoomMap({ incidents }: { incidents: Incident[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    // 1. Setup Map on mount
    let isCancelled = false;

    import("leaflet").then((L) => {
      if (isCancelled) return;
      if (!mapContainerRef.current || (mapContainerRef.current as any)._leaflet_id) return;

      // Initialize map natively
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([28.6139, 77.2090], 12);

      mapInstanceRef.current = map;

      // Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Render initial markers
      renderMarkers(incidents, L, map);
    });

    // Cleanup strictly destroys the map instance (perfect for Fast Refresh)
    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Update Map when incidents change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      renderMarkers(incidents, L, mapInstanceRef.current);
    });
  }, [incidents]);

  const renderMarkers = (currentIncidents: Incident[], L: any, map: any) => {
    // Remove old markers that are no longer in the incidents list
    const newIncidentIds = currentIncidents.map(inc => inc._id);
    Object.keys(markersRef.current).forEach(id => {
      if (!newIncidentIds.includes(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    currentIncidents.forEach((inc) => {
      if (!markersRef.current[inc._id]) {
        // Create new marker
        const color = SEV_COLOR[inc.severity] || "#3b82f6";
        const isPulse = inc.severity === "CRITICAL";

        const icon = L.divIcon({
          className: "custom-leaflet-icon",
          html: `
            <div class="relative w-4 h-4 rounded-full flex items-center justify-center shadow-lg" style="background: ${color}; border: 2px solid white;">
              ${isPulse ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background: ${color};"></div>` : ''}
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Remember: MongoDB is [lng, lat], Leaflet is [lat, lng]
        const marker = L.marker([inc.location.coordinates[1], inc.location.coordinates[0]], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="custom-popup font-sans">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase" style="background: ${color}20; color: ${color}">
                  ${inc.severity}
                </span>
                <span class="text-[10px] text-slate-500 font-mono">#${inc._id.slice(-6)}</span>
              </div>
              <p class="text-sm font-bold m-0 text-white">${inc.servicesRequired.join(" + ")}</p>
              <p class="text-xs text-slate-500 m-0 mt-1 capitalize">${inc.status.replace("_", " ").toLowerCase()}</p>
            </div>
          `);

        markersRef.current[inc._id] = marker;
      } else {
        // Update existing marker position (if moving)
        markersRef.current[inc._id].setLatLng([inc.location.coordinates[1], inc.location.coordinates[0]]);
      }
    });
  };

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%", background: "#0f172a" }} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #0f172a !important;
          color: #f8fafc !important;
          border: 1px solid #1e293b !important;
        }
        .leaflet-container {
          background: #0f172a !important;
        }
      `}} />
    </div>
  );
}
