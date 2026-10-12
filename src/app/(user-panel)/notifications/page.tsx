import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getUserNotificationsQuery } from "@/features/notifications/queries";
import { NotificationListClient } from "@/features/notifications/components/notification-list-client";

export const metadata = {
  title: "Notifications — Hisabo",
};

export const instant = false;

export default async function NotificationsPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const notifications = await getUserNotificationsQuery(session.id);

  return <NotificationListClient initialNotifications={notifications} />;
}
