"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, MapPin, X, Loader2, KeyRound, Search } from "lucide-react";
import { ImageSearchModal } from "@/components/ImageSearchModal";

interface ChatUIProps {
  onLocationFound: (lat: number, lng: number, title: string, imgUrl?: string) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  lat?: number;
  lng?: number;
  title?: string;
  imgUrl?: string;
}

export function ChatUI({ onLocationFound, onClose }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "こんにちは！京都のアニメ聖地を探していますか？「鴨川の橋の近くで主人公が座っていた場所」のようにシーンを教えてくだされば、場所を特定して地図に表示します！"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState<{lat: number; lng: number; title: string} | null>(null);
  
  // API Key handling for static export
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false); // No static loading, ask every time

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only scroll when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setIsApiKeySet(true);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userText = input.trim();
    setInput("");
    
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // We use gemini-2.5-flash which is fast and good for generic tasks
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `あなたは京都のアニメ聖地巡礼の専門家です。
ユーザーがアニメのシーンや場所の特徴を入力します。
その内容から、京都のどの場所（聖地）であるかを推測してください。
推測結果として、以下の要件を満たすJSONフォーマットのみで返答してください。余計な文字列（マークダウンブロック等）は含めないでください。

【JSONに含まれるべき項目】
・"name": 場所の名前
・"lat": おおよその緯度（数値）
・"lng": おおよその経度（数値）
・"description": その場所の説明やアニメの文脈
・"imgUrl": 特定した場所の**実在する画像**のURL（Wikimedia Commonsの「原画像URL」など、実際にリンクとして有効なパブリックなURLを含めてください。必ず該当その場所の写真である必要があります。）

JSONフォーマット例:
{
  "name": "鴨川デルタ",
  "lat": 35.0298,
  "lng": 135.7725,
  "description": "四畳半神話大系などでよく登場する出町柳の鴨川デルタ付近です。",
  "imgUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Kamogawa_Delta.jpg"
}

もし京都の場所として特定できない場合は、以下のようにエラーを返してください。
{
  "error": "申し訳ありません、その情報から京都の特定の場所を見つけることができませんでした。もう少し具体的なヒント（アニメ名など）をお願いします。"
}`
      });

      const result = await model.generateContent(userText);
      const responseText = result.response.text();
      
      // Try to parse JSON
      try {
        // Strip out markdown code blocks if the AI accidentally included them
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleanedText);
        
        if (data.error) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: data.error }]);
        } else if (data.lat && data.lng) {
          
          let validImgUrl: string | undefined = data.imgUrl;
          
          // Image Validation Process via JS Image object
          if (validImgUrl) {
            try {
              const isValid = await new Promise<boolean>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = validImgUrl as string;
              });
              if (!isValid) {
                console.warn("AI provided invalid image URL:", validImgUrl);
                validImgUrl = undefined; // Fallback will be used in SpotList
              }
            } catch (err) {
              validImgUrl = undefined;
            }
          }

          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: "ai", 
            content: `「${data.name}」ですね！こちらが見つかりました。\n\n${data.description}` + (!validImgUrl && data.imgUrl ? "\n(※AIが提案した画像は無効だったためプレースホルダーを使用します)" : ""),
            lat: data.lat,
            lng: data.lng,
            title: data.name,
            imgUrl: validImgUrl
          }]);
        }
      } catch (e) {
        console.error("Failed to parse AI response", e, responseText);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "エラーが発生しました。もう一度お試しください。\n" + responseText }]);
      }

    } catch (error) {
      console.error("Google AI Error:", error);
      let errMsg = "通信エラーが発生しました。";
      if (error instanceof Error && error.message.includes("API key")) {
        errMsg = "APIキーが無効か設定されていません。";
        setIsApiKeySet(false);
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] sm:h-[600px] animate-in slide-in-from-bottom sm:fade-in duration-300">
        
        {/* Header */}
        <div className="bg-[var(--color-navy)] text-white p-4 flex justify-between items-center shadow-md z-10">
          <h3 className="font-bold flex items-center gap-2">
            <span className="text-xl">✨</span> 聖地AIナビ
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isApiKeySet ? (
          /* API Key Input State */
          <div className="flex-1 flex flex-col justify-center p-6 space-y-4 bg-stone-50 text-stone-800">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>
            <h4 className="text-center font-bold text-lg">AI機能を利用するには</h4>
            <p className="text-sm text-stone-600 text-center">
              Google GeminiのAPIキーを入力してください。<br/>
              ※ここで入力したキーは一時的に使用され、保存されません。
            </p>
            <form onSubmit={handleSaveKey} className="flex flex-col gap-3 mt-4">
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="border border-stone-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]"
                autoFocus
              />
              <button 
                type="submit"
                className="bg-[var(--color-vermilion)] text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                保存してチャットを始める
              </button>
            </form>
          </div>
        ) : (
          /* Chat State */
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm whitespace-pre-wrap ${
                      msg.role === "user" 
                        ? "bg-[var(--color-navy)] text-white rounded-tr-sm" 
                        : "bg-white text-stone-800 border border-stone-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  
                  {/* Google Maps Preview for AI Location Message */}
                  {msg.lat && msg.lng && (
                    <div className="mt-2 w-[85%] bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="h-32 w-full bg-stone-100">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          loading="lazy" 
                          allowFullScreen 
                          referrerPolicy="no-referrer-when-downgrade" 
                          src={`https://maps.google.com/maps?q=${msg.lat},${msg.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                      </div>
                      <div className="p-3 bg-stone-50 flex gap-2 justify-end border-t border-stone-200">
                         <button 
                           onClick={() => msg.lat && msg.lng && msg.title && setSearchingLocation({ lat: msg.lat, lng: msg.lng, title: msg.title })}
                           className="text-xs bg-[var(--color-navy)] text-white font-bold py-2 px-4 rounded-full shadow hover:bg-blue-900 transition-colors flex items-center gap-1"
                         >
                           <Search className="w-3 h-3" /> 周辺画像を検索
                         </button>
                         <button 
                           onClick={() => msg.lat && msg.lng && msg.title && onLocationFound(msg.lat, msg.lng, msg.title, msg.imgUrl)}
                           className="text-xs bg-[var(--color-vermilion)] text-white font-bold py-2 px-4 rounded-full shadow hover:bg-red-700 transition-colors"
                         >
                           そのまま追加
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-stone-200">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="例：水が流れるレンガのアーチ..."
                  className="flex-1 bg-stone-100 border-none rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/30 transition-shadow"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-[var(--color-vermilion)] text-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
            
            <div className="bg-stone-100 px-4 py-2 text-center border-t border-stone-200">
              <button 
                onClick={() => setIsApiKeySet(false)}
                className="text-xs text-stone-400 hover:text-stone-600 underline"
              >
                APIキーを変更する
              </button>
            </div>
          </>
        )}

        {/* Image Search Modal (inside chat) */}
        {searchingLocation && (
          <ImageSearchModal
            lat={searchingLocation.lat}
            lng={searchingLocation.lng}
            title={searchingLocation.title}
            onSelectImage={(imageUrl) => {
              onLocationFound(searchingLocation.lat, searchingLocation.lng, searchingLocation.title, imageUrl);
              setSearchingLocation(null);
            }}
            onClose={() => setSearchingLocation(null)}
          />
        )}
      </div>
    </div>
  );
}
