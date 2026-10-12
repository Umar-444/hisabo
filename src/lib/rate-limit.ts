import { headers } from "next/headers";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  error?: string;
}

export const RATE_LIMIT_PRESETS = {
  // Login: 5 attempts per 60 seconds per IP/email
  LOGIN: { maxRequests: 5, windowSeconds: 60 },

  // Registration: 3 accounts per 120 seconds per IP
  REGISTER: { maxRequests: 3, windowSeconds: 120 },

  // Group Invite Join: 10 token attempts per 60 seconds
  INVITE_JOIN: { maxRequests: 10, windowSeconds: 60 },

  // Sensitive actions (e.g. currency toggle, member removal): 30 requests per 60 seconds
  SENSITIVE: { maxRequests: 30, windowSeconds: 60 },
} as const;

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store attached to globalThis to persist across hot reloads in dev
const store = ((globalThis as any).__hisabo_rate_limit_store ||
  new Map<string, RateLimitRecord>()) as Map<string, RateLimitRecord>;

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).__hisabo_rate_limit_store = store;
}

// Periodic cleanup every 5 minutes to prevent memory accumulation
if (!(globalThis as any).__hisabo_rate_limit_cleanup_installed) {
  (globalThis as any).__hisabo_rate_limit_cleanup_installed = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      // Retain only entries active in the last 10 minutes
      const valid = record.timestamps.filter((ts) => now - ts < 600_000);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        record.timestamps = valid;
      }
    }
  }, 300_000);
}

/**
 * Extracts client IP safely from request headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // If called outside Next request context
  }
  return "127.0.0.1";
}

/**
 * Checks sliding window rate limit for an identifier key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Purge expired timestamps
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= config.maxRequests) {
    const oldest = record.timestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetInSeconds,
      error: `Too many requests. Please wait ${resetInSeconds} second${
        resetInSeconds > 1 ? "s" : ""
      } before trying again.`,
    };
  }

  // Record this attempt
  record.timestamps.push(now);

  const remaining = Math.max(0, config.maxRequests - record.timestamps.length);
  const oldest = record.timestamps[0] || now;
  const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    resetInSeconds,
  };
}
