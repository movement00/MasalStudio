import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heic2any from "heic2any";
import type { UploadedFile } from "../types";
import { fileToBase64 } from "../services/geminiService";
import { MAX_FILES } from "../constants";

interface UploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

export function UploadZone({ files, onFilesChange, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(`En fazla ${MAX_FILES} fotoğraf yükleyebilirsiniz.`);
      return;
    }
    const newFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        let processedFile = file;
        if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
          try {
            const converted = await heic2any({ blob: file, toType: "image/jpeg" });
            const blobArr = Array.isArray(converted) ? converted : [converted];
            processedFile = new File(blobArr, file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
          } catch (err) {
            console.error("HEIC dönüşüm hatası:", err);
          }
        }
        const base64 = await fileToBase64(processedFile);
        return { id: crypto.randomUUID(), file: processedFile, previewUrl: URL.createObjectURL(processedFile), base64 };
      })
    );
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".heic")
    );
    processFiles(dropped);
  }, [disabled, processFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const removeFile = (id: string) => onFilesChange(files.filter(f => f.id !== id));
  const hasFiles = files.length > 0;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative rounded-xl border transition-all duration-200 overflow-hidden
          ${hasFiles
            ? "border-border bg-surface p-3 cursor-default"
            : "border-dashed border-border bg-surface hover:border-accent/40 hover:bg-surface-2 p-8 cursor-pointer group"
          }
          ${disabled ? "opacity-40 pointer-events-none" : ""}
        `}
      >
        <input ref={inputRef} type="file" accept="image/*,.heic" multiple onChange={handleChange} className="hidden" />

        {!hasFiles ? (
          <div className="text-center">
            {/* Upload icon with subtle animation */}
            <div className="relative w-10 h-10 mx-auto mb-4">
              <div className="absolute inset-0 rounded-xl bg-surface-3 border border-border group-hover:border-accent/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-subtle group-hover:text-muted transition-colors">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              {/* Scanning line animation */}
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-scan" />
              </div>
            </div>

            <p className="text-sm font-medium text-text mb-1">
              Fotoğrafları sürükleyin
            </p>
            <p className="text-xs text-subtle mb-3">
              veya tıklayarak seçin
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["JPG", "PNG", "WEBP", "HEIC"].map(fmt => (
                <span key={fmt} className="text-[10px] font-mono text-subtle px-2 py-0.5 rounded-md border border-border bg-surface-2">
                  {fmt}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-subtle/60 mt-3 font-mono">
              3–6 farklı açıdan çekim önerilir · maks. {MAX_FILES}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence mode="popLayout">
              {files.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 28 }}
                  className="relative group/thumb aspect-square rounded-lg overflow-hidden bg-surface-3"
                >
                  <img src={f.previewUrl} alt={`Yüklenen ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                    className="absolute top-1 right-1 w-7 h-7 md:w-5 md:h-5 bg-black/70 hover:bg-error text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/thumb:opacity-100 transition-all"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-0.5">
                    <span className="text-[8px] text-white/60 font-mono">{i + 1}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {files.length < MAX_FILES && (
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="aspect-square rounded-lg border border-dashed border-border flex items-center justify-center hover:border-accent/40 hover:bg-surface-2 transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-subtle">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {hasFiles && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-mono text-subtle">
            {files.length}/{MAX_FILES} fotoğraf
            {files.length < 3 && <span className="text-accent/70"> · 3+ önerilir</span>}
          </p>
          <button
            onClick={() => onFilesChange([])}
            className="text-[10px] font-mono text-subtle hover:text-error transition-colors"
          >
            Temizle
          </button>
        </div>
      )}
    </div>
  );
}
