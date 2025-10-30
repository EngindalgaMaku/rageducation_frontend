// API URL will be dynamically determined by BackendContext
// This is a fallback for server-side rendering
const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-gateway-1051060211087.europe-west1.run.app";

// Set API URL globally for client-side access
export function setGlobalApiUrl(url: string) {
  if (typeof window !== "undefined") {
    (window as any).__BACKEND_API_URL__ = url;
  }
}

// Get API URL from context or use default
function getApiUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: try to get from global state
    return (window as any).__BACKEND_API_URL__ || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export type SessionMeta = {
  session_id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_accessed: string;
  grade_level: string;
  subject_area: string;
  learning_objectives: string[];
  tags: string[];
  document_count: number;
  total_chunks: number;
  query_count: number;
  user_rating: number;
  is_public: boolean;
  backup_count: number;
};

export type Chunk = {
  document_name: string;
  chunk_index: number;
  chunk_text: string;
  chunk_metadata?: any;
};

export type SessionChunksResponse = {
  chunks: Chunk[];
  total_count: number;
  session_id: string;
};

export async function listSessions(): Promise<SessionMeta[]> {
  const res = await fetch(`${getApiUrl()}/sessions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function createSession(data: {
  name: string;
  description?: string;
  category: string;
  created_by?: string;
  grade_level?: string;
  subject_area?: string;
  learning_objectives?: string[];
  tags?: string[];
  is_public?: boolean;
}): Promise<SessionMeta> {
  const res = await fetch(`${getApiUrl()}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadDocument(form: FormData): Promise<any> {
  const res = await fetch(
    `${getApiUrl()}/documents/convert-document-to-markdown`,
    {
      method: "POST",
      body: form,
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function ragQuery(data: {
  session_id: string;
  query: string;
  top_k?: number;
  use_rerank?: boolean;
  min_score?: number;
  max_context_chars?: number;
  model?: string;
}): Promise<{ answer: string; sources: string[] }> {
  const res = await fetch(`${getApiUrl()}/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function convertPdfToMarkdown(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${getApiUrl()}/documents/convert-document-to-markdown`,
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listMarkdownFiles(): Promise<string[]> {
  const res = await fetch(`${getApiUrl()}/documents/list-markdown`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch markdown files");
  const data = await res.json();
  return data.markdown_files;
}

export async function addMarkdownDocumentsToSession(
  sessionId: string,
  filenames: string[]
): Promise<{
  success: boolean;
  processed_count: number;
  total_chunks_added: number;
  message: string;
  errors?: string[];
}> {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("markdown_files", JSON.stringify(filenames));
  formData.append("chunk_strategy", "semantic");
  formData.append("chunk_size", "1000");
  formData.append("chunk_overlap", "100");
  formData.append("embedding_model", "mixedbread-ai/mxbai-embed-large-v1");

  const res = await fetch(`${getApiUrl()}/documents/process-and-store`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getChunksForSession(sessionId: string): Promise<Chunk[]> {
  // Since the API Gateway doesn't have a chunks endpoint, return empty array for now
  // This functionality would need to be implemented in the API Gateway if needed
  console.warn(
    "getChunksForSession: API endpoint not available in gateway, returning empty array"
  );
  return [];
}

export async function getMarkdownFileContent(
  filename: string
): Promise<{ content: string }> {
  const res = await fetch(
    `${getApiUrl()}/documents/markdown/${encodeURIComponent(filename)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function configureAndProcess(data: {
  session_id: string;
  markdown_files: string[];
  chunk_strategy: string;
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
}): Promise<{
  success: boolean;
  message: string;
  processed_files: number;
  total_chunks: number;
  processing_time?: number;
}> {
  const formData = new FormData();
  formData.append("session_id", data.session_id);
  formData.append("markdown_files", JSON.stringify(data.markdown_files));
  formData.append("chunk_strategy", data.chunk_strategy);
  formData.append("chunk_size", data.chunk_size.toString());
  formData.append("chunk_overlap", data.chunk_overlap.toString());
  formData.append("embedding_model", data.embedding_model);

  const res = await fetch(`${getApiUrl()}/documents/process-and-store`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checkApiHealth(): Promise<{ status: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${getApiUrl()}/health`, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API ${res.status} durum kodu döndürdü`);
    }
    return await res.json();
  } catch (error) {
    // Bu kısım network hatalarını ve zaman aşımlarını yakalar
    throw new Error("API sağlık kontrolü başarısız oldu");
  }
}

export async function listAvailableModels(): Promise<{ models: string[] }> {
  const res = await fetch(`${getApiUrl()}/models`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch available models");
  return res.json();
}

// Changelog types and functions
export type ChangelogEntry = {
  id: number;
  version: string;
  date: string;
  changes: string[];
};

export async function getChangelog(): Promise<ChangelogEntry[]> {
  // Changelog functionality not available in API Gateway
  // Return empty array or mock data for now
  console.warn(
    "getChangelog: API endpoint not available in gateway, returning empty array"
  );
  return [];
}

export async function createChangelogEntry(data: {
  version: string;
  date: string;
  changes: string[];
}): Promise<ChangelogEntry> {
  // Changelog functionality not available in API Gateway
  console.warn("createChangelogEntry: API endpoint not available in gateway");
  throw new Error("Changelog functionality not available");
}
