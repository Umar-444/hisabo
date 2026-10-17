# Hisabo: Payment Requests & Quick Pay — Build Spec

**Date:** 2026-10-15
**Status:** Ready to implement
**Scenario:** user1, user2, user3, user4 go to dinner. user1 pays. user2, user3, user4 owe money.

## 1. Problem

Today only the debtor can start a settlement. There is no way for the person who paid to say "pay me," no quick way to pay from where the amount is shown, and no proper reject path (a "Dispute" button exists next to "Confirm Receipt" but has no defined reject behavior). The loop is one-sided.

## 2. What already exists (do not rebuild)

- Balances page with "Settle Up" button, amount prefilled, method picker ("Bank Transfer (STC Pay / Wire)" etc.)
- "Record Payment & Send Claim" creates a PENDING claim on the Settlements Ledger
- Creditor gets a notification: "X claimed they transferred SAR Y to you. Please confirm receipt or review."
- Creditor's ledger shows the claim with "Did you receive this payment?" banner, "Dispute" and "Confirm Receipt" buttons
- On confirm: CONFIRMED, balances update, debt row clears
- Rule already true: tapping pay never moves money; the debt stays live until the other side confirms

## 3. The new loop (5 steps)

### Step 1. Request payment
On any "You Are Owed" row, the creditor (or group admin) taps **Request**.
Each debtor gets a notification: "Umar requested SAR 50.00 for Team Dinner."
The admin also gets **Remind all** on the group: one tap requests every outstanding debt in the group.

Anti-harassment rule: one request per debtor per debt per 24 hours. The Request button shows a cooldown state ("Requested 2h ago") until the cooldown expires.

### Step 2. Quick pay
The debtor taps the amount **wherever they see it**:
- Dashboard "You Owe" card
- Balances page row
- Expense detail "Your Share" card
- The payment-request notification itself

A bottom sheet opens:
- Amount prefilled with the outstanding balance, **editable downward only** (partial payments allowed, capped at amount owed, must be > 0)
- Method picker (same list as today)
- One button: **"Mark as paid"**
- Button shows a loading state immediately and disables; claim creation uses an idempotency key so one tap can never fire two claims

On submit: claim recorded as PENDING. No balance changes yet.

### Step 3. Approve or reject
The person **owed the money** approves, because only they can verify the money arrived. They see: "Ali claims they paid SAR 50.00" with **Approve** / **Reject**.
- Reject requires a short reason (picker: "Not received", "Wrong amount", "Wrong method", "Other" + optional note).
- The existing "Dispute" button becomes this Reject path with reason.

Admin role: the admin can approve or reject **any** claim in their group as an override (dispute resolution), and every override is written to the audit log with who did it.

Escalation: if the creditor does not respond within 72 hours, the claim escalates: the admin is notified "A SAR 50.00 claim from Ali to Umar has waited 3 days" and can then approve or reject it.

### Step 4. On approve
- Claim → CONFIRMED
- Balances update, debt row clears
- Both sides notified: debtor "Umar confirmed your SAR 50.00 payment. Settled." / creditor "You confirmed Ali's SAR 50.00 payment."

### Step 5. On reject
- Claim → REJECTED with the reason, kept visible in the Settlements Ledger history (rejected claims are ledger facts, never deleted)
- The debt **reappears on the debtor's dashboard** as owed, in full
- Debtor notified plainly: "Your payment was not confirmed (reason: Not received). SAR 50.00 is still owed."
- Creditor sees it back in their outstanding list
- The debtor may submit a new claim after fixing the issue; the 24h request cooldown does not block the debtor from re-paying

## 4. Where the buttons live (UI checklist)

| Surface | User sees | Admin additionally sees |
|---|---|---|
| Dashboard "You Owe" card | Amount is tappable → quick-pay sheet | Same |
| Dashboard "You Are Owed" card | "Request" per debtor row | "Remind all" |
| Balances page, each peer row | "Pay" (if you owe) / "Request" (if owed) | Same + override on claims |
| Expense detail, "Your Share" card | "Pay your share" | Same |
| Payment-request notification | Tap → opens quick-pay sheet directly | Same |
| Settlements Ledger, PENDING claim | "Confirm Receipt" / "Dispute→Reject" (creditor side) | Approve/Reject on any claim |

## 5. Data model changes

