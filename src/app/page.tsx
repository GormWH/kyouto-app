"use client";

import { useState } from "react";
import { SpotList } from "@/components/SpotList";
import { CameraView } from "@/components/CameraView";
import { spots as initialSpots, Spot } from "@/data/spots";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [customSpots, setCustomSpots] = useState<Spot[]>(initialSpots);

  if (selectedSpot) {
    return <CameraView spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
  }

  return (
    <SpotList 
      spots={customSpots} 
      onSelectSpot={setSelectedSpot} 
      onSpotsChange={setCustomSpots}
    />
  );
}
