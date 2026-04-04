# Social Media Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Sosyal Medya" mode to ProShop Studio that generates a 7-visual social media content package (Instagram posts, stories, carousel, lifestyle shots) from product photos, with 3 entry paths (standalone mode, pipeline checkbox, post-pipeline button).

**Architecture:** New `socialMediaService.ts` defines 7 shot templates with prompt builders (same pattern as `pipelineService.ts`). A `runSocialMediaPipeline()` function generates shots sequentially using existing `generateImageRaw()`. New UI components (`SocialMediaConfig`, `SocialMediaResults`) follow existing component patterns. Three entry paths all feed the same pipeline function.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Google Gemini API (via existing geminiService)

---

## File Structure

```
src/
├── types.ts                          (MODIFY — add 'social-media' to AppMode, new ProcessStep values)
├── constants.ts                      (MODIFY — add SOCIAL_MEDIA_SHOTS config)
├── services/
│   └── socialMediaService.ts         (NEW — shot definitions, prompt builders, runSocialMediaPipeline)
├── components/
│   ├── SocialMediaConfig.tsx          (NEW — logo upload, brand name, shot toggles)
│   ├── SocialMediaResults.tsx         (NEW — results grid with platform labels)
│   ├── Header.tsx                     (MODIFY — add Sosyal Medya tab)
│   ├── ModeSelector.tsx               (MODIFY — add Sosyal Medya card)
│   ├── PipelineConfig.tsx             (MODIFY — add checkbox)
│   ├── PipelineResults.tsx            (MODIFY — add button)
│   └── App.tsx                        (MODIFY — social media state, handlers, layout)
```

---

### Task 1: Update Types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add social-media to AppMode and new ProcessStep values**

In `src/types.ts`, change line 40:
```typescript
export type AppMode = 'pipeline' | 'photography' | 'infographic' | 'box-content' | 'angles' | 'social-media';
```

Change line 41:
```typescript
export type ProcessStep = 'idle' | 'analyzing' | 'selection' | 'generating' | 'done' | 'error' | 'pipeline-running' | 'pipeline-done' | 'social-media-running' | 'social-media-done';
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add social-media mode to AppMode and ProcessStep types"
```

---

### Task 2: Social Media Service

**Files:**
- Create: `src/services/socialMediaService.ts`

- [ ] **Step 1: Create the social media service with 7 shot definitions and pipeline runner**

```typescript
// src/services/socialMediaService.ts
import { generateImageRaw } from "./geminiService";

export interface SocialMediaShot {
  id: string;
  label: string;
  group: "A" | "B" | "C";
  groupLabel: string;
  aspectRatio: string;
  hasText: boolean;
  description: string;
  promptBuilder: (
    generationPrompt: string,
    signatureDetails: string,
    productName: string,
    brandName: string,
    logoBase64?: string
  ) => string;
}

export interface SocialMediaResult {
  id: string;
  label: string;
  aspectRatio: string;
  imageUrl: string | null;
  status: "pending" | "generating" | "done" | "error";
  error?: string;
}

export interface SocialMediaProgress {
  currentGroup: "A" | "B" | "C" | "done";
  currentShot: string;
  completedCount: number;
  totalCount: number;
  results: SocialMediaResult[];
}

export type SocialMediaCallback = (progress: SocialMediaProgress) => void;

const BANNER_BASE = (
  generationPrompt: string,
  signatureDetails: string,
  productName: string,
  brandName: string,
  textInstructions: string,
  aspectRatio: string,
  logoBase64?: string
) => `Generate a professional social media marketing banner image.

PRODUCT CONTEXT:
${generationPrompt}

PRODUCT DETAILS: ${signatureDetails}

BANNER DESIGN INSTRUCTIONS:
- Create a sleek, modern marketing banner optimized for ${aspectRatio} aspect ratio.
- The product (bedding set) must be the hero element — clearly visible, beautifully styled.
- Professional studio or lifestyle setting with warm, inviting lighting.
- Premium, magazine-quality aesthetic.

