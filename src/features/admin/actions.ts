"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEFAULT_ADMIN, setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/auth/admin-session";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
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

  // Check against default credentials (or database admin)
  if (email === DEFAULT_ADMIN.email.toLowerCase() && password === DEFAULT_ADMIN.password) {
    await setAdminSessionCookie({
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: "admin",
    });

    redirect("/admin");
  }

  // Also support Umar as admin
  if (email === "umar@hisabo.com" && password === DEFAULT_ADMIN.password) {
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
  const newStatus = currentStatus === "active" ? "suspended" : "active";
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
  const { db } = await import("@/app/(backend)/_lib/db");
  const { currencies } = await import("@/app/(backend)/_lib/db/schema");
  const { eq } = await import("drizzle-orm");

  try {
    await db
      .update(currencies)
      .set({ isLive, updatedAt: new Date() })
      .where(eq(currencies.code, code.toUpperCase()));

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
  const { db } = await import("@/app/(backend)/_lib/db");
  const { currencies } = await import("@/app/(backend)/_lib/db/schema");
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
  const { db } = await import("@/app/(backend)/_lib/db");
  const { currencies } = await import("@/app/(backend)/_lib/db/schema");

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const name = (formData.get("name") as string)?.trim();
  const symbol = (formData.get("symbol") as string)?.trim();
  const decimals = parseInt((formData.get("decimals") as string) || "2", 10);
  const isLive = formData.get("isLive") === "true";

  if (!code || code.length !== 3) {
    return { success: false, error: "Currency code must be exactly 3 uppercase letters (e.g. SAR)." };
  }
  if (!name || !symbol) {
    return { success: false, error: "Please enter currency name and symbol." };
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

    revalidatePath("/admin/currencies");
    revalidatePath("/groups/new");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create currency:", err);
    return { success: false, error: err.message || "Failed to create currency (may already exist)." };
  }
}

