"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type BackendType = "local" | "cloud";

interface BackendContextType {
  backendType: BackendType;
  setBackendType: (type: BackendType) => void;
  apiUrl: string;
  isLocalBackendAvailable: boolean;
  setIsLocalBackendAvailable: (available: boolean) => void;
  checkLocalBackendHealth: () => Promise<boolean>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

const LOCAL_API_URL = "http://localhost:8080";
const CLOUD_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://rageducation-backend-1051060211087.europe-west1.run.app";

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const [backendType, setBackendTypeState] = useState<BackendType>("cloud");
  const [isLocalBackendAvailable, setIsLocalBackendAvailable] = useState(false);

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("preferred-backend");
    if (saved === "local" || saved === "cloud") {
      setBackendTypeState(saved);
    }
  }, []);

  // Save preference to localStorage
  const setBackendType = (type: BackendType) => {
    setBackendTypeState(type);
    localStorage.setItem("preferred-backend", type);
  };

  // Get current API URL based on backend type
  const apiUrl = backendType === "local" ? LOCAL_API_URL : CLOUD_API_URL;

  // Check if local backend is available
  const checkLocalBackendHealth = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Shorter timeout for local

      const response = await fetch(`${LOCAL_API_URL}/health`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      const isAvailable = response.ok;
      setIsLocalBackendAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      setIsLocalBackendAvailable(false);
      return false;
    }
  };

  // Check local backend availability on mount and periodically
  useEffect(() => {
    checkLocalBackendHealth();

    // Check every 30 seconds
    const interval = setInterval(checkLocalBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const value: BackendContextType = {
    backendType,
    setBackendType,
    apiUrl,
    isLocalBackendAvailable,
    setIsLocalBackendAvailable,
    checkLocalBackendHealth,
  };

  return (
    <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
  );
}

export function useBackend() {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error("useBackend must be used within a BackendProvider");
  }
  return context;
}
