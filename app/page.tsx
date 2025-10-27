"use client";
import React, { useState, useEffect, FormEvent } from "react";
import {
  listSessions,
  createSession,
  uploadDocument,
  ragQuery,
  listMarkdownFiles,
  addMarkdownDocumentsToSession,
  convertPdfToMarkdown,
  getMarkdownFileContent,
  listAvailableModels,
  SessionMeta,
} from "@/lib/api";
import Modal from "@/components/Modal";
import MarkdownViewer from "@/components/MarkdownViewer";
import { useRouter } from "next/navigation";

// Dashboard Statistics Card Component
function StatsCard({
  title,
  value,
  description,
  icon,
  color = "primary",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div
          className={`p-2 rounded-md ${
            colorClasses[color as keyof typeof colorClasses] ||
            colorClasses.primary
          }`}
        >
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Session Card Component
function SessionCard({
  session,
  onNavigate,
  index = 0,
}: {
  session: SessionMeta;
  onNavigate: (id: string) => void;
  index?: number;
}) {
  return (
    <div
      className="card-interactive animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onNavigate(session.session_id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <h3 className="text-sm font-semibold text-foreground">
              {session.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {session.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <DocumentIcon />
              <span>{session.document_count} belge</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-primary/10 flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
              </span>
              <span>{session.total_chunks} parça</span>
            </div>
            <div className="flex items-center gap-1">
              <QueryIcon />
              <span>{session.query_count} sorgu</span>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              session.status === "active"
                ? "bg-green-500/10 text-green-700 border border-green-500/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full mr-2 ${
                session.status === "active"
                  ? "bg-green-500 animate-pulse-soft"
                  : "bg-muted-foreground"
              }`}
            ></div>
            {session.status === "active" ? "Aktif" : "Pasif"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
const DocumentIcon = () => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SessionIcon = () => (
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

const QueryIcon = () => (
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
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const ChartIcon = () => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const UploadIcon = () => (
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
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const MarkdownIcon = () => (
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
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sessions" | "upload" | "query"
  >("dashboard");

  // Form states
  const [name, setName] = useState("Yeni Araştırma Oturumu");
  const [description, setDescription] = useState(
    "Akademik dokümanlarda RAG performansını inceleme"
  );
  const [category, setCategory] = useState("research");
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [uploadStats, setUploadStats] = useState<any>(null);

  // Model selection states
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedQueryModel, setSelectedQueryModel] = useState<string>("");
  const [modelsLoading, setModelsLoading] = useState(false);

  // Markdown files states
  const [markdownFiles, setMarkdownFiles] = useState<string[]>([]);
  const [selectedMarkdownFiles, setSelectedMarkdownFiles] = useState<string[]>(
    []
  );
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const [addingDocuments, setAddingDocuments] = useState(false);

  // PDF to Markdown conversion states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Modal viewer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);

  // Calculated metrics
  const totalSessions = sessions.length;
  const totalDocuments = sessions.reduce(
    (acc, s) => acc + (s.document_count || 0),
    0
  );
  const totalChunks = sessions.reduce(
    (acc, s) => acc + (s.total_chunks || 0),
    0
  );
  const totalQueries = sessions.reduce(
    (acc, s) => acc + (s.query_count || 0),
    0
  );

  async function refreshSessions() {
    try {
      setLoading(true);
      setError(null);
      const data = await listSessions();
      setSessions(data);

      // Auto-select the most recent session only on initial load
      if (!selectedSessionId && data.length > 0) {
        // Sort sessions by updated_at timestamp in descending order (most recent first)
        const sortedSessions = [...data].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        // Set the most recent session as selected
        setSelectedSessionId(sortedSessions[0].session_id);
      }
    } catch (e: any) {
      setError(e.message || "Oturumlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSession(e: FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      const session = await createSession({
        name,
        description,
        category,
        created_by: "akademik-kullanici",
      });
      await refreshSessions();
      setSelectedSessionId(session.session_id);
      setActiveTab("upload");
    } catch (e: any) {
      setError(e.message || "Oluşturma başarısız");
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file || !selectedSessionId) return;

    const formData = new FormData();
    formData.append("session_id", selectedSessionId);
    formData.append("strategy", "markdown");
    formData.append("chunk_size", "1000");
    formData.append("chunk_overlap", "100");
    formData.append("embedding_model", "mxbai-embed-large");
    formData.append("file", file);

    try {
      setError(null);
      const result = await uploadDocument(formData);
      setUploadStats(result.stats || result);
      await refreshSessions();
    } catch (e: any) {
      setError(e.message || "Yükleme başarısız");
    }
  }

  async function handleQuery(e: FormEvent) {
    e.preventDefault();
    if (!selectedSessionId || !query) return;

    try {
      setError(null);
      const result = await ragQuery({
        session_id: selectedSessionId,
        query,
        top_k: 5,
        use_rerank: true,
        min_score: 0.1,
        max_context_chars: 8000,
        model: selectedQueryModel, // Include selected model
      });
      setAnswer(result.answer);
    } catch (e: any) {
      setError(e.message || "Sorgu başarısız");
    }
  }

  async function fetchAvailableModels() {
    try {
      setModelsLoading(true);
      setError(null);
      const data = await listAvailableModels();
      setAvailableModels(data.models);

      // Auto-select the first model if none is selected
      if (!selectedQueryModel && data.models.length > 0) {
        setSelectedQueryModel(data.models[0]);
      }
    } catch (e: any) {
      setError(e.message || "Modeller yüklenemedi");
    } finally {
      setModelsLoading(false);
    }
  }

  async function fetchMarkdownFiles() {
    try {
      setMarkdownLoading(true);
      setError(null);
      const files = await listMarkdownFiles();
      setMarkdownFiles(files);
    } catch (e: any) {
      setError(e.message || "Markdown dosyaları yüklenemedi");
    } finally {
      setMarkdownLoading(false);
    }
  }

  async function handleAddMarkdownDocuments() {
    if (!selectedSessionId || selectedMarkdownFiles.length === 0) return;

    try {
      setAddingDocuments(true);
      setError(null);
      const result = await addMarkdownDocumentsToSession(
        selectedSessionId,
        selectedMarkdownFiles
      );

      setUploadStats({
        processed_count: result.processed_count,
        chunks_created: result.total_chunks_added,
        message: result.message,
      });

      // Clear selections and refresh data
      setSelectedMarkdownFiles([]);
      await refreshSessions();
    } catch (e: any) {
      setError(e.message || "Dokümanlar eklenemedi");
    } finally {
      setAddingDocuments(false);
    }
  }

  function handleMarkdownFileToggle(filename: string) {
    setSelectedMarkdownFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  }

  // PDF to Markdown conversion handlers
  const handlePdfUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsConverting(true);
      setError(null);
      setSuccess(null);

      const result = await convertPdfToMarkdown(selectedFile);

      if (result.success) {
        setSuccess(
          `PDF başarıyla Markdown formatına dönüştürüldü: ${result.markdown_filename}`
        );
        setSelectedFile(null);
        // Reset the file input
        const fileInput = document.getElementById(
          "pdf-file"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // Refresh the markdown files list after successful conversion
        setTimeout(async () => {
          await fetchMarkdownFiles();
        }, 1000);
      } else {
        setError(result.message || "Dönüştürme işlemi başarısız");
      }
    } catch (e: any) {
      setError(e.message || "PDF dönüştürme işlemi başarısız");
    } finally {
      setIsConverting(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Lütfen sadece PDF dosyası seçin");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  // Modal viewer handlers
  const handleViewMarkdownFile = async (filename: string) => {
    try {
      setIsLoadingContent(true);
      setIsModalOpen(true);
      setSelectedFileName(filename);
      setModalError(null);
      setSelectedFileContent("");

      const result = await getMarkdownFileContent(filename);
      setSelectedFileContent(result.content);
    } catch (e: any) {
      setModalError(e.message || "Dosya içeriği yüklenemedi");
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFileContent("");
    setSelectedFileName("");
    setModalError(null);
    setIsLoadingContent(false);
  };

  // Navigate to session page
  const handleNavigateToSession = (sessionId: string) => {
    router.push(`/sessions/${sessionId}`);
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  // Fetch markdown files when upload tab is selected
  useEffect(() => {
    if (activeTab === "upload" && markdownFiles.length === 0) {
      fetchMarkdownFiles();
    }
  }, [activeTab]);

  // Fetch available models when query tab is selected
  useEffect(() => {
    if (activeTab === "query" && availableModels.length === 0) {
      fetchAvailableModels();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Enhanced Tab Navigation */}
      <div className="border-b border-border bg-card/50 rounded-t-lg">
        <nav className="flex space-x-1 p-1">
          {[
            { id: "dashboard", name: "Panel", icon: <ChartIcon /> },
            { id: "sessions", name: "Oturumlar", icon: <SessionIcon /> },
            { id: "upload", name: "Belge Yönetimi", icon: <DocumentIcon /> },
            { id: "query", name: "RAG Sorgusu", icon: <QueryIcon /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-button transition-all duration-200 ${
                activeTab === tab.id ? "tab-active" : "tab-inactive"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Toplam Oturum"
              value={totalSessions}
              description="Aktif çalışma oturumları"
              icon={<SessionIcon />}
              color="primary"
            />
            <StatsCard
              title="Yüklenen Belgeler"
              value={totalDocuments}
              description="İşlenmiş dokümanlar"
              icon={<DocumentIcon />}
              color="green"
            />
            <StatsCard
              title="Toplam Parça"
              value={totalChunks}
              description="Vektörel parçalar"
              icon={<ChartIcon />}
              color="blue"
            />
            <StatsCard
              title="Yapılan Sorgular"
              value={totalQueries}
              description="RAG sorguları"
              icon={<QueryIcon />}
              color="purple"
            />
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Son Oturumlar
              </h2>
              <button
                onClick={refreshSessions}
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? "Yenileniyor..." : "Yenile"}
              </button>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session, index) => (
                  <SessionCard
                    key={session.session_id}
                    session={session}
                    onNavigate={handleNavigateToSession}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <SessionIcon />
                </div>
                <p className="text-sm">Henüz oturum bulunmuyor</p>
                <p className="text-xs mt-1 opacity-75">
                  Yeni bir oturum oluşturun
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Yeni Oturum Oluştur
            </h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div
                className="animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <label htmlFor="name" className="label">
                  Oturum Adı
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input hover:shadow-md focus:shadow-lg transition-all duration-200"
                  required
                />
              </div>
              <div
                className="animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <label htmlFor="description" className="label">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input hover:shadow-md focus:shadow-lg transition-all duration-200"
                  rows={3}
                />
              </div>
              <div
                className="animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <label htmlFor="category" className="label">
                  Kategori
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input hover:shadow-md focus:shadow-lg transition-all duration-200"
                >
                  <option value="research">🔬 Araştırma</option>
                  <option value="education">📚 Eğitim</option>
                  <option value="analysis">📊 Analiz</option>
                </select>
              </div>
              <div
                className="animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <button type="submit" className="btn btn-primary group">
                  <svg
                    className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Oturum Oluştur
                </button>
              </div>
            </form>
          </div>

          {/* All Sessions */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Tüm Oturumlar
            </h2>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <SessionCard
                    key={session.session_id}
                    session={session}
                    onNavigate={handleNavigateToSession}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <SessionIcon />
                </div>
                <p className="text-sm">Henüz oturum bulunmuyor</p>
                <p className="text-xs mt-1 opacity-75">
                  Yukarıdan yeni bir oturum oluşturun
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Tab - Now shows both PDF conversion and Markdown File Selection */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          {/* PDF to Markdown Conversion Section */}
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-md mr-3">
                <UploadIcon />
              </div>
              <h2 className="text-lg font-medium text-foreground">
                PDF to Markdown Dönüştürücü
              </h2>
            </div>

            {/* Success Display */}
            {success && (
              <div className="alert alert-success mb-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <form onSubmit={handlePdfUpload} className="space-y-6">
              {/* Interactive Dropzone */}
              <div
                className={`dropzone ${isDragOver ? "dropzone-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("pdf-file")?.click()}
              >
                <div className="dropzone-icon">
                  <UploadIcon />
                </div>
                <div className="space-y-2">
                  <p className="dropzone-text">
                    <span className="dropzone-highlight">Tıklayın</span> veya
                    dosyaları buraya sürükleyin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sadece PDF dosyaları desteklenmektedir (Max. 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  id="pdf-file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf"
                  disabled={isConverting}
                />
              </div>

              {selectedFile && (
                <div className="animate-slide-up p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary text-sm">
                      <DocumentIcon />
                      <div className="ml-3">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.getElementById(
                          "pdf-file"
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={!selectedFile || isConverting}
              >
                {isConverting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                    Dönüştürülüyor...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UploadIcon />
                    <span className="ml-2">PDF'i Markdown'a Dönüştür</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Markdown File Selection Section */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Oturuma Markdown Belgeleri Ekle
            </h2>
            {!selectedSessionId ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-yellow-800">
                  Belge eklemek için önce bir oturum seçin.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">
                  Seçili oturum:{" "}
                  <strong>
                    {
                      sessions.find((s) => s.session_id === selectedSessionId)
                        ?.name
                    }
                  </strong>
                </p>
              </div>
            )}

            {markdownLoading ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-muted-foreground animate-pulse-soft">
                  Markdown dosyaları yükleniyor...
                </p>
                <div className="flex justify-center mt-3 space-x-1">
                  <div
                    className="w-1 h-1 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="label">
                        Mevcut Markdown Dosyaları ({markdownFiles.length})
                      </label>
                      <button
                        onClick={fetchMarkdownFiles}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        🔄 Yenile
                      </button>
                    </div>

                    {markdownFiles.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-md">
                        Henüz markdown dosyası bulunmuyor.
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                        {markdownFiles.map((filename) => (
                          <div
                            key={filename}
                            className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMarkdownFiles.includes(filename)}
                              onChange={() =>
                                handleMarkdownFileToggle(filename)
                              }
                              className="mr-3 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {filename.replace(".md", "")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {filename}
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewMarkdownFile(filename)}
                              className="ml-3 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors flex items-center gap-1"
                              title="Dosyayı görüntüle"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              Görüntüle
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedMarkdownFiles.length > 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>
                          Seçili dosyalar ({selectedMarkdownFiles.length}):
                        </strong>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedMarkdownFiles.map((filename) => (
                          <span
                            key={filename}
                            className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-md"
                          >
                            {filename.replace(".md", "")}
                            <button
                              onClick={() => handleMarkdownFileToggle(filename)}
                              className="ml-1 text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddMarkdownDocuments}
                    className="btn btn-primary w-full"
                    disabled={
                      !selectedSessionId ||
                      selectedMarkdownFiles.length === 0 ||
                      addingDocuments
                    }
                  >
                    {addingDocuments ? (
                      <div className="flex items-center justify-center">
                        <div className="relative w-4 h-4 mr-2">
                          <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/30"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"></div>
                        </div>
                        <span className="animate-pulse-soft">
                          Dokümanlar Ekleniyor...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        {`Seçili Dokümanları Oturuma Ekle (${selectedMarkdownFiles.length})`}
                      </div>
                    )}
                  </button>
                </div>
              </>
            )}

            {uploadStats && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-green-800 font-medium">
                  Dokümanlar Başarıyla Eklendi!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    İşlenen dosya sayısı: {uploadStats.processed_count || "N/A"}
                  </p>
                  <p>
                    Oluşturulan parça sayısı:{" "}
                    {uploadStats.chunks_created || "N/A"}
                  </p>
                  {uploadStats.message && <p>Mesaj: {uploadStats.message}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Query Tab */}
      {activeTab === "query" && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            RAG Sorgusu
          </h2>
          {!selectedSessionId ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-yellow-800">
                Sorgu yapmak için önce bir oturum seçin.
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                Seçili oturum:{" "}
                <strong>
                  {
                    sessions.find((s) => s.session_id === selectedSessionId)
                      ?.name
                  }
                </strong>
              </p>
            </div>
          )}

          <form onSubmit={handleQuery} className="space-y-6">
            <div className="animate-slide-up">
              <label htmlFor="model-select" className="label">
                Model Seçimi
              </label>
              {modelsLoading ? (
                <div className="flex items-center justify-center p-4 border border-gray-300 rounded-md bg-gray-50">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
                  <span className="text-sm text-muted-foreground">
                    Modeller yükleniyor...
                  </span>
                </div>
              ) : (
                <select
                  id="model-select"
                  value={selectedQueryModel}
                  onChange={(e) => setSelectedQueryModel(e.target.value)}
                  className="input hover:shadow-md focus:shadow-lg transition-all duration-200"
                  required
                >
                  {availableModels.length === 0 ? (
                    <option value="">Model bulunamadı</option>
                  ) : (
                    availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <label htmlFor="query" className="label">
                Soru
              </label>
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input hover:shadow-md focus:shadow-lg transition-all duration-200 min-h-[100px]"
                rows={4}
                placeholder="Belgelerde aramak istediğiniz soruyu yazın..."
                required
              />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <button
                type="submit"
                className="btn btn-primary group w-full sm:w-auto"
                disabled={!selectedSessionId || !query}
              >
                <svg
                  className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Sorguyu Çalıştır
              </button>
            </div>
          </form>

          {answer && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-gray-900 font-medium mb-2">RAG Cevabı:</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Markdown Viewer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedFileName
            ? `${selectedFileName.replace(".md", "")}`
            : "Markdown Dosyası"
        }
        size="2xl"
      >
        <MarkdownViewer
          content={selectedFileContent}
          isLoading={isLoadingContent}
          error={modalError}
        />
      </Modal>
    </div>
  );
}
