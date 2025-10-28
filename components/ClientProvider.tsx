"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkApiHealth } from "@/lib/api";
import Link from "next/link";
import MobileMenu from "./MobileMenu";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "loading">(
    "loading"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
  }, [router, pathname, isLoginPage]);

  // API Health check
  useEffect(() => {
    if (isLoginPage) return;

    const checkStatus = async () => {
      try {
        await checkApiHealth();
        setApiStatus("online");
      } catch (error) {
        setApiStatus("offline");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  if (!isLoginPage) {
    const isAuthenticated =
      typeof window !== "undefined"
        ? localStorage.getItem("isAuthenticated")
        : null;
    if (!isAuthenticated) {
      return null; // veya bir yükleme ekranı
    }
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
                    <svg
                      className="w-6 h-6 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-xl font-bold text-foreground">
                      Öğretmen Paneli
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Yüksek Lisans Ödevi
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div
                className={`flex items-center space-x-2 text-sm ${
                  apiStatus === "online" ? "text-green-600" : "text-red-600"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    apiStatus === "online"
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
                <span>
                  {apiStatus === "online"
                    ? "API Online"
                    : apiStatus === "offline"
                    ? "API Offline"
                    : "Kontrol ediliyor..."}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground">
                  Engin DALGA
                </span>
                <span className="text-xs text-muted-foreground">
                  Danışman: Serkan BALLI
                </span>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/20">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <button
                onClick={handleLogout}
                title="Çıkış Yap"
                aria-label="Çıkış Yap"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors px-3 py-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 3.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v17a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 1.5 0v2.25h4.5V4.25h-4.5V6.5a.75.75 0 0 1-1.5 0v-3Z" />
                  <path d="M3.22 12.53a.75.75 0 0 1 0-1.06l3-3a.75.75 0 1 1 1.06 1.06L5.81 11h7.44a.75.75 0 0 1 0 1.5H5.81l1.47 1.47a.75.75 0 1 1-1.06 1.06l-3-3Z" />
                </svg>
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        apiStatus={apiStatus}
      />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-8rem)] animate-fade-in">
        <div className="max-w-full">{children}</div>
      </main>
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Engin DALGA - MAKÜ Yüksek Lisans
              Çalışması
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                v2.2.0
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
