"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { fetchApi } from "@/lib/api";

export default function HeatMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  
  const [heatData, setHeatData] = useState<[number, number, number][]>([]);

  // 1. Fetch Heatmap data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchApi("/dispatch/active-incidents");
        const incidents = res.data || [];

        // Convert to [lat, lng, intensity] for leaflet.heat
        const formatted = incidents.map((inc: any) => {
          const severityIntensity = inc.severity === "CRITICAL" ? 1.0 : inc.severity === "HIGH" ? 0.7 : inc.severity === "MEDIUM" ? 0.4 : 0.2;
          return [inc.location.coordinates[1], inc.location.coordinates[0], severityIntensity];
        });
        setHeatData(formatted);
      } catch (err) {
        console.error("Failed to load heatmap data", err);
      }
    };
    
    fetchData();
  }, []);

  // 2. Setup Map and Heat Layer natively
  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      import("leaflet"),
      import("leaflet.heat") // This attaches itself to L natively
    ]).then(([leaflet]) => {
      if (isCancelled) return;
      if (!mapContainerRef.current || (mapContainerRef.current as any)._leaflet_id) return;
      
      const L = leaflet.default || leaflet;
      
      // Initialize map natively
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([28.6139, 77.2090], 10);
      
      mapInstanceRef.current = map;

      // Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create empty heat layer
      // @ts-ignore - heatLayer is added by leaflet.heat plugin
      if (L.heatLayer) {
        // @ts-ignore
        heatLayerRef.current = L.heatLayer([], {
          radius: 25,
          blur: 15,
          maxZoom: 15,
          gradient: {
            0.0: "rgba(33,102,172,0)",
            0.2: "rgb(103,169,207)",
            0.4: "rgb(209,229,240)",
            0.6: "rgb(253,219,199)",
            0.8: "rgb(239,138,98)",
            1.0: "rgb(178,24,43)"
          }
        }).addTo(map);
      }
      
      // If we already fetched data before map loaded, render it
      if (heatData.length > 0 && heatLayerRef.current) {
        heatLayerRef.current.setLatLngs(heatData);
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Update Heat Layer when data changes
  useEffect(() => {
    if (heatLayerRef.current && heatData.length > 0) {
      heatLayerRef.current.setLatLngs(heatData);
    }
  }, [heatData]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%", background: "#0f172a" }} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #0f172a !important;
        }
      `}} />
    </div>
  );
}
