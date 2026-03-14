"use client";

import { useState } from "react";
import { SpotList } from "@/components/SpotList";
import { CameraView } from "@/components/CameraView";
import { spots, Spot } from "@/data/spots";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  if (selectedSpot) {
    return <CameraView spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
  }

  return <SpotList spots={spots} onSelectSpot={setSelectedSpot} />;
}
