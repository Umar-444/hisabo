<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Hisabo — Product & Engineering Rulebook

> **Tagline:** Split easy. Settle smart.  
> Everything below is **binding for every change in this repository**. When a rule here and the bundled Next.js docs disagree about Next.js APIs, the bundled docs win — update this file to match.  
> This rulebook is derived from the **Next.js 16 production checklist**, the **React 19 server-first model**, and mainstream **feature-first modular monolith architecture** (2026).

---

## 1. What We Are Building

A production-grade, full-stack web and Progressive Web App (PWA) for **Hisabo** — a reliable shared-expense and balance-tracking platform for friends, roommates, and people living in shared flats or apartments.

### Core Product Mandate
Hisabo records expenses, calculates fair splits, maintains a real-time zero-sum balance ledger, and tracks offline settlements.  
**It is an auditable record & settlement ledger — it does NOT move money between bank accounts, hold custodial deposits, or act as a digital wallet in the MVP.**

At any time, Hisabo answers five fundamental questions:
1. **Who paid?**
2. **Who participated?**
3. **How much does each person owe?**
4. **Which expenses are disputed or unpaid?**
5. **Who has settled their balance?**

### Application Surfaces

1. **Public Marketing Site:** High-converting landing page, feature deep-dive, how-it-works visual guide, FAQ, support, and legal terms.
2. **Authentication Flow:** Secure credentials & email verification, password reset, and optional OAuth.
3. **User Application (App Panel):** Dashboard (net balance summaries, recent feed), Groups management, Expense engine (equal & custom splits), Balances (who owes whom), Settlements workflow, Friends & invitations, and Notification center.
4. **Admin Portal:** Moderation dashboard, user account management, group health overview, notification delivery diagnostics, support metadata lookups, and audit logs.
5. **PWA & Android TWA:** Installable standalone web application with service worker offline shell, designed to wrap into a Google Play Store Trusted Web Activity (TWA).

### Feature Status & Implementation Scope

| Area | MVP Scope | Post-MVP / Roadmap |
| :--- | :--- | :--- |
| **Auth** | Email + Password, email verification, password reset, session cookies | Social logins (Google, Apple) |
| **Marketing** | Home (`/`), Features (`/features`), How It Works (`/how-it-works`), Privacy (`/privacy`), Terms (`/terms`), Support (`/support`), Contact (`/contact`) | SEO blog, interactive demo sandbox |
| **Friends** | Username discovery, invite links, send/accept/decline friend requests, blocking | Contact list sync |
| **Groups** | Group creation (apartments, flats, trips), secure invite links, member roles (Owner, Admin, Member), default currency | Recurring household templates, group archives |
| **Expenses** | Header (amount, payer, category, date), equal splitting, custom shares, change history, soft-cancellation | Itemized bill breakdowns, OCR receipt parsing |
| **Balances** | Real-time zero-sum net position ledger, aggregate group and friend balance views | Multi-currency live conversion, automated debt simplification |
| **Settlements** | Record off-platform payments (cash/transfer), debtor claim → creditor confirmation / dispute workflow | Direct payment gateway integrations (Stripe, Apple Pay) |
| **Notifications** | In-app notification center, durable transactional outbox worker, Web Push (VAPID) | Interactive push actions, SMS alerts |
| **Receipts** | S3-compatible private object storage with signed download URLs | Automatic OCR expense extraction |
| **Admin** | Dashboard metrics, user account status, group audit, privileged audit logs | Advanced financial reports, automated fraud detection |

---

## 2. Pinned Technology Stack

