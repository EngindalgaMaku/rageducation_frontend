"use client";
import React, { useState } from "react";
import { useBackend } from "@/contexts/BackendContext";

export default function BackendSelector() {
  const {
    backendType,
    setBackendType,
    apiUrl,
    isLocalBackendAvailable,
    checkLocalBackendHealth,
  } = useBackend();

  const [isChecking, setIsChecking] = useState(false);

  const handleBackendChange = async (type: "local" | "cloud") => {
    if (type === "local" && !isLocalBackendAvailable) {
      setIsChecking(true);
      const isAvailable = await checkLocalBackendHealth();
      setIsChecking(false);

      if (!isAvailable) {
        alert(
          "Local backend bulunamadı! Backend'in http://localhost:8080 adresinde çalıştığından emin olun."
        );
        return;
      }
    }

    setBackendType(type);
  };

  const handleRefreshLocalStatus = async () => {
    setIsChecking(true);
    await checkLocalBackendHealth();
    setIsChecking(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
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
                d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Backend Bağlantısı
            </h3>
            <p className="text-sm text-muted-foreground">
              Kullanılacak backend'i seçin
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-muted-foreground">Aktif:</span>
          <code className="px-2 py-1 bg-muted rounded text-foreground font-mono">
            {apiUrl}
          </code>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Backend Option */}
        <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
            backendType === "local"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleBackendChange("local")}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isLocalBackendAvailable ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium">Local Backend</span>
            </div>
            <input
              type="radio"
              checked={backendType === "local"}
              onChange={() => handleBackendChange("local")}
              className="accent-primary"
            />
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            Yerel geliştirme ortamı
          </p>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>URL:</span>
              <code className="text-primary">http://localhost:8080</code>
            </div>
            <div className="flex justify-between">
              <span>Durum:</span>
              <span
                className={`font-medium ${
                  isLocalBackendAvailable ? "text-green-600" : "text-red-600"
                }`}
              >
                {isLocalBackendAvailable ? "Çevrimiçi" : "Çevrimdışı"}
              </span>
            </div>
          </div>

          {!isLocalBackendAvailable && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              ⚠️ Local backend başlatılmamış
            </div>
          )}
        </div>

        {/* Cloud Backend Option */}
        <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
            backendType === "cloud"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleBackendChange("cloud")}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium">Cloud Backend</span>
            </div>
            <input
              type="radio"
              checked={backendType === "cloud"}
              onChange={() => handleBackendChange("cloud")}
              className="accent-primary"
            />
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            Google Cloud Run prodüksiyon ortamı
          </p>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>URL:</span>
              <code className="text-primary truncate">Cloud Run</code>
            </div>
            <div className="flex justify-between">
              <span>Durum:</span>
              <span className="font-medium text-blue-600">Hazır</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
        <button
          onClick={handleRefreshLocalStatus}
          disabled={isChecking}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
        >
          {isChecking ? (
            <>
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Kontrol ediliyor...</span>
            </>
          ) : (
            <>
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Local Backend'i Kontrol Et</span>
            </>
          )}
        </button>

        <div className="text-xs text-muted-foreground">
          Seçim otomatik kaydedilir
        </div>
      </div>
    </div>
  );
}
