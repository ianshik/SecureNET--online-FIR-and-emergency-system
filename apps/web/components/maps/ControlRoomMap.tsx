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

      // Add CartoDB Dark Matter Tile Layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
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
        const color = SEV_COLOR[inc.severity] || "#f59e0b";
        const isPulse = inc.severity === "CRITICAL";

        const icon = L.divIcon({
          className: "custom-leaflet-icon",
          html: `
            <div class="relative w-3 h-3 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]" style="background: ${color}; border: 1px solid white; transform: rotate(45deg);">
              ${isPulse ? `<div class="absolute inset-0 rounded-sm animate-ping opacity-75" style="background: ${color};"></div>` : ''}
            </div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        // Remember: MongoDB is [lng, lat], Leaflet is [lat, lng]
        const marker = L.marker([inc.location.coordinates[1], inc.location.coordinates[0]], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="custom-popup font-sans">
              <div class="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                <span class="text-[9px] font-bold font-heading uppercase tracking-widest px-1.5 py-0.5 rounded" style="background: ${color}20; color: ${color}; border: 1px solid ${color}30">
                  ${inc.severity}
                </span>
                <span class="text-[10px] text-gray-500 font-mono tracking-wider">#${inc._id.slice(-6)}</span>
              </div>
              <p class="text-xs font-black font-heading uppercase tracking-widest m-0 text-white">${inc.servicesRequired.join(" + ")}</p>
              <p class="text-[10px] text-gray-400 font-heading font-bold uppercase tracking-widest m-0 mt-1">${inc.status.replace("_", " ")}</p>
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
    <div className="w-full h-full relative z-0 mix-blend-screen">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%", background: "#000000" }} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: rgba(10, 10, 10, 0.95) !important;
          backdrop-filter: blur(10px);
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
        }
        .leaflet-popup-content {
          margin: 12px 14px !important;
        }
        .leaflet-container {
          background: #000000 !important;
          font-family: inherit !important;
        }
        /* Filter to make map tiles darker and more high-contrast */
        .leaflet-tile-pane {
          filter: brightness(0.6) contrast(1.2) grayscale(0.2) invert(0);
        }
      `}} />
    </div>
  );
}
