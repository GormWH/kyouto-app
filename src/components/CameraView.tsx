"use client";

import { useEffect, useRef, useState } from "react";
import { Spot } from "@/data/spots";
import { ArrowLeft, Camera, Columns, Layers } from "lucide-react";

interface CameraViewProps {
  spot: Spot;
  onBack: () => void;
}

export function CameraView({ spot, onBack }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [sliderValue, setSliderValue] = useState<number>(50);
  const [viewMode, setViewMode] = useState<"opacity" | "split">("opacity");
  const [uiHidden, setUiHidden] = useState<boolean>(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        const constraints = {
          video: { facingMode: "environment" },
          audio: false
        };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setErrorMsg("カメラの起動に失敗しました。権限を許可するか、HTTPSでアクセスしてください。");
      }
    }
    
    setupCamera();
    
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleContainerClick = () => {
    if (uiHidden) {
      setUiHidden(false);
    }
  };

  return (
    <div 
      className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col"
      onClick={handleContainerClick}
    >
      {/* Camera Video Layer */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay Image Layer (Anime Frame) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: viewMode === "opacity" ? sliderValue / 100 : 1,
          clipPath: viewMode === "split" ? `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)` : 'none'
        }}
      >
        <img 
          src={spot.imgUrl} 
          alt="Overlay Model" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Split view divider line */}
      {viewMode === "split" && !uiHidden && (
        <div 
          className="absolute top-0 bottom-0 bg-[var(--color-vermilion)] w-0.5 shadow-[0_0_8px_rgba(230,0,18,0.8)] pointer-events-none z-10"
          style={{ left: `${sliderValue}%` }}
        />
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="absolute top-1/3 left-4 right-4 bg-red-900/80 text-white p-4 rounded-xl backdrop-blur-sm z-20 text-center">
          {errorMsg}
        </div>
      )}

      {/* Control UI */}
      {/* Hint Banner */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 pt-8 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 z-20 pointer-events-none ${uiHidden ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="text-center pb-2">
          <h2 className="text-white text-lg font-bold drop-shadow-md">{spot.title}</h2>
          <p className="text-stone-300 text-xs mt-1 drop-shadow-md">{spot.hint}</p>
        </div>
      </div>

      {/* Bottom Panel */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 z-20 ${uiHidden ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        
        {/* Slider Controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-white">
            {viewMode === "opacity" ? <Layers className="w-5 h-5 text-stone-300" /> : <Columns className="w-5 h-5 text-stone-300" />}
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="flex-1 accent-[var(--color-vermilion)] h-2 bg-stone-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-white text-sm font-mono w-10 text-right">
            {sliderValue}%
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="p-3 bg-stone-800/80 hover:bg-stone-700 text-white rounded-full backdrop-blur-md transition-colors"
            aria-label="戻る"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setViewMode(prev => prev === "opacity" ? "split" : "opacity")}
            className="px-6 py-3 bg-[var(--color-navy)]/80 hover:bg-[var(--color-navy)] text-white font-bold rounded-full backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
          >
            {viewMode === "opacity" ? (
              <><Columns className="w-4 h-4" /> ワイプ</>
            ) : (
              <><Layers className="w-4 h-4" /> 半透明</>
            )}
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setUiHidden(true);
            }}
            className="p-3 bg-[var(--color-vermilion)] hover:bg-red-600 text-white rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center"
            aria-label="UI非表示（スクリーンショット用）"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-center text-xs text-stone-400 mt-4 h-4">
          カメラボタンでUIを隠します。画面タップで再表示。
        </p>
      </div>

    </div>
  );
}
