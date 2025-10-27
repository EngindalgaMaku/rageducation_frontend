import "./globals.css";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Akademik RAG Dashboard",
  description: "Modern akademik çalışmalar için tasarlanmış RAG yönetim paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full bg-background text-foreground font-sans antialiased">
        <div className="min-h-full">
          {/* Enhanced Header */}
          <header className="bg-card shadow-sm border-b border-border backdrop-blur-sm">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center">
                      {/* Logo/Icon */}
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
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
                      <div className="ml-3">
                        <h1 className="text-lg font-semibold text-gray-900">
                          Akademik RAG
                        </h1>
                        <p className="text-xs text-gray-500">Dashboard v2.0</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation Menu */}
                <div className="hidden md:flex items-center space-x-8">
                  <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 relative group"
                  >
                    Ana Sayfa
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                  </Link>
                </div>

                {/* Header Right Section */}
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sistem Aktif</span>
                  </div>

                  {/* User Profile */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary-600"
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
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      Akademik Kullanıcı
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-8rem)] animate-fade-in">
            <div className="max-w-full">{children}</div>
          </main>

          {/* Enhanced Footer */}
          <footer className="bg-card border-t border-border mt-12">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Akademik RAG Dashboard. Tüm
                  hakları saklıdır.
                </div>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    v2.0.0
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-soft"></div>
                    Docker Mode
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
