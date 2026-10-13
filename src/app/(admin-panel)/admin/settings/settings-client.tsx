"use client";

import { useState, useTransition } from "react";
import {
  FeatureFlags,
  SystemAnnouncement,
  updateFeatureFlagsAction,
  updateAnnouncementAction,
} from "@/features/admin/actions";
import { Sliders, Bell, ShieldAlert, Check, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialFlags: FeatureFlags;
  initialAnnouncement: SystemAnnouncement;
}

export function AdminSettingsClient({ initialFlags, initialAnnouncement }: Props) {
  const [flags, setFlags] = useState<FeatureFlags>(initialFlags);
  const [announcement, setAnnouncement] = useState<SystemAnnouncement>(initialAnnouncement);

  const [isUpdatingFlags, startFlagsTransition] = useTransition();
  const [isUpdatingAnnouncement, startAnnounceTransition] = useTransition();

  const handleToggleFlag = (key: keyof FeatureFlags) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);

    startFlagsTransition(async () => {
      const res = await updateFeatureFlagsAction({ [key]: updated[key] });
      if (res.success) {
        toast.success(`Feature flag "${key}" updated.`);
      } else {
        toast.error(res.error || "Failed to update feature flag.");
        setFlags(flags); // revert
      }
    });
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    startAnnounceTransition(async () => {
      const res = await updateAnnouncementAction(announcement);
      if (res.success) {
        toast.success("Global announcement banner updated successfully.");
      } else {
        toast.error(res.error || "Failed to update announcement.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header (Notion Workspace Title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3df]">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#e6e0f5] text-[#391c57] flex items-center justify-center shrink-0 border border-[#d6b6f6]">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
              Platform Controls &amp; Feature Flags
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Dynamically toggle global platform subsystems and configure system-wide broadcast alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Flags Section (Notion Database Card) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede9e4]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#185CFF]" />
            <h2 className="text-xs font-semibold text-[#787671] uppercase tracking-wider">
              System Feature Flags
            </h2>
          </div>
          {isUpdatingFlags && (
            <span className="flex items-center gap-1.5 text-xs text-[#185CFF] font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Syncing...
            </span>
          )}
        </div>

        <div className="space-y-4 divide-y divide-[#ede9e4]">
          {/* Flag 1: Registrations */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                User Registrations Enabled
              </div>
              <div className="text-xs text-[#787671] mt-0.5">
                Allow new visitors to register accounts. When disabled, signup forms display a maintenance notice.
              </div>
            </div>
            <button
              type="button"
              disabled={isUpdatingFlags}
              onClick={() => handleToggleFlag("registrationsEnabled")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                flags.registrationsEnabled ? "bg-[#185CFF]" : "bg-[#e5e3df]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  flags.registrationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Flag 2: CSV Exports */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                Financial CSV Exports Enabled
              </div>
              <div className="text-xs text-[#787671] mt-0.5">
                Allow roommates to stream export their historical group and expense data to CSV format.
              </div>
            </div>
            <button
              type="button"
              disabled={isUpdatingFlags}
              onClick={() => handleToggleFlag("exportEnabled")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                flags.exportEnabled ? "bg-[#185CFF]" : "bg-[#e5e3df]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  flags.exportEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Flag 3: Maintenance Mode */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1a1a1a]">
                System Maintenance Notice
              </div>
              <div className="text-xs text-[#787671] mt-0.5">
                Display scheduled maintenance banner and advisory on the public landing page.
              </div>
            </div>
            <button
              type="button"
              disabled={isUpdatingFlags}
              onClick={() => handleToggleFlag("maintenanceMode")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                flags.maintenanceMode ? "bg-[#dd5b00]" : "bg-[#e5e3df]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  flags.maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Global Announcement Banner Form (Notion Card) */}
      <form
        onSubmit={handleSaveAnnouncement}
        className="rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 space-y-4 shadow-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#ede9e4]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#7b3ff2]" />
            <h2 className="text-xs font-semibold text-[#787671] uppercase tracking-wider">
              Global Announcement Banner
            </h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#37352f]">
            <input
              type="checkbox"
              checked={announcement.active}
              onChange={(e) =>
                setAnnouncement({ ...announcement, active: e.target.checked })
              }
              className="rounded border-[#e5e3df] text-[#185CFF] focus:ring-0"
            />
            <span>Broadcast Active</span>
          </label>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#787671] mb-1.5 uppercase tracking-wider">
              Announcement Message
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled database maintenance tonight at 02:00 AM UTC. Balances will remain safe."
              value={announcement.message}
              onChange={(e) =>
                setAnnouncement({ ...announcement, message: e.target.value })
              }
              className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3.5 py-2 text-xs sm:text-sm text-[#1a1a1a] placeholder:text-[#a4a097] focus:border-[#185CFF] focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#787671] mb-1.5 uppercase tracking-wider">
              Alert Severity Level
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { value: "info", label: "Info (Brand Blue)", color: "text-[#005bab]", activeClass: "border-[#b8dcfa] bg-[#dcecfa]/60 text-[#005bab]" },
                { value: "warning", label: "Warning (Amber)", color: "text-[#793400]", activeClass: "border-[#fed0ab] bg-[#ffe8d4]/60 text-[#793400]" },
                { value: "alert", label: "Critical Alert (Rose)", color: "text-[#a02e6d]", activeClass: "border-[#f8b4d0] bg-[#fde0ec]/60 text-[#a02e6d]" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${
                    announcement.type === opt.value
                      ? opt.activeClass
                      : "border-[#e5e3df] bg-[#fafaf9] text-[#787671] hover:text-[#1a1a1a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="announcementType"
                    value={opt.value}
                    checked={announcement.type === opt.value}
                    onChange={() =>
                      setAnnouncement({
                        ...announcement,
                        type: opt.value as any,
                      })
                    }
                    className="hidden"
                  />
                  <span className={opt.color}>●</span>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isUpdatingAnnouncement}
            className="inline-flex items-center gap-2 rounded-lg bg-[#185CFF] px-4 py-2 text-xs font-medium text-white hover:bg-blue-600 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isUpdatingAnnouncement ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Publishing Announcement...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Save &amp; Broadcast Announcement</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
