# Premium UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ProShop Studio with dark/light mode, mobile wizard layout, desktop sidebar layout, and premium aesthetics while preserving all existing business logic.

**Architecture:** Theme context provides dark/light state via CSS custom properties toggled by a `.light` class on `<html>`. Mobile (< md) uses a step-based wizard with bottom nav; desktop (>= md) keeps the current sidebar layout, modernized. No changes to services, types, or constants.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, CSS custom properties

---

## File Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx          (NEW — theme state + toggle + persistence)
├── components/
│   ├── ThemeToggle.tsx           (NEW — sun/moon toggle button)
│   ├── BottomNav.tsx             (NEW — mobile tab bar, md:hidden)
│   ├── StepIndicator.tsx         (NEW — dot progress for mobile wizard)
│   ├── MobileWizard.tsx          (NEW — step manager wrapping mobile content)
│   ├── Header.tsx                (MODIFY — add ThemeToggle, simplify mobile)
│   ├── App.tsx                   (MODIFY — wrap ThemeProvider, responsive layout)
│   └── [all other components]    (MODIFY — replace hardcoded colors with theme-aware)
├── index.css                     (MODIFY — add light theme variables)
└── main.tsx                      (MODIFY — wrap with ThemeProvider)
```

---

### Task 1: ThemeContext — Dark/Light Mode Foundation

**Files:**
- Create: `src/contexts/ThemeContext.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create ThemeContext**

```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("proshop_theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("proshop_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Add light mode CSS variables to index.css**

Add this block after the `@theme` block (after line 25) in `src/index.css`:

```css
/* Light mode overrides */
.light {
  --color-bg: #faf8f5;
  --color-surface: #ffffff;
  --color-surface-2: #f5f2ed;
  --color-surface-3: #ece8e1;
  --color-border: #e0dbd3;
  --color-border-subtle: #ebe7e0;
  --color-text: #1a1816;
  --color-muted: #6b6560;
  --color-subtle: #9a948e;
  --color-accent: #d4900a;
  --color-accent-hover: #b87c08;
  --color-accent-dim: #fef7e8;
  --color-success: #16a34a;
  --color-success-dim: #f0fdf4;
  --color-error: #dc2626;
  --color-error-dim: #fef2f2;
}
```

Also update the `body` rule in `@layer base` to add transition:

```css
body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

Update scrollbar for light mode — add after the existing scrollbar rules:

```css
.light ::-webkit-scrollbar-track {
  background: var(--color-bg);
}
.light ::-webkit-scrollbar-thumb {
  background: var(--color-border);
}
.light ::-webkit-scrollbar-thumb:hover {
  background: var(--color-subtle);
}
```

Reduce grain opacity in light mode — update the `.grain::after` rule to use a CSS variable:

```css
.grain::after {
  /* existing properties unchanged */
  opacity: 0.018;
}
.light .grain::after {
  opacity: 0.008;
}
```

- [ ] **Step 3: Wrap App with ThemeProvider in main.tsx**

Replace `src/main.tsx` content:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 4: Verify dark mode still works, toggle to light mode works**

Run: `npm run dev` and check browser — toggle between themes via React DevTools or browser console: `document.documentElement.classList.toggle('light')`

- [ ] **Step 5: Commit**

```bash
git add src/contexts/ThemeContext.tsx src/main.tsx src/index.css
git commit -m "feat: add dark/light theme system with CSS variable overrides"
```

---

### Task 2: ThemeToggle Component

**Files:**
- Create: `src/components/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

```tsx
// src/components/ThemeToggle.tsx
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-lg border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-accent hover:border-accent/50 transition-all duration-200"
      aria-label={theme === "dark" ? "Açık moda geç" : "Koyu moda geç"}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "dark" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </motion.div>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.tsx
git commit -m "feat: add animated ThemeToggle component"
```

---

### Task 3: Update Header with ThemeToggle

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add ThemeToggle import and render in Header**

Add import at top of Header.tsx:

```tsx
import { ThemeToggle } from "./ThemeToggle";
```

Replace the `{/* Status */}` section (lines 124-131) with:

```tsx
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="text-[10px] font-mono text-subtle">Gemini 3.1</span>
            </div>
            <ThemeToggle />
          </div>