| Concern | Choice | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Server Components by default, Server Actions for mutations |
| **Runtime** | React 19 | Server-first rendering model, `useActionState` |
| **Language** | TypeScript 5 (`strict: true`) | Strict null checks, zero unchecked `any` |
| **Styling** | Tailwind CSS v4 | CSS-first `@theme` in `globals.css`, no `tailwind.config.js` |
| **UI Primitives** | Headless accessible components | Radix UI primitives + custom behavioral components |
| **Class Utilities** | `clsx` + `tailwind-merge` | Single `cn()` helper in `src/lib/utils.ts` |
| **Database** | PostgreSQL (Hosted / Neon) | ACID transactions, relational constraints, `BIGINT` minor units |
| **ORM** | Drizzle ORM + `drizzle-kit` | Typed migrations, `drizzle-zod` schema inference |
| **Validation** | Zod | Single source of truth for all API contracts & forms |
| **Auth** | Auth.js v5 (NextAuth) | JWT session strategy in secure `httpOnly` cookies |
| **Server State** | `@tanstack/react-query` | Client caching/refetching; RSC fetch for server reads |
| **Push / PWA** | Web Push (VAPID) + Service Worker | Web App Manifest, offline shell, push notifications |
| **Email** | Resend / Transactional SMTP | Outbox-driven notification emails and invites |
| **Storage** | S3-compatible Object Storage | Private bucket for expense receipts (Cloudflare R2 / AWS S3) |
| **Icons & Toasts** | `lucide-react` & `sonner` | Lightweight SVG icons and accessible notification toasts |
| **Dates & Money** | `dayjs` & Custom Integer Math | Strict integer minor-unit money arithmetic (halalas/cents) |

### Backend Placement Architecture

This is a **unified full-stack modular monolith**. PostgreSQL is accessed directly on the server via Drizzle. There is **no separate backend service**. All server-only backend code lives under `src/app/(backend)/`:

```text
src/app/(backend)/
  _lib/                      # Backend-only, NOT routable (underscore prefix). Alias: @/backend/*
    db/                      # Drizzle client + schema/ + migrations/seed → @/backend/db
      schema/                # Domain tables: auth, groups, expenses, settlements, outbox, etc.
      index.ts               # Database client singleton on globalThis
    auth/                    # Auth.js v5: config (edge), index (full), guards → @/backend/auth
    api/                     # Shared route handler helpers (auth-guard, response envelopes)
    services/                # Core domain services (expense, balance, settlement, outbox, push, email)
  (public-api)/api/…         # Public route handlers (/api/health, /api/auth/*)
  (private-api)/api/…        # Protected route handlers (/api/expenses, /api/settlements)
```

- `(public-api)` / `(private-api)` are **organizational route groups** stripped from the URL (both resolve under `/api/*`).
- Every handler under `(private-api)` **must** invoke `withApiAuth()` / `requireApiAuth()` from `@/backend/api/auth-guard`.
- `_lib/` is strictly `server-only`. Import it **only** from Server Components, Server Actions, domain services, and route handlers — never from a Client Component.

### Neon Database & Project Configuration

- **Neon Project ID:** `young-brook-45994299`
- **Pinned Branch:** `production`
- **Configuration Policy:** `neon.ts` in project root using `@neon/config/v1`:
  ```ts
  import { defineConfig } from "@neon/config/v1";

  export default defineConfig({});
  ```
- **CLI Commands & Tooling:**
  - CLI: `neon` (use `neon.cmd` on Windows PowerShell)
  - Linking: `neon link --project-id young-brook-45994299 --branch production -y`
  - Policy Deploy: `neon deploy` (applies `neon.ts` policy to branch)
  - MCP Server: Installed via `neon mcp` (`https://mcp.neon.tech/mcp`) for Antigravity and AI coding agents.
  - Connection pooling: Runtime uses pooled `DATABASE_URL`; migrations and `drizzle-kit` use direct/unpooled `DATABASE_URL_UNPOOLED`.

---

## 3. Financial & Expense Engine Rules (Non-Negotiable)

Financial data integrity takes absolute precedence over all other considerations.

### 1. Integer Minor Units Only
- **Never use floating-point numbers (`FLOAT` or `DOUBLE`) for monetary calculations.**
- All monetary values must be stored and computed as integer minor units:
  - SAR 10.00 $\rightarrow$ `1000` halalas
  - SAR 25.50 $\rightarrow$ `2550` halalas
  - SAR 100.00 $\rightarrow$ `10000` halalas
- Use `BIGINT` in PostgreSQL. In TypeScript, handle `BIGINT` safely as JavaScript `bigint` or serialized string representations.

### 2. Conservation Equation (Zero-Loss Invariant)
Every expense must satisfy:

$$\sum \text{participant shares} = \text{expense total}$$

