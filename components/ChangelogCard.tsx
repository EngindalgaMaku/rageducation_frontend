"use client";
import { useState, useEffect, FormEvent } from "react";
import { getChangelog, createChangelogEntry, ChangelogEntry } from "@/lib/api";

const VersionIcon = () => (
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
      d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 14h.01M7 17h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z"
    />
  </svg>
);

const AddIcon = () => (
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
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const ChangelogCard = () => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [version, setVersion] = useState("");
  const [changes, setChanges] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChangelog = async () => {
    try {
      setLoading(true);
      const data = await getChangelog();
      setEntries(data);
    } catch (e: any) {
      setError("Günlük verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangelog();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const newEntry = {
        version,
        date: new Date().toISOString(),
        changes: changes.split("\n").filter((line) => line.trim() !== ""),
      };
      await createChangelogEntry(newEntry);
      setVersion("");
      setChanges("");
      setShowForm(false);
      await fetchChangelog(); // Refresh the list
    } catch (e: any) {
      setError("Yeni günlük kaydı oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">
          Proje Geliştirme Günlüğü
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-secondary text-sm"
        >
          <AddIcon />
          <span>{showForm ? "Vazgeç" : "Yeni Ekle"}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg"
        >
          <h3 className="font-medium">Yeni Günlük Kaydı</h3>
          <div>
            <label htmlFor="version" className="label text-xs">
              Versiyon
            </label>
            <input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="input"
              placeholder="v2.1.1"
              required
            />
          </div>
          <div>
            <label htmlFor="changes" className="label text-xs">
              Değişiklikler (her satıra bir madde)
            </label>
            <textarea
              id="changes"
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              className="input"
              rows={4}
              placeholder="Örnek: Giriş sayfası tasarımı yenilendi."
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      )}

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {loading && <p>Yükleniyor...</p>}
        {!loading && error && <p className="text-destructive">{error}</p>}
        {!loading &&
          entries.map((entry) => (
            <div
              key={entry.id}
              className="relative pl-8 border-l-2 border-border"
            >
              <div className="absolute -left-[11px] top-1 w-5 h-5 bg-primary rounded-full border-4 border-card" />
              <p className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <VersionIcon />
                  {entry.version}
                </span>
              </div>
              <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-foreground">
                {entry.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChangelogCard;
