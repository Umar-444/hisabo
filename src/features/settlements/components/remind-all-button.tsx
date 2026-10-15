"use client";

import { useTransition } from "react";
import { remindAllGroupDebtorsAction } from "@/features/settlements/actions";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RemindAllButtonProps {
  groupId: string;
}

export function RemindAllButton({ groupId }: RemindAllButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRemindAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await remindAllGroupDebtorsAction({ groupId });
      if (res.success) {
        toast.success(res.message || "Reminders sent to all debtors!");
      } else {
        toast.error(res.error || "Failed to send reminders");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleRemindAll}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/90 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Reminding all...</span>
        </>
      ) : (
        <>
          <Bell className="h-3.5 w-3.5" />
          <span>Remind all</span>
        </>
      )}
    </button>
  );
}
