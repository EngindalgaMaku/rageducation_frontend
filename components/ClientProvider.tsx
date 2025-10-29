"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkApiHealth, setGlobalApiUrl } from "@/lib/api";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { BackendProvider, useBackend } from "@/contexts/BackendContext";

// Inner component that uses BackendContext
function ClientProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const { apiUrl, backendType } = useBackend();

  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "loading">(
    "loading"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Update global API URL when backend type changes
  useEffect(() => {
    setGlobalApiUrl(apiUrl);
  }, [apiUrl]);

  // Auth check and client-side mount detection
  useEffect(() => {
    setIsClient(true);
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    if (!authStatus && !isLoginPage) {
      router.replace("/login");
    }
  }, [router, pathname, isLoginPage]);

  // API Health check
  useEffect(() => {
    if (isLoginPage || !isClient) return;

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
  }, [isLoginPage, isClient, apiUrl]); // Include apiUrl in dependency

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  // On server, or before client-side check, or if not authenticated, render nothing.
  // This prevents the hydration mismatch.
  if (!isClient || !isAuthenticated) {
    return null;
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

            {/* Desktop Menu - Simple Tailwind responsive */}
            <nav className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      apiStatus === "online"
                        ? "bg-green-500"
                        : apiStatus === "offline"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {backendType === "local" ? "Local" : "Cloud"} Backend
                  </span>
                  <span className="font-medium">
                    {apiStatus === "online"
                      ? "Online"
                      : apiStatus === "offline"
                      ? "Offline"
                      : "Checking..."}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Çıkış Yap
              </button>
            </nav>

            {/* Mobile Menu Button - Simple Tailwind responsive */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Ana menüyü aç</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        apiStatus={apiStatus}
        backendType={backendType}
      />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-8rem)] animate-fade-in">
        <div className="max-w-full">{children}</div>
      </main>
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Engin DALGA - MAKÜ Yüksek Lisans
              Ödevi
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main component that provides BackendContext
export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BackendProvider>
      <ClientProviderInner>{children}</ClientProviderInner>
    </BackendProvider>
  );
}
