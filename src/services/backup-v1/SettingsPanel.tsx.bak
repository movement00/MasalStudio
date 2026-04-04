import { motion } from "framer-motion";
import type { AppMode, AngleOption } from "../types";
import { ASPECT_RATIOS, ANGLE_OPTIONS, INFOGRAPHIC_OPTIONS, PIECE_PRESETS } from "../constants";

interface SettingsPanelProps {
  mode: AppMode;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  selectedAngle: AngleOption;
  onAngleChange: (angle: AngleOption) => void;
  selectedBadges: Set<string>;
  onBadgeToggle: (badge: string) => void;
  boxContentText: string;
  onBoxContentTextChange: (text: string) => void;
  pieceCount: number;
  onPieceCountChange: (count: number) => void;
  userNotes: string;
  onUserNotesChange: (notes: string) => void;
}

export function SettingsPanel({
  mode, aspectRatio, onAspectRatioChange,
  selectedAngle, onAngleChange,
  selectedBadges, onBadgeToggle,
  boxContentText, onBoxContentTextChange,
  pieceCount, onPieceCountChange,
  userNotes, onUserNotesChange,
}: SettingsPanelProps) {
  const selectedPreset = PIECE_PRESETS.find(p => p.count === pieceCount);

  return (
    <div className="space-y-3">
      {/* Piece count — photography and box-content modes */}
      {(mode === "photography" || mode === "box-content") && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-2.5">Parça Sayısı</p>
          <div className="flex gap-1.5">
            {PIECE_PRESETS.map((preset) => (
              <button
                key={preset.count}
                onClick={() => onPieceCountChange(preset.count)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
                  pieceCount === preset.count
                    ? "bg-accent text-black"
                    : "bg-surface-2 text-muted hover:text-text border border-border"
                }`}
              >
                {preset.count}
              </button>
            ))}
          </div>
          {selectedPreset && (
            <p className="text-[10px] text-subtle mt-2 leading-relaxed">
              {selectedPreset.pieces}
            </p>
          )}
        </div>
      )}

      {/* Aspect Ratio */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-2.5">En-Boy Oranı</p>
        <div className="flex flex-wrap gap-1.5">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r.value}
              onClick={() => onAspectRatioChange(r.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all ${
                aspectRatio === r.value
                  ? "bg-accent text-black"
                  : "bg-surface-2 text-muted hover:text-text border border-border"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Angles */}
      {mode === "angles" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl border border-border p-4"
        >
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-2.5">Kamera Açısı</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ANGLE_OPTIONS.map((angle) => (
              <button
                key={angle.id}
                onClick={() => onAngleChange(angle)}
                className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all border ${
                  selectedAngle.id === angle.id
                    ? "bg-accent/10 text-accent border-accent/30"
                    : "bg-surface-2 text-muted hover:text-text border-border"
                }`}
              >
                {angle.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Infographic badges */}
      {mode === "infographic" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl border border-border p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-subtle uppercase tracking-widest">Özellik Etiketleri</p>
            <span className="text-[10px] font-mono text-subtle">{selectedBadges.size}/4</span>
          </div>
          {Object.entries(INFOGRAPHIC_OPTIONS).map(([key, category]) => (
            <div key={key}>
              <p className="text-[10px] text-subtle mb-1.5">{category.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {category.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onBadgeToggle(opt)}
                    disabled={!selectedBadges.has(opt) && selectedBadges.size >= 4}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                      selectedBadges.has(opt)
                        ? "bg-accent text-black border-accent"
                        : "bg-surface-2 text-muted border-border hover:text-text disabled:opacity-30"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Box content */}
      {mode === "box-content" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl border border-border p-4"
        >
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-2.5">Kutu İçeriği</p>
          <textarea
            value={boxContentText}
            onChange={(e) => onBoxContentTextChange(e.target.value)}
            placeholder="Örn: 1 nevresim, 2 yastık kılıfı, 1 çarşaf..."
            rows={3}
            className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-xs text-text placeholder:text-subtle resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </motion.div>
      )}

      {/* User notes — photography and box-content */}
      {(mode === "photography" || mode === "box-content") && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-0.5">Ek Bilgiler</p>
          <p className="text-[10px] text-subtle/70 mb-2.5">Opsiyonel: kumaş türü, özel detaylar</p>
          <textarea
            value={userNotes}
            onChange={(e) => onUserNotesChange(e.target.value)}
            placeholder="Örn: %100 pamuk saten, çift kişilik, el işi nakış..."
            rows={2}
            className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-xs text-text placeholder:text-subtle resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>
      )}
    </div>
  );
}
