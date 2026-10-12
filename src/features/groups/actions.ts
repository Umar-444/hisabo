"use server";

import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, groupInvitations, users, outboxEvents } from "@/app/(backend)/_lib/db/schema";
import { getUserSession } from "@/lib/auth/user-session";
import { createGroupSchema, inviteMemberSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { eq, or, and, sql } from "drizzle-orm";
import crypto from "crypto";

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

export async function createGroupInviteAction(
  groupId: string,
  options?: { expirationDays?: number; isSingleUse?: boolean }
) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Verify caller is an active group member
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, session.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "You are not authorized to create invite links for this group" };
    }

    // 2. Generate cryptographically secure random token (48 hex chars = 24 bytes)
    const token = crypto.randomBytes(24).toString("hex");

    const expirationDays = options?.expirationDays && options.expirationDays > 0 ? options.expirationDays : 7;
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    const maxUses = options?.isSingleUse ? 1 : 0;

    const [invite] = await db
      .insert(groupInvitations)
      .values({
        groupId,
        token,
        invitedBy: session.id,
        expiresAt,
        maxUses,
        useCount: 0,
        isRevoked: false,
      })
      .returning();

    await db.insert(outboxEvents).values({
      eventType: "group.invite_created",
      payload: {
        inviteId: invite.id,
        groupId,
        token,
        invitedBy: session.id,
        expiresAt: expiresAt.toISOString(),
        maxUses,
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return {
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        useCount: invite.useCount,
        isRevoked: invite.isRevoked,
      },
    };
  } catch (err: any) {
    console.error("Create group invite error:", err);
    return { success: false, error: err.message || "Failed to create invite link" };
  }
}

export async function revokeGroupInviteAction(inviteId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const [invite] = await db
      .select()
      .from(groupInvitations)
      .where(eq(groupInvitations.id, inviteId));

    if (!invite) {
      return { success: false, error: "Invite not found" };
    }

    // Verify caller is active member of this group
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, invite.groupId),
          eq(groupMembers.userId, session.id),
          eq(groupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "Unauthorized to revoke this invite" };
    }

    await db
      .update(groupInvitations)
      .set({ isRevoked: true })
      .where(eq(groupInvitations.id, inviteId));

    revalidatePath(`/groups/${invite.groupId}`);
    return { success: true, message: "Invite link revoked successfully" };
  } catch (err: any) {
    console.error("Revoke invite error:", err);
    return { success: false, error: err.message || "Failed to revoke invite" };
  }
}

export async function joinGroupByTokenAction(token: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Please log in or register to join this group" };
  }

  try {
    const [invitation] = await db
      .select()
      .from(groupInvitations)
      .where(eq(groupInvitations.token, token.trim()));

    if (!invitation) {
      return { success: false, error: "Invalid invitation link" };
    }

    if (invitation.isRevoked) {
      return { success: false, error: "This invitation link has been revoked by the group admin" };
    }

    if (new Date() > invitation.expiresAt) {
      return { success: false, error: "This invitation link has expired. Please ask for a new invite link" };
    }

    if (invitation.maxUses > 0 && invitation.useCount >= invitation.maxUses) {
      return { success: false, error: "This single-use invitation link has already been claimed" };
    }

    // Check if user is already a member
    const [existingMember] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, invitation.groupId),
          eq(groupMembers.userId, session.id)
        )
      );

    if (existingMember) {
      if (existingMember.status === "active") {
        return {
          success: true,
          groupId: invitation.groupId,
          alreadyMember: true,
          message: "You are already an active member of this group!",
        };
      } else {
        // Reactivate
        await db
          .update(groupMembers)
          .set({ status: "active", joinedAt: new Date() })
          .where(eq(groupMembers.id, existingMember.id));
      }
    } else {
      // Add new member and increment useCount in transaction
      await db.transaction(async (tx) => {
        await tx.insert(groupMembers).values({
          groupId: invitation.groupId,
          userId: session.id,
          role: "member",
          status: "active",
        });

        await tx
          .update(groupInvitations)
          .set({ useCount: sql`${groupInvitations.useCount} + 1` })
          .where(eq(groupInvitations.id, invitation.id));

        await tx.insert(outboxEvents).values({
          eventType: "group.member_joined_via_invite",
          payload: {
            groupId: invitation.groupId,
            userId: session.id,
            inviteId: invitation.id,
          },
        });
      });
    }

    revalidatePath("/groups");
    revalidatePath(`/groups/${invitation.groupId}`);
    revalidatePath("/dashboard");
    revalidatePath("/balances");

    return {
      success: true,
      groupId: invitation.groupId,
      message: "Successfully joined the group!",
    };
  } catch (err: any) {
    console.error("Join group error:", err);
    return { success: false, error: err.message || "Failed to join group" };
  }
}
