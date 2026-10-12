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