```

- [ ] **Step 2: Verify header shows toggle on both mobile and desktop**

Check the browser — ThemeToggle should appear in the header and switching themes should update all colors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add theme toggle to header"
```

---

### Task 4: StepIndicator Component

**Files:**
- Create: `src/components/StepIndicator.tsx`

- [ ] **Step 1: Create StepIndicator**

```tsx
// src/components/StepIndicator.tsx
import { motion } from "framer-motion";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <motion.div
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-success w-2"
                : i === currentStep
                ? "bg-accent w-7"
                : "bg-border w-2"
            }`}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </div>
      ))}
      <span className="text-xs text-muted font-medium ml-2">
        {currentStep < steps.length ? `${currentStep + 1}/${steps.length}` : "Tamamlandı"}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StepIndicator.tsx
git commit -m "feat: add StepIndicator component for mobile wizard"
```

---

### Task 5: BottomNav Component

**Files:**
- Create: `src/components/BottomNav.tsx`

- [ ] **Step 1: Create BottomNav**

```tsx
// src/components/BottomNav.tsx
import { motion } from "framer-motion";

export type WizardStep = "upload" | "mode" | "settings" | "generate";

interface BottomNavProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}

const tabs: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  {
    id: "upload",
    label: "Yükle",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
  },
  {
    id: "mode",
    label: "Mod",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Ayarlar",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
  {
    id: "generate",
    label: "Üret",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

export function BottomNav({ currentStep, onStepChange }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-border-subtle">
      <div className="flex justify-around items-center px-3 pt-2 pb-6">
        {tabs.map((tab) => {
          const isActive = tab.id === currentStep;
          return (
            <button
              key={tab.id}
              onClick={() => onStepChange(tab.id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isActive ? "text-accent" : "text-subtle"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="transition-transform duration-200">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BottomNav.tsx
git commit -m "feat: add BottomNav component for mobile navigation"
```

---

### Task 6: MobileWizard Component

**Files:**
- Create: `src/components/MobileWizard.tsx`

- [ ] **Step 1: Create MobileWizard**

This component wraps the mobile layout and manages which step content to show.

```tsx
// src/components/MobileWizard.tsx
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type WizardStep } from "./BottomNav";
import { StepIndicator } from "./StepIndicator";

const STEP_LABELS = ["Yükle", "Mod", "Ayarlar", "Üret"];
const STEP_ORDER: WizardStep[] = ["upload", "mode", "settings", "generate"];

interface MobileWizardProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
  uploadContent: React.ReactNode;
  modeContent: React.ReactNode;
  settingsContent: React.ReactNode;
  generateContent: React.ReactNode;
}

export function MobileWizard({
  currentStep,
  onStepChange,
  uploadContent,
  modeContent,
  settingsContent,
  generateContent,
}: MobileWizardProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  const contentMap: Record<WizardStep, React.ReactNode> = {
    upload: uploadContent,
    mode: modeContent,
    settings: settingsContent,
    generate: generateContent,
  };

  return (
    <div className="md:hidden flex flex-col min-h-screen pb-20">
      <StepIndicator steps={STEP_LABELS} currentStep={currentIndex} />

      <div className="flex-1 px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {contentMap[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav currentStep={currentStep} onStepChange={onStepChange} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MobileWizard.tsx
git commit -m "feat: add MobileWizard step manager component"
```

---

### Task 7: ModeSelector Component for Mobile

**Files:**
- Create: `src/components/ModeSelector.tsx`

- [ ] **Step 1: Create ModeSelector card-based component**

This is the mobile mode selection view (step 2 of wizard).

```tsx
// src/components/ModeSelector.tsx
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
                  isSelected
                    ? "border-accent bg-accent"
                    : "border-border"
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ModeSelector.tsx
git commit -m "feat: add ModeSelector card component for mobile wizard"
```

---

### Task 8: Integrate MobileWizard into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add imports and wizard state to App.tsx**

Add these imports at the top of App.tsx (after existing imports):

```tsx
import { MobileWizard } from "./components/MobileWizard";
import { ModeSelector } from "./components/ModeSelector";
import type { WizardStep } from "./components/BottomNav";
```

Add wizard step state after existing state declarations (after line 73 `const [pipelineResults, ...`):

```tsx
const [wizardStep, setWizardStep] = useState<WizardStep>("upload");
```

- [ ] **Step 2: Create mobile content sections**

Add these content builders before the `return` statement (before line 296), after the `EmptyState` component:

```tsx
  // Mobile wizard content sections
  const mobileUploadContent = (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-700 text-text mb-1">Fotoğraflarını Yükle</h2>
        <p className="text-sm text-muted">Nevresim ürün fotoğraflarını ekle, AI profesyonel görsellere dönüştürsün.</p>
      </div>
      <UploadZone files={files} onFilesChange={setFiles} disabled={isProcessing} />
      {files.length > 0 && (
        <button
          onClick={() => setWizardStep("mode")}
          className="w-full py-3.5 bg-accent text-black rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors active:scale-[0.99]"
        >
          Devam Et →
        </button>
      )}
    </div>
  );

  const mobileModeContent = (
    <div className="space-y-4">
      <ModeSelector mode={mode} onModeChange={handleModeChange} />
      <button
        onClick={() => setWizardStep("settings")}
        className="w-full py-3.5 bg-accent text-black rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors active:scale-[0.99]"
      >
        Devam Et →
      </button>
    </div>
  );

  const mobileSettingsContent = (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-700 text-text mb-1">Ayarları Düzenle</h2>
        <p className="text-sm text-muted">Görsel boyutu ve detayları ayarla.</p>
      </div>
      {isPipeline ? (
        <PipelineConfig
          enabledShots={pipelineEnabledShots}
          onEnabledShotsChange={setPipelineEnabledShots}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          pieceCount={pipelinePieceCount}
          onPieceCountChange={setPipelinePieceCount}
          userNotes={pipelineUserNotes}
          onUserNotesChange={setPipelineUserNotes}
        />
      ) : (
        <SettingsPanel
          mode={mode} aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio}
          selectedAngle={selectedAngle} onAngleChange={setSelectedAngle}
          selectedBadges={selectedBadges} onBadgeToggle={handleBadgeToggle}
          boxContentText={boxContentText} onBoxContentTextChange={setBoxContentText}
          pieceCount={pipelinePieceCount} onPieceCountChange={setPipelinePieceCount}
          userNotes={pipelineUserNotes} onUserNotesChange={setPipelineUserNotes}
        />
      )}
      <button
        onClick={() => setWizardStep("generate")}
        className="w-full py-3.5 bg-accent text-black rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors active:scale-[0.99]"
      >
        Devam Et →
      </button>
    </div>
  );

  const mobileGenerateContent = (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {status === "idle" && !generatedImage && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-dim border border-accent/20 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h2 className="font-display text-xl font-700 text-text mb-2">Her Şey Hazır!</h2>
              <p className="text-sm text-muted mb-6">
                {files.length} fotoğraf · {copy.title}
              </p>
              <button
                onClick={isPipeline ? startPipeline : startAnalysis}
                disabled={!canStart || (isPipeline && pipelineEnabledShots.size === 0)}
                className="w-full py-3.5 bg-accent text-black rounded-xl font-display font-700 text-base hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99] shadow-[0_4px_20px_rgba(232,160,32,0.25)]"
              >
                {isPipeline
                  ? `Pipeline Başlat · ${pipelineEnabledShots.size} görsel`
                  : "Analiz Et ve Üret"}
              </button>
            </div>
          </motion.div>
        )}
        {(status === "analyzing" || status === "generating") && (
          <div key="loading" className="bg-surface rounded-xl border border-border overflow-hidden">
            <LoadingState stage={status === "analyzing" ? "analyzing" : "generating"} />
          </div>
        )}
        {status === "pipeline-running" && pipelineProgress && (
          <PipelineProgressView key="progress" progress={pipelineProgress} />
        )}
        {status === "pipeline-done" && pipelineResults.length > 0 && (
          <PipelineResults key="pipeline-results" results={pipelineResults} onReset={reset} onRetryShot={retryPipelineShot} onReviseShot={revisePipelineShot} />
        )}
        {status === "done" && generatedImage && (
          <ResultView
            key="result"
            imageUrl={generatedImage}
            onRegenerate={handleRegenerate}
            onRevise={handleRevise}
            onReset={reset}
            onStartPipeline={mode === "photography" ? startPipelineFromHero : undefined}
            isRegenerating={isProcessing}
          />
        )}
        {status === "selection" && !generatedImage && (
          <div key="selection" className="bg-surface rounded-xl border border-border p-8 text-center">
            <h3 className="font-display text-sm font-700 text-text mb-1">
              {mode === "infographic" ? "Etiketlerinizi Seçin" : "Açı Seçin"}
            </h3>
            <p className="text-xs text-subtle mb-4">Ayarlar sekmesinden seçimlerinizi yapın.</p>
            <button
              onClick={generateFromSelection}
              className="px-6 py-2.5 bg-accent text-black rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              {mode === "infographic" ? `İnfografik Oluştur · ${selectedBadges.size} etiket` : "Seçilen Açıyla Üret"}
            </button>
          </div>
        )}
        {status === "error" && <ErrorState key="error" />}
      </AnimatePresence>
    </div>
  );
```

- [ ] **Step 3: Update the return JSX to show MobileWizard on mobile, existing layout on desktop**

Replace the entire `return` block with:

```tsx
  return (
    <div className="min-h-screen bg-bg grain">
      <Header mode={mode} onModeChange={handleModeChange} />

      {/* Mobile Wizard — visible only on < md */}
      <MobileWizard
        currentStep={wizardStep}
        onStepChange={setWizardStep}
        uploadContent={mobileUploadContent}
        modeContent={mobileModeContent}
        settingsContent={mobileSettingsContent}
        generateContent={mobileGenerateContent}
      />

      {/* Desktop Layout — visible only on >= md */}
      <main className="hidden md:block max-w-7xl mx-auto px-5 py-7">
        {/* Hero */}
        {status === "idle" && !generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl md:text-3xl font-800 text-text tracking-tight mb-2">
              {copy.title}
            </h2>
            <p className="text-sm text-subtle max-w-xl leading-relaxed">
              {copy.desc}
            </p>
          </motion.div>
        )}

        {/* ═══ PIPELINE ═══ */}
        {isPipeline && (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-4 space-y-3">
              <UploadZone files={files} onFilesChange={setFiles} disabled={isProcessing} />

              {status === "idle" && (
                <PipelineConfig
                  enabledShots={pipelineEnabledShots}
                  onEnabledShotsChange={setPipelineEnabledShots}
                  aspectRatio={aspectRatio}
                  onAspectRatioChange={setAspectRatio}
                  pieceCount={pipelinePieceCount}
                  onPieceCountChange={setPipelinePieceCount}
                  userNotes={pipelineUserNotes}
                  onUserNotesChange={setPipelineUserNotes}
                />
              )}

              {status === "idle" && (
                <button
                  onClick={startPipeline}
                  disabled={!canStart || pipelineEnabledShots.size === 0}
                  className="w-full py-3 bg-accent text-black rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {files.length === 0
                    ? "Önce fotoğraf yükleyin"
                    : `Pipeline Başlat  ·  ${pipelineEnabledShots.size} görsel`}
                </button>
              )}

              {analysis && (status === "pipeline-running" || status === "pipeline-done") && (
                <AnalysisCard analysis={analysis} />
              )}
            </div>

            <div className="col-span-8">
              <AnimatePresence mode="wait">
                {status === "analyzing" && (
                  <div key="analyzing" className="bg-surface rounded-xl border border-border overflow-hidden">
                    <LoadingState stage="analyzing" />
                  </div>
                )}
                {status === "pipeline-running" && pipelineProgress && (
                  <PipelineProgressView key="progress" progress={pipelineProgress} />
                )}
                {status === "pipeline-done" && pipelineResults.length > 0 && (
                  <PipelineResults key="results" results={pipelineResults} onReset={reset} onRetryShot={retryPipelineShot} onReviseShot={revisePipelineShot} />
                )}
                {status === "error" && <ErrorState key="error" />}
                {status === "idle" && (
                  <EmptyState
                    key="empty"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>}
                    title="Tam Set Pipeline"
                    desc="Fotoğraflarınızı yükleyin, görsel setini seçin ve pipeline'ı başlatın."
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ═══ SINGLE MODES ═══ */}
        {!isPipeline && (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-4 space-y-3">
              <UploadZone files={files} onFilesChange={setFiles} disabled={isProcessing} />

              <SettingsPanel
                mode={mode} aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio}
                selectedAngle={selectedAngle} onAngleChange={setSelectedAngle}
                selectedBadges={selectedBadges} onBadgeToggle={handleBadgeToggle}
                boxContentText={boxContentText} onBoxContentTextChange={setBoxContentText}
                pieceCount={pipelinePieceCount} onPieceCountChange={setPipelinePieceCount}
                userNotes={pipelineUserNotes} onUserNotesChange={setPipelineUserNotes}
              />

              {status === "idle" && (
                <button
                  onClick={startAnalysis}
                  disabled={!canStart}
                  className="w-full py-3 bg-accent text-black rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {files.length === 0 ? "Önce fotoğraf yükleyin" : "Analiz Et ve Üret"}
                </button>
              )}

              {status === "selection" && (
                <button
                  onClick={generateFromSelection}
                  className="w-full py-3 bg-accent text-black rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors active:scale-[0.99]"
                >
                  {mode === "infographic" ? `İnfografik Oluştur  ·  ${selectedBadges.size} etiket` : "Seçilen Açıyla Üret"}
                </button>
              )}

              {analysis && <AnalysisCard analysis={analysis} />}
            </div>

            <div className="col-span-8">
              <AnimatePresence mode="wait">
                {(status === "analyzing" || status === "generating") && (
                  <div key="loading" className="bg-surface rounded-xl border border-border overflow-hidden">
                    <LoadingState stage={status === "analyzing" ? "analyzing" : "generating"} />
                  </div>
                )}
                {status === "error" && <ErrorState key="error" />}
                {status === "pipeline-running" && pipelineProgress && (
                  <PipelineProgressView key="pipeline-progress" progress={pipelineProgress} />
                )}
                {status === "pipeline-done" && pipelineResults.length > 0 && (
                  <PipelineResults key="pipeline-results" results={pipelineResults} onReset={reset} onRetryShot={retryPipelineShot} onReviseShot={revisePipelineShot} />
                )}
                {status === "done" && generatedImage && (
                  <ResultView
                    key="result"
                    imageUrl={generatedImage}
                    onRegenerate={handleRegenerate}
                    onRevise={handleRevise}
                    onReset={reset}
                    onStartPipeline={mode === "photography" ? startPipelineFromHero : undefined}
                    isRegenerating={isProcessing}
                  />
                )}
                {status === "selection" && !generatedImage && (
                  <div key="selection" className="bg-surface rounded-xl border border-border p-10 text-center">
                    <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-accent-dim border border-accent/20 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                    <h3 className="font-display text-sm font-700 text-text mb-1">
                      {mode === "infographic" ? "Etiketlerinizi Seçin" : "Açı Seçin"}
                    </h3>
                    <p className="text-xs text-subtle">
                      {mode === "infographic"
                        ? "Sol panelden etiketleri seçin, ardından oluştur butonuna basın."
                        : "Sol panelden kamera açısını seçin, ardından üret butonuna basın."}
                    </p>
                  </div>
                )}
                {status === "idle" && !generatedImage && (
                  <EmptyState
                    key="empty"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                    title="Sonuç Alanı"
                    desc="Sol taraftan fotoğraflarınızı yükleyin ve ayarları yapın."
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <footer className="hidden md:block mt-14 py-5 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
          <p className="text-[11px] text-subtle font-mono">ProShop Studio — AI ile profesyonel ürün fotoğrafı</p>
          <button
            onClick={() => { localStorage.removeItem("gemini_api_key"); setApiReady(false); }}
            className="text-[11px] text-subtle hover:text-error transition-colors font-mono"
          >
            API Anahtarını Sıfırla
          </button>
        </div>
      </footer>
    </div>
  );
```

- [ ] **Step 4: Verify the app compiles and both layouts work**

Run: `npm run dev`
- Resize browser to < 768px: should see wizard with bottom nav
- Resize browser to >= 768px: should see existing sidebar layout
- Both should have ThemeToggle working

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate mobile wizard layout with desktop sidebar layout"
```

---

### Task 9: Polish Light Mode Compatibility in Components

**Files:**
- Modify: `src/components/ApiKeyInput.tsx`
- Modify: `src/components/ResultView.tsx`
- Modify: `src/components/PipelineResults.tsx`

Some components use hardcoded colors (rgba blacks, explicit dark colors) that need updating for light mode.

- [ ] **Step 1: Fix ApiKeyInput.tsx warm glow for light mode**

In `ApiKeyInput.tsx`, find the warm glow background div that uses hardcoded `rgba(232, 160, 32, ...)` — these should still work in both modes since they're accent-based overlays. However, check for any `bg-black` or hardcoded dark references.

Search for `bg-black` and `text-white` — replace any found with theme-aware alternatives:
- `bg-black` → `bg-bg`
- `text-white` → `text-text`

- [ ] **Step 2: Fix ResultView.tsx zoom modal**

In `ResultView.tsx`, the zoom modal likely uses `bg-black` for the overlay. Update:
- `bg-black` → `bg-black/90` (keep dark for image viewing context — this is intentional even in light mode)

No change needed — dark overlay for image viewing is correct UX.

- [ ] **Step 3: Fix PipelineResults.tsx zoom modal**

Same as ResultView — check for `bg-black` in zoom modal. Keep dark overlay for image viewing.

- [ ] **Step 4: Verify all components render correctly in light mode**

Toggle to light mode and check each component:
- ApiKeyInput screen
- Header
- UploadZone
- SettingsPanel
- LoadingState
- ResultView
- PipelineConfig/Progress/Results

- [ ] **Step 5: Commit**

```bash
git add src/components/ApiKeyInput.tsx src/components/ResultView.tsx src/components/PipelineResults.tsx
git commit -m "fix: ensure all components are light-mode compatible"
```

---

### Task 10: Mobile Touch Targets and Spacing Improvements

**Files:**
- Modify: `src/components/UploadZone.tsx`
- Modify: `src/components/SettingsPanel.tsx`

- [ ] **Step 1: Increase touch targets in UploadZone for mobile**

In `UploadZone.tsx`, find the delete button on thumbnails and increase size for mobile:

Replace any `w-5 h-5` or similar small button dimensions on the remove buttons with responsive sizing:

```tsx
// Change delete button classes to include mobile-friendly sizing
className="absolute top-1 right-1 w-7 h-7 md:w-5 md:h-5 rounded-full bg-black/60 ..."
```

- [ ] **Step 2: Make SettingsPanel chips larger on mobile**

In `SettingsPanel.tsx`, find chip/button elements and add responsive padding:

For aspect ratio buttons, ensure they have minimum 44px touch targets on mobile:

```tsx
// Add min-h-[44px] to chip buttons for mobile
className="... min-h-[44px] md:min-h-0 ..."
```

- [ ] **Step 3: Verify touch targets on mobile viewport**

Check in browser DevTools mobile mode that all interactive elements are at least 44px.

- [ ] **Step 4: Commit**

```bash
git add src/components/UploadZone.tsx src/components/SettingsPanel.tsx
git commit -m "fix: increase mobile touch targets for better usability"
```

---

### Task 11: Final Integration Test and Cleanup

**Files:**
- All modified files

- [ ] **Step 1: Run build to check for TypeScript errors**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 2: Full functionality test**

Test the following flows:
1. Dark mode: Upload → Select mode → Settings → Generate (mobile wizard)
2. Light mode: Same flow
3. Desktop: Pipeline mode full flow
4. Desktop: Photography mode → result → Start Pipeline from Hero
5. Theme toggle persists after refresh
6. Bottom nav allows jumping to any step

- [ ] **Step 3: Remove preview mockup file**

```bash
rm "C:/Users/ASUS/Desktop/NevresimFotoğrafOluşturma/preview-mockup.html"
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete premium UI redesign with dark/light mode and mobile wizard"
```
