"use client";

import { useEffect, useRef, useState } from "react";
import { Spot } from "@/data/spots";
import { ArrowLeft, Camera, Layers, SplitSquareHorizontal, Eye, EyeOff } from "lucide-react";

interface CameraViewProps {
  spot: Spot;
  onBack: () => void;
}

export function CameraView({ spot, onBack }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [opacityValue, setOpacityValue] = useState<number>(50);
  const [splitValue, setSplitValue] = useState<number>(100);
  const [uiHidden, setUiHidden] = useState<boolean>(false);
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false);

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
          opacity: opacityValue / 100,
          clipPath: `polygon(0 0, ${splitValue}% 0, ${splitValue}% 100%, 0 100%)`
        }}
      >
        <img 
          src={spot.imgUrl} 
          alt="Overlay Model" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Split view divider line */}
      {!uiHidden && splitValue < 100 && (
        <div 
          className="absolute top-0 bottom-0 w-[2px] pointer-events-none z-10"
          style={{ 
            left: `${splitValue}%`,
            background: 'linear-gradient(to bottom, transparent, #e60012, #e60012, transparent)',
            boxShadow: '0 0 12px rgba(230, 0, 18, 0.6), 0 0 24px rgba(230, 0, 18, 0.3)'
          }}
        />
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="absolute top-1/3 left-4 right-4 bg-red-900/70 text-white p-5 rounded-2xl backdrop-blur-xl z-20 text-center border border-red-800/50 animate-fade-in">
          <p className="text-sm leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* ── Top Header ── */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-500 ease-out ${
          uiHidden ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="animate-slide-down">
            {/* Glass Card Header */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                {/* Back Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onBack(); }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-90 flex-shrink-0"
                  aria-label="戻る"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                {/* Spot Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-base font-bold truncate leading-tight">{spot.title}</h2>
                  <p className="text-white/50 text-xs mt-0.5 truncate">{spot.hint}</p>
                </div>

                {/* Anime Badge */}
                <span className="hidden sm:inline-flex items-center bg-white/10 text-white/80 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10 flex-shrink-0">
                  {spot.anime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Panel ── */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ease-out ${
          uiHidden ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="animate-fade-in-up">
            {/* Glass Card Panel */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

              {/* Sliders Section */}
              <div 
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  controlsCollapsed ? 'max-h-0 opacity-0' : 'max-h-60 opacity-100'
                }`}
              >
                <div className="px-4 pt-4 pb-2 space-y-4">
                  {/* Opacity Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-white/60" />
                        <span className="text-[11px] text-white/60 font-medium uppercase tracking-wider">透過度</span>
                      </div>
                      <span className="text-white/80 text-xs font-mono tabular-nums bg-white/10 px-2 py-0.5 rounded-md">
                        {opacityValue}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={opacityValue}
                      onChange={(e) => setOpacityValue(Number(e.target.value))}
                      className="camera-slider slider-opacity"
                    />
                  </div>

                  {/* Split Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SplitSquareHorizontal className="w-4 h-4 text-white/60" />
                        <span className="text-[11px] text-white/60 font-medium uppercase tracking-wider">分割位置</span>
                      </div>
                      <span className="text-white/80 text-xs font-mono tabular-nums bg-white/10 px-2 py-0.5 rounded-md">
                        {splitValue}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={splitValue}
                      onChange={(e) => setSplitValue(Number(e.target.value))}
                      className="camera-slider slider-split"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mx-3" />

              {/* Button Bar */}
              <div className="flex items-center justify-between px-3 py-3">
                {/* Toggle Controls */}
                <button
                  onClick={(e) => { e.stopPropagation(); setControlsCollapsed(!controlsCollapsed); }}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 active:scale-90 group"
                  aria-label={controlsCollapsed ? "コントロールを展開" : "コントロールを折りたたむ"}
                >
                  {controlsCollapsed ? (
                    <Eye className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                  )}
                </button>

                {/* Shutter Button (Center) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setUiHidden(true);
                  }}
                  className="shutter-btn relative w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  aria-label="UI非表示（スクリーンショット用）"
                >
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-white/80" />
                  {/* Inner Circle */}
                  <div className="w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 text-stone-800" />
                  </div>
                </button>

                {/* Spacer for symmetry — same width as toggle button */}
                <div className="p-2.5 w-[44px]" />
              </div>

              {/* Hint Text */}
              <p className="text-center text-[10px] text-white/30 pb-2 -mt-1">
                シャッターでUI非表示 · タップで再表示
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
