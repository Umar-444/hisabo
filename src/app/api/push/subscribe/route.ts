import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth/user-session";
import { db } from "@/app/(backend)/_lib/db";
import { pushSubscriptions } from "@/app/(backend)/_lib/db/schema/notifications";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid push subscription payload." },
        { status: 400 }
      );
    }

    // Check if subscription already exists for this endpoint
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing) {
      // Re-activate if revoked
      await db
        .update(pushSubscriptions)
        .set({
          userId: session.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
          revokedAt: null,
        })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: session.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    return NextResponse.json({ success: true, message: "Push subscription active." });
  } catch (err: any) {
    console.error("Save push subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register push subscription." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    await db
      .update(pushSubscriptions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(pushSubscriptions.endpoint, endpoint),
          eq(pushSubscriptions.userId, session.id)
        )
      );

    return NextResponse.json({ success: true, message: "Subscription revoked." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to revoke subscription." },
      { status: 500 }
    );
  }
}
