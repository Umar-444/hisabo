import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { SettingsClientView } from "./settings-client";
import { db } from "@/app/(backend)/_lib/db";
import { users } from "@/app/(backend)/_lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Account & Preferences — Hisabo",
};

export const instant = false;

export default async function SettingsPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const [userRecord] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      defaultCurrency: users.defaultCurrency,
      paymentHandle: users.paymentHandle,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  const userData = {
    id: session.id,
    name: userRecord?.name || session.name,
    username: userRecord?.username || session.username,
    email: userRecord?.email || session.email,
    role: userRecord?.role || session.role,
    defaultCurrency: userRecord?.defaultCurrency || "SAR",
    paymentHandle: userRecord?.paymentHandle || "",
    image: userRecord?.image || null,
    createdAt: (userRecord?.createdAt || new Date()).toISOString(),
  };

  return <SettingsClientView user={userData} />;
}

