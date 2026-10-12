import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getUserGroupsQuery } from "@/features/groups";
import { getGroupDetailQuery } from "@/features/groups";
import { NewExpenseClientForm } from "./new-expense-form";

export const instant = false;

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const { groupId: queryGroupId } = await searchParams;
  const groups = await getUserGroupsQuery(session.id);

  if (groups.length === 0) {
    redirect("/groups/new");
  }

  // Determine active group to preload members for
  const activeGroupId = queryGroupId && groups.some((g) => g.id === queryGroupId)
    ? queryGroupId
    : groups[0].id;

  const groupDetail = await getGroupDetailQuery(activeGroupId, session.id);

  // Pre-serialize members for the client interactive component
  const initialMembers = groupDetail ? groupDetail.members.map((m) => ({
    userId: m.userId,
    name: m.name,
    username: m.username,
  })) : [];

  return (
    <div className="mx-auto max-w-xl pb-24">
      <NewExpenseClientForm
        currentUser={{ id: session.id, name: session.name }}
        groups={groups.map((g) => ({ id: g.id, name: g.name, currency: g.defaultCurrency }))}
        initialGroupId={activeGroupId}
        initialMembers={initialMembers}
      />
    </div>
  );
}