`settlement_claims` (extend):
- `status`: add `REJECTED` (existing: PENDING, CONFIRMED; keep DISPUTED mapping to the new Reject flow or retire it)
- `rejection_reason` (enum + note, nullable)
- `idempotency_key` (unique, for double-tap protection)
- `requested_by` (nullable FK → user; set when the claim follows a payment request)
- `decided_by`, `decided_at` (who approved/rejected; null while pending)
- `escalated_to_admin_at` (nullable timestamp)

New `payment_requests` table:
- `id`, `group_id`, `creditor_id`, `debtor_id`, `amount`, `expense_id` (nullable), `requested_at`
- Unique constraint on (group_id, creditor_id, debtor_id) per rolling 24h window (enforce in application logic)

Audit events to add:
- `payment.requested` (who requested, from whom, amount, expense)
- `payment.reminded_all` (admin, group, total debtors pinged)
- `claim.rejected` (who rejected, reason)
- `claim.escalated` (claim id, to admin)

## 6. Business rules (do not skip)

1. Balances change **only** on CONFIRMED. PENDING and REJECTED never touch balances.
2. One PENDING claim per (group, debtor, creditor) at a time. A second claim for the same pair is blocked until the first is decided ("You already have a pending SAR 50.00 claim with Umar.").
3. Partial payments allowed: multiple CONFIRMED claims can chip at one debt; each row shows "SAR 20.00 remaining" until zero.
4. Rejected debt returns in full to the debtor's dashboard immediately on reject.
5. Request cooldown: 24h per (creditor, debtor, debt). Re-paying after a reject is never blocked.
6. Escalation at 72h of creditor silence → admin notified, admin may decide.
7. Admin override of any claim is allowed but always audit-logged.
8. Quick-pay amount is capped at the outstanding balance; zero or negative amounts rejected client- and server-side.
9. All amounts rounded to minor units (2dp) everywhere; no float leakage in the sheet, notifications, or ledger.

## 7. Notifications (exact copy)

- Request: title "Payment requested", body "{creditor} requested {amount} for {expense/group}." → tap opens quick-pay sheet.
- Remind all: one per debtor, same as Request, prefixed "Group reminder:".
- Claim filed: existing copy kept ("{debtor} claimed they transferred {amount} to you. Please confirm receipt or review.").
- Approved: debtor: "{creditor} confirmed your {amount} payment. Settled." / creditor: "You confirmed {debtor}'s {amount} payment."
- Rejected: debtor: "Your payment was not confirmed ({reason}). {amount} is still owed." / creditor: "{debtor}'s {amount} claim was rejected."
- Escalated (admin): "A {amount} claim from {debtor} to {creditor} has waited 3 days and needs your decision."

## 8. Open decisions for Umar

1. **Approver:** creditor-approves with admin override (recommended, spec'd above) vs admin-only approval. Say the word if you want admin-only.
2. **Escalation timeout:** 72h spec'd. Shorter (24h) if groups are fast-moving.
3. **Request cooldown:** 24h spec'd. Shorter if you want more aggressive reminders.

## 9. Acceptance test checklist

- [ ] Creditor taps Request → debtor gets notification with correct amount and expense name; tap opens quick-pay sheet with amount prefilled
- [ ] Request button shows cooldown for 24h; second request blocked with clear message
- [ ] Admin "Remind all" pings every debtor with outstanding debt, exactly once each
- [ ] Quick pay from all four surfaces (dashboard card, balances row, expense share card, notification) opens the same sheet
- [ ] Sheet amount editable downward only; entering more than owed is rejected
- [ ] Double-tap / double-submit creates exactly one PENDING claim (idempotency)
- [ ] Second PENDING claim for the same pair blocked while first is undecided
- [ ] Balances unchanged while claim is PENDING
- [ ] Creditor Approve → CONFIRMED, balances update, both notified, debt row clears
- [ ] Creditor Reject with reason → REJECTED kept in ledger history, debt reappears on debtor dashboard in full, both notified with the reason
- [ ] Debtor can file a new claim after a reject
- [ ] Partial claim (30 of 50) → CONFIRMED, row shows "SAR 20.00 remaining"
- [ ] 72h creditor silence → admin notified, admin can approve/reject, override appears in audit log
- [ ] Rounding: 33.33 + 33.33 + 33.34 style splits still sum exactly; no float artifacts in sheet, notifications, or ledger
