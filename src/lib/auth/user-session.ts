import { cookies } from "next/headers";
import crypto from "crypto";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  expiresAt: number;
}

const COOKIE_NAME = "hisabo_user_session";
const SECRET = process.env.AUTH_SECRET || "hisabo-super-secret-user-key-2026";

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createToken(session: Omit<UserSession, "expiresAt">): string {
  // 30 days session
  const fullSession: UserSession = {
    ...session,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const json = JSON.stringify(fullSession);
  const base64 = Buffer.from(json).toString("base64url");
  const signature = sign(base64);
  return `${base64}.${signature}`;
}

export function verifyToken(token: string): UserSession | null {
  try {
    const [base64, signature] = token.split(".");
    if (!base64 || !signature) return null;

    const expectedSignature = sign(base64);
    if (signature !== expectedSignature) return null;

    const json = Buffer.from(base64, "base64url").toString("utf8");
    const session: UserSession = JSON.parse(json);

    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setUserSessionCookie(session: Omit<UserSession, "expiresAt">) {
  const token = createToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearUserSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
