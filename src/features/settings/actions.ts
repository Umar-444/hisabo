"use server";

import { getUserSession, setUserSessionCookie, clearUserSessionCookie } from "@/lib/auth/user-session";
import { db } from "@/app/(backend)/_lib/db";
import { users } from "@/app/(backend)/_lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getAggregatedBalancesQuery } from "@/features/balances";
import { fromMinorUnits } from "@/lib/money";

export interface SettingsActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updateProfileAction(
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const name = formData.get("name")?.toString().trim();
  const username = formData.get("username")?.toString().trim().toLowerCase().replace(/^@/, "");

  if (!name || name.length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }

  if (!username || username.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }

  try {
    // Check if username taken by another user
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing && existing.id !== session.id) {
      return { success: false, error: "Username is already taken by another user." };
    }

    // Update database
    await db
      .update(users)
      .set({
        name,
        username,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id));

    // Update cookie session
    await setUserSessionCookie({
      id: session.id,
      email: session.email,
      name,
      username,
      role: session.role,
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, message: "Profile updated successfully." };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update profile." };
  }
}

export async function changePasswordAction(
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All password fields are required." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  try {
    const [userRecord] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (!userRecord || !userRecord.passwordHash) {
      return { success: false, error: "User account not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({
        passwordHash: newHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id));

    return { success: true, message: "Password updated securely." };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to change password." };
  }
}

export async function updatePreferencesAction(
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const defaultCurrency = formData.get("defaultCurrency")?.toString().trim().toUpperCase() || "SAR";
  const paymentHandle = formData.get("paymentHandle")?.toString().trim() || null;

  try {
    await db
      .update(users)
      .set({
        defaultCurrency,
        paymentHandle,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, message: "App preferences saved successfully." };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update preferences." };
  }
}

export async function deleteAccountAction(): Promise<SettingsActionResult> {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    // 1. Financial check: does the user have any outstanding debts?
    const aggregated = await getAggregatedBalancesQuery(session.id);
    for (const cur of aggregated.currencies) {
      const summary = aggregated.byCurrency[cur];
      if (summary && summary.netTotalMinor < BigInt(0)) {
        const debtMajor = Math.abs(fromMinorUnits(summary.netTotalMinor)).toFixed(2);
        return {
          success: false,
          error: `Cannot delete account: You have an outstanding debt of ${cur} ${debtMajor}. You must settle all balances before closing your account.`,
        };
      }
    }

    // 2. Safe Anonymization & Deletion
    const anonymizedUsername = `deleted_${session.id.slice(0, 8)}`;
    const anonymizedEmail = `deleted_${session.id}@hisabo.local`;

    await db
      .update(users)
      .set({
        name: "Former Member",
        username: anonymizedUsername,
        email: anonymizedEmail,
        passwordHash: null,
        status: "deleted",
        paymentHandle: null,
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id));

    await clearUserSessionCookie();
    return { success: true, message: "Your account has been deleted safely." };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete account." };
  }
}

