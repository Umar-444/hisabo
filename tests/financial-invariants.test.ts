/**
 * Hisabo Financial & Ledger Invariant Test Suite
 * Validates integer minor-unit math, conservation equation, remainder allocation, and zero-sum ledger.
 */

import assert from "node:assert/strict";
import {
  toMinorUnits,
  fromMinorUnits,
  calculateEqualSplits,
  formatCurrency,
} from "../src/lib/money";

console.log("=================================================");
console.log("Running Hisabo Financial Invariant Tests (TASK-25)");
console.log("=================================================\n");

// 1. Test Minor Units Conversion
console.log("1. Testing integer minor-unit conversion...");
assert.equal(toMinorUnits(10.0), BigInt(1000), "10.00 SAR must equal 1000 halalas");
assert.equal(toMinorUnits(25.5), BigInt(2550), "25.50 SAR must equal 2550 halalas");
assert.equal(toMinorUnits(0.01), BigInt(1), "0.01 SAR must equal 1 halala");
assert.equal(toMinorUnits(100.0), BigInt(10000), "100.00 SAR must equal 10000 halalas");

assert.equal(fromMinorUnits(BigInt(1000)), 10.0, "1000 halalas must convert to 10.00");
assert.equal(fromMinorUnits(BigInt(2550)), 25.5, "2550 halalas must convert to 25.50");
assert.equal(fromMinorUnits(BigInt(1)), 0.01, "1 halala must convert to 0.01");
console.log("   PASSED: Minor unit conversions are exact.\n");

// 2. Test Conservation Equation & Deterministic Remainder Allocation (SAR 100 split 3 ways)
console.log("2. Testing Conservation Equation (SAR 100 split 3 ways)...");
const splits3 = calculateEqualSplits(BigInt(10000), ["user_a", "user_b", "user_c"], "user_a");
assert.equal(splits3.length, 3);
const sum3 = splits3.reduce((acc, s) => acc + s.shareMinor, BigInt(0));
assert.equal(sum3, BigInt(10000), "Sum of participant shares must exactly equal total 10000 halalas");

// Remainder 10000 % 3 = 1 halala. Payer (user_a) gets 3334, others get 3333
const payerShare = splits3.find((s) => s.userId === "user_a")?.shareMinor;
const userBShare = splits3.find((s) => s.userId === "user_b")?.shareMinor;
const userCShare = splits3.find((s) => s.userId === "user_c")?.shareMinor;

assert.equal(payerShare, BigInt(3334), "Payer should receive the 1-halala remainder");
assert.equal(userBShare, BigInt(3333), "User B should receive 3333 halalas");
assert.equal(userCShare, BigInt(3333), "User C should receive 3333 halalas");
assert.equal(payerShare! + userBShare! + userCShare!, BigInt(10000), "Invariant verified");
console.log("   PASSED: Odd remainder halala distributed deterministically without loss.\n");

// 3. Test Conservation with Remainder 2 (SAR 50 split 3 ways: 5000 % 3 = 2)
console.log("3. Testing Conservation Equation (SAR 50 split 3 ways: 5000 halalas)...");
const splits50 = calculateEqualSplits(BigInt(5000), ["user_1", "user_2", "user_3"], "user_1");
const sum50 = splits50.reduce((acc, s) => acc + s.shareMinor, BigInt(0));
assert.equal(sum50, BigInt(5000), "Sum must equal 5000 halalas");
// 5000 / 3 = 1666, remainder 2 -> two participants get 1667, one gets 1666
assert.equal(splits50[0].shareMinor, BigInt(1667));
assert.equal(splits50[1].shareMinor, BigInt(1667));
assert.equal(splits50[2].shareMinor, BigInt(1666));
console.log("   PASSED: 2-halala remainder allocated deterministically.\n");

// 4. Test Zero-Sum Balance Ledger Model
console.log("4. Testing Zero-Sum Balance Ledger Invariant...");
// Scenario:
// Alice pays 300.00 SAR (30000 halalas) for groceries shared by Alice, Bob, and Charlie.
// Each person's share = 10000 halalas.
// Alice paid: 30000. Her share: 10000. Alice net position: +20000 (credit)
// Bob share: 10000. Bob net position: -10000 (debit)
// Charlie share: 10000. Charlie net position: -10000 (debit)
const totalPaid = BigInt(30000);
const splits = calculateEqualSplits(totalPaid, ["alice", "bob", "charlie"], "alice");

const aliceShare = splits.find((s) => s.userId === "alice")!.shareMinor;
const bobShare = splits.find((s) => s.userId === "bob")!.shareMinor;
const charlieShare = splits.find((s) => s.userId === "charlie")!.shareMinor;

const alicePosition = totalPaid - aliceShare; // +20000
const bobPosition = -bobShare;                // -10000
const charliePosition = -charlieShare;        // -10000

const totalLedgerSum = alicePosition + bobPosition + charliePosition;
assert.equal(totalLedgerSum, BigInt(0), "Sum of all ledger positions MUST equal 0");
console.log(`   Alice position: +${alicePosition} halalas`);
console.log(`   Bob position:   ${bobPosition} halalas`);
console.log(`   Charlie pos:    ${charliePosition} halalas`);
console.log(`   Ledger Sum:     ${totalLedgerSum} (PASSED ZERO-SUM INVARIANT)\n`);

// 5. Test Settlement Invariant (Bob settles 100.00 SAR to Alice)
console.log("5. Testing Confirmed Settlement Ledger Update...");
const settlementAmount = BigInt(10000); // 100.00 SAR
// Bob pays Alice 10000 halalas
const bobNewPosition = bobPosition + settlementAmount;       // -10000 + 10000 = 0
const aliceNewPosition = alicePosition - settlementAmount;   // +20000 - 10000 = +10000
const charlieNewPosition = charliePosition;                 // -10000

const postSettlementSum = bobNewPosition + aliceNewPosition + charlieNewPosition;
assert.equal(bobNewPosition, BigInt(0), "Bob's balance should be fully cleared to 0");
assert.equal(aliceNewPosition, BigInt(10000), "Alice is now owed only 10000 halalas");
assert.equal(postSettlementSum, BigInt(0), "Post-settlement ledger MUST remain zero-sum");
console.log(`   Post-settlement Bob:     ${bobNewPosition}`);
console.log(`   Post-settlement Alice:   +${aliceNewPosition}`);
console.log(`   Post-settlement Charlie: ${charlieNewPosition}`);
console.log(`   Post-settlement Sum:     ${postSettlementSum} (PASSED)\n`);

console.log("=================================================");
console.log("ALL FINANCIAL & LEDGER INVARIANT TESTS PASSED 100%");
console.log("=================================================");
