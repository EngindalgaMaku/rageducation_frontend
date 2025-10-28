"use client";

import { useEffect, useState, useRef } from "react";

interface FailsafeDesktopHiderProps {
  children: React.ReactNode;
  forceHideOnMobile?: boolean;
}

export default function FailsafeDesktopHider({
  children,
  forceHideOnMobile = true,
}: FailsafeDesktopHiderProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [shouldRender, setShouldRender] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window === "undefined") return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const newIsDesktop = width >= 768;

      setScreenWidth(width);
      setIsDesktop(newIsDesktop);
      setShouldRender(newIsDesktop);

      // EMERGENCY LOGGING
      console.log("🛡️ FAILSAFE DESKTOP HIDER:", {
        timestamp: new Date().toISOString(),
        screenWidth: width,
        screenHeight: height,
        isDesktop: newIsDesktop,
        shouldRender: newIsDesktop,
        forceHideOnMobile,
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
      });

      // BRUTAL DOM MANIPULATION - if element exists and screen is mobile, DESTROY IT
      if (elementRef.current && !newIsDesktop && forceHideOnMobile) {
        const element = elementRef.current;
        element.style.display = "none";
        element.style.visibility = "hidden";
        element.style.opacity = "0";
        element.style.width = "0px";
        element.style.height = "0px";
        element.style.position = "absolute";
        element.style.left = "-99999px";
        element.style.top = "-99999px";
        element.style.zIndex = "-99999";
        element.style.pointerEvents = "none";
        element.setAttribute("aria-hidden", "true");
        element.setAttribute("data-mobile-hidden", "true");

        console.log("🛡️ BRUTAL DOM MANIPULATION - Element forcibly hidden");
      }
    };

    // Initial check
    checkScreenSize();

    // Multiple event listeners for maximum coverage
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("orientationchange", checkScreenSize);

    // Media query listener
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const desktopQuery = window.matchMedia("(min-width: 768px)");

    mobileQuery.addListener(checkScreenSize);
    desktopQuery.addListener(checkScreenSize);

    // AGGRESSIVE INTERVAL CHECKING - check every 50ms for the first 10 seconds
    let checkCount = 0;
    intervalRef.current = setInterval(() => {
      checkCount++;
      checkScreenSize();

      // After 200 checks (10 seconds), reduce frequency
      if (checkCount > 200) {
        clearInterval(intervalRef.current!);
        intervalRef.current = setInterval(checkScreenSize, 1000); // Check every second afterwards
      }
    }, 50);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("orientationchange", checkScreenSize);
      mobileQuery.removeListener(checkScreenSize);
      desktopQuery.removeListener(checkScreenSize);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [forceHideOnMobile]);

  // MULTIPLE LAYER CHECK
  const currentWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const isMobileByWidth = currentWidth < 768;
  const isMobileByQuery =
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false;

  // NUCLEAR DECISION MAKING
  const finalDecision =
    isDesktop && !isMobileByWidth && !isMobileByQuery && shouldRender;

  console.log("🛡️ FAILSAFE RENDER DECISION:", {
    isDesktop,
    currentWidth,
    isMobileByWidth,
    isMobileByQuery,
    shouldRender,
    finalDecision,
    forceHideOnMobile,
  });

  // If mobile detected by ANY method, return absolutely nothing
  if (!finalDecision || isMobileByWidth || isMobileByQuery) {
    console.log("🛡️ FAILSAFE - RETURNING NULL");
    return null;
  }

  // Multiple inline style protections
  const brutalInlineStyles: React.CSSProperties = {
    display: finalDecision ? "block" : "none",
    visibility: finalDecision ? "visible" : "hidden",
    opacity: finalDecision ? 1 : 0,
  };

  return (
    <div
      ref={elementRef}
      className="failsafe-desktop-wrapper desktop-only-element"
      style={brutalInlineStyles}
      data-screen-width={screenWidth}
      data-is-desktop={isDesktop}
      data-should-render={shouldRender}
      data-final-decision={finalDecision}
      data-force-hide={forceHideOnMobile}
    >
      {children}
    </div>
  );
}
