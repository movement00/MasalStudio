# SEO Product Card Implementation Plan

**Goal:** Add SEO product title, description, meta description, and keywords generator that produces Serebien.com-style e-commerce text, shown as an editable card after pipeline completion and before social media kit generation.

**Architecture:** New `seoService.ts` uses Gemini to generate SEO text from product analysis. New `SeoProductCard.tsx` displays editable fields. Pipeline flow becomes: Pipeline → SEO Card (edit/approve) → SM Kit.

---

## Tasks

### Task 1: SEO Service
Create `src/services/seoService.ts` — generates SEO texts using Gemini analysis model.

### Task 2: SeoProductCard Component
Create `src/components/SeoProductCard.tsx` — editable card with all SEO fields.

### Task 3: App.tsx Integration
Wire SEO card into pipeline flow, between pipeline-done and social media.
