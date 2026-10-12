import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { SettingsClientView } from "./settings-client";

export const metadata = {
  title: "Account & Preferences — Hisabo",
};

export default async function SettingsPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  return <SettingsClientView user={session} />;
}
