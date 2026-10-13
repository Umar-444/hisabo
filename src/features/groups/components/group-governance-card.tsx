"use client";

import { useTransition } from "react";
import { leaveGroupAction, archiveGroupAction, unarchiveGroupAction } from "../actions";
import { Shield, LogOut, Archive, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  groupId: string;
  groupName: string;
  isOwner: boolean;
  status: string;
  userNetBalanceMinor: string;
  currency: string;
}

export function GroupGovernanceCard({
  groupId,
  groupName,
  isOwner,
  status,
  userNetBalanceMinor,
  currency,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  const isArchived = status === "archived";

  return (
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
  );
}
