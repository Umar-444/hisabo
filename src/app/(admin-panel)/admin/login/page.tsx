import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { AdminLoginClient } from "./login-client";

export const instant = false;

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session && session.role === "admin") {
    redirect("/admin");
  }

  return <AdminLoginClient />;
}
