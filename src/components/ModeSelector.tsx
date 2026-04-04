import { motion } from "framer-motion";
import type { AppMode } from "../types";

const MODE_OPTIONS: { id: AppMode; name: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "pipeline",
    name: "Tam Set (Pipeline)",
    desc: "10 farklı profesyonel görsel",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: "photography",
    name: "Tekli Fotoğraf",
    desc: "Tek profesyonel ürün fotoğrafı",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
  },
  {
    id: "infographic",
    name: "İnfografik",
    desc: "Özellik etiketli pazarlama görseli",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/><path d="M8 8h5"/><path d="M8 16h3"/>
      </svg>
    ),
  },
  {
    id: "box-content",
    name: "Kutu İçeriği",
    desc: "Knolling / flat-lay düzenleme",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    id: "angles",
    name: "Açılar",
    desc: "Farklı kamera açıları",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
  },
  {
    id: "social-media",
    name: "Sosyal Medya",
    desc: "7 görselden oluşan SM paketi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    id: "seo-content",
    name: "SEO / Ürün İçeriği",
    desc: "SEO başlık, açıklama ve anahtar kelimeler",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
];

interface ModeSelectorProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-700 text-text mb-1">Üretim Modunu Seç</h2>
        <p className="text-sm text-muted">Ne tür görsel üretmek istiyorsun?</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {MODE_OPTIONS.map((opt) => {
          const isSelected = mode === opt.id;
          return (
            <motion.button
              key={opt.id}
              onClick={() => onModeChange(opt.id)}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? "border-accent bg-accent-dim shadow-[0_0_0_1px_var(--color-accent)]"
                  : "border-border bg-surface hover:border-accent/40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? "bg-accent text-black" : "bg-surface-2 text-muted"
                }`}
              >
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text">{opt.name}</div>
                <div className="text-xs text-subtle">{opt.desc}</div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "border-accent bg-accent" : "border-border"
                }`}
              >
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
