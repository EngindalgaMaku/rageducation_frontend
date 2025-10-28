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
      className="bg-card border border-border rounded-xl p-4 md:p-5 animate-slide-up transition-all duration-300 hover:border-primary/50 hover:shadow-lg touch-manipulation"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-base md:text-lg">
          {chunk.chunk_index}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base font-semibold text-foreground mb-1 leading-tight">
            {chunk.document_name}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mb-3">
            {chunk.chunk_text.length} karakter
          </p>
          <details className="group">
            <summary className="text-sm md:text-base text-primary cursor-pointer group-hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded py-1 px-2 -mx-2 transition-colors">
              İçeriği Görüntüle
            </summary>
            <div className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 md:p-4 max-h-48 md:max-h-64 overflow-y-auto">
              <p className="whitespace-pre-wrap font-sans text-xs md:text-sm leading-relaxed">
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
  const [chunkPage, setChunkPage] = useState(1);
  const CHUNKS_PER_PAGE = 10;

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
        setError("Ders oturumu bulunamadı");
      }
    } catch (e: any) {
      setError(e.message || "Ders oturumu bilgileri yüklenemedi");
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
        <div className="text-red-600">Geçersiz ders oturumu ID</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3 md:mb-2 transition-colors"
          >
            <BackIcon />
            <span className="truncate">Tüm Oturumlara Geri Dön</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {session?.name || "Ders Oturumu Yükleniyor..."}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1 leading-relaxed">
            {session?.description || ""}
          </p>
        </div>
        <div className="w-full md:w-auto flex-shrink-0 text-left md:text-right text-sm text-muted-foreground bg-card border border-border rounded-lg p-3 md:p-4">
          <div className="font-mono text-xs md:text-sm truncate">
            Ders Oturumu ID: {sessionId.substring(0, 12)}...
          </div>
          {session && (
            <div className="mt-2 md:mt-1 font-medium text-sm">
              <span className="inline-block mr-2">
                {session.document_count} belge
              </span>
              <span className="inline-block">{session.total_chunks} parça</span>
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
      <div className="bg-card p-4 md:p-6 lg:p-8 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
            <ConfigIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              RAG Konfigürasyonu
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Belgeleri parçalara ayırın ve vektör veritabanını oluşturun
            </p>
          </div>
        </div>

        <form onSubmit={handleConfigureAndProcess} className="space-y-6">
          {/* Markdown Files Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Markdown Dosyaları Seçin
            </label>
            <div className="max-h-48 md:max-h-56 overflow-y-auto border border-border rounded-lg bg-background">
              {markdownFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">Markdown dosyası bulunamadı</div>
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
            {selectedFiles.length > 0 && (
              <div className="mt-3 px-3 py-2 bg-primary/10 rounded-lg">
                <div className="text-sm text-primary font-medium">
                  {selectedFiles.length} dosya seçili
                </div>
              </div>
            )}
          </div>

          {/* Configuration Parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label
                htmlFor="chunk_strategy"
                className="block text-sm font-medium text-foreground"
              >
                Parçalama Stratejisi
              </label>
              <select
                id="chunk_strategy"
                value={chunkStrategy}
                onChange={(e) => setChunkStrategy(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {chunkStrategies.map((strategy) => (
                  <option key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="embedding_model"
                className="block text-sm font-medium text-foreground"
              >
                Embedding Modeli
              </label>
              <select
                id="embedding_model"
                value={embeddingModel}
                onChange={(e) => setEmbeddingModel(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {embeddingModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="chunk_size"
                className="block text-sm font-medium text-foreground"
              >
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
                className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="chunk_overlap"
                className="block text-sm font-medium text-foreground"
              >
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
                className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={selectedFiles.length === 0 || processing}
            className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center gap-3 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[3rem] touch-manipulation"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <PlayIcon />
                <span>RAG Konfigürasyonunu Çalıştır</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Chunks Visualization Section */}
      <div className="bg-card p-4 md:p-6 lg:p-8 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <ChunkIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                Ders Oturumu Parçaları ({chunks.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Vektör veritabanında oluşturulan tüm metin parçaları
              </p>
            </div>
          </div>
          <button
            onClick={fetchChunks}
            disabled={loading}
            className="w-full sm:w-auto py-2 px-4 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
          >
            {loading ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 md:py-16">
            <div className="relative mx-auto w-12 h-12 md:w-16 md:h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Parçalar yükleniyor...
            </p>
          </div>
        ) : chunks.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ChunkIcon />
            </div>
            <p className="text-muted-foreground text-sm md:text-base mb-2">
              Bu ders oturumu için henüz parça bulunmuyor
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Yukarıdan RAG konfigürasyonu çalıştırın
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 md:space-y-6">
              {chunks
                .slice(
                  (chunkPage - 1) * CHUNKS_PER_PAGE,
                  chunkPage * CHUNKS_PER_PAGE
                )
                .map((chunk, index) => (
                  <ChunkCard
                    key={`${chunk.document_name}-${chunk.chunk_index}`}
                    chunk={chunk}
                    index={index}
                  />
                ))}
            </div>
            {/* Pagination for Chunks */}
            {chunks.length > CHUNKS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-border gap-4">
                <button
                  onClick={() => setChunkPage((p) => Math.max(1, p - 1))}
                  disabled={chunkPage === 1}
                  className="w-full sm:w-auto py-2 px-6 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                >
                  Önceki
                </button>
                <span className="text-sm text-muted-foreground font-medium px-4 py-2 bg-muted/30 rounded-lg">
                  Sayfa {chunkPage} /{" "}
                  {Math.ceil(chunks.length / CHUNKS_PER_PAGE)}
                </span>
                <button
                  onClick={() =>
                    setChunkPage((p) =>
                      Math.min(
                        Math.ceil(chunks.length / CHUNKS_PER_PAGE),
                        p + 1
                      )
                    )
                  }
                  disabled={
                    chunkPage >= Math.ceil(chunks.length / CHUNKS_PER_PAGE)
                  }
                  className="w-full sm:w-auto py-2 px-6 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
