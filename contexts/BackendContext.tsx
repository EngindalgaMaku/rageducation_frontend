"use client";
import React, { createContext, useContext } from "react";

export type BackendType = "cloud";

interface BackendContextType {
  backendType: BackendType;
  apiUrl: string;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

const CLOUD_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-gateway-1051060211087.europe-west1.run.app";

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const value: BackendContextType = {
    backendType: "cloud",
    apiUrl: CLOUD_API_URL,
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
