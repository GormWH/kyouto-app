"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Search, MapPin } from "lucide-react";

interface ImageSearchModalProps {
  lat: number;
  lng: number;
  title: string;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
}

interface WikiImage {
  pageid: number;
  title: string;
  thumbUrl: string;
  fullUrl: string;
  dist: number;
}

export function ImageSearchModal({ lat, lng, title, onSelectImage, onClose }: ImageSearchModalProps) {
  const [images, setImages] = useState<WikiImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [radius, setRadius] = useState(1000);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchImages = async (searchRadius: number) => {
    setLoading(true);
    setError("");
    setImages([]);

    try {
      const url = `https://commons.wikimedia.org/w/api.php?` +
        `action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6` +
        `&ggsradius=${searchRadius}&ggscoord=${lat}|${lng}&ggslimit=20` +
        `&prop=imageinfo&iilimit=1&iiprop=url|extmetadata` +
        `&iiurlwidth=300&iiurlheight=300` +
        `&format=json&origin=*`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.query?.pages) {
        setError("この範囲では画像が見つかりませんでした。半径を広げてみてください。");
        setLoading(false);
        return;
      }

      const results: WikiImage[] = Object.values(data.query.pages)
        .filter((page: any) => page.imageinfo?.[0]?.thumburl)
        .map((page: any) => ({
          pageid: page.pageid,
          title: page.title.replace("File:", "").replace(/\.[^.]+$/, ""),
          thumbUrl: page.imageinfo[0].thumburl,
          fullUrl: page.imageinfo[0].url,
          dist: page.index || 0
        }));

      if (results.length === 0) {
        setError("この範囲では画像が見つかりませんでした。半径を広げてみてください。");
      }

      setImages(results);
    } catch (err) {
      console.error("Wikimedia API error:", err);
      setError("画像の検索中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    fetchImages(newRadius);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[650px]">
        
        {/* Header */}
        <div className="bg-[var(--color-navy)] text-white p-4 flex justify-between items-center shadow-md">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <Search className="w-5 h-5" /> 周辺の写真を検索
            </h3>
            <p className="text-xs text-stone-300 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {title}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Radius Control */}
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-stone-600 whitespace-nowrap">検索半径</label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="flex-1 accent-[var(--color-vermilion)] h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono text-stone-700 w-16 text-right">
              {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}
            </span>
          </div>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Wikimedia Commons を検索中...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-500">
              <Search className="w-10 h-10 text-stone-300" />
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {!loading && images.length > 0 && (
            <>
              <p className="text-xs text-stone-500 mb-3">{images.length}件の画像が見つかりました。使いたい画像をタップしてください。</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <button
                    key={img.pageid}
                    onClick={() => setSelectedId(img.pageid)}
                    className={`relative rounded-xl overflow-hidden aspect-square group transition-all duration-200 ${
                      selectedId === img.pageid 
                        ? "ring-3 ring-[var(--color-vermilion)] scale-[1.02] shadow-lg" 
                        : "ring-1 ring-stone-200 hover:ring-stone-400 hover:shadow-md"
                    }`}
                  >
                    <img
                      src={img.thumbUrl}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="absolute bottom-0 left-0 right-0 p-1.5 text-[10px] text-white bg-black/50 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.title}
                    </p>
                    {selectedId === img.pageid && (
                      <div className="absolute top-2 right-2 bg-[var(--color-vermilion)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer: Confirm Button */}
        {selectedId && (
          <div className="p-4 bg-white border-t border-stone-200">
            <button
              onClick={() => {
                const selected = images.find(img => img.pageid === selectedId);
                if (selected) onSelectImage(selected.fullUrl);
              }}
              className="w-full py-3 bg-[var(--color-vermilion)] text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors active:scale-[0.98]"
            >
              この画像を使う
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
