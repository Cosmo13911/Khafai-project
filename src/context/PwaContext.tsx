"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isOnline: boolean;
  showIosGuide: boolean;
  showInstallBanner: boolean;
  installApp: () => Promise<boolean>;
  openIosGuide: () => void;
  closeIosGuide: () => void;
  dismissBanner: () => void;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

const BANNER_DISMISSED_KEY = "khafai_pwa_banner_dismissed_v1";

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available
    if (typeof window === "undefined") return;

    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Detect if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setIsIOS(isIosDevice);

    // Check if dismissed before
    const isDismissed = localStorage.getItem(BANNER_DISMISSED_KEY) === "true";

    // Handle beforeinstallprompt for Chromium/Android/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isStandalone && !isDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log("[PWA] App successfully installed!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Show banner on iOS if not installed & not dismissed
    if (isIosDevice && !isStandalone && !isDismissed) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (isIOS) {
      setShowIosGuide(true);
      return false;
    }

    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowInstallBanner(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Error during install prompt:", err);
      return false;
    }
  }, [deferredPrompt, isIOS]);

  const dismissBanner = useCallback(() => {
    setShowInstallBanner(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    }
  }, []);

  const openIosGuide = useCallback(() => {
    setShowIosGuide(true);
  }, []);

  const closeIosGuide = useCallback(() => {
    setShowIosGuide(false);
  }, []);

  const isInstallable = Boolean(deferredPrompt) || (isIOS && !isInstalled);

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        isInstallable,
        isIOS,
        isOnline,
        showIosGuide,
        showInstallBanner,
        installApp,
        openIosGuide,
        closeIosGuide,
        dismissBanner,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = (): PwaContextType => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
};
