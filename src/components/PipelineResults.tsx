import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PipelineResult } from "../services/pipelineService";
import { generateCarouselVideo } from "../services/videoService";

interface PipelineResultsProps {
  results: PipelineResult[];
  onReset: () => void;
  onRetryShot: (shotId: string) => void;
  onReviseShot?: (shotId: string, instruction: string) => void;
  onStartSocialMedia?: () => void;
}

export function PipelineResults({ results, onReset, onRetryShot, onReviseShot, onStartSocialMedia }: PipelineResultsProps) {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; label: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviseId, setReviseId] = useState<string | null>(null);
  const [reviseText, setReviseText] = useState("");
  const [carouselGenerating, setCarouselGenerating] = useState(false);
  const [carouselPct, setCarouselPct] = useState(0);

  const handleCarouselVideo = async () => {
    const images = successResults.map(r => r.imageUrl!);
    if (images.length === 0) return;
    setCarouselGenerating(true); setCarouselPct(0);
    try {
      const url = await generateCarouselVideo(images, 2.5, 0.5, (pct) => setCarouselPct(pct));
      const a = document.createElement("a");
      a.href = url;
      a.download = `proshop-carousel-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setCarouselGenerating(false);
    }
  };

  const successResults = results.filter(r => r.status === "done" && r.imageUrl);
  const errorCount = results.filter(r => r.status === "error").length;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const downloadSingle = (result: PipelineResult) => {
    if (!result.imageUrl) return;
    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = `proshop-${result.id}-${Date.now()}.png`;
    link.click();
  };

  const downloadAll = () => {
    const toDownload = selectedIds.size > 0
      ? results.filter(r => selectedIds.has(r.id) && r.imageUrl)
      : successResults;
    toDownload.forEach((r, i) => setTimeout(() => downloadSingle(r), i * 300));
  };

  const handleReviseSubmit = (shotId: string) => {
    if (!reviseText.trim() || !onReviseShot) return;
    onReviseShot(shotId, reviseText.trim());
    setReviseId(null);
    setReviseText("");
  };

  return (
    <>
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={zoomedImage.url}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute top-5 left-5 text-white/70 text-xs font-medium bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {zoomedImage.label}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
              className="absolute top-5 right-5 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-700 text-text">Pipeline Tamamlandı</h3>
            <p className="text-xs text-subtle font-mono mt-0.5">
              {successResults.length} görsel üretildi
              {errorCount > 0 && <span className="text-error"> · {errorCount} hata</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-black rounded-lg font-semibold text-xs hover:bg-accent-hover transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {selectedIds.size > 0 ? `İndir (${selectedIds.size})` : "Tümünü İndir"}
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-surface border border-border text-muted rounded-lg text-xs font-medium hover:border-error/40 hover:text-error transition-colors"
            >
              Yeni Set
            </button>
          </div>
        </div>

        {onStartSocialMedia && (
          <button
            onClick={onStartSocialMedia}
            className="w-full py-3 bg-accent text-black rounded-lg font-display font-700 text-sm hover:bg-accent-hover transition-colors active:scale-[0.99] shadow-[0_4px_20px_rgba(232,160,32,0.25)]"
          >
            Sosyal Medya Paketi Oluştur →
          </button>
        )}

        {successResults.length > 1 && (
          <button
            onClick={handleCarouselVideo}
            disabled={carouselGenerating}
            className="w-full py-3 bg-surface border border-border text-muted hover:text-text rounded-lg font-display font-700 text-sm transition-colors active:scale-[0.99] disabled:opacity-40"
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {carouselGenerating ? `Carousel Video Oluşturuluyor ${carouselPct}%` : "Carousel Video Oluştur"}
            </span>
          </button>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative rounded-xl overflow-hidden border transition-all ${
                selectedIds.has(result.id)
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-border hover:border-border-subtle"
              } ${result.status === "error" ? "border-error/30" : ""} ${result.status === "generating" ? "opacity-60" : ""}`}
            >
              {result.status === "generating" ? (
                <div className="aspect-[4/3] bg-surface flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-border border-t-accent animate-spin-slow" />
                    <span className="text-[10px] text-subtle font-mono">Üretiliyor...</span>
                  </div>
                </div>
              ) : result.imageUrl ? (
                <>
                  <div
                    className="aspect-[4/3] cursor-zoom-in"
                    onClick={() => setZoomedImage({ url: result.imageUrl!, label: result.label })}
                  >
                    <img src={result.imageUrl} alt={result.label} className="w-full h-full object-cover" />
                  </div>
                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(result.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        selectedIds.has(result.id)
                          ? "bg-accent text-black"
                          : "bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
                      }`}
                      title="Seç"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadSingle(result); }}
                      className="w-7 h-7 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      title="İndir"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                  {/* Bottom action bar */}
                  <div className="absolute bottom-[32px] inset-x-0 flex gap-1 px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRetryShot(result.id); }}
                      className="flex-1 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-md text-[10px] font-medium hover:bg-black/80 transition-colors"
                    >
                      Yeniden Üret
                    </button>
                    {onReviseShot && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setReviseId(reviseId === result.id ? null : result.id); setReviseText(""); }}
                        className="flex-1 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-md text-[10px] font-medium hover:bg-black/80 transition-colors"
                      >
                        Revize Et
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-[4/3] bg-error-dim flex flex-col items-center justify-center p-4 gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[10px] text-error text-center">{result.error || "Hata"}</p>
                  <button
                    onClick={() => onRetryShot(result.id)}
                    className="text-[10px] px-2.5 py-1 bg-error/10 text-error border border-error/20 rounded-md hover:bg-error/20 transition-colors font-medium"
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}

              {/* Label bar */}
              <div className="px-3 py-2 bg-surface border-t border-border-subtle">
                <span className="text-[10px] font-medium text-muted block truncate font-mono">{result.label}</span>
              </div>

              {/* Revise panel */}
              <AnimatePresence>
                {reviseId === result.id && onReviseShot && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-3 bg-surface-2 space-y-2">
                      <textarea
                        value={reviseText}
                        onChange={(e) => setReviseText(e.target.value)}
                        placeholder="Neleri değiştirmeli? Örn: nakış daha belirgin olsun, arka plan daha açık..."
                        rows={2}
                        className="w-full px-2.5 py-2 bg-bg border border-border rounded-lg text-[11px] text-text placeholder:text-subtle resize-none focus:outline-none focus:border-accent/60 transition-all"
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleReviseSubmit(result.id)}
                          disabled={!reviseText.trim()}
                          className="flex-1 py-1.5 bg-accent text-black rounded-md text-[10px] font-semibold hover:bg-accent-hover transition-colors disabled:opacity-30"
                        >
                          Revize Et
                        </button>
                        <button
                          onClick={() => { setReviseId(null); setReviseText(""); }}
                          className="px-3 py-1.5 bg-surface border border-border text-muted rounded-md text-[10px] font-medium hover:text-text transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
