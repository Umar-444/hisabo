import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { NewGroupFormClient } from "./new-group-form";

export const instant = false;

export default async function NewGroupPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <NewGroupFormClient />
    </div>
  );
}
