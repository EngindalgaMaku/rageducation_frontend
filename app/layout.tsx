import "./globals.css";
import { Metadata } from "next";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Öğretmen Paneli | Akademik RAG",
  description: "Burdur Mehmet Akif Ersoy Üniversitesi Yüksek Lisans Tezi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full bg-background text-foreground font-sans antialiased">
        <AuthProvider>
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
                            Burdur Mehmet Akif Ersoy Üniversitesi
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="hidden md:flex flex-col items-end">
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
                  </div>
                </div>
              </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-8rem)] animate-fade-in">
              <div className="max-w-full">{children}</div>
            </main>

            <footer className="bg-card border-t border-border mt-12">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} MAKÜ Yüksek Lisans Tezi
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      v2.1.0
                    </span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
