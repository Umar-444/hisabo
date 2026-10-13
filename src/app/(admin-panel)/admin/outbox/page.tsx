import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { getAdminOutboxEventsQuery } from "@/features/admin/queries";
import { AdminOutboxClient } from "./outbox-client";

export const instant = false;

export default async function AdminOutboxPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const events = await getAdminOutboxEventsQuery();

  return <AdminOutboxClient initialEvents={events} />;
}