TEXT ON IMAGE (MUST BE IN TURKISH):
${textInstructions}

${brandName ? `BRAND NAME: "${brandName}" — display it elegantly on the image.` : ""}
${logoBase64 ? "A logo image is provided as a reference — place it subtly in a corner of the banner." : ""}

CRITICAL:
- ALL text on the image MUST be in TURKISH.
- Typography must be clean, modern, and premium-looking.
- Product colors, embroidery, and details must match reference images exactly.
- NO people in the image.`;

const LIFESTYLE_BASE = (
  generationPrompt: string,
  signatureDetails: string,
  sceneInstructions: string,
  aspectRatio: string
) => `Generate a professional lifestyle product photograph.

PRODUCT CONTEXT:
${generationPrompt}

PRODUCT DETAILS: ${signatureDetails}

SCENE: ${sceneInstructions}

CRITICAL:
- This is a pure lifestyle/aesthetic shot — NO text, NO labels, NO watermarks on the image.
- Must look like a genuine DSLR photograph, not CGI.
- Product colors, embroidery, and textile details must match reference images exactly.
- NO people in the image.
- Optimize composition for ${aspectRatio} aspect ratio.`;

export const SOCIAL_MEDIA_SHOTS: SocialMediaShot[] = [
  // ═══ GROUP A: Text Banner Visuals ═══
  {
    id: "sm_feed_banner",
    label: "Instagram Feed Banner",
    group: "A",
    groupLabel: "Yazılı Banner",
    aspectRatio: "3:4",
    hasText: true,
    description: "Ürün ismi + slogan + logo ile feed görseli",
    promptBuilder: (gp, sig, productName, brandName, logoBase64) =>
      BANNER_BASE(gp, sig, productName, brandName,
        `- Product name: "${productName}" as the main headline in large, elegant serif typography.
- A short, aspirational Turkish marketing slogan below (e.g., "Hayalinizdeki Konfor", "Lüks Dokunuş, Her Gece").
- The slogan should feel premium and be related to comfort/luxury/quality.`,
        "4:5", logoBase64),
  },
  {
    id: "sm_story_banner",
    label: "Instagram Story Banner",
    group: "A",
    groupLabel: "Yazılı Banner",
    aspectRatio: "9:16",
    hasText: true,
    description: "Tam ekran story formatında tanıtım",
    promptBuilder: (gp, sig, productName, brandName, logoBase64) =>
      BANNER_BASE(gp, sig, productName, brandName,
        `- Full-screen vertical (9:16) story format.
- Product name "${productName}" prominently displayed.
- A bold, attention-grabbing Turkish headline (e.g., "YENİ KOLEKSİYON", "SINIRLI STOK").
- A swipe-up style call-to-action at the bottom (e.g., "Keşfet →", "İncele →").`,
        "9:16", logoBase64),
  },
  {
    id: "sm_carousel_intro",
    label: "Carousel Kart 1 — Tanıtım",
    group: "A",
    groupLabel: "Yazılı Banner",
    aspectRatio: "3:4",
    hasText: true,
    description: "Carousel açılış kartı, ürün tanıtımı",
    promptBuilder: (gp, sig, productName, brandName, logoBase64) =>
      BANNER_BASE(gp, sig, productName, brandName,
        `- Opening card of a carousel series.
