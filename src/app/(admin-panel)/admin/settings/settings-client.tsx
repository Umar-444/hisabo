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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Sliders className="h-5 w-5 text-blue-400" />
          Platform Controls & Feature Flags
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamically toggle global platform subsystems and configure system-wide broadcast alerts.
        </p>
      </div>

      {/* Feature Flags Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              System Feature Flags
            </h2>
          </div>
          {isUpdatingFlags && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Syncing...
            </span>
          )}
        </div>

        <div className="space-y-4 divide-y divide-slate-800/80">
          {/* Flag 1: Registrations */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-sm font-bold text-slate-200">
                User Registrations Enabled
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Allow new visitors to register accounts. When disabled, signup forms display a maintenance notice.
              </div>
            </div>
            <button
              type="button"
              disabled={isUpdatingFlags}
              onClick={() => handleToggleFlag("registrationsEnabled")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                flags.registrationsEnabled ? "bg-[#185CFF]" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  flags.registrationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Flag 2: CSV Exports */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-sm font-bold text-slate-200">
                Financial CSV Exports Enabled
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Allow roommates to stream export their historical group and expense data to CSV format.
              </div>
            </div>
            <button
              type="button"
              disabled={isUpdatingFlags}
              onClick={() => handleToggleFlag("exportEnabled")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                flags.exportEnabled ? "bg-[#185CFF]" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  flags.exportEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Flag 3: Maintenance Mode */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-sm font-bold text-slate-200">
                System Maintenance Notice
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Display scheduled maintenance banner and advisory on the public landing page.
              </div>
            </div>
            <button
              type="button"
              disabled={isUpdatingFlags}
              onClick={() => handleToggleFlag("maintenanceMode")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                flags.maintenanceMode ? "bg-amber-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  flags.maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Global Announcement Banner Form */}
      <form
        onSubmit={handleSaveAnnouncement}
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Global Announcement Banner
            </h2>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
            <input
              type="checkbox"
              checked={announcement.active}
              onChange={(e) =>
                setAnnouncement({ ...announcement, active: e.target.checked })
              }
              className="rounded bg-slate-800 border-slate-700 text-[#185CFF] focus:ring-0"
            />
            <span>Broadcast Active</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Announcement Message
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled database maintenance tonight at 02:00 AM UTC. Balances will remain safe."
              value={announcement.message}
              onChange={(e) =>
                setAnnouncement({ ...announcement, message: e.target.value })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#185CFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Alert Severity Level
            </label>
            <div className="flex items-center gap-3">
              {[
                { value: "info", label: "Info (Brand Blue)", color: "text-blue-400" },
                { value: "warning", label: "Warning (Amber)", color: "text-amber-400" },
                { value: "alert", label: "Critical Alert (Rose)", color: "text-rose-400" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer text-xs font-bold transition-colors ${
                    announcement.type === opt.value
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-slate-800 bg-slate-800/50 text-slate-400 hover:text-slate-200"
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#185CFF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1249D6] transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            {isUpdatingAnnouncement ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing Announcement...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save &amp; Broadcast Announcement</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
