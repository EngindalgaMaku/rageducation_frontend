import "./globals.css";
import type { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "Öğretmen Paneli | Akademik RAG",
  description: "Burdur Mehmet Akif Ersoy Üniversitesi Yüksek Lisans Ödevi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full bg-background text-foreground font-sans antialiased overflow-x-hidden">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
