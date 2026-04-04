import { PIPELINE_SHOTS } from "../services/pipelineService";
import { ASPECT_RATIOS, PIECE_PRESETS } from "../constants";

interface PipelineConfigProps {
  enabledShots: Set<string>;
  onEnabledShotsChange: (shots: Set<string>) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  pieceCount: number;
  onPieceCountChange: (count: number) => void;
  userNotes: string;
  onUserNotesChange: (notes: string) => void;
}

const GROUP_META: Record<string, { label: string; color: string }> = {
  A: { label: "Oda Sahneleri", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  B: { label: "Detay Çekimleri", color: "text-accent bg-accent/10 border-accent/20" },
  C: { label: "Düzenleme & Pazarlama", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
};

export function PipelineConfig({
  enabledShots, onEnabledShotsChange,
  aspectRatio, onAspectRatioChange,
  pieceCount, onPieceCountChange,
  userNotes, onUserNotesChange,
}: PipelineConfigProps) {
  const toggleShot = (id: string) => {
    const next = new Set(enabledShots);
    if (next.has(id)) next.delete(id); else next.add(id);
    onEnabledShotsChange(next);
  };
  const toggleAll = () => {
    onEnabledShotsChange(
      enabledShots.size === PIPELINE_SHOTS.length
        ? new Set()
        : new Set(PIPELINE_SHOTS.map(s => s.id))
    );
  };

  const selectedPreset = PIECE_PRESETS.find(p => p.count === pieceCount);

  return (
    <div className="space-y-3">
      {/* Piece count */}
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

      {/* Shot checklist */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-subtle uppercase tracking-widest">
            Görsel Seti ({enabledShots.size}/{PIPELINE_SHOTS.length})
          </span>
          <button onClick={toggleAll} className="text-[11px] text-accent hover:text-accent-hover font-medium transition-colors">
            {enabledShots.size === PIPELINE_SHOTS.length ? "Temizle" : "Tümü"}
          </button>
        </div>

        <div className="space-y-3">
          {(["A", "B", "C"] as const).map((group) => {
            const shots = PIPELINE_SHOTS.filter(s => s.group === group);
            const meta = GROUP_META[group];
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border font-mono ${meta.color}`}>
                    {group}
                  </span>
                  <span className="text-[11px] text-subtle">{meta.label}</span>
                </div>
                <div className="space-y-1">
                  {shots.map((shot) => (
                    <label
                      key={shot.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                        enabledShots.has(shot.id)
                          ? "bg-surface-2 border border-border"
                          : "hover:bg-surface-2 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enabledShots.has(shot.id)}
                        onChange={() => toggleShot(shot.id)}
                        className="mt-0.5 w-3.5 h-3.5 rounded accent-accent bg-bg border-border"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-text block leading-tight">{shot.label}</span>
                        <span className="text-[10px] text-subtle leading-tight">{shot.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aspect ratio */}
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

      {/* Notes */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[10px] font-mono text-subtle uppercase tracking-widest mb-0.5">Ek Bilgiler</p>
        <p className="text-[10px] text-subtle/70 mb-2.5">Ürün özellikleri, kumaş türü, özel notlar</p>
        <textarea
          value={userNotes}
          onChange={(e) => onUserNotesChange(e.target.value)}
          placeholder="Örn: %100 pamuk saten, çift kişilik, el işi nakış..."
          rows={3}
          className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-xs text-text placeholder:text-subtle resize-none focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
        />
      </div>
    </div>
  );
}
