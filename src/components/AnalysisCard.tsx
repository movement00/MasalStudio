import { motion } from "framer-motion";
import type { ProductAnalysis } from "../types";

interface AnalysisCardProps {
  analysis: ProductAnalysis;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
        <span className="text-[10px] font-mono text-subtle uppercase tracking-widest">
          Analiz tamamlandı
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-1">Başlık</p>
          <p className="text-sm font-display font-700 text-text">{analysis.suggestedTitle}</p>
        </div>

        <div className="h-px bg-border-subtle" />

        <div>
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-1">Kategori</p>
          <p className="text-xs text-muted">{analysis.productCategory}</p>
        </div>

        <div>
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-1">İmza Detayları</p>
          <p className="text-xs text-muted leading-relaxed">{analysis.signatureDetails}</p>
        </div>

        <div>
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-1">Açıklama</p>
          <p className="text-xs text-subtle leading-relaxed">{analysis.marketingDescription}</p>
        </div>
      </div>
    </motion.div>
  );
}
