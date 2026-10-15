"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinGroupByTokenAction } from "@/features/groups/actions";
import { UserCheck, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function JoinGroupButtonClient({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      try {
        const res = await joinGroupByTokenAction(token);
        if (res.success && res.groupId) {
          toast.success(res.message || "Welcome! You joined the group.");
          router.push(`/groups/${res.groupId}`);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to join group");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to join group. Please try again.");
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleJoin}
      className="w-full h-12 rounded-xl bg-[#185CFF] hover:bg-[#1249D6] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#185CFF]/25 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Joining Flat...</span>
        </>
      ) : (
        <>
          <UserCheck className="h-4 w-4" />
          <span>Accept Invitation & Join</span>
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
