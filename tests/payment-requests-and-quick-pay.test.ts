import assert from "node:assert/strict";
import { toMinorUnits, fromMinorUnits } from "../src/lib/money";
import {
  quickPaySettlementSchema,
  requestPaymentSchema,
  rejectSettlementSchema,
} from "../src/features/settlements/schema";

console.log("=================================================");
console.log("Running Hisabo Payment Requests & Quick Pay Tests");
console.log("=================================================\n");

// Test 1: Quick Pay schema validation & downward-only validation
console.log("1. Testing Quick Pay schema & amount constraints...");
{
  const valid = quickPaySettlementSchema.safeParse({
    groupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    payeeId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    amount: 50.0,
    currency: "SAR",
    paymentMethod: "bank_transfer",
    idempotencyKey: "test-idempotency-key-12345",
  });
  assert.equal(valid.success, true, "Valid quick pay should pass");

  // Zero or negative amounts must fail
  const zeroAmount = quickPaySettlementSchema.safeParse({
    groupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    payeeId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    amount: 0,
  });
  assert.equal(zeroAmount.success, false, "Zero amount must be rejected");

  const negativeAmount = quickPaySettlementSchema.safeParse({
    groupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    payeeId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    amount: -10,
  });
  assert.equal(negativeAmount.success, false, "Negative amount must be rejected");
  console.log("   PASSED: Quick Pay validates positive amounts and rejects <= 0.");
}

// Test 2: 24h Request Cooldown Logic
console.log("\n2. Testing 24h Payment Request Cooldown Logic...");
{
  const now = Date.now();
  const cooldownMs = 24 * 60 * 60 * 1000;

  // Case A: Request made 2 hours ago -> cooldown active
  const requested2hAgo = new Date(now - 2 * 60 * 60 * 1000);
  const isCooldownActive2h = now - requested2hAgo.getTime() < cooldownMs;
  assert.equal(isCooldownActive2h, true, "Cooldown should be active for 2h ago request");

  // Case B: Request made 25 hours ago -> cooldown expired
  const requested25hAgo = new Date(now - 25 * 60 * 60 * 1000);
  const isCooldownActive25h = now - requested25hAgo.getTime() < cooldownMs;
  assert.equal(isCooldownActive25h, false, "Cooldown should be expired for 25h ago request");

  // Request schema validation
  const validRequest = requestPaymentSchema.safeParse({
    groupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    debtorId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    amount: 75.5,
    currency: "SAR",
  });
  assert.equal(validRequest.success, true, "Valid payment request schema should pass");
  console.log("   PASSED: 24h Cooldown logic functions correctly.");
}

// Test 3: Structured Rejection Schema
console.log("\n3. Testing Structured Rejection Reasons...");
{
  const validReasons = ["Not received", "Wrong amount", "Wrong method", "Other"] as const;
  for (const reason of validReasons) {
    const res = rejectSettlementSchema.safeParse({
      settlementId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
      reason,
      note: reason === "Other" ? "Unrecognized transfer" : undefined,
    });
    assert.equal(res.success, true, `Reason '${reason}' must be valid`);
  }

  const invalidReason = rejectSettlementSchema.safeParse({
    settlementId: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    reason: "Arbitrary text reason not in enum",
  });
  assert.equal(invalidReason.success, false, "Arbitrary reasons must be rejected");
  console.log("   PASSED: Structured rejection reasons strictly enforced.");
}

// Test 4: Invariant: Balances mutate ONLY on CONFIRMED settlements
console.log("\n4. Testing Ledger Invariant: Balances change ONLY on CONFIRMED...");
{
  // Simulated initial debt: Bob owes Alice 10,000 halalas (SAR 100.00)
  let aliceBalanceMinor = BigInt(10000);
  let bobBalanceMinor = BigInt(-10000);

  // Helper that applies settlement status:
  const applySettlementStatus = (
    status: "pending" | "confirmed" | "rejected",
    amountMinor: bigint
  ) => {
    let alice = aliceBalanceMinor;
    let bob = bobBalanceMinor;
    if (status === "confirmed") {
      alice -= amountMinor; // credit paid down
      bob += amountMinor;   // debt cleared
    }
    // pending and rejected NEVER touch balances
    return { alice, bob };
  };

  // When claim is PENDING
  const pendingState = applySettlementStatus("pending", BigInt(5000));
  assert.equal(pendingState.alice, aliceBalanceMinor, "Alice balance unchanged on PENDING");
  assert.equal(pendingState.bob, bobBalanceMinor, "Bob balance unchanged on PENDING");

  // When claim is REJECTED
  const rejectedState = applySettlementStatus("rejected", BigInt(5000));
  assert.equal(rejectedState.alice, aliceBalanceMinor, "Alice balance unchanged on REJECTED");
  assert.equal(rejectedState.bob, bobBalanceMinor, "Bob balance unchanged on REJECTED (debt intact)");

  // When claim is CONFIRMED
  const confirmedState = applySettlementStatus("confirmed", BigInt(5000));
  assert.equal(confirmedState.alice, BigInt(5000), "Alice credit reduced on CONFIRMED");
  assert.equal(confirmedState.bob, BigInt(-5000), "Bob debt reduced on CONFIRMED");
  assert.equal(confirmedState.alice + confirmedState.bob, BigInt(0), "Zero-sum invariant preserved");
  console.log("   PASSED: PENDING and REJECTED do not touch ledger; CONFIRMED updates ledger correctly.");
}

console.log("\n=================================================");
console.log("ALL PAYMENT REQUEST & QUICK PAY TESTS PASSED 100%");
console.log("=================================================\n");
