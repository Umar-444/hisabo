"use client";

import { useState, useTransition } from "react";
import { leaveGroupAction, archiveGroupAction, unarchiveGroupAction, transferGroupOwnershipAction } from "../actions";
import { Shield, LogOut, Archive, RotateCcw, AlertTriangle, Loader2, UserCheck, KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/ui";

interface GroupMemberSummary {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface Props {
  groupId: string;
  groupName: string;
  isOwner: boolean;
  status: string;
  userNetBalanceMinor: string;
  currency: string;
  members?: GroupMemberSummary[];
  currentUserId?: string;
}

export function GroupGovernanceCard({
  groupId,
  groupName,
  isOwner,
  status,
  userNetBalanceMinor,
  currency,
  members = [],
  currentUserId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Two-step ownership transfer modal state (TASK-15)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2>(1);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);

  const eligibleCandidates = members.filter(
    (m) => m.id !== currentUserId && m.role !== "owner"
  );

  const selectedCandidate = eligibleCandidates.find((m) => m.id === selectedMemberId);

  const handleLeaveGroup = () => {
    if (!confirm(`Are you sure you want to leave ${groupName}? Your historical expenses will be preserved.`)) {
      return;
    }

    startTransition(async () => {
      const res = await leaveGroupAction(groupId);
      if (res.success) {
        toast.success(res.message || "You have left the group.");
        router.push("/groups");
      } else {
        toast.error(res.error || "Cannot leave group.");
      }
    });
  };

  const handleArchiveGroup = () => {
    if (!confirm(`Archive ${groupName}? This locks the group into read-only mode for flatmates who moved out.`)) {
      return;
    }

    startTransition(async () => {
      const res = await archiveGroupAction(groupId);
      if (res.success) {
        toast.success(res.message || "Group archived.");
      } else {
        toast.error(res.error || "Failed to archive group.");
      }
    });
  };

  const handleReactivateGroup = () => {
    startTransition(async () => {
      const res = await unarchiveGroupAction(groupId);
      if (res.success) {
        toast.success(res.message || "Group reactivated.");
      } else {
        toast.error(res.error || "Failed to reactivate group.");
      }
    });
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setTransferError("Please select a flatmate to transfer ownership to.");
      return;
    }
    if (!password.trim()) {
      setTransferError("Password confirmation is required.");
      return;
    }

    setTransferError(null);
    startTransition(async () => {
      const res = await transferGroupOwnershipAction({
        groupId,
        newOwnerId: selectedMemberId,
        password,
      });

      if (!res.success) {
        setTransferError(res.error || "Failed to transfer ownership.");
      } else {
        toast.success(res.message || "Ownership transferred successfully!");
        setShowTransferModal(false);
        setPassword("");
        setTransferStep(1);
        router.refresh();
      }
    });
  };

  const isArchived = status === "archived";

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#185CFF]" />
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Group Governance & Status
            </h3>
          </div>

          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
              isArchived
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {isArchived ? "Archived Pool" : "Active Pool"}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          {isArchived
            ? "This group is archived in read-only mode. All flatmate balances have been squared away."
            : "When roommates move out or trips end, ensure balances are settled before archiving or leaving."}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Transfer Ownership Button (TASK-15) */}
          {isOwner && !isArchived && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setShowTransferModal(true);
                setTransferStep(1);
                setTransferError(null);
                setPassword("");
                if (eligibleCandidates.length > 0 && !selectedMemberId) {
                  setSelectedMemberId(eligibleCandidates[0].id);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Transfer Ownership</span>
            </button>
          )}

          {isOwner && !isArchived && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleArchiveGroup}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Archive className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>Archive Group</span>
            </button>
          )}

          {isOwner && isArchived && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleReactivateGroup}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#185CFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1249D6] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              <span>Re-Activate Group</span>
            </button>
          )}

          {!isOwner && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleLeaveGroup}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5 text-red-600" />
              )}
              <span>Leave Group</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-step Ownership Transfer Modal (TASK-15) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowTransferModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185CFF] flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Transfer Group Ownership</h3>
                <p className="text-xs text-slate-500">Step {transferStep} of 2 — Handover primary control</p>
              </div>
            </div>

            {transferError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {transferStep === 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select an active flatmate to designate as the new primary Owner of <strong>{groupName}</strong>. You will automatically transition to an <strong>Admin</strong>.
                </p>

                {eligibleCandidates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                    <p className="text-xs text-slate-500">
                      No other active members found in this group. Invite flatmates first before transferring ownership.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {eligibleCandidates.map((candidate) => (
                      <label
                        key={candidate.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedMemberId === candidate.id
                            ? "border-[#185CFF] bg-blue-50/50 shadow-2xs"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="newOwner"
                            value={candidate.id}
                            checked={selectedMemberId === candidate.id}
                            onChange={() => setSelectedMemberId(candidate.id)}
                            className="text-[#185CFF] focus:ring-[#185CFF]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#0F172A]">{candidate.name}</div>
                            <div className="text-[11px] text-slate-500">@{candidate.username}</div>
                          </div>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                          {candidate.role}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedMemberId || eligibleCandidates.length === 0}
                    onClick={() => {
                      setTransferError(null);
                      setTransferStep(2);
                    }}
                    className="h-10 px-4 rounded-xl bg-[#185CFF] text-xs font-bold text-white hover:bg-[#1249D6] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Continue to Confirmation
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmTransfer} className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Permanent Ownership Change</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-normal">
                    You are handing over primary ownership of <strong>{groupName}</strong> to{" "}
                    <strong>{selectedCandidate?.name || "the selected member"}</strong>. They will gain exclusive rights to archive the group or transfer ownership.
                  </p>
                </div>

                <div>
                  <label className={ui.label}>Confirm with Account Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter your current password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-[14px] border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-[#0F172A] focus:border-[#185CFF] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTransferStep(1)}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !password}
                    className="h-10 px-4 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Transferring...</span>
                      </>
                    ) : (
                      <span>Confirm Ownership Transfer</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
