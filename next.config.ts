import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Bridge Cloudflare build-time environment variables into the build output
try {
  const targetDir = path.resolve(process.cwd(), "src/app/(backend)/_lib/db");
  const targetPath = path.resolve(targetDir, "build-env.generated.json");
  const buildEnv = {
    DATABASE_URL: process.env.DATABASE_URL || "",
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || "",
    AUTH_SECRET: process.env.AUTH_SECRET || "",
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
  };
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, JSON.stringify(buildEnv, null, 2), "utf8");
} catch {
  // safe fallback
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ledger",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