- Product name "${productName}" as the hero headline.
- 2-3 key product features listed elegantly in Turkish (e.g., "✓ %100 Pamuk Saten", "✓ Nakışlı Tasarım", "✓ 7 Parça Set").
- Clean, modern layout that makes the viewer want to swipe for more.`,
        "4:5", logoBase64),
  },

  // ═══ GROUP B: Aesthetic/Lifestyle (No Text) ═══
  {
    id: "sm_lifestyle",
    label: "Lifestyle Shot",
    group: "B",
    groupLabel: "Estetik Görsel",
    aspectRatio: "3:4",
    hasText: false,
    description: "Yaşam alanında ürün, yazısız",
    promptBuilder: (gp, sig) =>
      LIFESTYLE_BASE(gp, sig,
        `Warm, sunlit bedroom scene. Product beautifully styled on the bed with duvet artfully turned back. Scandinavian-contemporary bedroom with soft morning light through sheer curtains. A coffee cup on the nightstand, a knit throw on a nearby chair. Inviting, aspirational mood — "I want this bedroom" feeling. Shot at f/4 with 50mm lens.`,
        "4:5"),
  },
  {
    id: "sm_detail",
    label: "Detay Close-up",
    group: "B",
    groupLabel: "Estetik Görsel",
    aspectRatio: "1:1",
    hasText: false,
    description: "Doku ve kalite detay çekimi, yazısız",
    promptBuilder: (gp, sig) =>
      LIFESTYLE_BASE(gp, sig,
        `Extreme close-up of the fabric texture and embroidery detail. Fill the frame with the textile surface — show thread structure, weave pattern, and embroidery stitching in beautiful detail. Shallow depth of field with tack-sharp center fading to soft bokeh. Side lighting at 45 degrees raking across the surface to reveal texture dimensionality. No bed, no room — only the fabric surface.`,
        "1:1"),
  },

  // ═══ GROUP C: Carousel Continuation ═══
  {
    id: "sm_carousel_angle",
    label: "Carousel Kart 2 — Açı",
    group: "C",
    groupLabel: "Carousel Devam",
    aspectRatio: "3:4",
    hasText: false,
    description: "Farklı açıdan ürün, yazısız",
    promptBuilder: (gp, sig) =>
      LIFESTYLE_BASE(gp, sig,
        `Different angle product shot. Low angle from the foot of the bed looking toward the headboard. Dramatic yet warm natural lighting. The duvet edge cascading over the bed foot is the closest element. Shows the product from a fresh perspective. Clean, modern bedroom setting.`,
        "4:5"),
  },
  {
    id: "sm_carousel_cta",
    label: "Carousel Kart 3 — Kapanış",
    group: "C",
    groupLabel: "Carousel Devam",
    aspectRatio: "3:4",
    hasText: true,
    description: "Kapanış kartı, slogan + CTA",
    promptBuilder: (gp, sig, productName, brandName, logoBase64) =>
      BANNER_BASE(gp, sig, productName, brandName,
        `- Final card of a carousel series — the closing/CTA card.
- A compelling Turkish call-to-action as the main text (e.g., "Şimdi Keşfet", "Hemen İncele", "Sipariş Ver").
- Product name "${productName}" displayed smaller below.
- Clean, premium design that drives action.
- The product should still be visible but the text/CTA is the focus.`,
        "4:5", logoBase64),
  },
];

export async function runSocialMediaPipeline(
  referenceImages: string[],
  generationPrompt: string,
  signatureDetails: string,
  productName: string,
  brandName: string,
  enabledShotIds: string[],
  logoBase64: string | undefined,
  onProgress: SocialMediaCallback
): Promise<SocialMediaResult[]> {
  const shots = SOCIAL_MEDIA_SHOTS.filter(s => enabledShotIds.includes(s.id));
  const results: SocialMediaResult[] = shots.map(s => ({
    id: s.id,
    label: s.label,
    aspectRatio: s.aspectRatio,
    imageUrl: null,
    status: "pending" as const,
  }));

  const report = (currentShot: string, group: "A" | "B" | "C" | "done") => {
    onProgress({
      currentGroup: group,
      currentShot,
      completedCount: results.filter(r => r.status === "done" || r.status === "error").length,
      totalCount: results.length,
      results: [...results],
    });
  };

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    results[i].status = "generating";
    report(shot.label, shot.group);

    try {
      const prompt = shot.promptBuilder(
        generationPrompt,
        signatureDetails,
        productName,
        brandName,
        logoBase64
      );

      const imageUrl = await generateImageRaw(
        prompt,
        referenceImages,
        shot.aspectRatio,
        shot.hasText // textFirst for banner shots
      );

      results[i].imageUrl = imageUrl;
      results[i].status = "done";
    } catch (err: any) {
      results[i].status = "error";
      results[i].error = err.message || "Görsel oluşturulamadı";
    }

    report(shot.label, i < shots.length - 1 ? shots[i + 1].group : "done");
  }

  return results;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/socialMediaService.ts
git commit -m "feat: add social media service with 7 shot definitions and pipeline runner"
```

