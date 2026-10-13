import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { getSystemSettingsAction } from "@/features/admin/actions";
import { AdminSettingsClient } from "./settings-client";

export const instant = false;

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { flags, announcement } = await getSystemSettingsAction();

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminSettingsClient
        initialFlags={flags}
        initialAnnouncement={announcement}
      />
    </div>
  );
}
