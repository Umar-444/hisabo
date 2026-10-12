"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  SerializedNotification,
} from "../queries";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "../actions";
import {
  Bell,
  CheckCircle2,
  Receipt,
  HandCoins,
  AlertTriangle,
  Building2,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialNotifications: SerializedNotification[];
}

export function NotificationListClient({ initialNotifications }: Props) {
  const [notificationsList, setNotificationsList] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notificationsList.filter((n) => !n.readAt).length;
  const filteredNotifications = notificationsList.filter((n) => {
    if (filter === "unread") return !n.readAt;
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsReadAction(id);
      if (res.success) {
        setNotificationsList((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
      } else {
        toast.error("Failed to mark notification as read");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        setNotificationsList((prev) =>
          prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
        );
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all as read");
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "settlement_requested":
      case "settlement_claimed":
        return <HandCoins className="h-4 w-4 text-[#185CFF]" />;
      case "settlement_confirmed":
        return <CheckCircle2 className="h-4 w-4 text-[#10B981]" />;
      case "dispute_raised":
        return <AlertTriangle className="h-4 w-4 text-[#EF4444]" />;
      case "group_invited":
        return <Building2 className="h-4 w-4 text-[#7B3FF2]" />;
      case "expense_added":
      default:
        return <Receipt className="h-4 w-4 text-[#0075DE]" />;
    }
  };

  return (
    <div className="w-full space-y-4 pb-24">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0a1530]">
            Notification Center
          </h1>
          <p className="text-xs md:text-sm text-[#787671] font-normal mt-0.5">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up! No unread notifications"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8c4be] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] shadow-2xs hover:bg-[#f6f5f4] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 text-[#10B981]" />
            )}
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* 2. Filter Pills */}
      <div className="flex rounded-md bg-[#f0eeec] p-0.5 border border-[#e5e3df] w-fit">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-white text-[#185cff] shadow-2xs font-bold"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          All ({notificationsList.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-white text-[#185cff] shadow-2xs font-bold"
              : "text-[#787671] hover:text-[#1a1a1a]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* 3. Notification Items Container */}
      <div className="rounded-xl border border-[#e5e3df] bg-white divide-y divide-[#ede9e4] shadow-2xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center p-6">
            <div className="h-10 w-10 rounded-md bg-[#e6e0f5] text-[#7b3ff2] flex items-center justify-center mx-auto mb-2.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-[#0a1530]">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-[11px] text-[#787671] mt-0.5">
              When flatmates add expenses, record settlements, or invite you to groups, you will see alerts here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-3 p-4 transition-colors ${
                  isUnread ? "bg-blue-50/30" : "hover:bg-[#f6f5f4]"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Type Icon Badge */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#e5e3df] shadow-2xs mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0a1530] leading-tight">
                        {n.title}
                      </span>
                      {isUnread && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#185CFF]" />
                      )}
                    </div>
                    <p className="text-xs text-[#52504b] mt-0.5 leading-normal">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#787671]">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {n.link && (
                        <Link
                          href={n.link}
                          className="inline-flex items-center gap-1 font-semibold text-[#185CFF] hover:underline"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mark Read Action Button */}
                {isUnread && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-md text-slate-400 hover:text-[#185CFF] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