---

### Task 3: SocialMediaConfig Component

**Files:**
- Create: `src/components/SocialMediaConfig.tsx`

- [ ] **Step 1: Create the config panel**

```tsx
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
  logoBase64,
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SocialMediaConfig.tsx
git commit -m "feat: add SocialMediaConfig component with logo upload and shot selection"
```

---

### Task 4: SocialMediaResults Component

**Files:**
- Create: `src/components/SocialMediaResults.tsx`

- [ ] **Step 1: Create the results view**

This follows the same pattern as `PipelineResults.tsx` but with social media labels and platform icons.

```tsx
// src/components/SocialMediaResults.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SocialMediaResult } from "../services/socialMediaService";

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
                {r.hasText && (
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SocialMediaResults.tsx
git commit -m "feat: add SocialMediaResults component with grid, download, revise"
```

---

### Task 5: Update Header and ModeSelector

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/ModeSelector.tsx`

- [ ] **Step 1: Add Sosyal Medya tab to Header.tsx**

In `Header.tsx`, add to the `modes` array (after the "angles" entry, before the closing `]`):

```tsx
  {
    id: "social-media",
    label: "Sosyal",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
```

- [ ] **Step 2: Add Sosyal Medya card to ModeSelector.tsx**

In `ModeSelector.tsx`, add to the `MODE_OPTIONS` array (after the "angles" entry):

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx src/components/ModeSelector.tsx
git commit -m "feat: add Sosyal Medya tab to Header and ModeSelector"
```

---

### Task 6: Add Pipeline Checkbox and Post-Pipeline Button

**Files:**
- Modify: `src/components/PipelineConfig.tsx`
- Modify: `src/components/PipelineResults.tsx`

- [ ] **Step 1: Add checkbox to PipelineConfig.tsx**

Add a new prop and checkbox. In the component's props interface, add:

```tsx
  autoSocialMedia: boolean;
  onAutoSocialMediaChange: (value: boolean) => void;
```

At the bottom of the component (before the closing `</div>` of the main container), add:

```tsx
      {/* Social Media Auto-Generate */}
      <div className="flex items-center gap-2.5 p-3 bg-bg border border-border rounded-lg">
        <button
          onClick={() => onAutoSocialMediaChange(!autoSocialMedia)}
          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
            autoSocialMedia ? "bg-accent border-accent" : "border-border"
          }`}
        >
          {autoSocialMedia && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          )}
        </button>
        <div>
          <div className="text-xs font-medium text-text">Sosyal Medya Paketi</div>
          <div className="text-[10px] text-subtle">Bitince 7 görselden SM paketi de üret</div>
        </div>
      </div>
```

- [ ] **Step 2: Add button to PipelineResults.tsx**

Add a new prop:

```tsx
  onStartSocialMedia?: () => void;
```

After the existing action buttons area (download all / new set), add:

```tsx
        {onStartSocialMedia && (
          <button
            onClick={onStartSocialMedia}
            className="w-full py-3 bg-accent text-black rounded-lg font-display font-700 text-sm hover:bg-accent-hover transition-colors active:scale-[0.99] shadow-[0_4px_20px_rgba(232,160,32,0.25)]"
          >
            Sosyal Medya Paketi Oluştur →
          </button>
        )}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PipelineConfig.tsx src/components/PipelineResults.tsx
