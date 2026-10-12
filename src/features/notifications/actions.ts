"use server";

import { getUserSession } from "@/lib/auth/user-session";
import { db } from "@/app/(backend)/_lib/db";
import { notifications } from "@/app/(backend)/_lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markNotificationAsReadAction(notificationId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.id)));

    revalidatePath("/notifications");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update notification" };
  }
}

export async function markAllNotificationsAsReadAction() {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, session.id), isNull(notifications.readAt)));

    revalidatePath("/notifications");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to mark all as read" };
  }
}

export async function createInternalNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      link: link || null,
      readAt: null,
    });
  } catch (e) {
    console.error("Failed to create internal notification:", e);
  }
}
