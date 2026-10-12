"use client";

import { useState, useTransition } from "react";
import { inviteMemberAction } from "@/features/groups/actions";
import { UserPlus, X, Copy, Check, AlertCircle } from "lucide-react";
import { ui } from "@/lib/ui";

export function InviteMemberModalClient({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/groups/${groupId}` : "";

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!identifier.trim()) return;

    startTransition(async () => {
      const res = await inviteMemberAction(groupId, identifier.trim());
      if (res.success) {
        setMsg({ text: res.message || "Member added successfully!", type: "success" });
        setIdentifier("");
      } else {
        setMsg({ text: res.error || "Failed to invite member", type: "error" });
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <UserPlus className="h-3.5 w-3.5 text-[#185CFF]" />
        <span>Invite</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => {
                setIsOpen(false);
                setMsg(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185CFF] flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Invite to {groupName}</h3>
                <p className="text-xs text-slate-500">Add a flatmate or share an invite link</p>
              </div>
            </div>

            {msg && (
              <div
                className={`mb-4 rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {msg.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            {/* Direct Username or Email Add Form */}
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className={ui.label}>Add by Username or Email</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., ahmed@hisabo.com or ali"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={ui.input}
                  />
                  <button
                    type="submit"
                    disabled={isPending || !identifier.trim()}
                    className="px-4 rounded-xl bg-[#185CFF] text-white font-bold text-xs hover:bg-[#1249D6] disabled:opacity-50 shrink-0"
                  >
                    {isPending ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </form>

            {/* Shareable Link Box */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <label className={ui.label}>Or Share Invite Link</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-transparent text-slate-600 outline-none text-xs truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 font-bold text-xs text-[#185CFF] border border-slate-200 shadow-2xs hover:bg-slate-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
