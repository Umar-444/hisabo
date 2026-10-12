"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, changePasswordAction } from "@/features/settings/actions";
import { ui } from "@/lib/ui";
import {
  User,
  Shield,
  Coins,
  BellRing,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
  };
}

export function SettingsClientView({ user }: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security">("profile");

  // Profile Form State
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [isUpdatingProfile, startProfileTransition] = useTransition();

  // Currency & Preference State
  const [defaultCurrency, setDefaultCurrency] = useState("SAR");
  const [requireHandshake, setRequireHandshake] = useState(true);
  const [notifyClaims, setNotifyClaims] = useState(true);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, startPasswordTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("username", username.trim());

    startProfileTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.success) {
        toast.success(res.message || "Profile updated");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    startPasswordTransition(async () => {
      const res = await changePasswordAction(formData);
      if (res.success) {
        toast.success(res.message || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Failed to change password");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-20">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl font-bold tracking-tight text-[#0a1530]">
          Account & Preferences
        </h1>
        <p className="text-xs text-[#787671] font-normal mt-0.5">
          Manage your personal profile, preferred currency, and ledger security
        </p>
      </div>

      {/* Notion-Style Sharp Segmented Navigation Tabs */}
      <div className="flex rounded-md bg-[#f0eeec] p-0.5 border border-[#e5e3df]">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-white text-[#185cff] shadow-2xs"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            activeTab === "preferences"
              ? "bg-white text-[#185cff] shadow-2xs"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Currencies & Ledger
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            activeTab === "security"
              ? "bg-white text-[#185cff] shadow-2xs"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Security
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <div className="rounded-xl border border-[#e5e3df] bg-white p-5 space-y-4 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#ede9e4]">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e6e0f5] text-[#7b3ff2] font-bold text-xs">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                Personal Identity
              </h2>
              <p className="text-[11px] text-[#787671]">
                Your display name and username visible to group flatmates
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-3.5">
            <div>
              <label className={ui.label}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-[#787671] font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${ui.input} pl-7 font-mono`}
                />
              </div>
            </div>

            <div>
              <label className={ui.label}>Email Address</label>
              <div className="flex items-center justify-between rounded-lg border border-[#e5e3df] bg-[#f6f5f4] px-3.5 py-2 text-xs text-[#787671]">
                <span>{user.email}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#d9f3e1] px-1.5 py-0.5 text-[10px] font-bold text-[#0f5132] border border-[#b8e8c6]">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-[#787671] mt-1">
                Used for offline settlement notices and account recovery.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#185cff] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#1249d6] transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CURRENCIES & LEDGER */}
      {activeTab === "preferences" && (
        <div className="space-y-3.5 animate-in fade-in">
          {/* Colored Section: Multi-Currency Partitioning (Notion Sky Tint) */}
          <div className="rounded-xl border border-[#c0dcf7] bg-[#dcecfa]/80 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0a3663] uppercase tracking-wider mb-1">
              <Coins className="h-4 w-4 text-[#0075de]" />
              Display Currency Preference
            </div>
            <p className="text-[11px] text-[#0a3663]/80 mb-3">
              Hisabo partitions balances per currency without exchange drift. Choose your primary default display:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { code: "SAR", symbol: "ر.س", label: "Saudi Riyal" },
                { code: "USD", symbol: "$", label: "US Dollar" },
                { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
                { code: "EUR", symbol: "€", label: "Euro" },
              ].map((curr) => {
                const isSelected = defaultCurrency === curr.code;
                return (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => {
                      setDefaultCurrency(curr.code);
                      toast.success(`Default currency preference set to ${curr.code}`);
                    }}
                    className={`rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#185cff] text-[#185cff] shadow-2xs font-bold"
                        : "bg-white/60 border-white/60 text-[#0a3663] hover:bg-white"
                    }`}
                  >
                    <div className="text-xs font-mono">{curr.code}</div>
                    <div className="text-[10px] text-[#787671] truncate">{curr.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ledger Rule Section (Notion Sharp Canvas Card) */}
          <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#ede9e4]">
              <Shield className="h-4 w-4 text-[#185cff]" />
              <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                Financial Ledger Rules
              </h2>
            </div>

            {/* Rule 1 */}
            <div className="flex items-center justify-between py-1.5">
              <div>
                <div className="text-xs font-semibold text-[#1a1a1a]">
                  Two-Party Settlement Handshake
                </div>
                <div className="text-[11px] text-[#787671]">
                  Debts remain active until creditor confirms receipt of funds.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequireHandshake(!requireHandshake)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  requireHandshake ? "bg-[#185cff]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    requireHandshake ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Rule 2 */}
            <div className="flex items-center justify-between py-1.5 border-t border-[#ede9e4]">
              <div>
                <div className="text-xs font-semibold text-[#1a1a1a]">
                  Pending Claim Dashboard Alerts
                </div>
                <div className="text-[11px] text-[#787671]">
                  Display unconfirmed payment claims on your dashboard.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyClaims(!notifyClaims)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  notifyClaims ? "bg-[#185cff]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifyClaims ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === "security" && (
        <div className="rounded-xl border border-[#e5e3df] bg-white p-5 space-y-4 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#ede9e4]">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#fde0ec] text-[#e03131] font-bold text-xs">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                Change Password
              </h2>
              <p className="text-[11px] text-[#787671]">
                Keep your financial records and settlement claims secure
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className={ui.label}>Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={ui.input}
              />
            </div>

            <div>
              <label className={ui.label}>Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={ui.input}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#185cff] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#1249d6] transition-all cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
