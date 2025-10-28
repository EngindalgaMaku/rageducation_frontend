"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkApiHealth } from "@/lib/api";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import MobileMenuButton from "./MobileMenuButton";
import FailsafeDesktopHider from "./FailsafeDesktopHider";

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
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  }, [isLoginPage, isClient]);

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
            <FailsafeDesktopHider forceHideOnMobile={true}>
              <DesktopMenu apiStatus={apiStatus} onLogout={handleLogout} />
            </FailsafeDesktopHider>
            <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
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
              Ödevi
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
