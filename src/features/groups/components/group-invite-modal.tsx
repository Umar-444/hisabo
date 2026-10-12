"use client";

import { useState, useTransition } from "react";
import {
  createGroupInviteAction,
  revokeGroupInviteAction,
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
}

export function GroupInviteModalClient({
  groupId,
  groupName,
  existingInvites: initialInvites = [],
}: GroupInviteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [isSingleUse, setIsSingleUse] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [invites, setInvites] = useState<ExistingInvite[]>(initialInvites);
  const [isPending, startTransition] = useTransition();

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
                  <Link2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                    Invite to {groupName}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400">
                    Cryptographic join tokens with automatic expiration
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Generated Active Link Banner */}
            {activeToken ? (
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
                            <button
                              type="button"
                              onClick={() => handleRevoke(inv.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Revoke link"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
