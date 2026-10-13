import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { getPendingActionsQuery } from "@/features/settlements";
import { DesktopUserShell } from "@/components/layout/desktop-user-shell";

export const instant = false;

export default async function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  let pendingActionsCount = 0;
  try {
    const pendingActions = await getPendingActionsQuery(session.id);
    pendingActionsCount = pendingActions.totalCount;
  } catch (err) {
    console.error("Failed to load pending actions count:", err);
  }

  return (
    <DesktopUserShell
      session={session}
      pendingActionsCount={pendingActionsCount}
      logoutAction={logoutAction}
    >
      {children}
    </DesktopUserShell>
  );
}

