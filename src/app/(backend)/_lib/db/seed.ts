import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting Hisabo database seed...");

  const passwordHash = await bcrypt.hash("Admin@Hisabo2026!", 10);

  // 1. Seed Users
  await db
    .insert(schema.users)
    .values({
      email: "admin@hisabo.com",
      name: "Hisabo Administrator",
      username: "admin",
      passwordHash,
      role: "admin",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  const [umar] = await db
    .insert(schema.users)
    .values({
      email: "umar@hisabo.com",
      name: "Umar Farooq",
      username: "umar",
      passwordHash,
      role: "admin",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  const [ali] = await db
    .insert(schema.users)
    .values({
      email: "ali@example.com",
      name: "Ali Al-Mansoor",
      username: "aliman",
      passwordHash,
      role: "user",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  const [ahmed] = await db
    .insert(schema.users)
    .values({
      email: "ahmed@example.com",
      name: "Ahmed Hassan",
      username: "ahmed_h",
      passwordHash,
      role: "user",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  const [bilal] = await db
    .insert(schema.users)
    .values({
      email: "bilal@example.com",
      name: "Bilal Tariq",
      username: "bilal99",
      passwordHash,
      role: "user",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  console.log("✓ Users seeded successfully.");

  // If umar exists, seed Apartment group
  if (umar) {
    const [apartmentGroup] = await db
      .insert(schema.groups)
      .values({
        name: "Al-Malqa Apartment 4B",
        description: "Shared living expenses for Riyadh flatmates",
        ownerId: umar.id,
        defaultCurrency: "SAR",
      })
      .onConflictDoNothing()
      .returning();

    if (apartmentGroup) {
      console.log("✓ Group 'Al-Malqa Apartment 4B' created.");

      // Add members
      const memberIds = [umar.id, ali?.id, ahmed?.id, bilal?.id].filter(Boolean) as string[];
      for (const mId of memberIds) {
        await db
          .insert(schema.groupMembers)
          .values({
            groupId: apartmentGroup.id,
            userId: mId,
            role: mId === umar.id ? "owner" : "member",
            status: "active",
          })
          .onConflictDoNothing();
      }

      // Seed SAR 160.00 Dinner Expense
      const [dinnerExpense] = await db
        .insert(schema.expenses)
        .values({
          groupId: apartmentGroup.id,
          createdBy: umar.id,
          paidBy: umar.id,
          amountMinor: 16000n, // SAR 160.00 = 16000 halalas
          currency: "SAR",
          description: "Dinner with friends",
          category: "food",
          status: "active",
        })
        .onConflictDoNothing()
        .returning();

      if (dinnerExpense) {
        // Equal split: 4000 halalas (SAR 40.00) each
        for (const mId of memberIds) {
          await db
            .insert(schema.expenseSplits)
            .values({
              expenseId: dinnerExpense.id,
              userId: mId,
              shareMinor: 4000n, // SAR 40.00 each
              decisionStatus: mId === umar.id ? "accepted" : "pending",
            })
            .onConflictDoNothing();
        }
        console.log("✓ Sample SAR 160 Dinner Expense & 4 Splits seeded.");
      }
    }
  }

  // 4. Seed Currencies
  const defaultCurrencies = [
    { code: "SAR", name: "Saudi Riyal", symbol: "SAR", decimals: 2, isLive: true, isDefault: true },
    { code: "AED", name: "UAE Dirham", symbol: "AED", decimals: 2, isLive: true, isDefault: false },
    { code: "USD", name: "US Dollar", symbol: "$", decimals: 2, isLive: true, isDefault: false },
    { code: "EUR", name: "Euro", symbol: "€", decimals: 2, isLive: true, isDefault: false },
    { code: "GBP", name: "British Pound", symbol: "£", decimals: 2, isLive: true, isDefault: false },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD", decimals: 3, isLive: false, isDefault: false },
    { code: "QAR", name: "Qatari Riyal", symbol: "QAR", decimals: 2, isLive: false, isDefault: false },
    { code: "BHD", name: "Bahraini Dinar", symbol: "BHD", decimals: 3, isLive: false, isDefault: false },
    { code: "OMR", name: "Omani Rial", symbol: "OMR", decimals: 3, isLive: false, isDefault: false },
  ];

  for (const c of defaultCurrencies) {
    await db
      .insert(schema.currencies)
      .values(c)
      .onConflictDoNothing();
  }
  console.log("✓ Currencies seeded (SAR, AED, USD, EUR, GBP, KWD, QAR, BHD, OMR).");

  console.log("🎉 Live Database Seeding Complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
