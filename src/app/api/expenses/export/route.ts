import { getUserSession } from "@/lib/auth/user-session";
import { getUserGroupsQuery } from "@/features/groups";
import { db } from "@/app/(backend)/_lib/db";
import { expenses, users, groups } from "@/app/(backend)/_lib/db/schema";
import { desc, inArray, eq } from "drizzle-orm";
import { fromMinorUnits } from "@/lib/money";
import { NextResponse } from "next/server";
import { getSystemSettingsAction } from "@/features/admin/actions";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { flags } = await getSystemSettingsAction();
  if (!flags.exportEnabled) {
    return new NextResponse("Exports temporarily disabled by platform administration.", {
      status: 403,
    });
  }

  const userGroups = await getUserGroupsQuery(session.id);
  const groupIds = userGroups.map((g) => g.id);

  if (groupIds.length === 0) {
    const emptyCsv = "Date,Group,Description,Category,PaidBy,Currency,TotalAmount,Status\n";
    return new NextResponse(emptyCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="hisabo-expenses-export.csv"',
      },
    });
  }

  const expenseRows = await db
    .select({
      id: expenses.id,
      description: expenses.description,
      amountMinor: expenses.amountMinor,
      currency: expenses.currency,
      category: expenses.category,
      status: expenses.status,
      createdAt: expenses.createdAt,
      paidBy: expenses.paidBy,
      payerName: users.name,
      groupName: groups.name,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.paidBy, users.id))
    .innerJoin(groups, eq(expenses.groupId, groups.id))
    .where(inArray(expenses.groupId, groupIds))
    .orderBy(desc(expenses.createdAt));

  // Build CSV conforming to RFC 4180
  const header = ["Date", "Group", "Description", "Category", "PaidBy", "Currency", "TotalAmount", "Status"];
  const rows = expenseRows.map((e) => {
    const dateStr = new Date(e.createdAt).toISOString().split("T")[0];
    const groupSafe = `"${(e.groupName || "").replace(/"/g, '""')}"`;
    const descSafe = `"${(e.description || "").replace(/"/g, '""')}"`;
    const categorySafe = e.category || "general";
    const payerSafe = `"${(e.payerName || "Roommate").replace(/"/g, '""')}"`;
    const currencySafe = e.currency || "SAR";
    const amountSafe = fromMinorUnits(e.amountMinor).toFixed(2);
    const statusSafe = e.status || "active";

    return [dateStr, groupSafe, descSafe, categorySafe, payerSafe, currencySafe, amountSafe, statusSafe].join(",");
  });

  const csvContent = [header.join(","), ...rows].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hisabo-expenses-export.csv"',
    },
  });
}
