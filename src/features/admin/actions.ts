"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  DEFAULT_ADMIN,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  getAdminSession,
  requireAdminSession,
} from "@/lib/auth/admin-session";
import { getClientIp, checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { isUuid } from "@/lib/utils";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function adminLoginAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  // Rate Limiting Protection for Admin Console
  const clientIp = await getClientIp();
  const rateCheck = checkRateLimit(`admin:login:ip:${clientIp}`, RATE_LIMIT_PRESETS.LOGIN);
  if (!rateCheck.success) {
    return {
      success: false,
      error: `Too many administrative login attempts. Please wait ${rateCheck.resetInSeconds}s before retrying.`,
    };
  }

  // Timing-safe check against default admin credentials
  const isDefaultAdmin =
    safeCompare(email, DEFAULT_ADMIN.email.toLowerCase()) &&
    safeCompare(password, DEFAULT_ADMIN.password);

  if (isDefaultAdmin) {
    await setAdminSessionCookie({
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: "admin",
    });

    redirect("/admin");
  }

  // Timing-safe check for Umar admin
  const isUmarAdmin =
    safeCompare(email, "umar@hisabo.com") &&
    safeCompare(password, DEFAULT_ADMIN.password);

  if (isUmarAdmin) {
    await setAdminSessionCookie({
      id: "usr-01",
      email: "umar@hisabo.com",
      name: "Umar Farooq",
      role: "admin",
    });

    redirect("/admin");
  }

  return {
    success: false,
    error: "Invalid admin credentials. Please check your email or password.",
  };
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function toggleUserStatusAction(
  userId: string,
  currentStatus: "active" | "suspended"
): Promise<ActionResult<{ newStatus: "active" | "suspended" }>> {
  const session = await requireAdminSession();
  const newStatus = currentStatus === "active" ? "suspended" : "active";

  try {
    const { db } = await import("@/app/(backend)/_lib/db");
    const { adminAuditLogs } = await import("@/app/(backend)/_lib/db/schema");
    if (session.id && isUuid(session.id)) {
      await db.insert(adminAuditLogs).values({
        adminId: session.id,
        action: newStatus === "suspended" ? "SUSPEND_USER" : "ACTIVATE_USER",
        targetType: "user",
        targetId: userId,
        details: { previousStatus: currentStatus, newStatus },
      });
    }
  } catch {
    // Non-blocking audit log fallback
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return {
    success: true,
    data: { newStatus },
  };
}

export async function toggleCurrencyStatusAction(
  code: string,
  isLive: boolean
): Promise<ActionResult<{ code: string; isLive: boolean }>> {
  const session = await requireAdminSession();
  const { db } = await import("@/app/(backend)/_lib/db");
  const { currencies, adminAuditLogs } = await import("@/app/(backend)/_lib/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    await db
      .update(currencies)
      .set({ isLive, updatedAt: new Date() })
      .where(eq(currencies.code, code.toUpperCase()));

    if (session.id && isUuid(session.id)) {
      await db.insert(adminAuditLogs).values({
        adminId: session.id,
        action: isLive ? "ENABLE_CURRENCY" : "DISABLE_CURRENCY",
        targetType: "currency",
        targetId: code.toUpperCase(),
        details: { isLive },
      });
    }

    revalidatePath("/admin/currencies");
    revalidatePath("/groups/new");
    return { success: true, data: { code, isLive } };
  } catch (err: any) {
    console.error("Failed to toggle currency:", err);
    return { success: false, error: err.message || "Failed to toggle currency status" };
  }
}

export async function setDefaultCurrencyAction(
  code: string
): Promise<ActionResult<{ code: string }>> {
  const session = await requireAdminSession();
  const { db } = await import("@/app/(backend)/_lib/db");
  const { currencies, adminAuditLogs } = await import("@/app/(backend)/_lib/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    await db.transaction(async (tx) => {
      // Clear previous default
      await tx.update(currencies).set({ isDefault: false });
      // Set new default and ensure it's live
      await tx
        .update(currencies)
        .set({ isDefault: true, isLive: true, updatedAt: new Date() })
        .where(eq(currencies.code, code.toUpperCase()));
    });

    if (session.id && isUuid(session.id)) {
      await db.insert(adminAuditLogs).values({
        adminId: session.id,
        action: "SET_DEFAULT_CURRENCY",
        targetType: "currency",
        targetId: code.toUpperCase(),
        details: { isDefault: true },
      });
    }

    revalidatePath("/admin/currencies");
    revalidatePath("/groups/new");
    return { success: true, data: { code } };
  } catch (err: any) {
    console.error("Failed to set default currency:", err);
    return { success: false, error: err.message || "Failed to set default currency" };
  }
}

