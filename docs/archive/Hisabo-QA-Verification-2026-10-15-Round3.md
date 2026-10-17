# Hisabo QA Verification Report — 2026-10-15 (Round 3)

Verification of the Round-2 fixes (report: Hisabo-QA-ReTest-2026-10-15.md).
All test accounts reused (password HisaboTest123!); new user umarqa5 created for
privacy testing. New groups "QA Round 3" (SAR, settled to zero) and "QA USD Test"
(USD, one 25 USD expense) left in place. Nothing deleted.

## Round-2 findings: fix verdict

| # | Finding | Verdict |
|---|---------|---------|
| 1 | No expense Edit/Delete UI | DELETE: FIXED. "Cancel & Void Expense" works end-to-end (90 SAR test expense voided; balances reverted exactly +53.33/0.00/-53.33; audit log grew). EDIT: NOT VERIFIED — a transient menu ("Dispute this expense" / "Edit Expense" / "Delete") appeared once on first load of an expense detail page but could not be reproduced in ~15 attempts. No persistent Edit control exists. |
| 2 | New members see full pre-join expense history | STILL PRESENT. New user umarqa5 joined QA Round 2 and sees all 4 pre-join expenses with full per-share breakdowns ("Umar Test @umarqa1 SAR 160.00 ACCEPTED", "Ali Test @aliqa2 SAR 160.00 PENDING", payer identity, date). No redaction. |
| 3 | Confusing "Invite Limit Reached" heading on consumed single-use link | FIXED. Now "Invitation Already Used" / "This single-use personal invite link has already been claimed." + Back to Dashboard. |
| 4 | Members could see/copy active invite links | FIXED. Member view shows only "Admin Permission Required" on both invite tabs; no links, no Copy, no Revoke. |
| 5 | Multi-currency marketed but SAR-only | FIXED — now real. Group creation has a default-currency selector (SAR, AED, EUR, GBP, USD). Verified: "QA USD Test" group in USD, "QA USD Coffee" 25 USD expense saved with zero-loss check; dashboard shows SAR/USD partition toggle. |
| 6 | "Fill Demo" prefilled email+password (localStorage) | FIXED. Button removed entirely; fields empty after logout + fresh load. |
| 7 | /ledger 404 | FIXED. Redirects to /dashboard (logged in) or /login (logged out); no UI references remain. |
| 8 | Footer "All Ledger Systems Operational" | FIXED. Footer now: "Secure & Auditable", "Zero Floating-Point Loss", "Privacy First". |
| 9a | "Developer Hub & Engineering" section (stack + internals) | FIXED. Gone from landing page. |
| 9b | Footer stack badges | FIXED. Gone. |
| 9c | Public links to /api/health, /admin, GitHub repo | FIXED. Footer links are only Features, Dashboard, Group Ledgers, Net Balances, Settlements, Sign In, Create Free Account, Reset Password, Install App. |
| 9d | Login page "Admin Console →" link | FIXED. Gone. |
| 9e | /admin/login reachable | STILL PRESENT (delinked). Renders full admin login form: "Internal Console / Hisabo Admin Console", email field prefilled "admin@hisabo.com", password field, "Sign In to Admin Console". |
| 9f | /api/health public | STILL PRESENT (delinked). Returns {"status":"healthy","service":"hisabo","version":"0.1.0","timestamp":"..."} with no auth. |

## Regression check (core money flow)

All PASS, no regressions:
- "QA Round 3" (SAR) created; User 2 added → "Ali Test has been added to the group!"
- Equal-split expense "QA Round 3 Dinner" 100 SAR: live breakdown 50/50, "Zero-Loss Check: Exact match: SAR100.00", saved.
- Balances matched independent arithmetic: User1 +50.00 "Owed by pool", User2 −50.00 "Owes pool".
- Settlement: User 2 claimed 50 SAR (Bank Transfer) → PENDING; User 1 got the notification → Confirmed Receipt → CONFIRMED; both balances 0.00 ("All balances squared away").
- Notifications: User 2 received "New Expense: QA Round 3 Dinner ... Your split share is 50 SAR." and "Settlement Confirmed — Your payment of SAR 50.00 was confirmed by Umar Test."
- Logout ends sessions; logged-out /dashboard → /login.

Zero-loss invariant held on every expense ("Zero-Loss Verified", dashboard "Ledger Invariant 100% OK").

## Remaining items (for the owner to decide)

1. **Edit expense**: the transient "Edit Expense" menu item suggests an edit feature exists but its trigger is unreachable. Either wire up a real Edit control or remove the ghost menu entry. (Delete/void works fine.)
2. **Pre-join history**: still fully visible to new members. Decide: intended (transparency) or fix (scope history to post-join).
3. **/admin/login**: unlinked but reachable, with the admin email prefilled. Consider removing the prefill and hardening (the login page no longer links it, which is the main win).
4. **/api/health**: unlinked but public with version string. Consider restricting to monitoring IPs or removing the version field — or accept as-is.

## Not tested

Editing an expense amount (no reproducible Edit control). Expense detail as group owner for someone else's expense (owner==creator in test groups). /admin/currencies and the GitHub URL directly (no public links remain; deep URLs not probed).
