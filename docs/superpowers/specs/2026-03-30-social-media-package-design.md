# Social Media Package — ProShop Studio

**Date:** 2026-03-30
**Status:** Approved

## Overview

Add a "Sosyal Medya" (Social Media) feature to ProShop Studio that generates a complete social media content package (7 visuals) from the same product photos used in the existing pipeline. The package includes banner-style visuals with text overlays (product name, slogan, logo) and aesthetic lifestyle shots without text, forming a cohesive set ready for Instagram, Stories, and carousel posts.

## Target Audience

Small bedding merchants/sellers who need ready-to-post social media content from their product photos without hiring a designer.

## Trigger Points (3 Entry Paths)

1. **Header Mode:** "Sosyal Medya" added as 6th mode in the header tab bar (desktop) and mode selector (mobile). Works standalone — user uploads photos, runs social media pipeline directly.
2. **Pipeline Checkbox:** In PipelineConfig, a checkbox "Bitince sosyal medya paketini de üret" — when enabled, social media pipeline auto-starts after main pipeline completes.
3. **Post-Pipeline Button:** In PipelineResults, a prominent "Sosyal Medya Paketi Oluştur →" button that starts social media pipeline using existing analysis data and generated images as references.

All three paths feed into the same social media pipeline logic.

## Social Media Pipeline — 7 Shots

### Group A — Text Banner Visuals (3 shots)

| ID | Name | Aspect | Content |
|----|------|--------|---------|
| sm_feed_banner | Instagram Feed Banner | 4:5 | Product photo + product name + marketing slogan + logo (if uploaded). Professional banner layout. |
| sm_story_banner | Instagram Story Banner | 9:16 | Product photo + campaign message + logo (if uploaded). Full-screen vertical story format. |
| sm_carousel_intro | Carousel Kart 1 — Tanıtım | 4:5 | Product photo + introductory headline + key feature highlight. Opening card of carousel. |

### Group B — Aesthetic/Lifestyle (2 shots, no text)

| ID | Name | Aspect | Content |
|----|------|--------|---------|
| sm_lifestyle | Lifestyle Shot | 4:5 | Product styled in a living space (bedroom, living room). No text overlay. Warm, aspirational mood. |
| sm_detail | Detail Close-up | 1:1 | Macro/close-up of fabric texture, embroidery, or edge detail. No text. Quality and craftsmanship focus. |

### Group C — Carousel Continuation (2 shots)

| ID | Name | Aspect | Content |
|----|------|--------|---------|
| sm_carousel_angle | Carousel Kart 2 — Açı | 4:5 | Different angle/composition of product. No text. Visual variety. |
| sm_carousel_cta | Carousel Kart 3 — Kapanış | 4:5 | Closing card with slogan + call-to-action text. Brand-consistent design. |

### Generation Order

Sequential: Group A (3 shots) → Group B (2 shots) → Group C (2 shots). Each shot uses the product analysis and previously generated pipeline images as style references for consistency.

## Data Flow

```
User's original photos
  ↓
Product Analysis (reused from pipeline, or new if standalone)
  → productName, category, signatureDetails, generationPrompt
  ↓
Social Media Pipeline
  → For each shot: build prompt using analysis + shot template + references
  → Call Gemini image generation (gemini-3.1-flash-image-preview)
  → Return base64 image
  ↓
Social Media Results View
  → Grid display of 7 generated images
  → Download all / Download selected
  → Retry / Revise per shot
```

### Prompt Engineering Approach

Each shot has a `promptBuilder` function (same pattern as existing `PIPELINE_SHOTS`):
- **Text banner shots:** Prompt explicitly specifies Turkish text to display on image (product name from analysis, generated slogan, CTA). Instructs model to create professional marketing banner layout.
- **Lifestyle/aesthetic shots:** Prompt describes scene composition, lighting, mood. No text instructions.
- **All shots:** Include `signatureDetails` and `generationPrompt` from analysis for product accuracy. Reference images from main pipeline (if available) ensure visual consistency.

### Logo Handling

- Optional logo upload field in social media settings (new `LogoUpload` component or reuse existing upload pattern).
- Logo stored as base64, passed to text banner shots as inline data with instruction "place this logo in the corner."
- If no logo uploaded, banner shots are generated without logo — only text overlays.
- Logo persisted in localStorage so user doesn't need to re-upload each session.

## UI Changes

### New Components

1. **SocialMediaConfig** — Settings panel for social media mode (logo upload, shot selection toggles, optional brand name input)
2. **SocialMediaResults** — Results grid for social media shots (similar to PipelineResults but with social media labels and platform icons)

### Modified Components

1. **App.tsx** — Add "social-media" to `AppMode` union, add social media state management, add social media pipeline logic, add post-pipeline continuation flow
2. **Header.tsx** — Add "Sosyal Medya" tab to modes array
3. **PipelineConfig.tsx** — Add checkbox "Bitince sosyal medya paketini de üret"
4. **PipelineResults.tsx** — Add "Sosyal Medya Paketi Oluştur →" button
5. **ModeSelector.tsx** (mobile) — Add "Sosyal Medya" card
6. **types.ts** — Add "social-media" to AppMode, add SocialMediaShot type
7. **constants.ts** — Add SOCIAL_MEDIA_SHOTS array with shot definitions

### New Service Code

1. **socialMediaService.ts** — Social media shot definitions, prompt builders, `runSocialMediaPipeline()` function. Same pattern as `pipelineService.ts`.

### Mobile Wizard

- Social media mode works through the same wizard flow (Upload → Mode → Settings → Generate)
- Settings step shows SocialMediaConfig
- Generate step shows SocialMediaResults when done

## Types

```typescript
// Added to AppMode
export type AppMode = 'pipeline' | 'photography' | 'infographic' | 'box-content' | 'angles' | 'social-media';

// Added to ProcessStep
export type ProcessStep = '...' | 'social-media-running' | 'social-media-done';

// New type
export interface SocialMediaShot {
  id: string;
  label: string;
  group: 'A' | 'B' | 'C';
  groupLabel: string;
  aspectRatio: string;
  hasText: boolean;
  promptBuilder: (generationPrompt: string, signatureDetails: string, productName: string, aspectRatio: string, logoBase64?: string) => string;
}
```

## What Stays Unchanged

- All existing services (geminiService.ts, pipelineService.ts) — no modifications
- All existing modes continue working exactly as before
- Analysis logic reused, not duplicated
- cropRegion.ts, lib/ — unchanged
