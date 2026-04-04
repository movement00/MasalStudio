import { motion } from "framer-motion";

interface LoadingStateProps {
  stage: "analyzing" | "generating";
}

const stages = {
  analyzing: {
    label: "ANALİZ",
    title: "Ürün analiz ediliyor",
    sub: "Detaylar hassasiyetle çıkarılıyor",
    steps: [
      "Fotoğraf kalitesi kontrol ediliyor",
      "Kumaş ve doku analiz ediliyor",
      "Nakış detayları çıkarılıyor",
      "Renk paleti belirleniyor",
      "Kenar işçilik detayları inceleniyor",
      "Üretim promptu hazırlanıyor",
    ],
  },
  generating: {
    label: "ÜRETİM",
    title: "Profesyonel görsel üretiliyor",
    sub: "Stüdyo sahnesi oluşturuluyor",
    steps: [
      "Sahne kompozisyonu tasarlanıyor",
      "Kumaş dokusu render ediliyor",
      "Nakış detayları işleniyor",
      "Işık ve gölge ayarlanıyor",
      "Renk kalibrasyonu uygulanıyor",
      "Son kalite kontrolleri",
    ],
  },
};

export function LoadingState({ stage }: LoadingStateProps) {
  const config = stages[stage];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-14 px-8"
    >
      {/* Stage badge */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[9px] font-mono font-600 tracking-[0.15em] text-accent/70 uppercase">
          {config.label}
        </span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="text-[9px] font-mono text-subtle uppercase tracking-widest">
          AI Processing
        </span>
      </div>

      {/* Concentric spinner */}
      <div className="relative w-14 h-14 mb-7">
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin-slow" />
        <div className="absolute inset-[5px] rounded-full border border-border" />
        <div className="absolute inset-[5px] rounded-full border-b border-accent/40 animate-spin-rev" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
        </div>
      </div>

      <h3 className="font-display text-base font-700 text-text mb-1 tracking-tight">
        {config.title}
      </h3>
      <p className="text-[11px] text-subtle mb-7 font-mono">{config.sub}</p>

      {/* Step list */}
      <div className="w-full max-w-[260px] space-y-2">
        {config.steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.65, duration: 0.3 }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.65 + 0.15, type: "spring" }}
              className="w-1 h-1 rounded-full bg-accent/50 shrink-0"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5] }}
              transition={{ delay: i * 0.65, duration: 2 }}
              className="text-[11px] text-subtle font-mono"
            >
              {step}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
