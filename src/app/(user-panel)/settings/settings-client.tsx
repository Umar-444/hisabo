"use client";

import { useState, useTransition } from "react";
import {
  updateProfileAction,
  updatePreferencesAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/features/settings/actions";
import { ui } from "@/lib/ui";
import {
  User,
  Shield,
  Coins,
  CheckCircle2,
  Lock,
  Loader2,
  Smartphone,
  AlertTriangle,
  LogOut,
  Laptop,
  Trash2,
  Copy,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    defaultCurrency: string;
    paymentHandle: string;
    image: string | null;
    createdAt: string;
  };
}

export function SettingsClientView({ user }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "security" | "danger"
  >("profile");

  // Profile Form State
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [isUpdatingProfile, startProfileTransition] = useTransition();

  // Currency & Preference State
  const [defaultCurrency, setDefaultCurrency] = useState(user.defaultCurrency || "SAR");
  const [paymentHandle, setPaymentHandle] = useState(user.paymentHandle || "");
  const [requireHandshake, setRequireHandshake] = useState(true);
  const [notifyClaims, setNotifyClaims] = useState(true);
  const [isUpdatingPrefs, startPrefsTransition] = useTransition();

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, startPasswordTransition] = useTransition();

  // Danger Zone Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeletingAccount, startDeleteTransition] = useTransition();

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

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("defaultCurrency", defaultCurrency);
    formData.append("paymentHandle", paymentHandle.trim());

    startPrefsTransition(async () => {
      const res = await updatePreferencesAction(formData);
      if (res.success) {
        toast.success(res.message || "Preferences saved");
      } else {
        toast.error(res.error || "Failed to save preferences");
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

  const handleDeleteAccount = () => {
    if (deleteConfirmationText.trim().toLowerCase() !== "delete my account") {
      toast.error("Please type 'delete my account' to confirm");
      return;
    }

    startDeleteTransition(async () => {
      const res = await deleteAccountAction();
      if (res.success) {
        toast.success(res.message || "Account deleted");
        router.push("/");
      } else {
        toast.error(res.error || "Failed to delete account");
      }
    });
  };

  return (
    <div className="w-full space-y-5 pb-24">
      {/* 1. Header */}
      <div className="pt-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0a1530]">
          Account & Preferences
        </h1>
        <p className="text-xs md:text-sm text-[#787671] font-normal mt-0.5">
          Manage your personal identity, preferred currency, settlement handles, and security
        </p>
      </div>

      {/* 2. Notion-Style Sharp Segmented Navigation Tabs */}
      <div className="flex overflow-x-auto rounded-lg bg-[#f0eeec] p-1 border border-[#e5e3df] gap-1 max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 min-w-[90px] rounded-md py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white text-[#185cff] shadow-2xs font-bold"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex-1 min-w-[130px] rounded-md py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "preferences"
              ? "bg-white text-[#185cff] shadow-2xs font-bold"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Currencies & Handles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex-1 min-w-[110px] rounded-md py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-white text-[#185cff] shadow-2xs font-bold"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Security & Sessions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={`flex-1 min-w-[90px] rounded-md py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "danger"
              ? "bg-red-50 text-red-600 shadow-2xs font-bold border border-red-200"
              : "text-red-500 hover:text-red-700 hover:bg-red-50/50"
          }`}
        >
          Danger Zone
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFILE DETAILS                                                    */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 space-y-5 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-[#ede9e4]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6e0f5] text-[#7b3ff2] font-black text-sm border border-[#d1c7ec]">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0a1530] tracking-tight">
                Personal Identity
              </h2>
              <p className="text-xs text-[#787671]">
                Your display name and username visible to flatmates and roommates
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className={ui.label}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={ui.input}
                placeholder="e.g. Ali Ahmed"
              />
            </div>

            <div>
              <label className={ui.label}>Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-[#787671] font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${ui.input} pl-8 font-mono`}
                  placeholder="ali_ahmed"
                />
              </div>
              <p className="text-[11px] text-[#787671] mt-1">
                Used by flatmates to split expenses and invite you to apartment pools.
              </p>
            </div>

            <div>
              <label className={ui.label}>Email Address</label>
              <div className="flex items-center justify-between rounded-lg border border-[#e5e3df] bg-[#f6f5f4] px-3.5 py-2.5 text-xs text-[#787671]">
                <span className="font-mono text-slate-800">{user.email}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#d9f3e1] px-2 py-0.5 text-[10px] font-bold text-[#0f5132] border border-[#b8e8c6]">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-[#787671] mt-1">
                Used for account recovery and notifications when roommates claim offline transfers.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#185cff] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1249d6] transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CURRENCIES & PAYMENT HANDLES                                      */}
      {/* ========================================================================= */}
      {activeTab === "preferences" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Default Currency Box */}
          <div className="rounded-xl border border-[#c0dcf7] bg-[#dcecfa]/80 p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0a3663] uppercase tracking-wider mb-1">
              <Coins className="h-4 w-4 text-[#0075de]" />
              Default Display Currency
            </div>
            <p className="text-xs text-[#0a3663]/80 mb-4">
              Balances are partitioned per currency to prevent exchange rate volatility. Select your default preference for new entries:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { code: "SAR", symbol: "ر.س", label: "Saudi Riyal" },
                { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
                { code: "USD", symbol: "$", label: "US Dollar" },
                { code: "EUR", symbol: "€", label: "Euro" },
                { code: "KWD", symbol: "د.ك", label: "Kuwaiti Dinar" },
                { code: "BHD", symbol: "د.ب", label: "Bahraini Dinar" },
                { code: "QAR", symbol: "ر.ق", label: "Qatari Riyal" },
                { code: "EGP", symbol: "ج.م", label: "Egyptian Pound" },
              ].map((curr) => {
                const isSelected = defaultCurrency === curr.code;
                return (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => setDefaultCurrency(curr.code)}
                    className={`rounded-lg p-3 text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#185cff] text-[#185cff] shadow-2xs ring-1 ring-[#185cff]"
                        : "bg-white/70 border-white/60 text-[#0a3663] hover:bg-white"
                    }`}
                  >
                    <div className="text-xs font-black font-mono">{curr.code}</div>
                    <div className="text-[10px] text-[#787671] truncate">{curr.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Handle Box (STC Pay / IBAN snippet) */}
          <form
            onSubmit={handlePreferencesSubmit}
            className="rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[#ede9e4]">
              <Smartphone className="h-4 w-4 text-[#185cff]" />
              <h2 className="text-sm font-bold text-[#0a1530] tracking-tight">
                Peer Settlement Payment Handle
              </h2>
            </div>

            <p className="text-xs text-[#787671]">
              Provide your preferred STC Pay mobile number or IBAN snippet. When flatmates click &quot;Settle Up&quot;, they will see this to transfer funds to you directly.
            </p>

            <div className="max-w-xl">
              <label className={ui.label}>STC Pay Mobile or IBAN Snippet</label>
              <input
                type="text"
                value={paymentHandle}
                onChange={(e) => setPaymentHandle(e.target.value)}
                placeholder="e.g. STC Pay: 0501234567 or SA03800000..."
                className={ui.input}
              />
              <p className="text-[10px] text-[#787671] mt-1">
                Visible only to active members in your shared groups when settling balances.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPrefs}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#185cff] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#1249d6] transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPrefs ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </form>

          {/* Ledger Rule Section */}
          <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#ede9e4]">
              <Shield className="h-4 w-4 text-[#185cff]" />
              <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                Financial Ledger Rules
              </h2>
            </div>

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

            <div className="flex items-center justify-between py-1.5 border-t border-[#ede9e4]">
              <div>
                <div className="text-xs font-semibold text-[#1a1a1a]">
                  Pending Claim Dashboard Alerts
                </div>
                <div className="text-[11px] text-[#787671]">
                  Surface payment claims needing your verification on the home dashboard.
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

      {/* ========================================================================= */}
      {/* TAB 3: SECURITY & SESSIONS                                               */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Change Password Card */}
          <div className="rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
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

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 max-w-xl">
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

          {/* Active Session Management Card */}
          <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#ede9e4]">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-[#185cff]" />
                <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                  Active Session Device
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Current Device
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#f6f5f4] border border-[#ede9e4]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-[#185cff] flex items-center justify-center font-mono text-xs font-bold">
                  WEB
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0a1530]">
                    Desktop Web Browser Session
                  </div>
                  <div className="text-[11px] text-[#787671]">
                    Authenticated via secure httpOnly token · Expires in 30 days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DANGER ZONE & DELETION                                             */}
      {/* ========================================================================= */}
      {activeTab === "danger" && (
        <div className="rounded-xl border border-red-200 bg-white p-5 sm:p-6 space-y-4 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5 pb-3 border-b border-red-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Delete User Account
              </h2>
              <p className="text-[11px] text-[#787671]">
                Permanent closure with strict zero-loss ledger protection
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-2">
            <p className="font-semibold">Important Financial Protection Safeguard:</p>
            <p className="text-[11px] text-red-800 leading-relaxed">
              If you owe any money to your roommates or flatmates, Hisabo will block account deletion until all outstanding debts are settled. Historical expense shares will be retained as &quot;Former Member&quot; so your group ledgers remain 100% mathematically balanced.
            </p>
          </div>

          {!showDeleteModal ? (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Proceed to Account Deletion</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-red-300 bg-red-50/40 space-y-3 max-w-md">
              <p className="text-xs font-bold text-red-950">
                Type <span className="font-mono text-red-700 select-all">delete my account</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="delete my account"
                className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Verifying & Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Deletion</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
