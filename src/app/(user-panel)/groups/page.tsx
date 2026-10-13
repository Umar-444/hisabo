import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getUserGroupsQuery } from "@/features/groups";
import { ui } from "@/lib/ui";
import Link from "next/link";
import { PlusCircle, Building2, Users, ArrowRight, Sparkles } from "lucide-react";

export const instant = false;

export default async function GroupsPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const userGroups = await getUserGroupsQuery(session.id);

  return (
    <div className="w-full space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Your Groups</h1>
          <p className="text-xs text-slate-500 font-medium">
            Flats, apartments, roommates & trip pools
          </p>
        </div>

        <Link
          href="/groups/new"
          className={ui.btn({ variant: "primary", size: "sm" })}
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Group</span>
        </Link>
      </div>

      {/* Groups Grid */}
      {userGroups.length === 0 ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="h-12 w-12 rounded-[14px] bg-blue-50 text-[#185CFF] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-bold text-[#0F172A]">No groups yet</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Create a shared group for your flatmates or trip to split expenses seamlessly.
          </p>
          <Link
            href="/groups/new"
            className={ui.btn({ variant: "primary", size: "sm" })}
          >
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="rounded-[20px] border border-slate-200/90 bg-white p-5 shadow-xs hover:border-[#185CFF]/30 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EBF2FF] text-[#185CFF] font-bold text-lg border border-blue-100">
                    🏢
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {group.role}
                  </span>
                </div>

                <h3 className="mt-3.5 text-base font-bold text-[#0F172A] group-hover:text-[#185CFF] transition-colors">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {group.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  {group.memberCount} members
                </span>
                <span className="flex items-center gap-1 font-bold text-[#185CFF]">
                  View Ledger
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
