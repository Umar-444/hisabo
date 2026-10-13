"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff, X, Sparkles } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check for service worker updates
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
    }

    // 3. PWA Install Prompt Interception
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-bold py-2 px-4 shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>You are currently offline. Viewing cached shell; live financial sync will resume once reconnected.</span>
        </div>
      )}

      {/* PWA Home Screen Install Banner */}
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
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDismissed(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
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
    </>
  );
}
