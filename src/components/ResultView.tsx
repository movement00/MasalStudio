import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateKenBurnsVideo } from "../services/videoService";

interface ResultViewProps {
  imageUrl: string;
  onRegenerate: (changeComposition?: boolean) => void;
  onRevise: (prompt: string, refFile?: File) => Promise<void>;
  onReset: () => void;
  onStartPipeline?: () => void;
  isRegenerating: boolean;
}

export function ResultView({ imageUrl, onRegenerate, onRevise, onReset, onStartPipeline, isRegenerating }: ResultViewProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoPct, setVideoPct] = useState(0);

  const handleKenBurns = async () => {
    setVideoGenerating(true); setVideoPct(0);
    try {
      const url = await generateKenBurnsVideo(imageUrl, 5, (pct) => setVideoPct(pct));
      const a = document.createElement("a");
      a.href = url;
      a.download = `proshop-reveal-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setVideoGenerating(false);
    }
  };

  const handleRevise = async () => {
    if (!revisionText.trim()) return;
    setIsRevising(true);
    try {
      await onRevise(revisionText);
      setRevisionText("");
      setShowRevision(false);
    } finally {
      setIsRevising(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `proshop-studio-${Date.now()}.png`;
    link.click();
  };

  return (
    <>
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.93 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.93 }}
              src={imageUrl}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false); }}
              className="absolute top-5 right-5 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* Image */}
        <div
          onClick={() => setIsZoomOpen(true)}
          className="relative group cursor-zoom-in rounded-xl overflow-hidden bg-black border border-border"
        >
          <img src={imageUrl} alt="Üretilen görsel" className="w-full h-auto" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-white/60 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono">
              Büyütmek için tıklayın
            </span>
            <span className="text-[10px] text-white/50 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full font-mono">
              AI Generated
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-black rounded-lg font-semibold text-xs hover:bg-accent-hover transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            İndir
          </button>

          <button
            onClick={() => onRegenerate(false)}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-muted hover:text-text rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRegenerating ? "animate-spin-slow" : ""}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Yeniden Üret
          </button>

          <button
            onClick={() => onRegenerate(true)}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-muted hover:text-text rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Farklı Kompozisyon
          </button>

          <button
            onClick={() => setShowRevision(!showRevision)}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-lg text-xs font-medium transition-colors ${
              showRevision
                ? "bg-accent/10 border-accent/40 text-accent"
                : "bg-surface border-border text-muted hover:text-text"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Revize Et
          </button>

          {onStartPipeline && (
            <button
              onClick={onStartPipeline}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-accent text-black rounded-lg font-semibold text-xs hover:bg-accent-hover transition-colors disabled:opacity-40"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Tam Set Üret
            </button>
          )}

          <button
            onClick={handleKenBurns}
            disabled={videoGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-muted hover:text-text rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {videoGenerating ? `Video ${videoPct}%` : "Reveal Video"}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border text-subtle hover:border-error/40 hover:text-error rounded-lg text-xs font-medium transition-colors ml-auto"
          >
            Sıfırla
          </button>
        </div>

        {/* Revision panel */}
        <AnimatePresence>
          {showRevision && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
                <label className="text-xs font-medium text-muted block uppercase tracking-wider font-mono">
                  Değişiklik Talimatı
                </label>
                <textarea
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder="Örn: Yastıkları daha kabarık yap, ışığı daha sıcak tonlara çek..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-xs text-text placeholder:text-subtle resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button
                  onClick={handleRevise}
                  disabled={isRevising || !revisionText.trim()}
                  className="px-5 py-2 bg-accent text-black rounded-lg font-semibold text-xs hover:bg-accent-hover transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isRevising ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin-slow">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      İşleniyor...
                    </>
                  ) : "Revizyonu Uygula"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
