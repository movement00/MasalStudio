// src/components/SeoProductCard.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import type { SeoProductData } from "../services/seoService";

interface SeoProductCardProps {
  data: SeoProductData;
  onChange: (data: SeoProductData) => void;
  onApprove: () => void;
  isGenerating?: boolean;
}

export function SeoProductCard({ data, onChange, onApprove, isGenerating }: SeoProductCardProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  const updateField = <K extends keyof SeoProductData>(key: K, value: SeoProductData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAll = () => {
    const all = `${data.seoTitle}\n\n${data.metaDescription}\n\n${data.shortDescription}\n\n${data.longDescription.replace(/<[^>]*>/g, '')}\n\nAnahtar Kelimeler: ${data.keywords.join(", ")}\n\nParça Listesi:\n${data.pieceList.join("\n")}`;
    navigator.clipboard.writeText(all);
  };

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-xl border border-border p-8 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <h3 className="font-display text-base font-700 text-text mb-1">SEO Metinleri Üretiliyor</h3>
        <p className="text-xs text-subtle">Serebien formatında ürün başlığı, açıklama ve anahtar kelimeler oluşturuluyor...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-700 text-text">SEO Ürün Kartı</h3>
          <p className="text-[10px] text-subtle font-mono mt-0.5">Düzenleyip onaylayın, ardından SM paketine geçin</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-bg border border-border rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "preview" ? "bg-accent text-black" : "text-subtle hover:text-muted"
              }`}
            >
              Önizleme
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "edit" ? "bg-accent text-black" : "text-subtle hover:text-muted"
              }`}
            >
              Düzenle
            </button>
          </div>
          <button
            onClick={copyAll}
            className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs font-medium hover:text-text transition-colors"
          >
            Tümünü Kopyala
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        /* PREVIEW TAB */
        <div className="p-4 space-y-4">
          {/* SEO Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider">SEO Ürün Başlığı</span>
              <button onClick={() => copyToClipboard(data.seoTitle)} className="text-[10px] text-subtle hover:text-accent transition-colors">Kopyala</button>
            </div>
            <p className="text-sm font-semibold text-text leading-relaxed">{data.seoTitle}</p>
            <p className="text-[10px] text-subtle font-mono">{data.seoTitle.length}/120 karakter</p>
          </div>

          {/* Meta Description */}
          <div className="space-y-1 p-3 bg-bg rounded-lg border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-success uppercase tracking-wider">Meta Description</span>
              <button onClick={() => copyToClipboard(data.metaDescription)} className="text-[10px] text-subtle hover:text-accent transition-colors">Kopyala</button>
            </div>
            <p className="text-xs text-muted leading-relaxed">{data.metaDescription}</p>
            <p className="text-[10px] text-subtle font-mono">{data.metaDescription.length}/155 karakter</p>
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider">Kısa Açıklama</span>
              <button onClick={() => copyToClipboard(data.shortDescription)} className="text-[10px] text-subtle hover:text-accent transition-colors">Kopyala</button>
            </div>
            <p className="text-xs text-muted leading-relaxed">{data.shortDescription}</p>
          </div>

          {/* Long Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-subtle uppercase tracking-wider">Detaylı Ürün Açıklaması</span>
              <button onClick={() => copyToClipboard(data.longDescription.replace(/<[^>]*>/g, ''))} className="text-[10px] text-subtle hover:text-accent transition-colors">Kopyala</button>
            </div>
            <div
              className="text-xs text-muted leading-relaxed prose prose-sm max-w-none [&_strong]:text-text [&_li]:text-muted"
              dangerouslySetInnerHTML={{ __html: data.longDescription }}
            />
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-subtle uppercase tracking-wider">Anahtar Kelimeler</span>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-accent-dim border border-accent/20 rounded-full text-[10px] text-accent font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Piece List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-subtle uppercase tracking-wider">Parça Listesi</span>
            <ul className="space-y-1">
              {data.pieceList.map((piece, i) => (
                <li key={i} className="text-xs text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {piece}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* EDIT TAB */
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-accent uppercase tracking-wider">SEO Ürün Başlığı</label>
            <input
              type="text"
              value={data.seoTitle}
              onChange={(e) => updateField("seoTitle", e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:border-accent/60 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
            />
            <p className="text-[10px] text-subtle font-mono">{data.seoTitle.length}/120 karakter</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-success uppercase tracking-wider">Meta Description</label>
            <textarea
              value={data.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs text-text focus:border-accent/60 focus:ring-1 focus:ring-accent/20 outline-none resize-none transition-colors"
            />
            <p className="text-[10px] text-subtle font-mono">{data.metaDescription.length}/155 karakter</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-subtle uppercase tracking-wider">Kısa Açıklama</label>
            <textarea
              value={data.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs text-text focus:border-accent/60 focus:ring-1 focus:ring-accent/20 outline-none resize-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-subtle uppercase tracking-wider">Detaylı Açıklama (HTML)</label>
            <textarea
              value={data.longDescription}
              onChange={(e) => updateField("longDescription", e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs text-text font-mono focus:border-accent/60 focus:ring-1 focus:ring-accent/20 outline-none resize-y transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-subtle uppercase tracking-wider">Anahtar Kelimeler (virgülle ayır)</label>
            <input
              type="text"
              value={data.keywords.join(", ")}
              onChange={(e) => updateField("keywords", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-xs text-text focus:border-accent/60 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Footer — Approve Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onApprove}
          className="w-full py-3 bg-accent text-black rounded-lg font-display font-700 text-sm hover:bg-accent-hover transition-colors active:scale-[0.99] shadow-[0_4px_20px_rgba(232,160,32,0.25)]"
        >
          Onayla ve Sosyal Medya Paketine Geç →
        </button>
      </div>
    </motion.div>
  );
}
