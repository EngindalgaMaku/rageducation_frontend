"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { configureAndProcess, listMarkdownFiles } from "@/lib/api";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const UploadIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const ProcessingIcon = () => (
  <svg
    className="w-8 h-8 animate-spin"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default function FileUploadModal({
  isOpen,
  onClose,
  sessionId,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: FileUploadModalProps) {
  const [markdownFiles, setMarkdownFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Configuration states
  const [chunkStrategy, setChunkStrategy] = useState("markdown");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [embeddingModel, setEmbeddingModel] = useState("mxbai-embed-large");

  // Processing status
  const [processingStep, setProcessingStep] = useState("");

  // Available options
  const chunkStrategies = [
    { value: "markdown", label: "Markdown Sections" },
    { value: "fixed", label: "Fixed Size" },
    { value: "semantic", label: "Semantic Chunking" },
  ];

  const embeddingModels = [
    { value: "mxbai-embed-large", label: "mxbai-embed-large" },
    { value: "nomic-embed-text", label: "nomic-embed-text" },
    { value: "all-minilm", label: "all-MiniLM-L6-v2" },
  ];

  // Fetch available markdown files
  const fetchMarkdownFiles = async () => {
    try {
      setLoading(true);
      const files = await listMarkdownFiles();
      setMarkdownFiles(files);
    } catch (e: any) {
      onError(e.message || "Markdown dosyaları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection toggle
  const handleFileToggle = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      onError("En az bir Markdown dosyası seçmelisiniz");
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep("Konfigürasyon hazırlanıyor...");

      const result = await configureAndProcess({
        session_id: sessionId,
        markdown_files: selectedFiles,
        chunk_strategy: chunkStrategy,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        embedding_model: embeddingModel,
      });

      if (result.success) {
        setProcessingStep("İşlem tamamlandı!");
        onSuccess(result);
        setSelectedFiles([]);
        setTimeout(() => {
          onClose();
          setProcessingStep("");
        }, 2000);
      } else {
        onError(result.message || "İşlem başarısız");
        setIsProcessing(false);
        setProcessingStep("");
      }
    } catch (e: any) {
      onError(e.message || "RAG konfigürasyonu başarısız");
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Load files when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMarkdownFiles();
    }
  }, [isOpen]);

  // Update processing steps
  useEffect(() => {
    if (isProcessing && processingStep === "Konfigürasyon hazırlanıyor...") {
      const steps = [
        "Dosyalar okunuyor...",
        "Metin parçaları oluşturuluyor...",
        "Embedding vektörleri hesaplanıyor...",
        "Veritabanı güncelleniyor...",
      ];

      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          setProcessingStep(steps[stepIndex]);
          stepIndex++;
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isProcessing, processingStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Belge Yükle & İşle
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isProcessing ? (
            // Processing State
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-4">
                <ProcessingIcon />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Markdown İşlemi Devam Ediyor
                  </h3>
                  <p className="text-muted-foreground mb-4">{processingStep}</p>
                  <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm">
                    💡 Modal'ı kapatabilirsiniz - İşlem arka planda devam edecek
                    ve bitince sonuçlar burada görünecektir
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // File Selection Form
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <UploadIcon className="w-5 h-5" />
                    Markdown Dosyaları Seçin
                  </div>
                </label>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                    <p className="text-muted-foreground text-sm mt-2">
                      Dosyalar yükleniyor...
                    </p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg bg-background">
                    {markdownFiles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-sm">
                          Markdown dosyası bulunamadı
                        </div>
                      </div>
                    ) : (
                      markdownFiles.map((filename) => (
                        <div
                          key={filename}
                          className="flex items-start p-4 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(filename)}
                            onChange={() => handleFileToggle(filename)}
                            className="mt-0.5 mr-4 h-5 w-5 text-primary rounded border-border focus:ring-primary focus:ring-2 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {filename.replace(".md", "")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {filename}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="mt-3 px-3 py-2 bg-primary/10 rounded-lg">
                    <div className="text-sm text-primary font-medium">
                      {selectedFiles.length} dosya seçili
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Parçalama Stratejisi
                  </label>
                  <select
                    value={chunkStrategy}
                    onChange={(e) => setChunkStrategy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {chunkStrategies.map((strategy) => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Embedding Modeli
                  </label>
                  <select
                    value={embeddingModel}
                    onChange={(e) => setEmbeddingModel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {embeddingModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Parça Boyutu
                  </label>
                  <input
                    type="number"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    min="100"
                    max="4000"
                    step="100"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Parça Çakışması
                  </label>
                  <input
                    type="number"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    min="0"
                    max="1000"
                    step="50"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isProcessing ? "Arka Planda Devam Et" : "İptal"}
            </button>
            {!isProcessing && (
              <button
                type="submit"
                form="upload-form"
                disabled={selectedFiles.length === 0}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                İşlemeyi Başlat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
