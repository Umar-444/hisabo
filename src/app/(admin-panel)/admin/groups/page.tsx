import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { getAdminGroupsQuery } from "@/features/admin/queries";
import { AdminGroupsClient } from "./groups-client";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const groupsList = await getAdminGroupsQuery();

  return <AdminGroupsClient initialGroups={groupsList} />;
}
