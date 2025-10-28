"use client";

import { useEffect, useState } from "react";

interface DesktopMenuProps {
  apiStatus: "online" | "offline" | "loading";
  onLogout: () => void;
}

export default function DesktopMenu({ apiStatus, onLogout }: DesktopMenuProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenWidth(width);
      const wasDesktop = isDesktop;
      const newIsDesktop = width >= 768;
      setIsDesktop(newIsDesktop);

      // EMERGENCY DEBUG LOGGING
      console.log("🔴 DESKTOP MENU DEBUG:", {
        timestamp: new Date().toISOString(),
        screenWidth: width,
        screenHeight: height,
        isDesktop: newIsDesktop,
        previousIsDesktop: wasDesktop,
        userAgent: navigator.userAgent,
        innerWidth: window.innerWidth,
        outerWidth: window.outerWidth,
        devicePixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.angle || "unknown",
      });

      // Check media queries too
      const mobileQuery = window.matchMedia("(max-width: 767px)");
      const desktopQuery = window.matchMedia("(min-width: 768px)");
      console.log("🔴 MEDIA QUERY CHECK:", {
        mobileMatches: mobileQuery.matches,
        desktopMatches: desktopQuery.matches,
      });
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Also check every 100ms for the first 5 seconds to catch any issues
    const intervalCheck = setInterval(() => {
      console.log(
        "🔴 INTERVAL CHECK - Current width:",
        window.innerWidth,
        "isDesktop:",
        isDesktop
      );
      checkScreenSize();
    }, 100);

    setTimeout(() => {
      clearInterval(intervalCheck);
    }, 5000);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      clearInterval(intervalCheck);
    };
  }, [isDesktop]);

  // BRUTAL MULTIPLE LAYER CHECK
  const currentWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const isMobileByWidth = currentWidth < 768;
  const isMobileByQuery =
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false;

  console.log("🔴 RENDER CHECK:", {
    isDesktop,
    currentWidth,
    isMobileByWidth,
    isMobileByQuery,
    shouldHide: !isDesktop || isMobileByWidth || isMobileByQuery,
    renderingAt: new Date().toISOString(),
  });

  // Nuclear approach: multiple layers of hiding for mobile
  if (!isDesktop || isMobileByWidth || isMobileByQuery) {
    console.log("🔴 RETURNING NULL - Desktop menu hidden");
    return null;
  }

  const inlineStyle: React.CSSProperties = {
    display: currentWidth >= 768 ? "flex" : "none",
    visibility: currentWidth >= 768 ? "visible" : "hidden",
  };

  return (
    <div
      className="desktop-menu-component items-center space-x-6"
      style={inlineStyle}
      data-screen-width={currentWidth}
      data-is-desktop={isDesktop}
    >
      <div
        className={`flex items-center space-x-2 text-sm ${
          apiStatus === "online" ? "text-green-600" : "text-red-600"
        }`}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            apiStatus === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
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
        onClick={onLogout}
        title="Çıkış Yap"
        aria-label="Çıkış Yap"
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
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
      </button>
    </div>
  );
}
