# Hisabo QA Re-Test Report — 2026-10-15 (Round 2)

Re-test after the owner fixed all Round-1 bugs (report: Hisabo-QA-Report-2026-10-14.md).
Existing test accounts still worked; added User 3 (umarpak995+hisabotest3@gmail.com @umarqa3)
and User 4 (umarpak995+hisabotest4@gmail.com @umarqa4), password HisaboTest123! for all.
New group "QA Round 2" (9f9f90da-f58a-458b-b552-7c81659e6779), SAR. Nothing deleted.

## Round-1 bugs: fix verdict

| # | Bug | Verdict |
|---|-----|---------|
| 1 | Expense creation failed ("No transactions support in neon-http driver") | FIXED. 4 expenses created, zero errors. |
| 2 | Invite-link Accept button dead | FIXED. Accept → joined + redirected. Single-use reuse → "Invite Limit Reached" page. Tampered token → "Invalid Invitation Link". Already-member accept → idempotent redirect. |
| 3 | Phantom "Recent Activity" demo data on fresh accounts | FIXED. New accounts show clean SAR 0.00, "No expenses recorded yet". |
| 4 | Members could generate/revoke invites (RBAC inverted) | FIXED. Members see "Admin Permission Required" on both direct-add and shareable-link tabs; no Revoke buttons. |
| 5 | /api/health 404 | FIXED. Now 200 JSON {"status":"healthy","service":"hisabo","version":"0.1.0",...}. |
| 8 | "Forgot password?" dead link | FIXED. Now routes to /reset-password (flow itself not tested). |
| 9 | /admin/login printed demo credentials | FIXED. Only placeholder text now. |
| 19 | Viewport blocked pinch zoom | FIXED. Now width=device-width, initial-scale=1. |
| 20 | No apple-touch-icon | FIXED. /apple-touch-icon.png present. |
| 21 | Duplicate manifest tags | FIXED. Single /manifest.webmanifest. |
| 24 | 404 page had no home action | FIXED. Now "Go to Dashboard" + "Home Page". |
| 23 | /ledger 404 | STILL PRESENT. No such page. |
| 25 | Footer "All Ledger Systems Operational" | STILL PRESENT. |

## Full user flow (Round 2)

1. **Group**: PASS. "QA Round 2" created; name/description editable after creation (rename verified). Currency NOT editable — SAR fixed at user level, no currency control in create or edit forms.
2. **Invites**: PASS. 7-day multi-use link generated; User 2 added directly by email (instant); User 3 joined via single-use link.
3. **Expenses** (all saved, correct shares visible to all 3 members): E1 "Monthly Fiber Internet" 320 SAR, U1 paid, equal U1/U2 → 160/160. E2 "Dinner at Al Baik" 160 SAR, U2 paid, equal → 80/80. E3 "Grocery Run" 100 SAR, U1 paid, custom 50/30/20. E4 "Tea Supplies" 100 SAR, U1 paid, equal 3-way.
4. **Rounding**: PASS. E4 → 33.34 + 33.33 + 33.33 = exactly 100.00 ("Zero-Loss Verified", "✓ Exact match: SAR100.00").
5. **Balances**: PASS, matched independent arithmetic. Before settlement: U1 +196.66 (Ali Test +143.33 = 160−80+30+33.33; Umar Test 3 +53.33 = 20+33.33). U2 −143.33 to Umar Test. U3 −53.33 to Umar Test.
6. **Settlement**: PASS. U2 claimed "You paid Umar Test — QA Round 2 · Bank Transfer · SAR 143.33 — PENDING" (note: prefill showed full float 143.3300018310547). U1 confirmed → CONFIRMED. Balances updated: U1 +53.33 (only U3 owes), U2 "0.00 Settled". Confirm-without-claim: no pending item → no confirm control. Double-confirm: confirmed item shows no Confirm/Dispute buttons → impossible via UI.
7. **Multi-currency**: NOT SUPPORTED at user level. Expense form is SAR-only; group currency fixed. Landing page markets SAR/USD/AED segregated ledgers — marketing/reality gap.
8. **Notifications** (who gets what): Expense added → all other members ("New Expense: X — Your split share is N SAR"). Direct-add → "Added to QA Round 2" (U2). Join via link → "New Flatmate Joined" went ONLY to owner/inviter U1, NOT to existing member U2. Settlement claimed → creditor ("Settlement Payment Claimed — Ali Test claimed they transferred SAR 143.33 to you. Please confirm receipt or review."). Settlement confirmed → debtor ("Settlement Confirmed — Your payment of SAR 143.33 was confirmed by Umar Test."). No notification for pre-join expenses (correct).
9. **Edit/delete expense**: NO UI EXISTS anywhere (expense detail, Expenses feed, group history). Only "Dispute this expense". New functional gap — untestable.
10. **Logout**: PASS for all 4 users. Logged-out /dashboard → /login?from=%2Fdashboard. Sessions truly end.

