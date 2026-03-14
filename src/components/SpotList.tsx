import { Spot } from "@/data/spots";
import { MapPin, Image as ImageIcon } from "lucide-react";

interface SpotListProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

export function SpotList({ spots, onSelectSpot }: SpotListProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 p-4 pb-20">
      <header className="mb-6 pt-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-2">京・透け撮りカメラ</h1>
        <p className="text-sm text-stone-500">アニメの聖地と完全に重なる一枚を。</p>
      </header>
      
      <div className="space-y-5 max-w-md mx-auto">
        {spots.map((spot) => (
          <div 
            key={spot.id} 
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-200"
            onClick={() => onSelectSpot(spot)}
          >
            <div className="relative h-48 w-full bg-stone-200">
              <img 
                src={spot.imgUrl} 
                alt={spot.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <h2 className="absolute bottom-3 left-4 text-xl font-bold text-white mb-1 flex items-center gap-1 shadow-sm">
                <MapPin className="w-5 h-5 text-[var(--color-vermilion)]" />
                {spot.title}
              </h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-stone-600 font-medium mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {spot.anime}
              </p>
              <div className="bg-amber-50 text-amber-900 text-xs p-2.5 rounded border border-amber-200">
                <span className="font-bold mr-1">💡 ヒント:</span> 
                {spot.hint}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
