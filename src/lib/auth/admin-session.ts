import { cookies } from "next/headers";
import crypto from "crypto";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: "admin";
  expiresAt: number;
}

const COOKIE_NAME = "hisabo_admin_session";
const SECRET = process.env.AUTH_SECRET || "hisabo-super-secret-admin-key-2026-production";

// Hardcoded initial superadmin credentials for immediate access & verification
export const DEFAULT_ADMIN = {
  id: "admin-system-root-001",
  email: "admin@hisabo.com",
  password: "Admin@Hisabo2026!",
  name: "Hisabo Administrator",
  role: "admin" as const,
};

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createToken(session: Omit<AdminSession, "expiresAt">): string {
  // 7 days expiration
  const fullSession: AdminSession = {
    ...session,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const json = JSON.stringify(fullSession);
  const base64 = Buffer.from(json).toString("base64url");
  const signature = sign(base64);
  return `${base64}.${signature}`;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const [base64, signature] = token.split(".");
    if (!base64 || !signature) return null;

    const expectedSignature = sign(base64);
    if (signature !== expectedSignature) return null;

    const json = Buffer.from(base64, "base64url").toString("utf8");
    const session: AdminSession = JSON.parse(json);

    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAdminSessionCookie(session: Omit<AdminSession, "expiresAt">) {
  const token = createToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
