"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff, X, Sparkles, Share, PlusSquare } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIosPromptVisible, setIsIosPromptVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default true until checked
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("Hisabo PWA update available.");
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("ServiceWorker registration skipped:", err);
        });
    }

    // 2. Offline / Online Connectivity Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 3. Dismissal Check (7-day cooldown)
      const dismissedUntil = localStorage.getItem("hisabo_pwa_dismissed_until");
      const isCoolingDown = dismissedUntil && parseInt(dismissedUntil, 10) > Date.now();
      if (!isCoolingDown) {
        setIsDismissed(false);
      }

      // 4. iOS Safari Detection (standalone mode check)
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      const isStandalone =
        (window.navigator as any).standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches;

      if (isIosDevice && !isStandalone && !isCoolingDown) {
        setIsIosPromptVisible(true);
      }
    }

    // 5. Chromium / Android / Desktop Install Prompt Interception
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsIosPromptVisible(false);
    // Cooldown 7 days
    try {
      localStorage.setItem(
        "hisabo_pwa_dismissed_until",
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
    } catch {
      // storage unavailable
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsDismissed(true);
    }
  };

  return (
    <>
      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a1530] text-amber-300 text-xs font-semibold py-2 px-4 shadow-md flex items-center justify-center gap-2 border-b border-amber-400/30 animate-in slide-in-from-top duration-300">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            You are currently offline. Viewing cached shell; live financial sync resumes upon reconnection.
          </span>
        </div>
      )}

      {/* PWA Standard Install Banner (Chromium / Android / Desktop) */}
      {deferredPrompt && !isDismissed && (
        <aside
          aria-label="Install Hisabo App"
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-sm z-40 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-4 shadow-xl border-l-4 border-l-[#185CFF] animate-in fade-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#185CFF] to-[#0D40C9] text-white shadow-md shadow-blue-500/20 font-bold text-base">
                H
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-[#0F172A]">Install Hisabo App</h4>
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </div>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Add to home screen for instant balances & offline expense logs.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#185CFF] hover:bg-[#1249D6] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </aside>
      )}

      {/* iOS Safari Coach Mark Banner */}
      {isIosPromptVisible && !isDismissed && !deferredPrompt && (
        <aside
          aria-label="Install Hisabo on iOS"
          className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl border border-slate-200/95 bg-white/95 backdrop-blur-md p-4 shadow-xl border-l-4 border-l-[#185CFF] animate-in fade-in slide-in-from-bottom duration-300 max-w-md mx-auto"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#185CFF] to-[#0D40C9] text-white font-bold text-sm shadow-xs">
                H
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                  Install Hisabo on iPhone
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mt-1">
                  Tap <Share className="inline h-3 w-3 text-[#185CFF] mx-0.5" /> in Safari&apos;s toolbar, then tap{" "}
                  <strong className="text-[#0F172A]">Add to Home Screen</strong>{" "}
                  <PlusSquare className="inline h-3 w-3 text-[#185CFF] mx-0.5" />
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
              aria-label="Dismiss iOS install banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1 text-xs font-semibold text-[#185CFF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
