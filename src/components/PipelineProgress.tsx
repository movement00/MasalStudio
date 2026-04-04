import { motion } from "framer-motion";
import type { PipelineProgress as PipelineProgressType } from "../services/pipelineService";

interface PipelineProgressProps {
  progress: PipelineProgressType;
}

const GROUP_LABELS: Record<string, string> = {
  A: "Oda Sahneleri",
  B: "Detay Çekimleri",
  C: "Düzenleme & Pazarlama",
  done: "Tamamlandı",
};

export function PipelineProgressView({ progress }: PipelineProgressProps) {
  const pct = Math.round((progress.completedCount / progress.totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-surface rounded-xl border border-border p-5 space-y-5"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-base font-700 text-text">Pipeline Çalışıyor</h3>
            <p className="text-[11px] text-subtle font-mono mt-0.5">
              {GROUP_LABELS[progress.currentGroup]}
            </p>
          </div>
          <span className="text-sm font-mono text-accent font-semibold tabular-nums">
            {progress.completedCount}/{progress.totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-accent rounded-full animate-progress-pulse"
          />
        </div>
        <p className="text-[10px] font-mono text-subtle mt-1.5 text-right">{pct}%</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {progress.results.map((result, i) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
              result.status === "done" ? "border-success/40"
              : result.status === "generating" ? "border-accent/50"
              : result.status === "error" ? "border-error/40"
              : "border-border"
            }`}
          >
            {result.imageUrl ? (
              <img src={result.imageUrl} alt={result.label} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                result.status === "generating" ? "shimmer"
                : result.status === "error" ? "bg-error-dim"
                : "bg-surface-2"
              }`}>
                {result.status === "generating" && (
                  <div className="w-5 h-5 rounded-full border border-border border-t-accent animate-spin-slow" />
                )}
                {result.status === "error" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                )}
                {result.status === "pending" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                )}
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3">
              <span className="text-[8px] text-white/80 font-medium leading-tight block truncate">{result.label}</span>
            </div>

            {result.status === "done" && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
