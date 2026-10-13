"use client";

import { useState } from "react";
import { Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { SystemAnnouncement } from "@/features/admin/actions";

interface Props {
  announcement: SystemAnnouncement;
}

export function GlobalAnnouncementBanner({ announcement }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement?.active || !announcement.message || dismissed) {
    return null;
  }

  const isAlert = announcement.type === "alert";
  const isWarning = announcement.type === "warning";

  return (
    <div
      role="banner"
      className={`relative z-40 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b transition-all ${isAlert
          ? "bg-rose-500 text-white border-rose-600 shadow-xs"
          : isWarning
            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
            : "bg-[#185CFF] text-white border-[#1249D6] shadow-xs"
        }`}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 justify-center pr-6">
        {isAlert ? (
          <AlertCircle className="h-4 w-4 shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <Info className="h-4 w-4 shrink-0" />
        )}
        <span className="text-center font-medium">{announcement.message}</span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="text-white/80 hover:text-white p-1 rounded-md transition-colors cursor-pointer shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
