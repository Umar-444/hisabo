"use server";

import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, groupInvitations, users, outboxEvents, notifications } from "@/app/(backend)/_lib/db/schema";
import { getUserSession } from "@/lib/auth/user-session";
import { createGroupSchema, inviteMemberSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { eq, or, and, sql } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getClientIp, checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { getMemberNetPositionInGroup } from "@/features/balances";
import { fromMinorUnits } from "@/lib/money";

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

  // Rate Limiting Protection against token scanning/flooding
  const clientIp = await getClientIp();
  const rateCheck = checkRateLimit(
    `group:join:${clientIp}:${session.id}`,
    RATE_LIMIT_PRESETS.INVITE_JOIN
  );
  if (!rateCheck.success) {
    return {
      success: false,
      error: `Too many join attempts. Please wait ${rateCheck.resetInSeconds}s before trying again.`,
    };
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

export async function leaveGroupAction(groupId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Verify user is in group
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, session.id),
          eq(groupMembers.status, "active")
        )
      )
      .limit(1);

    if (!membership) {
      return { success: false, error: "You are not an active member of this group." };
    }

    if (membership.role === "owner") {
      return {
        success: false,
        error: "Group owners cannot leave without transferring ownership first.",
      };
    }

    // 2. Financial check: is user net balance zero in this group?
    const netPosition = await getMemberNetPositionInGroup(groupId, session.id);
    if (netPosition < BigInt(0)) {
      const debtMajor = Math.abs(fromMinorUnits(netPosition)).toFixed(2);
      return {
        success: false,
        error: `Cannot leave group: You have an outstanding debt of ${debtMajor} in this group. Please settle up first.`,
      };
    }

    if (netPosition > BigInt(0)) {
      const creditMajor = fromMinorUnits(netPosition).toFixed(2);
      return {
        success: false,
        error: `Cannot leave group: Roommates owe you ${creditMajor} in this group. Collect settlements before leaving.`,
      };
    }

    // 3. Deactivate membership safely (preserve historical expenses)
    await db
      .update(groupMembers)
      .set({ status: "inactive" })
      .where(eq(groupMembers.id, membership.id));

    await db.insert(outboxEvents).values({
      eventType: "group.member_left",
      payload: {
        groupId,
        userId: session.id,
      },
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");
    revalidatePath("/balances");

    return { success: true, message: "You have left the group successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to leave group." };
  }
}

export async function updateMemberRoleAction(
  groupId: string,
  targetUserId: string,
  newRole: "admin" | "member"
) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Verify caller is owner
    const [callerMembership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, session.id),
          eq(groupMembers.status, "active")
        )
      )
      .limit(1);

    if (!callerMembership || callerMembership.role !== "owner") {
      return { success: false, error: "Only the group owner can modify member roles." };
    }

    // 2. Verify target member
    const [targetMembership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, targetUserId),
          eq(groupMembers.status, "active")
        )
      )
      .limit(1);

    if (!targetMembership) {
      return { success: false, error: "Target member not found in group." };
    }

    if (targetMembership.role === "owner") {
      return { success: false, error: "Cannot change the group owner's role." };
    }

    // 3. Update role
    await db
      .update(groupMembers)
      .set({ role: newRole })
      .where(eq(groupMembers.id, targetMembership.id));

    await db.insert(outboxEvents).values({
      eventType: "group.role_updated",
      payload: {
        groupId,
        targetUserId,
        newRole,
        updatedBy: session.id,
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: true, message: `Member role updated to ${newRole}.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update role." };
  }
}

export async function archiveGroupAction(groupId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // 1. Verify caller is owner
    const [groupRecord] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!groupRecord) {
      return { success: false, error: "Group not found." };
    }

    if (groupRecord.ownerId !== session.id) {
      return { success: false, error: "Only the group owner can archive or close this group." };
    }

    // 2. Financial check: verify caller net balance is zero
    const callerNet = await getMemberNetPositionInGroup(groupId, session.id);
    if (callerNet !== BigInt(0)) {
      const amountMajor = Math.abs(fromMinorUnits(callerNet)).toFixed(2);
      return {
        success: false,
        error: `Cannot archive group: You have an unsettled balance of ${amountMajor} in this group. All member debts must be zero before archiving.`,
      };
    }

    // 3. Mark group as archived
    await db
      .update(groups)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(groups.id, groupId));

    await db.insert(outboxEvents).values({
      eventType: "group.archived",
      payload: {
        groupId,
        archivedBy: session.id,
      },
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true, message: "Group archived successfully. Records are now in read-only mode." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to archive group." };
  }
}

export async function unarchiveGroupAction(groupId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const [groupRecord] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!groupRecord || groupRecord.ownerId !== session.id) {
      return { success: false, error: "Only the group owner can re-activate this group." };
    }

    await db
      .update(groups)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(groups.id, groupId));

    await db.insert(outboxEvents).values({
      eventType: "group.reactivated",
      payload: {
        groupId,
        reactivatedBy: session.id,
      },
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return { success: true, message: "Group re-activated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reactivate group." };
  }
}

export async function transferGroupOwnershipAction({
  groupId,
  newOwnerId,
  password,
}: {
  groupId: string;
  newOwnerId: string;
  password: string;
}) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  if (!password || !password.trim()) {
    return { success: false, error: "Password confirmation is required to transfer group ownership." };
  }

  try {
    // 1. Fetch group & verify caller is owner
    const [groupRecord] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!groupRecord) {
      return { success: false, error: "Group not found." };
    }

    if (groupRecord.ownerId !== session.id) {
      return { success: false, error: "Only the current group owner can transfer ownership." };
    }

    if (newOwnerId === session.id) {
      return { success: false, error: "You are already the primary owner of this group." };
    }

    // 2. Verify caller's password
    const [callerUser] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!callerUser || !callerUser.passwordHash) {
      return { success: false, error: "Unable to verify credentials." };
    }

    const isPasswordValid = await bcrypt.compare(password, callerUser.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: "Incorrect password. Ownership transfer rejected." };
    }

    // 3. Verify target newOwner is an active member
    const [targetMembership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, newOwnerId),
          eq(groupMembers.status, "active")
        )
      )
      .limit(1);

    if (!targetMembership) {
      return { success: false, error: "Designated member is not an active participant in this group." };
    }

    // 4. Atomically transfer ownership
    await db.transaction(async (tx) => {
      // Update group primary owner
      await tx
        .update(groups)
        .set({ ownerId: newOwnerId, updatedAt: new Date() })
        .where(eq(groups.id, groupId));

      // Promote new owner in group_members
      await tx
        .update(groupMembers)
        .set({ role: "owner" })
        .where(eq(groupMembers.id, targetMembership.id));

      // Demote previous owner to admin
      await tx
        .update(groupMembers)
        .set({ role: "admin" })
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, session.id)
          )
        );

      // Record outbox event
      await tx.insert(outboxEvents).values({
        eventType: "group.ownership_transferred",
        payload: {
          groupId,
          previousOwnerId: session.id,
          newOwnerId,
          groupName: groupRecord.name,
        },
      });

      // Send in-app notification to new owner
      await tx.insert(notifications).values({
        userId: newOwnerId,
        type: "group_role_changed",
        title: `Ownership Transferred: ${groupRecord.name}`,
        message: `${session.name || "The previous owner"} has designated you as the primary Owner of ${groupRecord.name}.`,
        link: `/groups/${groupId}`,
      });
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Group ownership transferred successfully. You are now an Admin of this group.",
    };
  } catch (err: any) {
    console.error("Transfer ownership error:", err);
    return { success: false, error: err.message || "Failed to transfer group ownership." };
  }
}



