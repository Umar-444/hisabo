import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { AdminAuditLogsClient } from "./audit-logs-client";

export const instant = false;

export default async function AdminAuditLogsPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminAuditLogsClient />;
}