When splitting an expense equally, integer division remainders must be distributed **deterministically** (e.g., allocating extra halalas to the payer or first participant):
```text
Total: 10000 halalas (SAR 100.00) shared by 3 participants:
- Quotient: 10000 / 3 = 3333 halalas each
- Remainder: 10000 - (3333 * 3) = 1 halala
- Allocation: Participant 1 = 3334 halalas; Participant 2 = 3333; Participant 3 = 3333
- Invariant check: 3334 + 3333 + 3333 == 10000 (PASSED)
```

### 3. Zero-Sum Balance Ledger
For every expense:
- **Payer is credited:** $\text{Credit} = \text{Total Paid} - \text{Payer's Own Share}$
- **Participants are debited:** $\text{Debit} = -(\text{Assigned Share})$
- **Invariant:** $\sum \text{all positions} = 0$.
- Positive position $(+)$ = user is owed money by the group.
- Negative position $(-)$ = user owes money to the group.
- Balances are derived dynamically from valid expenses and confirmed settlements. Do not store mutable balance totals as an editable source of truth.

### 4. Separation of Lifecycles
- **Expense Decision Status:** `pending` $\rightarrow$ `accepted` $\rightarrow$ `disputed`.
- **Expense Lifecycle:** `active` $\rightarrow$ `cancelled`.
- **Settlement Lifecycle:** `pending` $\rightarrow$ `confirmed` $\rightarrow$ `disputed` $\rightarrow$ `cancelled`.
- **Approval is not payment.** An accepted expense acknowledges liability; the balance remains active until a settlement is recorded and confirmed by the payee.

### 5. Atomic Multi-Record Transactions
Creating or modifying an expense must execute within a single database transaction:
1. Validate group membership and input invariants.
2. Insert/update `expenses` row.
3. Insert/update `expense_splits` rows.
4. Insert `outbox_events` notification row.
5. Commit transaction. (Never return success before commit completes).

---

## 4. Project Directory Architecture

Feature-first structure where `src/app/` handles routing only:

```bash
src/
  app/                       # ROUTING ONLY. Pages are thin: compose features & set metadata.
    (marketing-site)/        # Public pages: /, /features, /how-it-works, /privacy, /terms, /support, /contact
    (auth-pages)/            # Auth routes: /login, /register, /verify-email, /reset-password
    (user-panel)/            # Protected user application:
      dashboard/             # Overview: net owed, owed to you, recent activity, quick actions
      groups/                # Groups list, group detail [id], members, invite link generator
      expenses/              # New expense form, expense detail [id], edit, dispute modal
      balances/              # Who owes whom, breakdown per friend and group, settle-up modal
      settlements/           # Settlement details [id], confirm receipt, dispute payment
      friends/               # Friend list, add friend by username, pending requests
      notifications/         # In-app notification feed, mark as read
      settings/              # User profile, notification preferences, security, account deletion
    (admin-panel)/           # Admin dashboard (/admin):
      admin/                 # Users management, groups monitor, audit logs, notification queue
    (backend)/               # ALL backend code (see §2)
    layout.tsx               # Root layout: <html>, fonts, theme provider, global toast container
    global-error.tsx         # Global error boundary
    globals.css              # Tailwind v4 theme variables & base layers
  features/                  # ALL domain logic lives here, organized by feature - FIXED SHAPE:
    auth/
    groups/
    expenses/
    balances/
    settlements/
    friends/
    notifications/
    admin/
    <feature>/
      schema.ts              # Zod schemas - single source of truth for shapes & validations
      types.ts               # z.infer types + Drizzle DB row types
      queries.ts             # import "server-only"; Drizzle reads called from RSC pages
      actions.ts             # "use server"; mutations wrapped with withAction()
      hooks.ts               # "use client"; React Query hooks for client islands
      components/            # Feature-scoped Server Components and client interaction islands
      index.ts               # PUBLIC BARREL - only import surface for app/ and other features
  components/
    ui/                      # BEHAVIORAL components only (Modal, Drawer, Tabs, DataTable, OtpInput)
    layout/                  # Shells: MarketingHeader, UserSidebar, BottomTabBar, AdminNav
  lib/
    ui.ts                    # THE styling source: class string recipes (ui.btn, ui.card, ui.input)
    money.ts                 # Integer minor unit conversions, rounding, currency formatting
    api/                     # Client apiFetch transport + Route Handler response envelopes
    utils.ts                 # cn() class merge utility
    errors.ts                # AppError classes & error normalization
    actions.ts               # withAction() helper for typed Server Actions
    query-client.ts          # React Query singleton factory
  config/                    # Site, routes, navigation, enums, constants, env
  proxy.ts                   # Next.js middleware - optimistic redirects, security headers
```

---

## 5. Server vs. Client Components

- **Server Components by Default:** Every page, layout, and component is an RSC unless it requires browser event listeners, state (`useState`), effects (`useEffect`), or browser APIs.
- **Push `"use client"` to the Leaf:** Never mark an entire page or layout as `"use client"`. Wrap interactive widgets (e.g., `<SplitTypeToggle>`, `<SettleUpModal>`, `<AddExpenseForm>`) in small client islands.
- **Data Flow Pattern:** Server page fetches data via `features/<name>/queries.ts` $\rightarrow$ passes plain serialized props to Client Component $\rightarrow$ Client Component renders and handles user interaction.
- **No Direct DB in Client:** Client Components never import Drizzle, database credentials, or server-only utilities.

---

## 6. Data Fetching, Mutations & Caching

### Server Reads
```typescript
// In src/app/(user-panel)/groups/[id]/page.tsx
import { getGroupDetailQuery } from "@/features/groups";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroupDetailQuery(id);
  return <GroupDetailView group={group} />;
}
```
- `queries.ts` is flagged with `import "server-only";`, runs Drizzle queries, and validates user authorization via `auth()`.

### Client Reads
- For interactive filtering, polling, or real-time balance updates, client components use React Query hooks from `features/<name>/hooks.ts` calling thin route handlers under `/api/*`.

### Mutations (Server Actions)
- All writes use Server Actions built with `withAction(schema, role, fn)`:
```typescript
// In src/features/expenses/actions.ts
"use server";
import { withAction } from "@/lib/actions";
import { createExpenseSchema } from "./schema";
import { expenseService } from "@/backend/services/expense";

export const createExpenseAction = withAction(
  createExpenseSchema,
  "user",
  async (data, session) => {
    return await expenseService.createExpense(data, session.user.id);
  }
);
```
- Client forms execute actions via `react-hook-form` or React 19 `useActionState`, invalidating affected React Query keys and displaying toasts via `sonner`.

---

## 7. Database & Schema Conventions

1. **Schema Location:** `src/app/(backend)/_lib/db/schema/` with modular files:
   - `auth.ts` (`users`, `sessions`, `accounts`)
   - `friends.ts` (`friendships`, `friend_invitations`)
   - `groups.ts` (`groups`, `group_members`, `group_invitations`)
   - `expenses.ts` (`expenses`, `expense_splits`, `expense_events`, `expense_receipts`)
   - `settlements.ts` (`settlements`, `settlement_events`)
   - `notifications.ts` (`notifications`, `push_subscriptions`)
   - `outbox.ts` (`outbox_events`, `idempotency_keys`, `admin_audit_logs`)
2. **Naming Convention:** PostgreSQL columns and tables use `snake_case`. TypeScript interfaces and Drizzle fields use `camelCase`.
3. **Primary Keys:** Use UUID v4 (`uuid("id").defaultRandom().primaryKey()`) for externally referenced entities.
4. **No Hard Deletes:** Financial entries use status flags (`cancelled`, `void`) and retain full audit history.
5. **Migrations:** Managed via `drizzle-kit`. Run `npm run db:generate` to inspect SQL migrations, then `npm run db:migrate`. Never hand-edit files in `drizzle/`.

---

## 8. Styling Architecture & Brand Design System

### Design Tokens (`globals.css`)
Tailwind CSS v4 CSS-first token system without `tailwind.config.js`:

```css
@theme {
  --color-brand-primary: #185CFF;       /* Primary vibrant action blue */
  --color-brand-navy: #0F172A;          /* Dark navy background & high-emphasis text */
  --color-brand-surface: #F1F5F9;       /* Slate surface & subtle card borders */
  --color-brand-text-main: #0F172A;     /* Primary readable text */
  --color-brand-text-muted: #64748B;    /* Secondary metadata text */
  --color-brand-success: #10B981;       /* Positive balances (+ owed to you) */
  --color-brand-warning: #F59E0B;       /* Pending reviews & approval alerts */
  --color-brand-error: #EF4444;         /* Negative balances (- you owe) & disputes */
}
```

### Styling Recipes (`src/lib/ui.ts`)
**`src/lib/ui.ts` is the single source of truth for component styling class recipes.**  
Do **NOT** create redundant styling wrapper components (`Button.tsx`, `Input.tsx`, `Card.tsx`). Use native HTML elements with classes from `ui.ts`:

```typescript
// src/lib/ui.ts
export const ui = {
  btn: ({ variant = "primary", size = "md" }: BtnOptions) => cn(...),
  input: "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
  card: "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm",
  badge: ({ status }: BadgeOptions) => cn(...),
};
```

---

## 9. PWA & Google Play Store (TWA) Strategy

1. **Manifest File:** `public/manifest.webmanifest` configured with:
   - `name`: "Hisabo - Shared Expenses"
   - `short_name`: "Hisabo"
   - `start_url`: "/dashboard"
   - `display`: "standalone"
   - `theme_color`: "#185CFF"
   - `background_color`: "#F1F5F9"
   - Maskable icons at 192x192 and 512x512.
2. **Service Worker:** Registered in client shell. Handles asset caching and offline shell. **Never cache private user financial API responses in public service worker caches.**
3. **Android Trusted Web Activity (TWA):**
   - Package production PWA using `@bubblewrap/cli` or Android Studio TWA template.
   - Configure `.well-known/assetlinks.json` on the production domain for seamless full-screen verification.

---

## 10. Third-Party Services & Transactional Outbox

All third-party integrations live under `src/app/(backend)/_lib/services/<service>/`:

1. **Transactional Outbox Engine (`@/backend/services/outbox`):**
   - Saves business data and notification tasks in the same database transaction.
   - Background worker dequeues outbox events with exponential backoff retries.
2. **Web Push (`@/backend/services/push`):**
   - Standard Web Push protocol using VAPID keys.
   - Dispatches contextual alerts for expense inclusions and settlement confirmations.
3. **Transactional Email (`@/backend/services/email`):**
   - Resend API (primary) with SMTP fallback.
   - Sends email verification codes, password resets, and invite links.
4. **Receipt Media Storage (`@/backend/services/storage`):**
   - S3-compatible private object storage (Cloudflare R2 or AWS S3).
   - Generates short-lived pre-signed download URLs for authorized group members.

---

## 11. Security & Authorization Checklist

- [ ] Validate every input payload with server-side Zod schemas.
- [ ] Check granular authorization on **every** read and write (verify user is an active group member).
- [ ] Store session tokens strictly in `httpOnly`, `sameSite=Lax`, secure HTTPS cookies. Never use `localStorage`.
- [ ] Enforce rate limits on `/api/auth/*` and invitation endpoints.
- [ ] Prevent duplicate submissions using client-provided idempotency keys.
- [ ] Receipts served only via authenticated pre-signed URLs.
- [ ] Privileged administrative actions logged to `admin_audit_logs`.
- [ ] Provide user data export and account deletion workflows.

---

## 12. Non-Negotiable Development Workflow

1. **Read Bundled Docs First:** For any Next.js API questions, consult `node_modules/next/dist/docs/`.
2. **Verify Runtime Compilation:** Verify changes with the local dev server. Zero browser console errors.
3. **Strict Type Safety:** `tsc --noEmit` and `npm run lint` must pass with zero errors.
4. **Math Verification:** All splitting algorithms, remainder distributions, and balances must have passing unit tests.
5. **No Secrets Committed:** Validate all environment variables through `src/config/env.ts`.

---

## 13. Definition of Done (Every Task)

A feature is complete only when:
- [ ] Requirements, access policies, and permission checks are clearly enforced.
- [ ] Database migrations are generated and tested against PostgreSQL.
- [ ] Financial calculations use integer minor units and satisfy $\sum \text{splits} = \text{total}$.
- [ ] Server/Client boundaries are minimal and deliberate.
- [ ] Loading, empty, and error UI states exist.
- [ ] Automated unit and integration tests pass.
- [ ] Responsive design verified on mobile viewports and PWA standalone mode.
- [ ] Code review completed; no dead or commented-out code.
