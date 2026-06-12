"use client";

import { useEffect, useState, useRef } from "react";
import { useSocketStore } from "@/store/socketStore";
import "leaflet/dist/leaflet.css";

interface LiveMapProps {
  incidentId: string;
  initialLocation: [number, number]; // [lng, lat]
  responderLocation?: [number, number];
  citizenLocation?: [number, number];
  role: "CITIZEN" | "OFFICER";
}

export default function LiveMap({
  incidentId,
  initialLocation,
  responderLocation,
  citizenLocation,
  role,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const citizenMarkerRef = useRef<any>(null);
  const responderMarkerRef = useRef<any>(null);
  
  const { socket, isConnected } = useSocketStore();

  // 1. Setup Map on mount
  useEffect(() => {
    let isCancelled = false;
    
    import("leaflet").then((L) => {
      if (isCancelled) return;
      if (!mapContainerRef.current || (mapContainerRef.current as any)._leaflet_id) return;
      
      // Initialize map natively
      // Note: Leaflet uses [lat, lng], while our coordinates are [lng, lat]
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([initialLocation[1], initialLocation[0]], 14);
      
      mapInstanceRef.current = map;

      // Add Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Define Icons
      const citizenIcon = L.divIcon({
        className: "custom-leaflet-icon",
        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const responderIcon = L.divIcon({
        className: "custom-leaflet-icon",
        html: `<div class="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.8)] flex items-center justify-center"><span class="text-[12px]">🚓</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Add initial markers if they exist
      const initialCitizenLoc = citizenLocation || (role === "CITIZEN" ? initialLocation : undefined);
      if (initialCitizenLoc) {
        citizenMarkerRef.current = L.marker([initialCitizenLoc[1], initialCitizenLoc[0]], { icon: citizenIcon }).addTo(map);
      }

      const initialResponderLoc = responderLocation || (role === "OFFICER" ? initialLocation : undefined);
      if (initialResponderLoc) {
        responderMarkerRef.current = L.marker([initialResponderLoc[1], initialResponderLoc[0]], { icon: responderIcon }).addTo(map);
      }
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

  // 2. Listen to Socket events for live tracking
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("join_incident_room", incidentId);

    socket.on("location:change", (data: any) => {
      if (!mapInstanceRef.current) return;
      
      const newLatLng: [number, number] = [data.coordinates[1], data.coordinates[0]];

      if (data.role === "OFFICER") {
        if (responderMarkerRef.current) {
          responderMarkerRef.current.setLatLng(newLatLng);
        }
        // If citizen is watching, pan to the officer
        if (role === "CITIZEN") {
          mapInstanceRef.current.panTo(newLatLng);
        }
      } else if (data.role === "CITIZEN") {
        if (citizenMarkerRef.current) {
          citizenMarkerRef.current.setLatLng(newLatLng);
        }
      }
    });

    return () => {
      socket.off("location:change");
    };
  }, [socket, isConnected, incidentId, role]);

  // 3. Emit our own location periodically
  useEffect(() => {
    if (!socket || !isConnected) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          socket.emit("location:update", { incidentId, coordinates: coords });
          
          const newLatLng: [number, number] = [coords[1], coords[0]];
          
          // Update our own marker visually
          if (role === "CITIZEN" && citizenMarkerRef.current) {
             citizenMarkerRef.current.setLatLng(newLatLng);
          } else if (role === "OFFICER" && responderMarkerRef.current) {
             responderMarkerRef.current.setLatLng(newLatLng);
          }
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [socket, isConnected, incidentId, role]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden shadow-lg border border-slate-800 z-0">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%", background: "#0f172a" }} />

      {/* HUD overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg text-xs font-semibold text-slate-200 z-[1000] shadow-lg pointer-events-none">
        <span className="status-dot online mr-2" />
        Live GPS Tracking
      </div>
      
      {/* Global styles for our custom icons to prevent background tile clipping */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          background: #0f172a !important;
        }
      `}} />
    </div>
  );
}
