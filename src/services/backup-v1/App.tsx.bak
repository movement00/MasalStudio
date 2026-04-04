import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AppMode, ProcessStep, UploadedFile, ProductAnalysis, InfographicAnalysis, BoxContentAnalysis, ProductAnglesAnalysis, AngleOption } from "./types";
import { ANGLE_OPTIONS, PIECE_PRESETS } from "./constants";
import { setApiKey } from "./services/geminiService";
import * as api from "./services/geminiService";
import { PIPELINE_SHOTS, runPipeline } from "./services/pipelineService";
import type { PipelineProgress, PipelineResult as PipelineResultType } from "./services/pipelineService";

import { ApiKeyInput } from "./components/ApiKeyInput";
import { Header } from "./components/Header";
import { UploadZone } from "./components/UploadZone";
import { SettingsPanel } from "./components/SettingsPanel";
import { LoadingState } from "./components/LoadingState";
import { AnalysisCard } from "./components/AnalysisCard";
import { ResultView } from "./components/ResultView";
import { PipelineConfig } from "./components/PipelineConfig";
import { PipelineProgressView } from "./components/PipelineProgress";
import { PipelineResults } from "./components/PipelineResults";

const MODE_COPY: Record<AppMode, { title: string; desc: string }> = {
  pipeline: {
    title: "Tam Set Üret",
    desc: "Amatör fotoğraflarınızı yükleyin — hero shot, detay çekimleri, kuşbakışı, knolling, infografik... tüm ilan setiniz otomatik üretilsin.",
  },
  photography: {
    title: "Profesyonel Ürün Fotoğrafı",
    desc: "Amatör nevresim fotoğraflarınızı yapay zeka ile profesyonel ürün görsellerine dönüştürün.",
  },
  infographic: {
    title: "Pazarlama İnfografiği",
    desc: "Ürün özelliklerini vurgulayan Türkçe etiketli pazarlama görselleri oluşturun.",
  },
  "box-content": {
    title: "Kutu İçeriği Görseli",
    desc: "Ürün setinizin tüm parçalarını düzenli knolling görünümünde sergileyin.",
  },
  angles: {
    title: "Farklı Açı Çekimleri",
    desc: "Ürününüzü farklı kamera açılarından profesyonel olarak görüntüleyin.",
  },
};

