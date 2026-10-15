import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { getPendingActionsQuery } from "@/features/settlements";
import { DesktopUserShell } from "@/components/layout/desktop-user-shell";
import { getSystemSettingsAction, SystemAnnouncement } from "@/features/admin/actions";
import { GlobalAnnouncementBanner } from "@/components/layout/global-announcement-banner";

import { getUnreadNotificationsCountQuery } from "@/features/notifications";

export const dynamic = "force-dynamic";

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
  let unreadNotificationsCount = 0;
  let announcement: SystemAnnouncement = { active: false, message: "", type: "info" };
  try {
    const [pendingActions, unreadCount, settings] = await Promise.all([
      getPendingActionsQuery(session.id),
      getUnreadNotificationsCountQuery(session.id),
      getSystemSettingsAction(),
    ]);
    pendingActionsCount = pendingActions.totalCount;
    unreadNotificationsCount = unreadCount;
    announcement = settings.announcement;
  } catch (err) {
    console.error("Failed to load user layout data:", err);
  }

  return (
    <>
      <GlobalAnnouncementBanner announcement={announcement} />
      <DesktopUserShell
        session={session}
        pendingActionsCount={pendingActionsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        logoutAction={logoutAction}
      >
        {children}
      </DesktopUserShell>
    </>
  );
}

