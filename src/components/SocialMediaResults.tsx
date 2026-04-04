// src/components/SocialMediaResults.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SOCIAL_MEDIA_SHOTS, type SocialMediaResult } from "../services/socialMediaService";

interface SocialMediaResultsProps {
  results: SocialMediaResult[];
  onReset: () => void;
  onRetryShot: (shotId: string) => void;
  onReviseShot: (shotId: string, instruction: string) => void;
}

export function SocialMediaResults({ results, onReset, onRetryShot, onReviseShot }: SocialMediaResultsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [reviseText, setReviseText] = useState("");

  const successCount = results.filter(r => r.status === "done" && r.imageUrl).length;
  const errorCount = results.filter(r => r.status === "error").length;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `proshop-sm-${name}.png`;
    a.click();
  };

  const downloadAll = () => {
    const targets = selectedIds.size > 0
      ? results.filter(r => selectedIds.has(r.id) && r.imageUrl)
      : results.filter(r => r.imageUrl);
    targets.forEach(r => downloadImage(r.imageUrl!, r.id));
  };

  const handleRevise = (id: string) => {
    if (!reviseText.trim()) return;
    onReviseShot(id, reviseText);
    setReviseId(null);
    setReviseText("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-700 text-text">Sosyal Medya Paketi</h3>
          <p className="text-xs text-subtle mt-0.5">
            {successCount} görsel hazır{errorCount > 0 ? ` · ${errorCount} hata` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadAll} className="px-3 py-1.5 bg-accent text-black rounded-lg text-xs font-semibold hover:bg-accent-hover transition-colors">
            {selectedIds.size > 0 ? `Seçilenleri İndir (${selectedIds.size})` : "Tümünü İndir"}
          </button>
          <button onClick={onReset} className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs font-medium hover:text-text transition-colors">
            Yeni Set
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {results.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative rounded-xl border border-border overflow-hidden bg-surface"
          >
            {/* Image */}
            <div
              className="relative cursor-pointer"
              style={{ aspectRatio: r.aspectRatio === "9:16" ? "9/16" : r.aspectRatio === "1:1" ? "1/1" : "3/4" }}
              onClick={() => r.imageUrl && setZoomedUrl(r.imageUrl)}
            >
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.label} className="w-full h-full object-cover" />
              ) : r.status === "generating" ? (
                <div className="w-full h-full shimmer flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : r.status === "error" ? (
                <div className="w-full h-full bg-error-dim flex items-center justify-center">
                  <span className="text-xs text-error">Hata</span>
                </div>
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                  <span className="text-xs text-subtle">Bekliyor</span>
                </div>
              )}

              {/* Hover overlay */}
              {r.imageUrl && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedIds.has(r.id) ? "bg-accent border-accent" : "border-white/70 bg-black/30"
                    }`}
                  >
                    {selectedIds.has(r.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Label */}
            <div className="p-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text truncate">{r.label}</span>
                {SOCIAL_MEDIA_SHOTS.find(s => s.id === r.id)?.hasText && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent font-mono">TXT</span>
                )}
              </div>

              {/* Action buttons */}
              {r.status === "done" && r.imageUrl && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => downloadImage(r.imageUrl!, r.id)}
                    className="flex-1 py-1 text-[10px] bg-surface-2 border border-border rounded text-muted hover:text-text transition-colors"
                  >
                    İndir
                  </button>
                  <button
                    onClick={() => onRetryShot(r.id)}
                    className="flex-1 py-1 text-[10px] bg-surface-2 border border-border rounded text-muted hover:text-text transition-colors"
                  >
                    Yenile
                  </button>
                  <button
                    onClick={() => setReviseId(reviseId === r.id ? null : r.id)}
                    className="flex-1 py-1 text-[10px] bg-surface-2 border border-border rounded text-muted hover:text-text transition-colors"
                  >
                    Revize
                  </button>
                </div>
              )}
              {r.status === "error" && (
                <button
                  onClick={() => onRetryShot(r.id)}
                  className="w-full py-1 text-[10px] bg-error-dim border border-error/30 rounded text-error hover:bg-error/20 transition-colors"
                >
                  Tekrar Dene
                </button>
              )}

              {/* Revise panel */}
              <AnimatePresence>
                {reviseId === r.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={reviseText}
                        onChange={(e) => setReviseText(e.target.value)}
                        placeholder="Değişiklik talimatı..."
                        className="flex-1 px-2 py-1.5 bg-bg border border-border rounded text-xs text-text placeholder:text-subtle outline-none focus:border-accent/60"
                        onKeyDown={(e) => e.key === "Enter" && handleRevise(r.id)}
                      />
                      <button
                        onClick={() => handleRevise(r.id)}
                        className="px-2 py-1.5 bg-accent text-black rounded text-xs font-semibold"
                      >
                        Gönder
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedUrl(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={zoomedUrl}
              alt="Zoom"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
