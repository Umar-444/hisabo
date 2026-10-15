"use client";

import { useState, useTransition } from "react";
import {
  createGroupInviteAction,
  revokeGroupInviteAction,
  inviteMemberAction,
} from "@/features/groups/actions";
import {
  UserPlus,
  X,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Trash2,
  Loader2,
  Link2,
  AtSign,
  AlertCircle,
  Mail,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ui } from "@/lib/ui";

export interface ExistingInvite {
  id: string;
  token: string;
  expiresAt: Date;
  maxUses: number;
  useCount: number;
  isRevoked: boolean;
  isActive: boolean;
  inviterName: string;
}

interface GroupInviteModalProps {
  groupId: string;
  groupName: string;
  existingInvites?: ExistingInvite[];
  userRole?: string;
}

export function GroupInviteModalClient({
  groupId,
  groupName,
  existingInvites: initialInvites = [],
  userRole = "member",
}: GroupInviteModalProps) {
  const isAdmin = userRole === "owner" || userRole === "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"username" | "link">("username");
  const [identifier, setIdentifier] = useState("");
  const [directMsg, setDirectMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isDirectPending, startDirectTransition] = useTransition();

  const [expirationDays, setExpirationDays] = useState(7);
  const [isSingleUse, setIsSingleUse] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invites, setInvites] = useState<ExistingInvite[]>(initialInvites);
  const [isPending, startTransition] = useTransition();

  const handleDirectInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectMsg(null);
    const clean = identifier.trim().replace(/^@/, "");
    if (!clean) return;

    startDirectTransition(async () => {
      const res = await inviteMemberAction(groupId, clean);
      if (res.success) {
        toast.success(res.message || "Flatmate added to group!");
        setDirectMsg({ text: res.message || "Flatmate added successfully!", type: "success" });
        setIdentifier("");
      } else {
        toast.error(res.error || "Failed to add member");
        setDirectMsg({ text: res.error || "Failed to add member", type: "error" });
      }
    });
  };

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createGroupInviteAction(groupId, {
        expirationDays,
        isSingleUse,
      });

      if (res.success && res.invite) {
        setActiveToken(res.invite.token);
        setInvites((prev) => [
          {
            id: res.invite.id,
            token: res.invite.token,
            expiresAt: new Date(res.invite.expiresAt),
            maxUses: res.invite.maxUses,
            useCount: res.invite.useCount,
            isRevoked: res.invite.isRevoked,
            isActive: true,
            inviterName: "You",
          },
          ...prev,
        ]);
        toast.success("Secure invitation link created!");
      } else {
        toast.error(res.error || "Failed to generate invite link");
      }
    });
  };

  const handleRevoke = (inviteId: string) => {
    startTransition(async () => {
      const res = await revokeGroupInviteAction(inviteId);
      if (res.success) {
        toast.info("Invite link revoked");
        setInvites((prev) =>
          prev.map((inv) =>
            inv.id === inviteId ? { ...inv, isRevoked: true, isActive: false } : inv
          )
        );
        if (activeToken && invites.find((inv) => inv.id === inviteId)?.token === activeToken) {
          setActiveToken(null);
        }
      } else {
        toast.error(res.error || "Failed to revoke invite");
      }
    });
  };

  const getFullUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/groups/join/${token}`;
    }
    return `/groups/join/${token}`;
  };

  const handleCopy = (token: string) => {
    const url = getFullUrl(token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Copied to clipboard! Share with your flatmate.");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-[#185CFF] hover:bg-blue-100/80 transition-colors border border-blue-200/60 cursor-pointer shadow-2xs"
      >
        <UserPlus className="h-3.5 w-3.5" />
        <span>Invite Flatmate</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#185CFF] flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                    Invite to {groupName}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400">
                    Add flatmates directly or share an invite link
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setDirectMsg(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("username")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "username"
                    ? "bg-white text-[#185CFF] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <AtSign className="h-3.5 w-3.5" />
                <span>Username / Email</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("link")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "link"
                    ? "bg-white text-[#185CFF] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Shareable Link</span>
              </button>
            </div>

            {/* TAB 1: Direct Username or Email Add */}
            {activeTab === "username" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {directMsg && (
                  <div
                    className={`rounded-xl p-3 text-xs font-bold flex items-center gap-2 border ${
                      directMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {directMsg.type === "success" ? (
                      <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    )}
                    <span>{directMsg.text}</span>
                  </div>
                )}

                {!isAdmin && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Admin Permission Required</span>
                      <p className="mt-0.5 text-slate-600">Only group owners and admins can add flatmates directly. Please ask an admin to add new members.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleDirectInvite} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Username or Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <AtSign className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={!isAdmin}
                        placeholder="e.g. khalid_99 or ahmed@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#185CFF]/20 focus:border-[#185CFF] transition-all disabled:bg-slate-100 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isAdmin || isDirectPending || !identifier.trim()}
                    className="w-full h-11 rounded-xl bg-[#185CFF] hover:bg-[#1249D6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#185CFF]/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDirectPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    <span>Add to Group Instantly</span>
                  </button>
                </form>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-[11px] text-slate-500 leading-relaxed space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>💡 Instant Group Inclusion</span>
                  </div>
                  <p>
                    Registered members are immediately added to group splits and balances. If your flatmate does not have an account yet, switch to the <strong>Shareable Link</strong> tab to send them an invite.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Cryptographic Shareable Link */}
            {activeTab === "link" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {!isAdmin ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Admin Permission Required</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Only group owners and admins can generate or manage invitation links for <strong>{groupName}</strong>. If you need to invite a flatmate, please ask the group owner.
                    </p>
                  </div>
                ) : activeToken ? (
                  <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Invite Link Ready
                      </span>
                      <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md font-mono">
                        {expirationDays}d validity
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-emerald-200">
                      <input
                        type="text"
                        readOnly
                        value={getFullUrl(activeToken)}
                        className="w-full bg-transparent text-xs font-mono text-slate-700 focus:outline-none select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(activeToken)}
                        className="px-3 py-1.5 rounded-lg bg-[#185CFF] hover:bg-[#1249D6] text-white text-xs font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Share this link via WhatsApp, Telegram, or SMS. Anyone with this link can join until it expires.
                    </p>
                  </div>
                ) : (
                  /* Generator Options */
                  <div className="space-y-4">
                    <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Link Expiration Window
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { days: 1, label: "24 Hours" },
                      { days: 7, label: "7 Days (Std)" },
                      { days: 30, label: "30 Days" },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setExpirationDays(opt.days)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          expirationDays === opt.days
                            ? "border-[#185CFF] bg-blue-50 text-[#185CFF] shadow-xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Usage Security
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSingleUse(false)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        !isSingleUse
                          ? "border-[#185CFF] bg-blue-50 text-[#185CFF]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold">Multi-Use</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Multiple flatmates can join
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSingleUse(true)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSingleUse
                          ? "border-[#185CFF] bg-blue-50 text-[#185CFF]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-xs font-bold">Single-Use (1x)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Burns after 1 join
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleCreate}
                  className="w-full h-11 rounded-xl bg-[#185CFF] hover:bg-[#1249D6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#185CFF]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  <span>Generate Tokenized Invite Link</span>
                </button>
              </div>
            )}

            {/* Existing Active Invites List */}
            {invites.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Active Invites ({invites.filter((i) => i.isActive).length})
                </div>

                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {invites.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[11px] text-slate-700 truncate">
                          ...{inv.token.slice(-10)}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            {inv.isActive
                              ? `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`
                              : inv.isRevoked
                              ? "Revoked"
                              : "Expired"}
                          </span>
                          <span>·</span>
                          <span>{inv.useCount} joined</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {inv.isActive && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopy(inv.token)}
                              className="p-1 text-slate-500 hover:text-[#185CFF] rounded-lg transition-colors cursor-pointer"
                              title="Copy link"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleRevoke(inv.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Revoke link"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      )}
    </>
  );
}