git commit -m "feat: add social media checkbox to PipelineConfig and button to PipelineResults"
```

---

### Task 7: Integrate Social Media into App.tsx

**Files:**
- Modify: `src/App.tsx`

This is the largest task. It adds social media state, handlers, and wires everything together.

- [ ] **Step 1: Add imports**

Add at top of App.tsx:

```tsx
import { SOCIAL_MEDIA_SHOTS, runSocialMediaPipeline } from "./services/socialMediaService";
import type { SocialMediaProgress, SocialMediaResult as SocialMediaResultType } from "./services/socialMediaService";
import { SocialMediaConfig } from "./components/SocialMediaConfig";
import { SocialMediaResults } from "./components/SocialMediaResults";
```

- [ ] **Step 2: Add MODE_COPY entry**

Add to `MODE_COPY` object:

```tsx
  "social-media": {
    title: "Sosyal Medya Paketi",
    desc: "Ürün fotoğraflarınızdan Instagram post, story, carousel ve estetik görseller — 7 parçalık komple sosyal medya seti.",
  },
```

- [ ] **Step 3: Add state variables**

After existing state declarations, add:

```tsx
  const [smBrandName, setSmBrandName] = useState(() => localStorage.getItem("proshop_brand_name") || "");
  const [smLogoBase64, setSmLogoBase64] = useState<string | undefined>(() => localStorage.getItem("proshop_logo") || undefined);
  const [smEnabledShots, setSmEnabledShots] = useState<Set<string>>(new Set(SOCIAL_MEDIA_SHOTS.map(s => s.id)));
  const [smProgress, setSmProgress] = useState<SocialMediaProgress | null>(null);
  const [smResults, setSmResults] = useState<SocialMediaResultType[]>([]);
  const [autoSocialMedia, setAutoSocialMedia] = useState(false);
```

Add brand name persistence:

```tsx
  const handleBrandNameChange = (name: string) => {
    setSmBrandName(name);
    localStorage.setItem("proshop_brand_name", name);
  };
```

- [ ] **Step 4: Add social media pipeline handler**

```tsx
  const startSocialMediaPipeline = async (fromPipeline = false) => {
    if (files.length === 0 && !fromPipeline) return;
    setStatus("social-media-running");
    setErrorMessage("");

    const b64List = files.map(f => f.base64);
    // If coming from pipeline, add pipeline result images as references
    const allRefs = fromPipeline && pipelineResults.length > 0
      ? [...b64List, ...pipelineResults.filter(r => r.imageUrl).map(r => r.imageUrl!)]
      : b64List;

    try {
      // If no analysis yet, run it first
      let currentAnalysis = analysis;
      if (!currentAnalysis) {
        setStatus("analyzing");
        const piecePreset = PIECE_PRESETS.find(p => p.count === pipelinePieceCount);
        const ctx = [
          piecePreset ? `This is a ${piecePreset.count}-piece set: ${piecePreset.pieces}` : "",
          pipelineUserNotes || "",
        ].filter(Boolean).join("\n");
        currentAnalysis = await api.analyzeProductPhotos(b64List, ctx || undefined);
        setAnalysis(currentAnalysis);
        setStatus("social-media-running");
      }

      const productName = currentAnalysis.suggestedTitle || "Premium Nevresim Seti";

      const results = await runSocialMediaPipeline(
        allRefs,
        currentAnalysis.generationPrompt,
        currentAnalysis.signatureDetails,
        productName,
        smBrandName,
        Array.from(smEnabledShots),
        smLogoBase64,
        (progress) => setSmProgress({ ...progress })
      );

      setSmResults(results);
      setStatus("social-media-done");

    } catch (err: any) {
      handleError(err);
    }
  };

  const startSocialMediaFromPipeline = () => startSocialMediaPipeline(true);
