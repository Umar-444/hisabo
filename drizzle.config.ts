import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/app/(backend)/_lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
});
