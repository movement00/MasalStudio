// src/components/SocialMediaConfig.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { SOCIAL_MEDIA_SHOTS } from "../services/socialMediaService";

interface SocialMediaConfigProps {
  brandName: string;
  onBrandNameChange: (name: string) => void;
  logoBase64: string | undefined;
  onLogoChange: (base64: string | undefined) => void;
  enabledShots: Set<string>;
  onEnabledShotsChange: (shots: Set<string>) => void;
}

export function SocialMediaConfig({
  brandName,
  onBrandNameChange,
  logoBase64: _logoBase64,
  onLogoChange,
  enabledShots,
  onEnabledShotsChange,
}: SocialMediaConfigProps) {
  const [logoPreview, setLogoPreview] = useState<string>(() => {
    const saved = localStorage.getItem("proshop_logo_preview");
    return saved || "";
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      onLogoChange(base64);
      setLogoPreview(result);
      localStorage.setItem("proshop_logo", base64);
      localStorage.setItem("proshop_logo_preview", result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onLogoChange(undefined);
    setLogoPreview("");
    localStorage.removeItem("proshop_logo");
    localStorage.removeItem("proshop_logo_preview");
  };

  const toggleShot = (id: string) => {
    const next = new Set(enabledShots);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onEnabledShotsChange(next);
  };

  const toggleAll = () => {
    if (enabledShots.size === SOCIAL_MEDIA_SHOTS.length) {
      onEnabledShotsChange(new Set());
    } else {
      onEnabledShotsChange(new Set(SOCIAL_MEDIA_SHOTS.map(s => s.id)));
    }
  };

  const groups = [
    { key: "A", label: "Yazılı Banner", color: "text-accent" },
    { key: "B", label: "Estetik Görsel", color: "text-success" },
    { key: "C", label: "Carousel Devam", color: "text-blue-400" },
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
      {/* Brand Name */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-subtle uppercase tracking-wider">
          Marka Adı (isteğe bağlı)
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          placeholder="Örn: Premium Home"
          className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-subtle focus:border-accent/60 focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-subtle uppercase tracking-wider">
          Logo (isteğe bağlı)
        </label>
        {logoPreview ? (
          <div className="flex items-center gap-3 p-2 bg-bg border border-border rounded-lg">
            <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain rounded" />
            <span className="text-xs text-muted flex-1">Logo yüklendi</span>
            <button
              onClick={handleRemoveLogo}
              className="text-xs text-error hover:text-error/80 transition-colors"
            >
              Kaldır
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-3 bg-bg border border-dashed border-border rounded-lg cursor-pointer hover:border-accent/40 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-subtle">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="text-xs text-subtle">Logo Yükle</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Shot Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-subtle uppercase tracking-wider">
            Görsel Seti ({enabledShots.size}/{SOCIAL_MEDIA_SHOTS.length})
          </span>
          <button
            onClick={toggleAll}
            className="text-[10px] text-accent hover:text-accent-hover transition-colors font-medium"
          >
            {enabledShots.size === SOCIAL_MEDIA_SHOTS.length ? "Temizle" : "Tümünü Seç"}
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.key} className="space-y-1">
            <span className={`text-[10px] font-mono ${group.color} uppercase tracking-wider`}>
              {group.label}
            </span>
            {SOCIAL_MEDIA_SHOTS.filter(s => s.group === group.key).map((shot) => (
              <motion.button
                key={shot.id}
                onClick={() => toggleShot(shot.id)}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                  enabledShots.has(shot.id)
                    ? "border-accent/40 bg-accent-dim"
                    : "border-border bg-bg hover:border-border"
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                  enabledShots.has(shot.id) ? "bg-accent border-accent" : "border-border"
                }`}>
                  {enabledShots.has(shot.id) && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{shot.label}</div>
                  <div className="text-[10px] text-subtle">{shot.description} · {shot.aspectRatio === "9:16" ? "9:16" : shot.aspectRatio === "1:1" ? "1:1" : "4:5"}</div>
                </div>
                {shot.hasText && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono">TXT</span>
                )}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
