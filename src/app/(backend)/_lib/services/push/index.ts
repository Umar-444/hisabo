import webpush from "web-push";
import { VAPID_CONFIG } from "@/config/push";
import { db } from "@/app/(backend)/_lib/db";
import { pushSubscriptions } from "@/app/(backend)/_lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

webpush.setVapidDetails(
  VAPID_CONFIG.subject,
  VAPID_CONFIG.publicKey,
  VAPID_CONFIG.privateKey
);

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendWebPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    const subs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
      })
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          isNull(pushSubscriptions.revokedAt)
        )
      );

    if (subs.length === 0) {
      return;
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/dashboard",
    });

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payloadString,
            {
              TTL: 60 * 60 * 24, // 24 hours
            }
          );
        } catch (err: any) {
          // If subscription has expired (HTTP 404/410 Gone), automatically revoke it
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await db
              .update(pushSubscriptions)
              .set({ revokedAt: new Date() })
              .where(eq(pushSubscriptions.id, sub.id));
          } else {
            console.warn(`Web push delivery error for subscription ${sub.id}:`, err?.message || err);
          }
        }
      })
    );
  } catch (err) {
    console.warn("sendWebPushToUser dispatch error:", err);
  }
}
