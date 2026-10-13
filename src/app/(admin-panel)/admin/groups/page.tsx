import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { AdminGroupsClient } from "./groups-client";

export const instant = false;

export default async function AdminGroupsPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminGroupsClient />;
}
