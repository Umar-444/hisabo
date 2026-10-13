import { GroupActivityItem } from "../queries";
import { Clock, UserPlus, Shield, Archive, LogOut, CheckCircle2, History } from "lucide-react";

interface Props {
  activityLog: GroupActivityItem[];
}

export function GroupActivityList({ activityLog }: Props) {
  const formatEvent = (item: GroupActivityItem) => {
    switch (item.eventType) {
      case "group.created":
        return {
          title: "Group created",
          description: "Apartment/flat sharing pool initialized",
          icon: <Shield className="h-4 w-4 text-[#185CFF]" />,
        };
      case "group.member_joined_via_invite":
        return {
          title: "Member joined",
          description: "New flatmate joined via tokenized invite link",
          icon: <UserPlus className="h-4 w-4 text-[#10B981]" />,
        };
      case "group.role_updated":
        return {
          title: "Member role updated",
          description: `Role permissions updated to ${item.payload?.newRole || "updated"}`,
          icon: <Shield className="h-4 w-4 text-amber-500" />,
        };
      case "group.archived":
        return {
          title: "Group closed & archived",
          description: "All balances settled to zero; group locked in read-only mode",
          icon: <Archive className="h-4 w-4 text-slate-500" />,
        };
      case "group.member_left":
        return {
          title: "Member departed",
          description: "Member settled all debts and exited the group",
          icon: <LogOut className="h-4 w-4 text-slate-400" />,
        };
      default:
        return {
          title: item.eventType.replace(/_/g, " "),
          description: "Group ledger activity recorded",
          icon: <CheckCircle2 className="h-4 w-4 text-[#185CFF]" />,
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#185CFF]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Group Audit & Activity History</h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {activityLog.length} {activityLog.length === 1 ? "Event" : "Events"}
        </span>
      </div>

      {activityLog.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No activity recorded yet for this group pool.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activityLog.map((event) => {
            const parsed = formatEvent(event);
            return (
              <div key={event.id} className="py-3 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {parsed.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] leading-tight">
                    {parsed.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    {parsed.description}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
