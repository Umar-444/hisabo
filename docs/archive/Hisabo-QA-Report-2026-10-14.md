# Hisabo QA Report — 2026-10-14

Full black-box test of https://hisabo.itsumarfarooq.com/ (roommate shared-expense ledger).
Tested as visitor, as two fresh users connected in one group, on desktop flows plus a PWA/manifest audit.
Mobile-viewport visual layout could NOT be tested (the test browser has no viewport/device emulation).

## Test accounts (left intact for inspection, nothing deleted)

- User 1: umarpak995+hisabotest1@gmail.com / HisaboTest123! — name "Umar Test", username umarqa1, OWNER of group "Riyadh Flat QA"
- User 2: umarpak995+hisabotest2@gmail.com / HisaboTest123! — name "Ali Test", username aliqa2, MEMBER of the group
- Group: "Riyadh Flat QA" (id c799af5e-b614-44ba-a8c9-b15c43b2210c), SAR, 2 members, 0 expenses (creation blocked, see Bug 1)
- Owner invite link (multi-use, 7-day): https://hisabo.itsumarfarooq.com/groups/join/6b9560e727d20cf9a4d3df4ba790706a725f7deba666c243
- No email verification was required at signup for either account (instant login to /dashboard).

## What passed

- Landing page loads; all ~35 links resolve.
- Login works; wrong-password and unknown-email errors shown.
- Signup validation works (empty, bad email, short password, duplicate email all rejected with clear messages). Password policy is min-6 only, no complexity, and signup has no password-confirmation field (only Settings → Change Password has one).
- Dashboard, Groups, Expenses feed, Balances, Settlements, Notifications, Settings (4 tabs) all render with sane empty states.
- Group creation works ("Riyadh Flat QA", SAR). Currencies offered: SAR, AED, EUR, GBP, USD.
- Invite generation (24h/7d/30d, single/multi-use) and direct username/email add work.
- Tampered invite token shows a clean "Invalid Invitation Link" page.
- Expense form UX is good: live split preview, "Exact match" zero-loss check, equal/custom split, categories, paid-by selector. Client-side validation blocks empty title, zero/negative amounts, non-numeric input. A `<script>` title is stored as plain text, no execution.
- Profile rename saves. Logout fully ends the session.
- Auth guards pass: logged-out visits to /dashboard, /groups, /balances, /settings, /groups/<id> all redirect to /login; no data leaked.

## Bugs

### BLOCKER

1. **Expense creation always fails: "No transactions support in neon-http driver".** Login → any group → Add Expense → valid data → "Record Expense · Split Now" → red error banner, nothing saved (tried 3x as User 1, 1x as User 2, incl. 2-person split). The landing page advertises "strict ACID transactions" on Neon PostgreSQL, but the deployed driver (neon-http) does not support explicit transactions, so the write path is fundamentally broken. This single bug blocks ALL of: expense CRUD, balances, settlements, the 100/3 rounding-invariant check, and multi-currency ledger tests. Likely fix: switch to the pooled/websocket Neon driver, or restructure writes to avoid explicit transactions.

### MAJOR

2. **Invite-link "Accept Invitation & Join" button does nothing.** As User 2, open /groups/join/<valid-token> → "VERIFIED GROUP INVITE — Join Riyadh Flat QA" → click Accept (4 attempts incl. reload) → no navigation, no error, no loading state. Workaround that worked: owner adding via the Username/Email tab.
3. **Phantom demo data for brand-new users.** Both fresh test accounts saw dashboard "Recent Activity: Dinner with friends — Paid by roommate · 4 participants · -SAR 160.00 · Total: SAR 160.00" while Owed-to-You/You-Owe were SAR 0.00. Hardcoded demo data presented as the user's own ledger activity.
4. **Invite RBAC is inverted/missing.** As a MEMBER (aliqa2), the Shareable Link tab is fully functional: generated a working invite link and "Revoke link" buttons are visible. The "Only admins can invite" notice appeared for the OWNER but not the member. Expected: only admins can generate/revoke invites.

### MINOR

