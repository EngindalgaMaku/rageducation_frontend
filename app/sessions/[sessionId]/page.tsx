"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
  listMarkdownFiles,
  configureAndProcess,
  getChunksForSession,
  listSessions,
  SessionMeta,
  Chunk,
} from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";

// Icons
const BackIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const ConfigIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChunkIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

const PlayIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Chunk Card Component
function ChunkCard({ chunk, index }: { chunk: Chunk; index: number }) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-4 animate-slide-up transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-lg">
          {chunk.chunk_index}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {chunk.document_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {chunk.chunk_text.length} karakter
          </p>
          <details className="mt-2 group">
            <summary className="text-xs text-primary cursor-pointer group-hover:underline">
              İçeriği Görüntüle
            </summary>
            <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {chunk.chunk_text}
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  // State management
  const [session, setSession] = useState<SessionMeta | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [markdownFiles, setMarkdownFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form configuration state
  const [chunkStrategy, setChunkStrategy] = useState("markdown");
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [embeddingModel, setEmbeddingModel] = useState("mxbai-embed-large");

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

  // Fetch session details
  const fetchSessionDetails = async () => {
    try {
      const sessions = await listSessions();
      const currentSession = sessions.find((s) => s.session_id === sessionId);
      if (currentSession) {
        setSession(currentSession);
      } else {
        setError("Oturum bulunamadı");
      }
    } catch (e: any) {
      setError(e.message || "Oturum bilgileri yüklenemedi");
    }
  };

  // Fetch chunks for the session
  const fetchChunks = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionChunks = await getChunksForSession(sessionId);
      setChunks(sessionChunks);
    } catch (e: any) {
      setError(e.message || "Parçalar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available markdown files
  const fetchMarkdownFiles = async () => {
    try {
      const files = await listMarkdownFiles();
      setMarkdownFiles(files);
    } catch (e: any) {
      setError(e.message || "Markdown dosyaları yüklenemedi");
    }
  };

  // Handle markdown file selection
  const handleFileToggle = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  // Handle form submission
  const handleConfigureAndProcess = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError("En az bir Markdown dosyası seçmelisiniz");
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      const result = await configureAndProcess({
        session_id: sessionId,
        markdown_files: selectedFiles,
        chunk_strategy: chunkStrategy,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        embedding_model: embeddingModel,
      });

      if (result.success) {
        setSuccess(
          `RAG işlemi tamamlandı! ${result.processed_files} dosya işlendi, ${result.total_chunks} parça oluşturuldu.`
        );
        setSelectedFiles([]);

        // Refresh chunks after successful processing
        await fetchChunks();
        await fetchSessionDetails();
      } else {
        setError(result.message || "İşlem başarısız");
      }
    } catch (e: any) {
      setError(e.message || "RAG konfigürasyonu başarısız");
    } finally {
      setProcessing(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
      fetchChunks();
      fetchMarkdownFiles();
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Geçersiz oturum ID</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <BackIcon />
            Tüm Oturumlara Geri Dön
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {session?.name || "Oturum Yükleniyor..."}
          </h1>
          <p className="text-muted-foreground text-md mt-1">
            {session?.description || ""}
          </p>
        </div>
        <div className="flex-shrink-0 text-right text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
          <div className="font-mono">ID: {sessionId.substring(0, 12)}...</div>
          {session && (
            <div className="mt-1 font-medium">
              {session.document_count} belge • {session.total_chunks} parça
            </div>
          )}
        </div>
      </div>

      {/* Error/Success Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {/* RAG Configuration Section */}
      <div className="bg-card p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-primary/10 text-primary rounded-xl mr-4">
            <ConfigIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              RAG Konfigürasyonu
            </h2>
            <p className="text-sm text-muted-foreground">
              Belgeleri parçalara ayırın ve vektör veritabanını oluşturun
            </p>
          </div>
        </div>

        <form onSubmit={handleConfigureAndProcess} className="space-y-6">
          {/* Markdown Files Selection */}
          <div>
            <label className="label">Markdown Dosyaları Seçin</label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-md">
              {markdownFiles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Markdown dosyası bulunamadı
                </div>
              ) : (
                markdownFiles.map((filename) => (
                  <div
                    key={filename}
                    className="flex items-center p-3 hover:bg-muted/50 border-b border-border last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(filename)}
                      onChange={() => handleFileToggle(filename)}
                      className="mr-3 h-4 w-4 text-primary rounded border-border focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {filename.replace(".md", "")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {filename}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedFiles.length} dosya seçili
              </div>
            )}
          </div>

          {/* Configuration Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="chunk_strategy" className="label">
                Parçalama Stratejisi
              </label>
              <select
                id="chunk_strategy"
                value={chunkStrategy}
                onChange={(e) => setChunkStrategy(e.target.value)}
                className="input"
              >
                {chunkStrategies.map((strategy) => (
                  <option key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="embedding_model" className="label">
                Embedding Modeli
              </label>
              <select
                id="embedding_model"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="input"
              >
                {embeddingModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="chunk_size" className="label">
                Parça Boyutu
              </label>
              <input
                type="number"
                id="chunk_size"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                min="100"
                max="4000"
                step="100"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="chunk_overlap" className="label">
                Parça Çakışması
              </label>
              <input
                type="number"
                id="chunk_overlap"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                min="0"
                max="1000"
                step="50"
                className="input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={selectedFiles.length === 0 || processing}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                İşleniyor...
              </>
            ) : (
              <>
                <PlayIcon />
                RAG Konfigürasyonunu Çalıştır
              </>
            )}
          </button>
        </form>
      </div>

      {/* Chunks Visualization Section */}
      <div className="bg-card p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-xl mr-4">
              <ChunkIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Oturum Parçaları ({chunks.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Vektör veritabanında oluşturulan tüm metin parçaları
              </p>
            </div>
          </div>
          <button
            onClick={fetchChunks}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Parçalar yükleniyor...</p>
          </div>
        ) : chunks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ChunkIcon />
            </div>
            <p className="text-muted-foreground">
              Bu oturum için henüz parça bulunmuyor
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Yukarıdan RAG konfigürasyonu çalıştırın
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chunks.map((chunk, index) => (
              <ChunkCard
                key={`${chunk.document_name}-${chunk.chunk_index}`}
                chunk={chunk}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
