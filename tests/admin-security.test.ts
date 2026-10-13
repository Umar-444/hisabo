import assert from "node:assert";
import { createToken, verifyToken } from "../src/lib/auth/admin-session";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "../src/lib/rate-limit";

console.log("=================================================");
console.log("Running Hisabo Admin Security Test Suite");
console.log("=================================================\n");

// 1. Valid token creation and verification
console.log("1. Testing Admin Token Creation & HMAC Verification...");
const validSession = {
  id: "admin-system-root-001",
  email: "admin@hisabo.com",
  name: "Hisabo Administrator",
  role: "admin" as const,
};
const token = createToken(validSession);
const verified = verifyToken(token);
assert(verified !== null, "Token should be verified successfully");
assert.strictEqual(verified.email, "admin@hisabo.com", "Email should match");
assert.strictEqual(verified.role, "admin", "Role must be admin");
console.log("   PASSED: Admin token HMAC verified.\n");

// 2. Tampered token rejection
console.log("2. Testing Tampered Token Signature Rejection...");
const [base64, signature] = token.split(".");
const tamperedToken = `${base64}.${signature.slice(0, -2)}aa`;
const tamperedResult = verifyToken(tamperedToken);
assert.strictEqual(tamperedResult, null, "Tampered signature must be rejected");
console.log("   PASSED: Tampered signatures strictly rejected.\n");

// 3. Expired token rejection
console.log("3. Testing Expired Token Rejection...");
const expiredPayload = {
  ...validSession,
  expiresAt: Date.now() - 1000, // 1 second ago
};
const crypto = require("crypto");
const secret = process.env.AUTH_SECRET || "hisabo-super-secret-admin-key-2026-production";
const expJson = JSON.stringify(expiredPayload);
const expBase64 = Buffer.from(expJson).toString("base64url");
const hmac = crypto.createHmac("sha256", secret);
hmac.update(expBase64);
const expSig = hmac.digest("hex");
const expiredToken = `${expBase64}.${expSig}`;
const expResult = verifyToken(expiredToken);
assert.strictEqual(expResult, null, "Expired token must be rejected");
console.log("   PASSED: Expired tokens rejected.\n");

// 4. Non-admin role rejection
console.log("4. Testing Non-Admin Role Rejection...");
const userPayload = {
  id: "usr-regular-001",
  email: "user@example.com",
  name: "Regular User",
  role: "user" as any,
  expiresAt: Date.now() + 100000,
};
const userJson = JSON.stringify(userPayload);
const userBase64 = Buffer.from(userJson).toString("base64url");
const userHmac = crypto.createHmac("sha256", secret);
userHmac.update(userBase64);
const userSig = userHmac.digest("hex");
const userToken = `${userBase64}.${userSig}`;
const userResult = verifyToken(userToken);
assert.strictEqual(userResult, null, "Tokens without admin role must be rejected");
console.log("   PASSED: Non-admin roles rejected by admin verifier.\n");

// 5. Admin Login Rate Limiting
console.log("5. Testing Admin Login Rate Limiting...");
const testIp = `192.168.99.${Math.floor(Math.random() * 200) + 1}`;
for (let i = 0; i < RATE_LIMIT_PRESETS.LOGIN.maxRequests; i++) {
  const check = checkRateLimit(`admin:login:ip:${testIp}`, RATE_LIMIT_PRESETS.LOGIN);
  assert.strictEqual(check.success, true, `Attempt ${i + 1} should be permitted`);
}
// Next attempt must exceed rate limit
const blockedCheck = checkRateLimit(`admin:login:ip:${testIp}`, RATE_LIMIT_PRESETS.LOGIN);
assert.strictEqual(blockedCheck.success, false, "6th attempt must be rate limited");
assert(blockedCheck.resetInSeconds > 0, "Reset in seconds must be positive");
console.log("   PASSED: Sliding window rate limit locks out excessive brute-force attempts.\n");

console.log("=================================================");
console.log("ALL ADMIN SECURITY TESTS PASSED 100%");
console.log("=================================================");