5. /api/health returns a Next.js 404 although linked twice on the landing page ("Endpoint: /api/health", footer "Health Endpoint").
6. "Explore Live Demo" links to #features — there is no live demo.
7. "Install Web App Free" (PWA section) links to /register, not an install flow.
8. "Forgot password?" links to /login itself — no reset flow exists.
9. /admin/login publicly prints demo credentials (admin@hisabo.com / Admin@Hisabo2026!). Not used during testing. Either remove or gate behind proper admin auth.
10. Possible credential persistence: login password field appeared pre-filled after logout/fresh loads, and Settings → Change Password inputs rendered pre-populated (values masked, unconfirmed). Owner should verify real credential values are not left in the DOM.
11. No way to edit group name/description/currency after creation (only Transfer Ownership / Archive Group under Governance).
12. Settings shows a "Verified" email badge though no email verification ever happens.
13. Login user enumeration: distinct "Incorrect password" vs "No account found with this email" messages let attackers probe which emails are registered.
14. Stale login error not cleared after clicking "Fill Demo".
15. Sidebar/in-app links intermittently fail to navigate on click (dashboard card, group link, "Add Expense" link); direct URL entry worked.
16. No notification generated when a user is directly added to a group (User 2's notification center stayed empty).
17. No max-amount validation: 999999999999 accepted; internal float64 value showed 999999995904 (precision loss) — undermines the "zero-loss integer arithmetic" claim.
18. Expense description has no maxlength (600 chars accepted client-side).

### PWA / MOBILE-ONLY (minor)

19. Viewport meta disables pinch zoom: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no` (WCAG/a11y issue).
20. No apple-touch-icon link (only 48px favicon.ico) — iOS home-screen installs get a screenshot icon.
21. Duplicate `<link rel="manifest" href="/manifest.webmanifest">` tags in `<head>`.
22. Manifest `orientation: "portrait-primary"` locks out landscape.
23. /ledger 404s; the landing page's phone mockup shows a bottom tab bar with a "Ledger" tab that does not exist in the real app nav.
24. 404 page has no "back home" action (only the header logo links home).
25. Footer claims "All Ledger Systems Operational" while core ledger writes are broken.

## PWA audit

- Manifest /manifest.webmanifest is valid: name "Hisabo - Shared Expenses", short_name "Hisabo", start_url "/dashboard", scope "/", display "standalone", background_color #F1F5F9, theme_color #185CFF (matches meta), icons 192+512 purpose "any maskable", both icon URLs load. apple-mobile-web-app-capable and status-bar-style meta present.
- Service-worker registration and the advertised "offline shell" could NOT be verified (no JS execution / offline emulation in the test browser). No install prompt appeared during testing, though a PwaInstallPrompt component exists in the JS bundle.
- Installability: HTTPS yes + manifest yes + service worker unknown → not confirmable.
- Mobile-viewport layout (overflow, tap targets, menus, tables on a phone screen) could NOT be visually tested — needs a real phone or device emulation.

## Fix-first priority order

1. Expense creation (neon-http transactions) — the app cannot perform its core function; every money flow depends on it.
2. Invite-link Accept button — second broken core flow (onboarding).
3. Member invite RBAC — any member can mint/revoke invite links.
4. Remove the phantom "Dinner with friends" demo activity for real new users.
5. Remove public admin demo credentials from /admin/login (or gate behind proper admin auth).
6. Fix or remove the /api/health link (404).
7. Then the minors: forgot-password dead link, zoom-blocking viewport meta, apple-touch-icon, misleading CTAs ("Live Demo", "Install Web App Free"), "Verified" email badge, amount/title length caps, group settings editing.

## Not tested (and why)

- Expense view/edit/delete, rounding invariant (100/3), multi-currency ledgers, settlement handshake incl. confirm-without-claim and double-confirm: blocked by Bug 1 (no expense can be created).
- Single-use invite reuse: blocked by Bug 2 (accept flow dead for all link types).
- Change password / delete account / transfer ownership / archive group: destructive or would alter shared test credentials.
- Web-push subscribe, CSV export on empty data: not exercised.
- Service-worker control + offline reload, mobile-viewport visual layout: test browser limitations (see PWA audit).
