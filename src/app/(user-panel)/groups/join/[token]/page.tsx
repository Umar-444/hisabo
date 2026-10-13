import { getUserSession } from "@/lib/auth/user-session";
import { getGroupInvitePreviewQuery } from "@/features/groups/queries";
import Link from "next/link";
import {
  Building2,
  Users,
  ShieldAlert,
  ArrowLeft,
  Coins,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { JoinGroupButtonClient } from "./join-button-client";

export const dynamic = "force-dynamic";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getUserSession();
  const preview = await getGroupInvitePreviewQuery(token);

  if (!preview.isValid || !preview.group) {
    let title = "Invalid Invitation Link";
    let desc = "This group invitation link does not exist or has been removed.";

    if (preview.reason === "expired") {
      title = "Invitation Expired";
      desc = "This invite link has passed its validity window. Please ask a flatmate for a fresh link.";
    } else if (preview.reason === "revoked") {
      title = "Invitation Revoked";
      desc = "This invitation link was revoked by the group administrator for security.";
    } else if (preview.reason === "max_reached") {
      title = "Invite Limit Reached";
      desc = "This was a single-use personal invite link that has already been claimed.";
    }

    return (
      <div className="mx-auto max-w-md pt-8 pb-20">
        <div className="rounded-[24px] border border-red-200 bg-white p-7 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">{title}</h1>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { group, inviter } = preview;

  return (
    <div className="mx-auto max-w-md pt-6 pb-20 space-y-5">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/groups" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Groups</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800">Invitation</span>
      </div>

      {/* Main Invitation Card */}
      <div className="rounded-[24px] border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm space-y-6">
        {/* Header Icon & Tag */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#185CFF] text-2xl border border-blue-100 shadow-xs">
            🏢
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#185CFF] bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
              <CheckCircle2 className="h-3 w-3" />
              Verified Group Invite
            </span>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Join {group.name}
            </h1>
            {group.description && (
              <p className="mt-1 text-xs text-slate-500">{group.description}</p>
            )}
          </div>
        </div>

        {/* Group Details Card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="h-4 w-4 text-slate-400" />
              Current Flatmates
            </span>
            <span className="font-bold text-[#0F172A]">{group.memberCount} members</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Coins className="h-4 w-4 text-slate-400" />
              Base Currency
            </span>
            <span className="font-bold font-mono text-[#0F172A]">{group.defaultCurrency}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Invited by</span>
            <span className="font-bold text-blue-600">
              {inviter?.name} (@{inviter?.username})
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            Joining this group will grant you access to its shared expense ledger and zero-sum balances.
          </span>
        </div>

        {/* Action Button */}
        <div>
          {session ? (
            <JoinGroupButtonClient token={token} />
          ) : (
            <div className="space-y-2.5">
              <Link
                href={`/register?returnUrl=/groups/join/${token}`}
                className="w-full h-12 rounded-xl bg-[#185CFF] hover:bg-[#1249D6] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#185CFF]/25 transition-all"
              >
                <span>Register to Join Group</span>
              </Link>

              <Link
                href={`/login?returnUrl=/groups/join/${token}`}
                className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <span>Already have an account? Log In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
