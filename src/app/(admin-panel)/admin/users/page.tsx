import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { AdminUsersClient } from "./users-client";

export const instant = false;

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminUsersClient />;
}