function App() {
  const [apiReady, setApiReady] = useState(() => {
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) { setApiKey(saved); return true; }
    return false;
  });

  const [mode, setMode] = useState<AppMode>("pipeline");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<ProcessStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [infographicAnalysis, setInfographicAnalysis] = useState<InfographicAnalysis | null>(null);
  const [boxContentAnalysis, setBoxContentAnalysis] = useState<BoxContentAnalysis | null>(null);
  const [anglesAnalysis, setAnglesAnalysis] = useState<ProductAnglesAnalysis | null>(null);

  const [selectedAngle, setSelectedAngle] = useState<AngleOption>(ANGLE_OPTIONS[0]);
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(new Set());
  const [boxContentText, setBoxContentText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [pipelineEnabledShots, setPipelineEnabledShots] = useState<Set<string>>(
    new Set(PIPELINE_SHOTS.map(s => s.id))
  );
  const [pipelineUserNotes, setPipelineUserNotes] = useState("");
  const [pipelinePieceCount, setPipelinePieceCount] = useState(6);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null);
  const [pipelineResults, setPipelineResults] = useState<PipelineResultType[]>([]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setAnalysis(null); setInfographicAnalysis(null); setBoxContentAnalysis(null);
    setAnglesAnalysis(null); setGeneratedImage(null); setSelectedBadges(new Set());
    setPipelineProgress(null); setPipelineResults([]); setStatus("idle");
  };

  const handleBadgeToggle = (badge: string) => {
    const next = new Set(selectedBadges);
    if (next.has(badge)) next.delete(badge);
    else if (next.size < 4) next.add(badge);
    setSelectedBadges(next);
  };

  const handleError = (error: any) => {
    console.error(error);
    setErrorMessage(error.message || "Bir hata oluştu.");
    setStatus("error");
  };

  const startPipeline = async () => {
    if (files.length === 0 || pipelineEnabledShots.size === 0) return;
    setStatus("analyzing"); setErrorMessage("");
    const b64List = files.map(f => f.base64);
    try {
      const piecePreset = PIECE_PRESETS.find(p => p.count === pipelinePieceCount);
      const pieceInfo = piecePreset?.pieces ?? "";
      const ctx = [
        piecePreset ? `This is a ${piecePreset.count}-piece set: ${pieceInfo}` : "",
        pipelineUserNotes || "",
      ].filter(Boolean).join("\n");
      const analysisResult = await api.analyzeProductPhotos(b64List, ctx || undefined);
      setAnalysis(analysisResult);
      setStatus("pipeline-running");
      const results = await runPipeline(
        b64List, analysisResult.generationPrompt, analysisResult.signatureDetails, aspectRatio,
        Array.from(pipelineEnabledShots), pipelineUserNotes, pieceInfo,
        (progress) => setPipelineProgress({ ...progress })
      );
      setPipelineResults(results);
      setStatus("pipeline-done");
    } catch (err: any) { handleError(err); }
  };

  // Hero beğenildikten sonra: hero atlanır, kalan çekimler üretilir
  const startPipelineFromHero = async () => {
    if (!generatedImage || !analysis || files.length === 0) return;
    setMode("pipeline"); setStatus("pipeline-running"); setErrorMessage("");
    const b64List = files.map(f => f.base64);
    // Hero görseli referans olarak ekleniyor — model "ürün böyle görünecek" diye anlıyor
    const allReferences = [...b64List, generatedImage];
    try {
      // Hero zaten hazır — pipeline'dan çıkar
      const enabledIds = Array.from(pipelineEnabledShots).filter(id => id !== "hero_editorial");
      const pieceInfo = PIECE_PRESETS.find(p => p.count === pipelinePieceCount)?.pieces ?? "";
      const results = await runPipeline(
        allReferences, analysis.generationPrompt, analysis.signatureDetails, aspectRatio,
        enabledIds, pipelineUserNotes, pieceInfo,
        (progress) => setPipelineProgress({ ...progress })
      );
      // Hero'yu sonuçların başına ekle
      const heroResult: PipelineResultType = {
        id: "hero_editorial",
        label: "Hero Shot (Editorial)",
        imageUrl: generatedImage,
        status: "done",
      };
      setPipelineResults([heroResult, ...results]);
      setStatus("pipeline-done");
    } catch (err: any) { handleError(err); }
  };

  const retryPipelineShot = async (shotId: string) => {
    const shot = PIPELINE_SHOTS.find(s => s.id === shotId);
    if (!shot || !analysis) return;
    const b64List = files.map(f => f.base64);

    // Mark as generating — functional update to avoid stale closure
    setPipelineResults(prev => prev.map(r => r.id === shotId ? { ...r, status: "generating" as const, error: undefined } : r));

    try {
      const userCtx = pipelineUserNotes ? `\n\nADDITIONAL USER NOTES: ${pipelineUserNotes}` : "";
      const pieceInfo = PIECE_PRESETS.find(p => p.count === pipelinePieceCount)?.pieces ?? "";
      const prompt = shot.promptBuilder(
        analysis.generationPrompt + userCtx,
        analysis.signatureDetails + userCtx,
        pieceInfo,
        aspectRatio
      );
      const allRefs = generatedImage ? [...b64List, generatedImage] : b64List;
      const imageUrl = await api.generateImageRaw(prompt, allRefs, aspectRatio, shot.textFirst);
      setPipelineResults(prev => prev.map(r => r.id === shotId ? { ...r, imageUrl, status: "done" as const } : r));
    } catch (err: any) {
      setPipelineResults(prev => prev.map(r => r.id === shotId ? { ...r, status: "error" as const, error: err.message } : r));
    }
  };

  const revisePipelineShot = async (shotId: string, instruction: string) => {
    const currentResult = pipelineResults.find(r => r.id === shotId);
    if (!currentResult?.imageUrl) return;
    const currentImageUrl = currentResult.imageUrl;

    setPipelineResults(prev => prev.map(r => r.id === shotId ? { ...r, status: "generating" as const, error: undefined } : r));

    try {
      const revisedUrl = await api.reviseGeneratedImage(currentImageUrl, instruction, aspectRatio);
      setPipelineResults(prev => prev.map(r => r.id === shotId ? { ...r, imageUrl: revisedUrl, status: "done" as const } : r));
    } catch (err: any) {
      setPipelineResults(prev => prev.map(r => r.id === shotId ? { ...r, imageUrl: currentImageUrl, status: "done" as const, error: err.message } : r));
    }
  };

  const startAnalysis = async () => {
    if (files.length === 0) return;
    setStatus("analyzing"); setErrorMessage("");
    const b64List = files.map(f => f.base64);
    try {
      if (mode === "photography") {
        const piecePreset = PIECE_PRESETS.find(p => p.count === pipelinePieceCount);
        const ctx = [
          piecePreset ? `This is a ${piecePreset.count}-piece set: ${piecePreset.pieces}` : "",
          pipelineUserNotes || "",
        ].filter(Boolean).join("\n");
        const result = await api.analyzeProductPhotos(b64List, ctx || undefined);
        setAnalysis(result); setStatus("generating");
        const img = await api.generateProfessionalImage(result.generationPrompt, b64List, aspectRatio);
        setGeneratedImage(img); setStatus("done");
      } else if (mode === "infographic") {
        const result = await api.analyzeInfographic(b64List);
        setInfographicAnalysis(result); setStatus("selection");
      } else if (mode === "box-content") {
        const result = await api.analyzeBoxContent(b64List, boxContentText);
        setBoxContentAnalysis(result); setStatus("generating");
        const img = await api.generateBoxContentImage(result.generationPrompt, b64List, result.itemsList, aspectRatio);
        setGeneratedImage(img); setStatus("done");
      } else if (mode === "angles") {
        const result = await api.analyzeProductAngles(b64List);
        setAnglesAnalysis(result); setStatus("selection");
      }
    } catch (err: any) { handleError(err); }
  };

  const handleRegenerate = async (changeComposition = false) => {
    if (files.length === 0) return;
    setStatus("generating"); setErrorMessage("");
    const b64List = files.map(f => f.base64);
    try {
      if (mode === "angles" && anglesAnalysis) {
        setGeneratedImage(await api.generateProductAngleImage(anglesAnalysis.basePrompt, b64List, selectedAngle, aspectRatio));
        setStatus("done"); return;
      }
      let prompt = "";
      if (mode === "photography" && analysis) prompt = analysis.generationPrompt;
      if (mode === "infographic" && infographicAnalysis) prompt = infographicAnalysis.generationPrompt;
      if (mode === "box-content" && boxContentAnalysis) prompt = boxContentAnalysis.generationPrompt;
      if (changeComposition) prompt += " CRITICAL: Create a DIFFERENT camera angle and composition while keeping the product 100% the same.";
      let img = "";
      if (mode === "photography") img = await api.generateProfessionalImage(prompt, b64List, aspectRatio);
      else if (mode === "infographic") img = await api.generateInfographicImage(prompt, b64List, Array.from(selectedBadges), aspectRatio);
      else if (mode === "box-content" && boxContentAnalysis) img = await api.generateBoxContentImage(prompt, b64List, boxContentAnalysis.itemsList, aspectRatio);
      setGeneratedImage(img); setStatus("done");
    } catch (err: any) { handleError(err); }
  };

  const generateFromSelection = async () => {
    const b64List = files.map(f => f.base64);
    setStatus("generating");
    try {
      if (mode === "infographic" && infographicAnalysis) {
        setGeneratedImage(await api.generateInfographicImage(infographicAnalysis.generationPrompt, b64List, Array.from(selectedBadges), aspectRatio));
      } else if (mode === "angles" && anglesAnalysis) {
        setGeneratedImage(await api.generateProductAngleImage(anglesAnalysis.basePrompt, b64List, selectedAngle, aspectRatio));
      }
      setStatus("done");
    } catch (err: any) { handleError(err); }
  };

  const handleRevise = async (prompt: string, refFile?: File) => {
    if (!generatedImage) return;
    const refB64 = refFile ? await api.fileToBase64(refFile) : undefined;
    setGeneratedImage(await api.reviseGeneratedImage(generatedImage, prompt, aspectRatio, refB64));
  };

  const reset = () => {
    setFiles([]); setStatus("idle"); setGeneratedImage(null); setBoxContentText("");
    setAnalysis(null); setInfographicAnalysis(null); setBoxContentAnalysis(null);
    setAnglesAnalysis(null); setPipelineProgress(null); setPipelineResults([]); setErrorMessage("");
  };

  if (!apiReady) return <ApiKeyInput onReady={() => setApiReady(true)} />;

  const isProcessing = status === "analyzing" || status === "generating" || status === "pipeline-running";
  const canStart = files.length > 0 && !isProcessing;
  const isPipeline = mode === "pipeline";
  const copy = MODE_COPY[mode];

  const ErrorState = () => (
    <div className="bg-surface rounded-xl border border-error/30 p-8 text-center">
      <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-error-dim flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-error">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 className="font-display text-base font-700 text-text mb-1">Hata Oluştu</h3>
      <p className="text-xs text-subtle mb-4 font-mono">{errorMessage}</p>
      <button onClick={() => setStatus("idle")} className="px-5 py-2 bg-surface-2 border border-border text-muted hover:text-text rounded-lg text-xs font-medium transition-colors">
        Tekrar Dene
      </button>
    </div>
  );

  const EmptyState = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="bg-surface rounded-xl border border-dashed border-border p-14 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-subtle">
        {icon}
      </div>
      <h3 className="font-display text-sm font-700 text-muted mb-1">{title}</h3>
      <p className="text-xs text-subtle max-w-xs mx-auto leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg grain">
      <Header mode={mode} onModeChange={handleModeChange} />

      <main className="max-w-7xl mx-auto px-5 py-7">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 space-y-3">
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

            <div className="lg:col-span-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 space-y-3">
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

            <div className="lg:col-span-8">
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

      <footer className="mt-14 py-5 border-t border-border-subtle">
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
}

export default App;
