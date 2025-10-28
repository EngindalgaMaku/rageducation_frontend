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
import ChangelogCard from "@/components/ChangelogCard";
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
  const gradientClasses = {
    primary: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    blue: "from-sky-500 to-sky-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div
      className={`rounded-xl p-6 shadow-lg text-white bg-gradient-to-br ${
        gradientClasses[color as keyof typeof gradientClasses]
      } transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && <p className="text-xs opacity-70">{description}</p>}
        </div>
        <div className="p-3 rounded-lg bg-white/20">{icon}</div>
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
  const colorPalette = [
    { border: "border-blue-500", dot: "text-blue-600", strip: "bg-blue-500" },
    { border: "border-emerald-500", dot: "text-emerald-600", strip: "bg-emerald-500" },
    { border: "border-violet-500", dot: "text-violet-600", strip: "bg-violet-500" },
    { border: "border-rose-500", dot: "text-rose-600", strip: "bg-rose-500" },
    { border: "border-amber-500", dot: "text-amber-600", strip: "bg-amber-500" },
    { border: "border-cyan-500", dot: "text-cyan-600", strip: "bg-cyan-500" },
  ];
  const c = colorPalette[index % colorPalette.length];

  return (
    <div
      className={`relative group bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 ${c.border} cursor-pointer p-6 animate-slide-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onNavigate(session.session_id)}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${c.strip} opacity-20 rounded-l-xl`} />
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-md font-semibold text-foreground mb-1">
            {session.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {session.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <DocumentIcon />
              <span>{session.document_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChartIcon />
              <span>{session.total_chunks}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <QueryIcon />
              <span>{session.query_count}</span>
            </div>
          </div>
        </div>
        <div className="ml-4 flex flex-col items-end justify-between h-full">
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              session.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                session.status === "active" ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            {session.status === "active" ? "Aktif" : "Pasif"}
          </div>
          <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
            <span>Ayarları Görüntüle</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
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
  const [sessionPage, setSessionPage] = useState(1);
  const SESSIONS_PER_PAGE = 5;
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
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: string }[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
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
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] =
    useState(false);
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

      if (!selectedSessionId && data.length > 0) {
        const sortedSessions = [...data].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
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
      setIsCreateSessionModalOpen(false);
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
    if (!selectedSessionId || !query.trim()) return;

    const userMessage = query;
    setQuery("");
    setIsQuerying(true);
    setError(null);

    setChatHistory((prev) => [...prev, { user: userMessage, bot: "..." }]);

    try {
      const result = await ragQuery({
        session_id: selectedSessionId,
        query: userMessage,
        top_k: 5,
        use_rerank: true,
        min_score: 0.1,
        max_context_chars: 8000,
        model: selectedQueryModel,
      });

      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].bot = result.answer;
        return newHistory;
      });
    } catch (e: any) {
      const errorMessage = e.message || "Sorgu başarısız oldu";
      setError(errorMessage);
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].bot = `Hata: ${errorMessage}`;
        return newHistory;
      });
    } finally {
      setIsQuerying(false);
    }
  }

  async function fetchAvailableModels() {
    try {
      setModelsLoading(true);
      setError(null);
      const data = await listAvailableModels();
      setAvailableModels(data.models);

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
        const fileInput = document.getElementById(
          "pdf-file"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

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
      if (file && file.type === "application/pdf") {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Lütfen sadece PDF dosyası seçin");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Lütfen sadece PDF dosyası seçin");
      }
    }
  };

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

  const handleNavigateToSession = (sessionId: string) => {
    router.push(`/sessions/${sessionId}`);
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (activeTab === "upload" && markdownFiles.length === 0) {
      fetchMarkdownFiles();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "query" && availableModels.length === 0) {
      fetchAvailableModels();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="border-b border-border bg-card/50 rounded-t-lg">
        <nav className="flex space-x-1 p-1">
          {[
            { id: "dashboard", name: "Panel", icon: <ChartIcon /> },
            { id: "sessions", name: "Oturumlar", icon: <SessionIcon /> },
            { id: "upload", name: "Belge Yönetimi", icon: <DocumentIcon /> },
            { id: "query", name: "RAG Tabanlı Chatbot", icon: <QueryIcon /> },
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

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Toplam Ders Oturumu"
              value={totalSessions}
              description="Aktif ders oturumları"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Son Ders Oturumları
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
                  <div className="space-y-4">
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
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <SessionIcon />
                    </div>
                    <p className="font-medium">Henüz ders oturumu bulunmuyor</p>
                    <p className="text-sm mt-1">
                      "Ders Oturumları" sekmesinden yeni bir oturum oluşturun.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <ChangelogCard />
            </div>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-8">
          <div className="alert alert-info">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-bold">Nasıl Çalışır?</h3>
                <p className="text-sm mt-1">
                  Bir ders oturumunun üzerine tıklayarak o oturuma ait Markdown
                  dosyalarını seçebilir, RAG ayarlarını yapılandırabilir ve RAG
                  işlemini başlatabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Tüm Ders Oturumları
              </h2>
              <button
                onClick={() => setIsCreateSessionModalOpen(true)}
                className="btn btn-primary"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                <span>Yeni Ders Oturumu</span>
              </button>
            </div>
            {sessions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {sessions
                    .slice(
                      (sessionPage - 1) * SESSIONS_PER_PAGE,
                      sessionPage * SESSIONS_PER_PAGE
                    )
                    .map((session, index) => (
                      <SessionCard
                        key={session.session_id}
                        session={session}
                        onNavigate={handleNavigateToSession}
                        index={index}
                      />
                    ))}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                    disabled={sessionPage === 1}
                    className="btn btn-secondary"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Sayfa {sessionPage} /{" "}
                    {Math.ceil(sessions.length / SESSIONS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setSessionPage((p) =>
                        Math.min(
                          Math.ceil(sessions.length / SESSIONS_PER_PAGE),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      sessionPage >=
                      Math.ceil(sessions.length / SESSIONS_PER_PAGE)
                    }
                    className="btn btn-secondary"
                  >
                    Sonraki
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <SessionIcon />
                </div>
                <p className="font-medium">Henüz ders oturumu bulunmuyor</p>
                <p className="text-sm mt-1">
                  Başlamak için yeni bir ders oturumu oluşturun.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="space-y-6">
          <div className="bg-card p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-xl mr-4">
                <UploadIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  PDF'den Markdown'a
                </h2>
                <p className="text-sm text-muted-foreground">
                  Akademik belgelerinizi RAG için hazırlayın
                </p>
              </div>
            </div>

            {success && (
              <div className="alert alert-success mb-4">{success}</div>
            )}

            <form onSubmit={handlePdfUpload} className="space-y-6">
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
                <p className="dropzone-text">
                  <span className="dropzone-highlight">Tıklayın</span> veya PDF
                  dosyanızı buraya sürükleyin
                </p>
                <p className="text-xs text-muted-foreground mt-1">Maks. 50MB</p>
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
                      onClick={() => setSelectedFile(null)}
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
                  <>
                    <div className="spinner mr-2"></div>
                    Dönüştürülüyor...
                  </>
                ) : (
                  <>
                    <UploadIcon />
                    <span className="ml-2">Dönüştür ve Yükle</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Oturuma Markdown Belgeleri Ekle
            </h2>
            {!selectedSessionId ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-yellow-800">
                  Belge eklemek için önce bir ders oturumu seçin.
                </p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">
                  Seçili ders oturumu:{" "}
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
                        {`Seçili Dokümanları Ders Oturumuna Ekle (${selectedMarkdownFiles.length})`}
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

      {/* Query Tab - Chatbot Interface */}
      {activeTab === "query" && (
        <div className="bg-card rounded-xl shadow-lg flex flex-col h-[70vh]">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">
              RAG Tabanlı Chatbot
            </h2>
            {!selectedSessionId ? (
              <p className="text-xs text-yellow-600">
                Sohbeti başlatmak için bir ders oturumu seçin.
              </p>
            ) : (
              <p className="text-xs text-green-600">
                Seçili ders oturumu:{" "}
                <strong>
                  {
                    sessions.find((s) => s.session_id === selectedSessionId)
                      ?.name
                  }
                </strong>
              </p>
            )}
          </div>

          {/* Chat History */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {chatHistory.map((chat, index) => (
              <div key={index} className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-lg">
                    {chat.user}
                  </div>
                </div>
                {/* Bot Message */}
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-lg">
                    {chat.bot === "..." ? (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{chat.bot}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleQuery} className="flex items-center gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input flex-1"
                placeholder={
                  !selectedSessionId
                    ? "Lütfen önce bir ders oturumu seçin..."
                    : "Sorunuzu buraya yazın..."
                }
                disabled={!selectedSessionId || isQuerying}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedSessionId || !query.trim() || isQuerying}
              >
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Gönder</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={isCreateSessionModalOpen}
        onClose={() => setIsCreateSessionModalOpen(false)}
        title="Yeni Ders Oturumu Oluştur"
      >
        <form onSubmit={handleCreateSession} className="space-y-6">
          <div>
            <label htmlFor="name" className="label">
              Ders Oturumu Adı
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="label">
              Açıklama
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="category" className="label">
              Kategori
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="research">🔬 Araştırma</option>
              <option value="general">📚 Genel</option>
              <option value="exam_prep">📝 Sınav Hazırlık</option>
              <option value="science">🔭 Fen Bilimleri</option>
              <option value="mathematics">➗ Matematik</option>
              <option value="language">🗣️ Dil</option>
              <option value="social_studies">🌍 Sosyal Bilgiler</option>
              <option value="history">🏛️ Tarih</option>
              <option value="geography">🗺️ Coğrafya</option>
              <option value="biology">🧬 Biyoloji</option>
              <option value="chemistry">⚗️ Kimya</option>
              <option value="physics">🧲 Fizik</option>
              <option value="computer_science">💻 Bilgisayar Bil.</option>
              <option value="art">🎨 Sanat</option>
              <option value="music">🎵 Müzik</option>
              <option value="physical_education">🏃‍♂️ Beden Eğitimi</option>
            </select>
          </div>
          <div className="pt-2">
            <button type="submit" className="btn btn-primary group w-full">
              <svg
                className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300"
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
              <span>Ders Oturumu Oluştur</span>
            </button>
          </div>
        </form>
      </Modal>

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
