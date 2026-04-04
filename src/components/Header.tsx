import { motion } from "framer-motion";
import type { AppMode } from "../types";
import { ThemeToggle } from "./ThemeToggle";

const modes: { id: AppMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "pipeline",
    label: "Tam Set",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: "photography",
    label: "Fotoğraf",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
  },
  {
    id: "infographic",
    label: "İnfografik",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/><path d="M8 8h5"/><path d="M8 16h3"/>
      </svg>
    ),
  },
  {
    id: "box-content",
    label: "Kutu",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    id: "angles",
    label: "Açılar",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    ),
  },
  {
    id: "social-media",
    label: "Sosyal",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    id: "seo-content",
    label: "SEO",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
];

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5">
        <div className="h-12 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-accent/20 rounded-md rotate-45 scale-75" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-sm font-700 text-text tracking-tight leading-none">
                MasalSensin
              </span>
              <span className="text-[10px] font-mono text-subtle tracking-widest uppercase leading-none">
                Studio
              </span>
            </div>
          </div>

          {/* Mode Tabs — desktop */}
          <nav className="hidden md:flex items-center gap-px bg-surface border border-border rounded-lg p-0.5">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  mode === m.id
                    ? "text-black"
                    : "text-subtle hover:text-muted"
                }`}
              >
                {mode === m.id && (
                  <motion.div
                    layoutId="header-tab"
                    className="absolute inset-0 bg-accent rounded-md"
                    transition={{ type: "spring", stiffness: 600, damping: 38 }}
                  />
                )}
                <span className={`relative z-10 ${mode === m.id ? "text-black" : ""}`}>
                  {m.icon}
                </span>
                <span className="relative z-10">{m.label}</span>
              </button>
            ))}
          </nav>

          {/* Mobile */}
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value as AppMode)}
            className="md:hidden bg-surface border border-border text-text rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none"
          >
            {modes.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="text-[10px] font-mono text-subtle">Gemini 3.1</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
