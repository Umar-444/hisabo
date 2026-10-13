import "server-only";

import { db } from "@/app/(backend)/_lib/db";
import { notifications } from "@/app/(backend)/_lib/db/schema";
import { eq, desc, isNull, and } from "drizzle-orm";
import { isUuid } from "@/lib/utils";

export interface SerializedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function getUserNotificationsQuery(
  userId: string,
  limitCount: number = 50
): Promise<SerializedNotification[]> {
  if (!isUuid(userId)) {
    return [];
  }
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      link: notifications.link,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limitCount);

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    link: r.link,
    readAt: r.readAt ? r.readAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationsCountQuery(userId: string): Promise<number> {
  if (!isUuid(userId)) {
    return 0;
  }
  const unreadRows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return unreadRows.length;
}