```

- [ ] **Step 5: Add retry/revise handlers for social media**

```tsx
  const retrySocialMediaShot = async (shotId: string) => {
    const shot = SOCIAL_MEDIA_SHOTS.find(s => s.id === shotId);
    if (!shot || !analysis) return;

    setSmResults(prev => prev.map(r => r.id === shotId ? { ...r, status: "generating" as const, error: undefined } : r));

    try {
      const b64List = files.map(f => f.base64);
      const productName = analysis.suggestedTitle || "Premium Nevresim Seti";
      const prompt = shot.promptBuilder(
        analysis.generationPrompt,
        analysis.signatureDetails,
        productName,
        smBrandName,
        smLogoBase64
      );
      const imageUrl = await api.generateImageRaw(prompt, b64List, shot.aspectRatio, shot.hasText);
      setSmResults(prev => prev.map(r => r.id === shotId ? { ...r, imageUrl, status: "done" as const } : r));
    } catch (err: any) {
      setSmResults(prev => prev.map(r => r.id === shotId ? { ...r, status: "error" as const, error: err.message } : r));
    }
  };

  const reviseSocialMediaShot = async (shotId: string, instruction: string) => {
    const current = smResults.find(r => r.id === shotId);
    if (!current?.imageUrl) return;
    const currentUrl = current.imageUrl;

    setSmResults(prev => prev.map(r => r.id === shotId ? { ...r, status: "generating" as const } : r));

    try {
      const revisedUrl = await api.reviseGeneratedImage(currentUrl, instruction, current.aspectRatio);
      setSmResults(prev => prev.map(r => r.id === shotId ? { ...r, imageUrl: revisedUrl, status: "done" as const } : r));
    } catch (err: any) {
      setSmResults(prev => prev.map(r => r.id === shotId ? { ...r, imageUrl: currentUrl, status: "done" as const, error: err.message } : r));
    }
  };
```

- [ ] **Step 6: Update reset function to clear social media state**

In the existing `reset` function, add:

```tsx
    setSmProgress(null); setSmResults([]);
```

- [ ] **Step 7: Modify pipeline completion to auto-trigger social media**

In `startPipeline`, after `setStatus("pipeline-done")`, add:

```tsx
      if (autoSocialMedia) {
        // Small delay so user sees pipeline results briefly
        setTimeout(() => startSocialMediaPipeline(true), 500);
      }
```

- [ ] **Step 8: Add social media mode to desktop layout**

In the desktop `<main>` section, add a new block for social media mode (after the `{!isPipeline && (` block's closing `)}` and before `</main>`):

The social media mode should follow the same sidebar+content pattern:
- Sidebar: UploadZone + SocialMediaConfig + Start button
- Content area: Loading / Progress / Results

- [ ] **Step 9: Add social media to mobile wizard content**

Update `mobileSettingsContent` to include SocialMediaConfig when mode is "social-media".
Update `mobileGenerateContent` to show social media results.

- [ ] **Step 10: Pass new props to PipelineConfig and PipelineResults**

Pass `autoSocialMedia` and `onAutoSocialMediaChange` to PipelineConfig.
Pass `onStartSocialMedia={startSocialMediaFromPipeline}` to PipelineResults.

- [ ] **Step 11: Verify build passes**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 12: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate social media pipeline into App with all 3 entry paths"
```

---

### Task 8: Build Verification and Final Test

**Files:**
- All modified files

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Manual testing checklist**

1. Header shows "Sosyal" tab (desktop) and ModeSelector shows "Sosyal Medya" card (mobile)
2. Social media mode: Upload → Config (brand name, logo, shot selection) → Start → Results
3. Pipeline mode: Checkbox appears in PipelineConfig
4. Pipeline results: "Sosyal Medya Paketi Oluştur →" button visible
5. Dark/light mode works correctly for new components
6. Results grid: download, retry, revise all functional
7. Logo persists in localStorage across page refresh

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete social media package feature"
```
