import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";

export default function PwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  useEffect(() => {
    // Listen for install prompt event from browser
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissedInstall) {
        setShowInstallBanner(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    // Listen for online/offline connectivity
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dismissedInstall]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissedInstall(true);
  };

  return (
    <>
      {/* Offline Status Pill */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#102a43] px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-black/20 animate-fade-in border border-white/10"
        >
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Offline mode &bull; Viewing cached records</span>
        </aside>
      )}

      {/* Install App Prompt */}
      {showInstallBanner && !isOffline && (
        <aside
          role="region"
          aria-label="Install UM-Tap application"
          className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl bg-white/95 p-3.5 text-[#102a43] shadow-xl shadow-slate-900/15 backdrop-blur-md border border-slate-200"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102a43] text-amber-400">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold leading-tight truncate">Install UM-Tap</h2>
            <p className="text-[11px] text-slate-500 leading-tight">Fast access & offline attendance</p>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="rounded-lg bg-[#102a43] px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-[#102a43]/90 transition-colors"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </aside>
      )}
    </>
  );
}
