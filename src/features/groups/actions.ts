"use server";

import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, users, outboxEvents } from "@/app/(backend)/_lib/db/schema";
import { getUserSession } from "@/lib/auth/user-session";
import { createGroupSchema, inviteMemberSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { eq, or, and } from "drizzle-orm";

export async function createGroupAction(formData: FormData) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    defaultCurrency: formData.get("defaultCurrency") || "SAR",
    category: formData.get("category") || "apartment",
  };

  const parsed = createGroupSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const [newGroup] = await db
      .insert(groups)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        defaultCurrency: parsed.data.defaultCurrency,
        ownerId: session.id,
      })
      .returning();

    // Automatically add the creator as the group owner
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: session.id,
      role: "owner",
      status: "active",
    });

    // Write outbox event for auditing & notifications
    await db.insert(outboxEvents).values({
      eventType: "group.created",
      payload: {
        groupId: newGroup.id,
        name: newGroup.name,
        ownerId: session.id,
      },
    });

    revalidatePath("/groups");
    revalidatePath("/dashboard");
    return { success: true, groupId: newGroup.id };
  } catch (err: any) {
    console.error("Create group error:", err);
    return { success: false, error: err.message || "Failed to create group" };
  }
}

export async function inviteMemberAction(groupId: string, identifier: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = inviteMemberSchema.safeParse({ groupId, identifier });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    // 1. Verify caller is a member
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id), eq(groupMembers.status, "active")));

    if (!membership) {
      return { success: false, error: "You are not authorized to invite members to this group" };
    }

    // 2. Find target user by email or username
    const [targetUser] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, identifier.trim().toLowerCase()),
          eq(users.username, identifier.trim().toLowerCase())
        )
      );

    if (!targetUser) {
      return {
        success: false,
        error: `User "${identifier}" was not found. Please ensure they have registered an account on Hisabo first.`,
      };
    }

    // 3. Check if already a member
    const [alreadyMember] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUser.id)));

    if (alreadyMember) {
      return { success: false, error: `${targetUser.name} is already a member of this group.` };
    }

    // 4. Add member
    await db.insert(groupMembers).values({
      groupId,
      userId: targetUser.id,
      role: "member",
      status: "active",
    });

    // Write outbox event
    await db.insert(outboxEvents).values({
      eventType: "group.member_added",
      payload: {
        groupId,
        addedUserId: targetUser.id,
        addedByUserId: session.id,
      },
    });

    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");
    return { success: true, message: `${targetUser.name} has been added to the group!` };
  } catch (err: any) {
    console.error("Invite member error:", err);
    return { success: false, error: err.message || "Failed to invite member" };
  }
}
