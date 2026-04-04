# Premium UI Redesign — ProShop Studio

**Date:** 2026-03-30
**Status:** Approved

## Overview

Complete UI redesign of the ProShop Studio nevresim photo generation app with premium aesthetics, dark/light mode support, and responsive mobile-first design with separate mobile and desktop layouts.

## Target Audience

Small merchants and bedding sellers (küçük esnaf/tüccarlar). UI must be simple, intuitive, and easy to understand without technical background.

## Design Decisions

### Color Palette
- **Keep** existing warm amber/gold accent scheme, modernize it
- **Dark mode:** Current palette (bg: #090806, accent: #e8a020, etc.)
- **Light mode:** Warm cream/off-white background (#faf8f5), slightly darker amber accent (#d4900a) for contrast
- CSS custom properties with `.light` class toggle for theme switching
- System preference detection via `prefers-color-scheme` with manual override stored in localStorage

### Typography
- Keep existing 3-font system: Syne (display), Instrument Sans (body), JetBrains Mono (labels)
- No changes needed

### Layout Strategy — Responsive Split

**Mobile (< 768px): Guided Studio Wizard**
- Step-by-step wizard flow: Upload → Mode Select → Settings → Generate/Results
- Bottom navigation bar for direct access to any step (not forced linear)
- Step indicator dots at top showing progress
- Single column, full-width content
- Each step is a full-screen view

**Desktop (>= 768px): Enhanced Sidebar Layout**
- Keep current sidebar (left) + content area (right) structure
- Modernize with updated spacing, borders, shadows
- Add dark/light toggle in header
- Same component logic, different layout arrangement

### Animations (B+ Level)
- Smooth page/step transitions with Framer Motion
- Staggered fade-up for lists and cards
- Satisfying micro-interactions on buttons (scale on press)
- Impressive loading spinner (concentric rings)
- Result image "reveal" effect
- No excessive parallax or 3D — performant on mobile

### Dark/Light Mode Implementation
- Theme context provider wrapping the app
- CSS custom properties for all colors (already partially in place)
- `.light` class on `<html>` element toggles all variables
- Toggle button in header (both mobile and desktop)
- Persist choice in localStorage
- Default: follow system preference

## Component Changes

### New Components
1. **ThemeProvider** — React context for theme state + toggle function
2. **ThemeToggle** — Sun/moon icon button, used in header
3. **BottomNav** — Mobile-only bottom navigation (4 tabs: Upload, Mode, Settings, Generate)
4. **StepIndicator** — Dot-based progress indicator for mobile wizard
5. **MobileWizard** — Wrapper that manages step state for mobile layout

### Modified Components
1. **App.tsx** — Add ThemeProvider, responsive layout split (wizard vs sidebar)
2. **Header.tsx** — Add ThemeToggle, simplify for mobile (logo + menu only)
3. **UploadZone.tsx** — Mobile-optimized layout, larger touch targets
4. **SettingsPanel.tsx** — Chip-based selectors instead of plain buttons, pill/rounded style
5. **LoadingState.tsx** — Keep current design, ensure theme-aware colors
6. **ResultView.tsx** — Mobile-friendly action buttons, keep zoom modal
7. **PipelineConfig.tsx** — Mobile card-based shot selection
8. **PipelineProgress.tsx** — 2-column grid on mobile (vs 3-5 on desktop)
9. **PipelineResults.tsx** — 2-column grid on mobile, larger touch targets
10. **ApiKeyInput.tsx** — Theme-aware, keep current onboarding flow

### Hero Shot Selection Feature
- In single photo (Tekli Fotoğraf) mode, after pipeline generation, allow user to select a "hero shot" from results
- Add selection UI with highlight ring on chosen image
- Must be preserved in both mobile and desktop layouts

### index.css Changes
- Add light mode CSS variables under `.light` selector
- Add bottom-nav utilities
- Add step-indicator styles
- Update grain/glow utilities for light mode compatibility

## Data Flow

No changes to data flow, API calls, or business logic. This is purely a UI/presentation layer redesign. All existing services (geminiService, pipelineService) remain untouched.

## File Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx          (NEW)
├── components/
│   ├── ThemeToggle.tsx           (NEW)
│   ├── BottomNav.tsx             (NEW)
│   ├── StepIndicator.tsx         (NEW)
│   ├── MobileWizard.tsx          (NEW)
│   ├── Header.tsx                (MODIFIED)
│   ├── UploadZone.tsx            (MODIFIED)
│   ├── SettingsPanel.tsx         (MODIFIED)
│   ├── LoadingState.tsx          (MODIFIED)
│   ├── ResultView.tsx            (MODIFIED)
│   ├── PipelineConfig.tsx        (MODIFIED)
│   ├── PipelineProgress.tsx      (MODIFIED)
│   ├── PipelineResults.tsx       (MODIFIED)
│   ├── ApiKeyInput.tsx           (MODIFIED)
│   └── AnalysisCard.tsx          (MODIFIED)
├── index.css                     (MODIFIED - add light theme vars)
├── App.tsx                       (MODIFIED - responsive layout split)
└── [services/, lib/, types.ts, constants.ts — UNCHANGED]
```

## Testing Plan
- Verify all 5 modes work on both mobile and desktop
- Test dark/light toggle persistence across refresh
- Test bottom nav navigation on mobile
- Test step indicator progress tracking
- Verify all existing functionality preserved (upload, generate, download, revise, pipeline)
- Test HEIC conversion still works
- Cross-browser: Chrome, Safari (mobile), Firefox
