"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Spot } from "@/data/spots";

export interface MapProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

export default function SpotMap({ spots, onSelectSpot }: MapProps) {
  useEffect(() => {
    // Fix default marker icon issue with Next.js/Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const centerPosition: [number, number] = [34.99, 135.76]; // 概ね京都の中心

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden shadow-md border border-stone-200 z-0 relative">
      <MapContainer 
        center={centerPosition} 
        zoom={11} 
        style={{ height: "100%", width: "100%", position: "absolute", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {spots.map(spot => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]}
            eventHandlers={{
              click: () => onSelectSpot(spot),
            }}
          >
            <Popup>
              <div className="text-center">
                <strong className="block text-sm text-[var(--color-navy)]">{spot.title}</strong>
                <span className="text-xs text-stone-500">{spot.anime}</span>
                <button 
                  className="mt-2 w-full py-1.5 bg-[var(--color-vermilion)] text-white font-bold text-xs rounded shadow-sm hover:bg-red-700 active:scale-95 transition-transform"
                  onClick={(e) => { e.stopPropagation(); onSelectSpot(spot); }}
                >
                  カメラを起動
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
