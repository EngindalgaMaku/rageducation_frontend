"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
  }, [router, pathname, isLoginPage]);

  if (!isLoginPage) {
    const isAuthenticated =
      typeof window !== "undefined"
        ? localStorage.getItem("isAuthenticated")
        : null;
    if (!isAuthenticated) {
      return null; // Veya bir yükleme ekranı
    }
  }

  return <>{children}</>;
}
