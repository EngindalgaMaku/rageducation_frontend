const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://rag3-api-1051060211087.europe-west1.run.app";

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
  const res = await fetch(`${API_URL}/sessions`, { cache: "no-store" });
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
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadDocument(form: FormData): Promise<any> {
  const res = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: form,
  });
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
  const res = await fetch(`${API_URL}/rag/query`, {
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

  const res = await fetch(`${API_URL}/documents/convert-pdf-to-markdown`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listMarkdownFiles(): Promise<string[]> {
  const res = await fetch(`${API_URL}/documents/list-markdown`, {
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
  const res = await fetch(`${API_URL}/sessions/add-markdown-documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      markdown_files: filenames,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getChunksForSession(sessionId: string): Promise<Chunk[]> {
  const res = await fetch(
    `${API_URL}/rag/chunks/${encodeURIComponent(sessionId)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch chunks for session");
  const data: SessionChunksResponse = await res.json();
  return data.chunks;
}

export async function getMarkdownFileContent(
  filename: string
): Promise<{ content: string }> {
  const res = await fetch(
    `${API_URL}/documents/markdown/${encodeURIComponent(filename)}`,
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
  const res = await fetch(`${API_URL}/rag/configure-and-process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listAvailableModels(): Promise<{ models: string[] }> {
  const res = await fetch(`${API_URL}/models/list`, {
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
  const res = await fetch(`${API_URL}/changelog`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch changelog");
  return res.json();
}

export async function createChangelogEntry(data: {
  version: string;
  date: string;
  changes: string[];
}): Promise<ChangelogEntry> {
  const res = await fetch(`${API_URL}/changelog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
