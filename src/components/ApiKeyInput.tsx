import { useState } from "react";
import { motion } from "framer-motion";
import { setApiKey } from "../services/geminiService";

interface ApiKeyInputProps {
  onReady: () => void;
}

export function ApiKeyInput({ onReady }: ApiKeyInputProps) {
  const [key, setKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) { setError("API anahtarı gerekli"); return; }
    setApiKey(trimmed);
    localStorage.setItem("gemini_api_key", trimmed);
    onReady();
  };

  return (
    <div className="min-h-screen bg-bg grain flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Warm amber glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[400px] z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border mb-5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-accent/5" />
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-accent relative z-10">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h1 className="font-display text-[26px] font-700 text-text tracking-tight leading-tight">
              ProShop Studio
            </h1>
            <p className="text-sm text-subtle mt-1.5 leading-relaxed">
              Amatör nevresim fotoğraflarını<br />
              <span className="text-muted">profesyonel e-ticaret görsellerine dönüştür.</span>
            </p>
          </motion.div>
        </div>

        {/* Form card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4"
          style={{ boxShadow: "0 24px 64px var(--shadow-card), 0 0 0 1px var(--shadow-card-border)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono font-500 text-subtle uppercase tracking-[0.1em]">
                Gemini API Anahtarı
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener"
                className="text-[10px] font-mono text-accent/70 hover:text-accent transition-colors"
              >
                Anahtar al →
              </a>
            </div>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(""); }}
                placeholder="AIzaSy..."
                autoComplete="off"
                className="w-full pr-10 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-subtle font-mono focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
                tabIndex={-1}
              >
                {show
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-error mt-1.5 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-accent text-black rounded-xl font-semibold text-sm hover:bg-accent-hover active:scale-[0.98] transition-all"
          >
            Uygulamaya Gir
          </button>
        </motion.form>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-[11px] text-subtle mt-4 font-mono"
        >
          Anahtar yalnızca tarayıcınızda saklanır · Hiçbir sunucuya gönderilmez
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6"
        >
          {["Pipeline", "10 Görsel", "Analiz + Üretim", "HEIC Desteği"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1 text-[10px] text-subtle px-2.5 py-1 rounded-full border border-border bg-surface font-mono">
              <span className="w-1 h-1 rounded-full bg-success/60" />
              {f}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