export async function createCurrencyAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdminSession();
  const { db } = await import("@/app/(backend)/_lib/db");
  const { currencies, adminAuditLogs } = await import("@/app/(backend)/_lib/db/schema");

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const name = (formData.get("name") as string)?.trim();
  const symbol = (formData.get("symbol") as string)?.trim();
  const decimals = parseInt((formData.get("decimals") as string) || "2", 10);
  const isLive = formData.get("isLive") === "true";

  if (!code || code.length !== 3 || !/^[A-Z]{3}$/.test(code)) {
    return { success: false, error: "Currency code must be exactly 3 uppercase letters (e.g. SAR)." };
  }
  if (!name || name.length > 50 || !symbol || symbol.length > 10) {
    return { success: false, error: "Please enter a valid currency name and symbol." };
  }

  try {
    await db
      .insert(currencies)
      .values({
        code,
        name,
        symbol,
        decimals,
        isLive,
        isDefault: false,
      });

    if (session.id && isUuid(session.id)) {
      await db.insert(adminAuditLogs).values({
        adminId: session.id,
        action: "CREATE_CURRENCY",
        targetType: "currency",
        targetId: code,
        details: { code, name, symbol, decimals, isLive },
      });
    }

    revalidatePath("/admin/currencies");
    revalidatePath("/groups/new");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create currency:", err);
    return { success: false, error: err.message || "Failed to create currency (may already exist)." };
  }
}

export interface FeatureFlags {
  registrationsEnabled: boolean;
  exportEnabled: boolean;
  maintenanceMode: boolean;
}

export interface SystemAnnouncement {
  active: boolean;
  message: string;
  type: "info" | "warning" | "alert";
}

export async function getSystemSettingsAction(): Promise<{
  flags: FeatureFlags;
  announcement: SystemAnnouncement;
}> {
  const { db } = await import("@/app/(backend)/_lib/db");
  const { systemSettings } = await import("@/app/(backend)/_lib/db/schema");

  let flags: FeatureFlags = {
    registrationsEnabled: true,
    exportEnabled: true,
    maintenanceMode: false,
  };

  let announcement: SystemAnnouncement = {
    active: false,
    message: "",
    type: "info",
  };

  try {
    const rows = await db.select().from(systemSettings);
    for (const row of rows) {
      if (row.key === "feature_flags" && row.value) {
        flags = { ...flags, ...(row.value as any) };
      } else if (row.key === "announcement" && row.value) {
        announcement = { ...announcement, ...(row.value as any) };
      }
    }
  } catch (err: any) {
    // Graceful fallback to default system settings
    return { flags, announcement };
  }

  return { flags, announcement };
}

export async function updateFeatureFlagsAction(
  newFlags: Partial<FeatureFlags>
): Promise<ActionResult<FeatureFlags>> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const { db } = await import("@/app/(backend)/_lib/db");
  const { systemSettings, adminAuditLogs } = await import("@/app/(backend)/_lib/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    const current = await getSystemSettingsAction();
    const merged: FeatureFlags = { ...current.flags, ...newFlags };

    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "feature_flags"))
      .limit(1);

    if (existing) {
      await db
        .update(systemSettings)
        .set({ value: merged, updatedAt: new Date() })
        .where(eq(systemSettings.key, "feature_flags"));
    } else {
      await db
        .insert(systemSettings)
        .values({ key: "feature_flags", value: merged });
    }

    if (session.id && isUuid(session.id)) {
      await db.insert(adminAuditLogs).values({
        adminId: session.id,
        action: "UPDATE_FEATURE_FLAGS",
        targetType: "system",
        targetId: "feature_flags",
        details: merged,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true, data: merged };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update feature flags." };
  }
}

export async function updateAnnouncementAction(
  newAnnouncement: Partial<SystemAnnouncement>
): Promise<ActionResult<SystemAnnouncement>> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const { db } = await import("@/app/(backend)/_lib/db");
  const { systemSettings, adminAuditLogs } = await import("@/app/(backend)/_lib/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    const current = await getSystemSettingsAction();
    const merged: SystemAnnouncement = { ...current.announcement, ...newAnnouncement };

    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "announcement"))
      .limit(1);

    if (existing) {
      await db
        .update(systemSettings)
        .set({ value: merged, updatedAt: new Date() })
        .where(eq(systemSettings.key, "announcement"));
    } else {
      await db
        .insert(systemSettings)
        .values({ key: "announcement", value: merged });
    }

    if (session.id && isUuid(session.id)) {
      await db.insert(adminAuditLogs).values({
        adminId: session.id,
        action: "UPDATE_ANNOUNCEMENT",
        targetType: "system",
        targetId: "announcement",
        details: merged,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true, data: merged };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update announcement banner." };
  }
}