## New issues found (Round 2)

- **Functional gap**: no expense Edit/Delete UI anywhere. Decide: build it or document immutability as a design choice.
- **Info/privacy**: new members see FULL pre-join expense history including per-share breakdowns and pending/accept statuses (verified: U3 viewed E1 detail). Consider hiding history before join date.
- **Minor**: consumed single-use invite link shows confusing "Invite Limit Reached" heading (body text is clear).
- **Minor**: members can still SEE active invite links with a Copy-link button in the Shareable Link tab (invite enumeration by non-admins) — consider hiding the tab entirely for members.
- **Minor**: landing page markets multi-currency (SAR/USD/AED) but only SAR is usable.
- **Info**: "Fill Demo" email+password persist via localStorage across sessions.

## Information disclosure audit (public site → stack/admin/repo clues)

Every public clue found, with location:

1. Landing page "Developer Hub & Engineering" section (#developers, nav "Developer Hub"): names **Next.js 16 & React 19, Neon PostgreSQL, Drizzle ORM & Zod, Sliding-Window Limiter**, with internals ("Server Components by default, minimal client islands, Turbopack, type-safe server actions", "Serverless PostgreSQL with connection pooling, strict ACID transactions, BIGINT minor units", "typed migrations", "In-memory TTL sliding window rate limiting on authentication and invite join endpoints" — the last one leaks a security control).
2. Landing page buttons: "Endpoint: /api/health" → /api/health; "Admin Portal & Currency Controller" → /admin; "GitHub: Umar-444/hisabo" → https://github.com/Umar-444/hisabo.
3. Footer "Developers" column: Health Endpoint (/api/health), Admin Portal (/admin), GitHub Repository. "Financial Engine" column: Currency Manager (/admin/currencies).
4. Footer bottom bar: "Next.js 16 · React 19 · Tailwind CSS v4 · Neon PostgreSQL". Status pill: "All Ledger Systems Operational".
5. Login page: "Admin Console →" link → /admin/login; "Test Account: umar@hisabo.com" + "Fill Demo" button prefilling BOTH email and password (public demo credential; persists via localStorage).
6. /admin/login: reachable, no longer prints credentials, but publicly linked from login page and landing page.
7. /api/health: public 200 returning service name + version ({"status":"healthy","service":"hisabo","version":"0.1.0",...}).
8. HTML head: JS chunks at /_next/static/chunks/ (Next.js giveaway), one chunk named turbopack-1tfoo0t7pz5vg.js (Turbopack giveaway); Cloudflare beacon https://static.cloudflareinsights.com/beacon.min.js with token 2ed4659614a4407a946e4c9805c645f9 (reveals Cloudflare + analytics token). Manifest clean; icons fine.
9. /robots.txt: exists; NO User-agent/Disallow rules; does NOT list /admin or sensitive paths (good); only AI content-signal boilerplate.
10. Response headers: could not check (browser tool limitation).

## Prioritized advice: hiding the clues

1. **Remove or gate the "Developer Hub & Engineering" section** — the single biggest leak: exact versions plus security-control internals. Move it to a private README or a logged-in developer page.
2. **Remove public links** to /api/health, /admin, /admin/currencies, and the GitHub repo from the landing page, footer, and login page.
3. **Remove the footer stack badges** ("Next.js 16 · React 19 · Tailwind CSS v4 · Neon PostgreSQL").
4. **Remove the public demo credential**: drop the "Fill Demo" password prefill (keep at most a demo email hint, or remove the demo entirely).
5. **Unlink /admin/login** everywhere (no "Admin Console →" link) and consider hardening (rate limiting already exists; consider IP allowlist).
6. **Restrict or de-advertise /api/health** — a public endpoint returning service name + version is a fingerprinting aid. Keep it for monitoring, but stop linking it.
7. **Remove the "All Ledger Systems Operational" status claim** (also unverifiable).
8. **robots.txt**: leave as-is. Do NOT add unlinked sensitive paths (that would advertise them). Adding `Disallow: /admin/` and `/api/` is acceptable only because they are already publicly linked.
9. Decide on expense edit/delete UI vs documented immutability.
10. Align the multi-currency marketing with the SAR-only reality (or ship the Currency Controller to users).

## Not tested

Response headers (tool limitation). /reset-password flow (needs email/code). Admin panel login (out of scope). Actual email delivery. Expense edit/delete (no UI exists). Whether /api/health publicity is intentional (owner decision).
