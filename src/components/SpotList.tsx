import { Spot } from "@/data/spots";
import { MapPin, Image as ImageIcon, MessageSquareText, UploadCloud, Pencil, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { ChatUI } from "@/components/ChatUI";
import { ImageSearchModal } from "@/components/ImageSearchModal";

const DynamicMap = dynamic(() => import("@/components/SpotMap"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-stone-200 animate-pulse rounded-xl flex items-center justify-center text-stone-500">地図を読み込み中...</div>
});

interface SpotListProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onSpotsChange: (spots: Spot[] | ((prev: Spot[]) => Spot[])) => void;
}

export function SpotList({ spots, onSelectSpot, onSpotsChange }: SpotListProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [editingSpotId, setEditingSpotId] = useState<number | null>(null);
  const [searchSpot, setSearchSpot] = useState<Spot | null>(null);

  const handleCardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editingSpotId === null) return;

    const imageUrl = URL.createObjectURL(file);
    onSpotsChange((prev: Spot[]) =>
      prev.map((s: Spot) => s.id === editingSpotId ? { ...s, imgUrl: imageUrl } : s)
    );
    setEditingSpotId(null);
    if (cardFileInputRef.current) cardFileInputRef.current.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local blob URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    
    const newSpot: Spot = {
      id: Date.now(),
      title: "アップロード画像",
      anime: "カスタムファイル",
      imgUrl: imageUrl,
      hint: "アップロードしたお手本画像と合わせて撮影しましょう。",
      lat: 35.0, // Default to center Kyoto
      lng: 135.76
    };

    onSpotsChange((prev: Spot[]) => [newSpot, ...prev]);
    onSelectSpot(newSpot); // Instantly jump to camera
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLocationFound = (lat: number, lng: number, title: string, imgUrl?: string) => {
    // Add the AI found spot to the map and list
    const newSpot: Spot = {
      id: Date.now(),
      title: title,
      anime: "AIによる推測結果",
      imgUrl: imgUrl || "https://picsum.photos/id/102/800/600",
      hint: "この場所で同じ構図を探してみましょう！",
      lat,
      lng
    };
    
    // Check if we already added an AI spot to avoiding cluttering
    onSpotsChange((prev: Spot[]) => {
      const filtered = prev.filter((s: Spot) => s.anime !== "AIによる推測結果");
      return [newSpot, ...filtered];
    });
    
    setIsChatOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 p-4 pb-20">
      <header className="mb-6 pt-4 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-navy)] mb-2">京・透け撮りカメラ</h1>
        <p className="text-sm text-stone-500">アニメの聖地と完全に重なる一枚を。</p>
      </header>
      
      <div className="max-w-md mx-auto mb-6 relative">
        <DynamicMap spots={spots} onSelectSpot={onSelectSpot} />
        {/* We can also add a Street View Iframe for the latest selected map marker if needed, but for now the Map is good. */}
      </div>

      <div className="space-y-5 max-w-md mx-auto">
        {spots.map((spot: Spot) => (
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSpotId(spot.id);
                  cardFileInputRef.current?.click();
                }}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
                aria-label="画像を変更"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchSpot(spot);
                }}
                className="absolute top-3 right-14 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
                aria-label="周辺の画像を検索"
              >
                <Search className="w-4 h-4" />
              </button>
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

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
      />
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={cardFileInputRef} 
        onChange={handleCardImageChange}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        {/* Upload Custom Image Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[var(--color-navy)] text-white p-4 rounded-full shadow-xl hover:bg-blue-900 transition-transform active:scale-90 flex items-center justify-center group"
          aria-label="手持ちの画像をアップロード"
        >
          <UploadCloud className="w-6 h-6" />
          <span className="hidden group-hover:block ml-2 text-sm font-bold animate-in fade-in slide-in-from-right-4 whitespace-nowrap">
            画像をアップ
          </span>
        </button>

        {/* AI Chat Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-[var(--color-vermilion)] text-white p-4 rounded-full shadow-xl hover:bg-red-600 transition-transform active:scale-90 flex items-center justify-center group"
          aria-label="AIと場所を探す"
        >
          <MessageSquareText className="w-6 h-6" />
          <span className="hidden group-hover:block ml-2 text-sm font-bold animate-in fade-in slide-in-from-right-4 whitespace-nowrap">
            場所を探す
          </span>
        </button>
      </div>

      {/* Chat UI Modal */}
      {isChatOpen && (
        <ChatUI 
          onClose={() => setIsChatOpen(false)} 
          onLocationFound={handleLocationFound} 
        />
      )}

      {/* Image Search Modal */}
      {searchSpot && (
        <ImageSearchModal
          lat={searchSpot.lat}
          lng={searchSpot.lng}
          title={searchSpot.title}
          onSelectImage={(imageUrl) => {
            onSpotsChange((prev: Spot[]) =>
              prev.map((s: Spot) => s.id === searchSpot.id ? { ...s, imgUrl: imageUrl } : s)
            );
            setSearchSpot(null);
          }}
          onClose={() => setSearchSpot(null)}
        />
      )}
    </div>
  );
}
