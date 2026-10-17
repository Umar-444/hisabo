# Hisabo — Complete A–Z Product & Engineering Blueprint

> **Product Tagline:** Split easy. Settle smart.  
> **Platform Strategy:** Next.js & TypeScript · PostgreSQL · PWA-First · Play Store (TWA) Later  
> **Reference & Design Concept:** [behance.net](https://behance.net)

---

## Executive Overview

**Umar**, let’s define **Hisabo** properly before you start coding. This blueprint brings together your product idea, MVP features, database design, Next.js architecture, PostgreSQL, PWA requirements, security, notifications, testing, and future Play Store launch.

The goal is to build a **reliable expense-sharing platform** for friends, roommates, and people living in shared apartments—**not** an unnecessarily complicated banking application.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Recommended Technology Stack](#2-recommended-technology-stack)
3. [Product Scope: What Hisabo Should Include](#3-product-scope-what-hisabo-should-include)
4. [The Complete Application Architecture](#4-the-complete-application-architecture)
5. [Recommended Next.js Project Structure](#5-recommended-nextjs-project-structure)
6. [PostgreSQL Database Design](#6-postgresql-database-design)
7. [How Expense Splitting Should Work](#7-how-expense-splitting-should-work)
8. [Authentication and Authorization](#8-authentication-and-authorization)
9. [PWA: Make Hisabo Installable](#9-pwa-make-hisabo-installable)
10. [Play Store Launch Plan](#10-play-store-launch-plan)
11. [User Interface and Branding](#11-user-interface-and-branding)
12. [Admin Panel](#12-admin-panel)
13. [Security, Privacy, and Reliability](#13-security-privacy-and-reliability)
14. [Testing Strategy](#14-testing-strategy)
15. [Development Roadmap](#15-development-roadmap)
16. [Environment Variables](#16-environment-variables)
17. [Engineering Rules for AGENTS.md](#17-engineering-rules-for-agentsmd)
18. [SEO, Landing Page, and Launch Preparation](#18-seo-landing-page-and-launch-preparation)
19. [What Not to Build Yet](#19-what-not-to-build-yet)
20. [Your First Implementation Checklist & Final Recommendation](#20-your-first-implementation-checklist--final-recommendation)

---

## 1. Product Vision

### The Problem
Friends share dinners, groceries, rent, internet bills, transportation, and other living costs. People frequently forget who paid, who participated, and who owes whom. This leads to confusion, manual calculation errors, and awkward social tension.

### The Solution
**Hisabo** allows anyone to record an expense, select participants, calculate fair splits automatically, notify everyone involved, and track outstanding balances until all members settle up.

### Practical Example: Shared Dinner

```text
┌────────────────────────────────────────────────────────┐
│ Dinner with friends                                    │
│ Paid by: Umar  ·  Participants: 4                      │
├────────────────────────────────────────────────────────┤
│ Total Bill:            SAR 160                         │
│ Each Person's Share:   SAR 40                          │
│ Net Owed to Umar:      SAR 120 (SAR 40 × 3 friends)    │
└────────────────────────────────────────────────────────┘
```

> **Illustration:** If Umar paid the full SAR 160 bill and all four participants owe an equal share, the other three participants each owe Umar SAR 40.

### The Core Mandate
At any given moment, Hisabo must accurately answer five fundamental questions:
1. **Who paid?**
2. **Who participated?**
3. **How much does each person owe?**
4. **Which expenses are disputed or unpaid?**
5. **Who has settled their balance?**

---

## 2. Recommended Technology Stack

Use a single modular **Next.js** project for the public marketing website, logged-in user application, and administrative portal. Use **PostgreSQL** as the primary relational database.

### Architectural Pillars
- **Frontend & Application:** Next.js (App Router, TypeScript, React Server Components, Tailwind CSS, accessible component library). Powers the landing page, dashboard, groups, expenses, settlements, settings, and PWA shell.
- **Database:** PostgreSQL. Reliable storage for users, friendships, groups, expenses, splits, settlements, notifications, and audit event logs.
- **Hosting:** Vercel for the Next.js runtime, paired with a managed PostgreSQL provider (choose a region close to your primary user base).
- **Notifications:** Web Push via Service Worker, user notification preferences, and in-app notification history. Transactional email serves as an asynchronous fallback.

### Comprehensive Stack Specification

| Area | Recommended Choice | Purpose & Notes |
| :--- | :--- | :--- |
| **Language** | TypeScript | Strict type safety across client and server |
| **Framework** | Next.js (App Router) | Full-stack React with Server Components & Server Actions |
| **Styling** | Tailwind CSS | Utility-first, responsive, and tokenized design system |
| **UI Library** | Accessible Component Library | Radix UI / shadcn/ui style accessible primitives |
| **Database** | PostgreSQL | ACID transactions, strict relational constraints |
| **ORM** | Prisma or Drizzle | Consistent schema definitions and typed migrations (pick one) |
| **Validation** | Zod | Server-side contract and form validation |
| **Authentication** | Auth.js (NextAuth) or Managed Auth | Secure session cookies, OAuth, or credentials |
| **PWA** | Web App Manifest + Service Worker | Offline caching, standalone installation on mobile & desktop |
| **Push Notifications** | Web Push with VAPID | Native browser notifications on mobile and desktop |
| **Email** | Transactional Email Provider | Resend, Postmark, or SendGrid for invitations/resets |
| **File Storage** | S3-Compatible Object Storage | Cloudflare R2 / AWS S3 for private receipt attachments |
| **Testing** | Vitest, React Testing Library, Playwright | Unit math tests, component tests, and E2E journeys |
| **Deployment** | Vercel + Managed PostgreSQL | Zero-config edge routing with scalable database instance |
| **Monitoring** | Error tracking & structured logging | Sentry, OpenTelemetry, uptime checks |
| **Android Release** | Trusted Web Activity (TWA) | Wrap production-ready PWA for Google Play Store |

> [!IMPORTANT]
> **No Laravel backend needed:** Since you have chosen Next.js and PostgreSQL, you can maintain the entire system in a unified TypeScript codebase with a clear server-side domain layer. This avoids the overhead and maintenance burden of two separate backends.

---

## 3. Product Scope: What Hisabo Should Include

Do not build every conceivable feature on day one. Deliver the core expense-sharing and balance-tracking workflow first, then iteratively expand based on user feedback.

### Functional Modules

#### A. Friends and Connections
- Search and discover friends by username or direct invite link.
- Send, accept, or decline friend connection requests.
- Invite unregistered friends via shareable link or email.
- Block abusive users and manage contact preferences.

#### B. Groups and Apartments
- Create isolated groups for flats, shared apartments, trips, projects, or circles of friends.
- Secure invite links with optional expiration.
- Group-level expense timelines and net balances.
- Group settings: name, icon, default currency, and member permissions.
- Ownership roles: Owner, Admin, Member.

#### C. Expense Management
- Record expense header: title, total amount, category, date, payer, and participants.
- Split modes: Equal splitting or custom assigned shares.
- Optional receipt attachment (image or PDF).
- Permission-based editing and cancellation with full event audit logs.

#### D. Balances and Settlements
- Real-time balance ledger: who owes whom.
- Aggregate summary views for individual friends and groups.
- Record off-platform payments (cash, bank transfer, digital wallet).
- Settlement lifecycle: record claim → recipient confirmation or dispute.
- Distinct visibility for pending, disputed, and settled amounts.

#### E. Notifications
- Invitations to groups or friend requests.
- Inclusion in a newly recorded expense.
- Edits or cancellations made to an existing expense.
- Expense split review and approval requests.
- Settlement confirmation requests.
- Expense or settlement dispute alerts.

### Feature Priorities: MVP vs. Future Releases

| Feature | MVP Scope | Post-MVP / Future Roadmap |
| :--- | :---: | :--- |
| **Registration & Login** | ✅ Yes | Social login (Google, Apple) |
| **Groups & Invitations** | ✅ Yes | Recurring household expense templates |
| **Equal Expense Splitting** | ✅ Yes | Advanced split formulas (percentages, shares/weights) |
| **Custom Split Amounts** | ✅ Yes | Complex itemized bill breakdown |
| **Balance Tracking** | ✅ Yes | Debt simplification algorithms (minimize transactions) |
| **Manual Settlement Recording** | ✅ Yes | Direct payment gateway integrations |
| **In-App Notifications** | ✅ Yes | — |
| **Web Push Notifications** | ✅ Yes (post core-flows) | Interactive push notification action buttons |
| **Expense History & Filters** | ✅ Yes | Advanced visual financial analytics and charts |
| **Admin Panel** | ✅ Basic | Advanced platform moderation and reporting |
| **Receipt Attachments** | ⚡ Optional | Receipt OCR with automated bill parsing |
| **Multi-Currency Support** | 📐 Architecture ready | Automated real-time exchange rate conversions |
| **Offline Expense Creation** | ⏳ Later | Conflict-aware background sync engine |
| **AI Financial Assistant** | ❌ No | Re-evaluate only after product-market fit |

> [!NOTE]
> **Core MVP Principle:** Hisabo is an informational record and settlement ledger. It **records and organizes** shared expenses—it does **not** move money between bank accounts or act as a digital wallet.

---

## 4. The Complete Application Architecture

Hisabo adopts a **Modular Monolith** architecture. This maximizes developer velocity, simplifies testing, avoids distributed system pitfalls, and keeps operational costs minimal.

### Architectural Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                          USER DEVICES                           │
│       Mobile Browser   ·   Installed PWA   ·   Desktop Browser  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS / Web Push
┌────────────────────────────────▼────────────────────────────────┐
│                      NEXT.JS APPLICATION                        │
│   Marketing Site   │    User Dashboard    │    Admin Panel      │
│   (Server Comps)   │ (Client/Server Comps)│ (Protected Routes)  │
├─────────────────────────────────────────────────────────────────┤
│                  SERVER APPLICATION LAYER                       │
│  - Authentication & Sessions      - Validation (Zod)            │
│  - Authorization Policies         - Domain Services (Expenses)  │
│  - Outbox Pattern Engine          - Transaction Handlers        │
└───────────────────┬───────────────────────────────┬─────────────┘
                    │                               │
┌───────────────────▼──────────┐    ┌───────────────▼─────────────┐
│          POSTGRESQL          │    │      EXTERNAL SERVICES      │
│  - ACID Transactions         │    │  - Push Service (VAPID)     │
│  - Relational Schema         │    │  - Transactional Email      │
│  - Constraints & Indexes     │    │  - S3 Receipt Storage       │
│  - Audit & Outbox Tables     │    │  - Monitoring & Logging     │
└──────────────────────────────┘    └─────────────────────────────┘
```

### Request Lifecycle Workflow

```text
1. User Action       ──▶ Opens PWA or browser, submits expense/settlement form
2. Next.js Routing   ──▶ Evaluates Route Handler or Server Action
3. Auth & Guard      ──▶ Validates session and checks granular access policies
4. Domain Service    ──▶ Validates financial rules, split math, and invariants
5. DB Transaction    ──▶ PostgreSQL commits expense + splits + outbox event atomically
6. Outbox Dispatch   ──▶ Background worker dequeues outbox event
7. Notifications     ──▶ Push/Email sent to participants; delivery outcome logged
```

> [!IMPORTANT]
> The database transaction must successfully commit **before** the application reports the expense as saved to the client.

### Key Architectural Boundaries
- **Server-Only Business Logic:** All domain logic belongs in `src/server/services/`. Never place business rules inside React client components.
- **Server Components vs. Client Components:** Use Server Components for data fetching and read-heavy views. Use Client Components strictly for interactive forms, dynamic splitting, dialogs, and optimistic UI.
- **No Direct Database Access:** The client browser must never connect directly to PostgreSQL. Database credentials and private keys must never leak to the client bundle.
- **Pragmatic Scaling:** Avoid premature microservices, message brokers, or Redis caches until specific, measurable performance bottlenecks arise.
- **Future React Native Compatibility:** By housing business logic in dedicated domain services, you can easily expose a versioned REST/GraphQL API for React Native later without rewriting backend rules.

---

## 5. Recommended Next.js Project Structure

Organize the repository domain-by-domain to maintain clean separation of concerns as the application grows:

```bash
hisabo/
├── public/
│   ├── icons/                  # PWA application icons (192x192, 512x512)
│   ├── screenshots/            # PWA store presentation screenshots
│   ├── manifest.webmanifest    # Web App Manifest
│   └── offline.html            # Fallback offline shell
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public marketing pages
│   │   │   ├── page.tsx        # Homepage / Landing page
│   │   │   ├── about/          # Product story
│   │   │   └── privacy/        # Privacy policy
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (app)/              # Authenticated user application
│   │   │   ├── dashboard/      # User financial overview
│   │   │   ├── friends/        # Friends and connection requests
│   │   │   ├── groups/         # Group listings and details
│   │   │   ├── expenses/       # Expense management & creation
│   │   │   ├── balances/       # Net balances & who owes whom
│   │   │   ├── settlements/    # Settlement confirmation workflow
│   │   │   ├── notifications/  # In-app notification center
│   │   │   └── settings/       # Profile, security, notification prefs
│   │   ├── admin/              # Admin dashboard & moderation
│   │   ├── api/                # Route handlers (webhooks, cron, push)
│   │   ├── layout.tsx          # Root layout
│   │   ├── error.tsx           # Global error boundary
│   │   ├── not-found.tsx       # 404 handler
│   │   └── globals.css         # Tailwind styles & theme variables
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # Atomic UI primitives (buttons, dialogs, inputs)
│   │   ├── forms/              # Reusable form controls
│   │   ├── expenses/           # Expense cards, split selectors
│   │   ├── groups/             # Group members, invite modals
│   │   └── navigation/         # Header, bottom tab bar, sidebar
│   ├── features/               # Feature-specific client hooks and helpers
│   │   ├── auth/
│   │   ├── friends/
│   │   ├── groups/
│   │   ├── expenses/
│   │   ├── balances/
│   │   ├── settlements/
│   │   └── notifications/
│   ├── server/                 # Server-only application layer
│   │   ├── auth/               # Session evaluation, token generation
│   │   ├── db/                 # Database client (Prisma / Drizzle)
│   │   ├── policies/           # Authorization & access control rules
│   │   ├── services/           # Core business domain logic
│   │   ├── repositories/       # Database queries and mutations
│   │   └── jobs/               # Background outbox workers & scheduled tasks
│   ├── lib/                    # Shared universal utilities
│   │   ├── validation/         # Zod schemas
│   │   ├── money/              # Integer math, currency formatters
│   │   ├── dates/              # Date manipulation & formatting
│   │   ├── errors/             # Custom error classes
│   │   └── logging/            # Structured logging
│   └── types/                  # Shared TypeScript interfaces & definitions
├── prisma/                     # (Or drizzle/)
│   ├── schema.prisma           # Relational schema
│   └── migrations/             # Version-controlled database migrations
├── tests/                      # Automated test suites
│   ├── unit/                   # Math, splitting, and policy tests
│   ├── integration/            # DB transactions and repository tests
│   └── e2e/                    # Playwright end-to-end user journeys
├── .env.example                # Documented environment configuration template
├── .gitignore
├── AGENTS.md                   # AI Assistant & team engineering rulebook
├── package.json
└── README.md
```

> [!TIP]
> Add `import "server-only";` at the top of every file in `src/server/` to guarantee server-side code is never accidentally bundled into client-side assets.

---

## 6. PostgreSQL Database Design

The database schema is the most critical asset in Hisabo. The application must preserve an immutable, auditable history of expenses, split decisions, and settlements.

### Core Database Entities

```text
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│      users      │───┬───│    group_members     │───┬───│     groups      │
└─────────────────┘   │   └──────────────────────┘   │   └─────────────────┘
         │            │                              │            │
         │            └──────────────────────────────┘            │
         │                                                        │
         ├───────────────────────┬────────────────────────────────┤
         │                       │                                │
┌────────▼────────┐     ┌────────▼────────┐              ┌────────▼────────┐
│  friendships    │     │    expenses     │──────────────│   settlements   │
└─────────────────┘     └────────┬────────┘              └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │ expense_splits  │
                        └─────────────────┘
```

### Table Schema Blueprint

| Table | Primary Fields | Description & Invariants |
| :--- | :--- | :--- |
| `users` | `id`, `email`, `username`, `display_name`, `avatar_url`, `status`, `created_at` | Core user identity and account status |
| `friendships` | `id`, `user_id`, `friend_id`, `status`, `created_at` | Bilateral friend relationship with status (`pending`, `accepted`, `blocked`) |
| `groups` | `id`, `name`, `owner_id`, `default_currency`, `created_at` | Expense group container |
| `group_members` | `group_id`, `user_id`, `role`, `status`, `joined_at` | Membership mapping (`role`: `owner`, `admin`, `member`) |
| `expenses` | `id`, `group_id`, `created_by`, `paid_by`, `amount_minor`, `currency`, `description`, `category`, `status`, `created_at` | Master expense header (`status`: `active`, `cancelled`, `disputed`) |
| `expense_splits` | `id`, `expense_id`, `user_id`, `share_minor`, `decision_status` | Participant share allocation (`decision_status`: `pending`, `accepted`, `disputed`) |
| `expense_events` | `id`, `expense_id`, `actor_id`, `event_type`, `details`, `created_at` | Audit trail for edits, cancellations, and status changes |
| `settlements` | `id`, `group_id`, `payer_id`, `payee_id`, `amount_minor`, `currency`, `status`, `created_at`, `settled_at` | Payment claims (`status`: `pending`, `confirmed`, `disputed`, `cancelled`) |
| `notifications` | `id`, `user_id`, `type`, `payload`, `read_at`, `created_at` | In-app notification messages |
| `push_subscriptions` | `id`, `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`, `revoked_at` | Browser Web Push device registration tokens |
| `outbox_events` | `id`, `event_type`, `payload`, `status`, `attempts`, `created_at`, `processed_at` | Durable background transactional outbox queue |
| `idempotency_keys` | `key`, `user_id`, `response_payload`, `created_at`, `expires_at` | Deduplication lock for financial mutations |
| `admin_audit_logs` | `id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at` | Audit trail for administrative operations |

### Storing Money Safely: Integer Minor Units

> [!CAUTION]
> **Never store monetary values as floating-point numbers (`FLOAT` or `DOUBLE`).** Binary floating-point arithmetic causes precision loss and rounding errors.

All amounts must be represented as **integer minor units** (e.g., cents, halalas, fils):
- **SAR 10.00** $\rightarrow$ `1000` halalas
- **SAR 25.50** $\rightarrow$ `2550` halalas
- **SAR 100.00** $\rightarrow$ `10000` halalas

Use `BIGINT` in PostgreSQL for monetary storage. In TypeScript, handle `BIGINT` values using JavaScript `bigint` or strings to prevent 64-bit integer overflow in standard JSON numbers.

### Invariant Formula
Every expense must strictly adhere to the conservation equation:

$$\sum \text{participant shares} = \text{expense total}$$

#### Deterministic Rounding Distribution
When splitting SAR 100.00 (`10000` halalas) equally among 3 participants:
$$\frac{10000}{3} = 3333.3333...$$

The integer quotient is `3333` with a remainder of `1` halala ($10000 - 3333 \times 3 = 1$).  
The algorithm must distribute the remainder deterministically (e.g., to the payer or first participant):
- Participant 1: `3334` halalas (SAR 33.34)
- Participant 2: `3333` halalas (SAR 33.33)
- Participant 3: `3333` halalas (SAR 33.33)
- **Total:** `3334 + 3333 + 3333 = 10000` halalas (SAR 100.00)

### Database Integrity Rules
1. **Foreign Keys & Constraints:** Use strict foreign keys, non-null constraints, and `ON DELETE RESTRICT` for financial tables.
2. **Soft Deletions / Void Status:** Never hard-delete financial records. Mark them as `cancelled` or `void` and record the cancelling user and timestamp.
3. **Atomic Transactions:** Expense creation, split allocation, and outbox event insertion must occur within a single database transaction.
4. **Idempotency Keys:** Prevent double-click or network retry duplicate charges using unique client-provided idempotency keys.
5. **No Independent Balance Columns:** Balances are a calculated aggregate of valid expenses and settlements. Avoid storing mutable balance totals directly on user or group records.

---

## 7. How Expense Splitting Should Work

This is the core business logic of Hisabo.

### Creating an Expense: Step-by-Step
1. User selects a group.
2. User enters description, total amount, category, date, and currency.
3. User selects the payer (defaults to the current user).
4. User selects participants.
5. User selects the split method:
   - **Equal Split:** System calculates shares and deterministically allocates remainder halalas.
   - **Custom Split:** User inputs individual amounts; server asserts $\sum \text{shares} = \text{total}$.
6. Server validates group membership and verifies data integrity.
7. Server atomically inserts expense and split rows.
8. Outbox entry triggers notifications for participants.

### Approval and Dispute Lifecycle

```text
┌──────────────┐     Participant approves      ┌──────────────┐
│   Pending    │──────────────────────────────▶│   Accepted   │
└──────┬───────┘                               └──────────────┘
       │
       │ Participant disputes
       ▼
┌──────────────┐       Payer modifies/cancels   ┌──────────────┐
│   Disputed   │──────────────────────────────▶│  Cancelled   │
└──────────────┘                               └──────────────┘
```

- **pending:** The participant needs to review the expense share.
- **accepted:** The participant confirmed the share.
- **disputed:** The participant flagged a disagreement (e.g., wrong amount or did not attend).
- **cancelled:** The expense has been voided by the payer or group admin.

> [!NOTE]
> **Approval is not payment.** An accepted expense means the user acknowledges the debt, but the balance remains outstanding until settled.

### Balance Calculation Mechanics
For any single expense:
- **Payer receives a credit (+):** $\text{Credit} = \text{Total Amount Paid} - \text{Payer's Own Share}$
- **Participants receive a debit (-):** $\text{Debit} = -(\text{Assigned Share})$
- **Zero-Sum Invariant:** The sum of all member positions for any single expense equals exactly zero.

#### Concrete Ledger Example
**Expense:** SAR 160 paid by Umar, shared equally between Umar, Ali, Ahmed, and Bilal (SAR 40 each).

| Member | Total Paid | Assigned Share | Net Position | Explanation |
| :--- | :---: | :---: | :---: | :--- |
| **Umar** | SAR 160 | SAR 40 | **+ SAR 120** | Owed SAR 120 from the group |
| **Ali** | SAR 0 | SAR 40 | **- SAR 40** | Owes Umar SAR 40 |
| **Ahmed** | SAR 0 | SAR 40 | **- SAR 40** | Owes Umar SAR 40 |
| **Bilal** | SAR 0 | SAR 40 | **- SAR 40** | Owes Umar SAR 40 |
| **Total** | **SAR 160** | **SAR 160** | **SAR 0** | **Balanced** |

*Convention:* Positive $(+)$ means the person is owed money. Negative $(-)$ means the person owes money.

### Settlement Flow
1. A debtor opens their balance sheet and clicks **"Settle Up"**.
2. They record an off-platform payment to a creditor (e.g., "Paid Ali SAR 40 via Bank Transfer").
3. Settlement record is created with status `pending`.
4. The creditor receives a notification to confirm receipt.
5. Upon creditor confirmation, the settlement status updates to `confirmed`.
6. Net balances recalculate immediately, reducing the outstanding debt.

---

## 8. Authentication and Authorization

### Authentication Best Practices
- **Session Handling:** Store authentication tokens exclusively in secure, `httpOnly`, `sameSite=Lax`, HTTPS cookies.
- **Zero localStorage:** Never store authentication tokens or session secrets in `localStorage` or `sessionStorage` (vulnerable to XSS).
- **Email Verification:** Require email confirmation prior to joining groups or recording financial entries.
- **Rate Limiting:** Protect `/api/auth/*`, invitation links, and password reset endpoints with strict rate limiting.
- **Account Controls:** Support secure password resets, active session revocation, account export, and account deletion.

### Granular Authorization Policies
Every single server mutation and query must enforce server-side authorization:
- **Group Privacy:** Only active members of a group can view its expenses, members, and balances.
- **Expense Mutability:** Only the original creator/payer (or group owner) can edit or cancel an expense.
- **Settlement Confirmation:** Only the named payee (recipient of funds) can confirm receipt of a settlement.
- **ID Tampering Prevention:** Access control checks must verify user permission against the requested resource ID, preventing Insecure Direct Object References (IDOR).
- **Admin Isolation:** Administrative capabilities require an explicit `role = 'system_admin'` check.

---

## 9. PWA: Make Hisabo Installable

Hisabo's primary distribution vehicle is a Progressive Web App (PWA), providing a native-like experience on mobile and desktop without app store friction.

### Technical PWA Requirements
- Production domain served over HTTPS.
- Valid `manifest.webmanifest` with required metadata and maskable icons.
- Registered Service Worker handling offline shell and asset caching.
- Responsive mobile-first UI with comfortable touch targets ($\ge 44 \times 44\text{px}$).
- Safe caching: **Never cache private financial API responses in shared service worker caches.**

### Web App Manifest Specification

```json
{
  "name": "Hisabo - Shared Expenses",
  "short_name": "Hisabo",
  "description": "Split easy. Settle smart.",
  "start_url": "/dashboard",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#F1F5F9",
  "theme_color": "#185CFF",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Offline Caching Strategy
- **App Shell:** Cache HTML shell, CSS, JavaScript, and static icons for instant loading.
- **Offline States:** When disconnected from the internet, show a clear visual offline banner.
- **Integrity Rule:** Do not pretend an expense has been saved when offline. Queue operations with an explicit "Pending Sync" visual tag until the server acknowledges them.

### Web Push Notifications
Web Push enables real-time engagement even when the app is closed:
- Request push permissions contextually (e.g., after the user joins their first group, not immediately upon landing).
- Store subscription endpoints and cryptographic keys securely in the database.
- Example notifications:
  - *"Ali added a new dinner expense in Apartment 4B."*
  - *"Your share of SAR 40 is ready for review."*
  - *"Ahmed confirmed your settlement of SAR 120."*
- **Privacy Rule:** Never display sensitive bank or total net worth amounts on lock-screen push notifications.

---

## 10. Play Store Launch Plan

### Distribution Path
$$\text{Next.js PWA} \longrightarrow \text{Production Validation} \longrightarrow \text{Android Trusted Web Activity (TWA)}$$

Using a **Trusted Web Activity (TWA)** wraps the high-performance PWA in an Android APK/AAB package, giving you a Google Play Store listing with zero duplicate codebases.

### Pre-Publishing Checklist
- [ ] Production domain has a valid, modern SSL certificate.
- [ ] Digital Asset Links (`.well-known/assetlinks.json`) configured for seamless full-screen verification (hiding browser URL bar).
- [ ] Splash screens, adaptive icons, and Play Store promotional graphics generated.
- [ ] Android package name declared (e.g., `com.hisabo.app`) and signed with a release keystore.
- [ ] Tested Android back-button behavior, deep linking, and external OAuth redirects.
- [ ] Comprehensive Privacy Policy, Terms of Service, and Data Safety disclosures prepared for Google Play Console.
- [ ] Target Android API level verified against current Google Play requirements.

---

## 11. User Interface and Branding

The user experience must be frictionless. Users should be able to record an expense in under 10 seconds.

### Key Screens & UX Flow

#### 1. Dashboard
- Quick Summary Cards: **Total You Owe** vs. **Total Owed to You**.
- Floating / Quick Action: Prominent **"Add Expense"** button.
- Activity Feed: Recent expenses and pending settlement requests.

#### 2. Add Expense Screen
- Large prominent amount input at top with currency symbol.
- Description and category selector (Food, Rent, Utilities, Transport, Fun).
- Payer selector (defaults to current user).
- Participant selector with multi-select checkboxes.
- Split toggle: **Equal Split** vs. **Custom Amounts**.
- Live breakdown preview before submission.

#### 3. Group & Settlement Views
- Group members list with individual balance tags.
- Expense chronology timeline with dispute indicators.
- Settle-up modal displaying bank transfer or cash recording options.

### Brand Color Palette

| Token Name | Hex Code | Visual Swatch & Application |
| :--- | :---: | :--- |
| **Primary Accent** | `#185CFF` | Vibrant royal blue for primary buttons, active tabs, and branding |
| **Dark Navy** | `#0F172A` | Deep navy for dark surfaces, headings, and high-emphasis typography |
| **Light Surface** | `#F1F5F9` | Slate background for page containers and subtle card borders |
| **Main Text** | `#0F172A` | High-contrast primary reading text |
| **Secondary Text**| `#64748B` | Slate gray for metadata, dates, and secondary labels |
| **Success** | `#10B981` | Emerald green for positive balances (+ owed to you) and confirmations |
| **Warning** | `#F59E0B` | Amber for pending approvals and review requests |
| **Error / Debt** | `#EF4444` | Crimson red for negative balances (- you owe) and disputed items |

### Complete Screen Inventory (14 Required Views)
1. **Public Landing Page** (`/`)
2. **Registration & Login** (`/register`, `/login`)
3. **Password Reset & Verification** (`/reset-password`)
4. **Main Dashboard** (`/dashboard`)
5. **Friends & Invite Connections** (`/friends`)
6. **Groups Overview & Group Detail** (`/groups`, `/groups/[id]`)
7. **Add / Edit Expense** (`/expenses/new`, `/expenses/[id]/edit`)
8. **Expense Detail & Dispute Screen** (`/expenses/[id]`)
9. **Balances Sheet** (`/balances`)
10. **Settlement Details & Confirmation** (`/settlements/[id]`)
11. **Notifications Center** (`/notifications`)
12. **Profile & Security Settings** (`/settings`)
13. **Privacy Policy & Account Deletion** (`/privacy`, `/settings/delete`)
14. **Admin Dashboard & Moderation** (`/admin`)

---

## 12. Admin Panel

Build the administrative dashboard directly within the same Next.js project under the `/admin` route group, shielded by strict role-based authorization.

### Core Admin Capabilities
- **User Management:** View registered users, active sessions, and ban/suspend accounts violating terms.
- **Group Overview:** Monitor group count, membership health, and active expense volume.
- **Audit Logging:** Searchable log of administrative actions, permission overrides, and system changes.
- **Support Diagnostics:** Look up transaction and settlement metadata to resolve customer support inquiries.
- **Notification Deliverability:** Track Web Push and email delivery success/failure rates.

> [!CAUTION]
> **Admins must not silently edit financial ledger entries.** Any administrative intervention must be logged in `admin_audit_logs` specifying who executed the change, why, and a snapshot of the prior state.

---

## 13. Security, Privacy, and Reliability

### Engineering Security Checklist
- [ ] All inputs validated on the server using Zod schemas.
- [ ] Strict authorization check on every database read and write.
- [ ] Session tokens stored strictly in `httpOnly`, `sameSite=Lax`, secure cookies.
- [ ] Protection against Cross-Site Scripting (XSS) and CSRF attacks.
- [ ] Strict rate limiting on authentication, invitations, and financial mutations.
- [ ] Secrets managed via deployment environment variables (never committed to Git).
- [ ] Full HTTPS encryption enforced with HSTS headers.
- [ ] Receipts stored in private object storage, served only via authenticated pre-signed URLs.
- [ ] Idempotency keys used for expense creation to prevent duplicate charges.
- [ ] Structured security logging with sensitive data (passwords, tokens) masked.
- [ ] Automated database backups with verified disaster recovery procedures.
- [ ] Compliant data retention policy with user data export and deletion endpoints.

### Outbox Pattern for Reliable Notifications
To guarantee reliability, do not make expense creation depend on third-party push or email APIs:

```text
┌────────────────────────────────────────────────────────┐
│               DATABASE TRANSACTION                     │
│  1. Insert Expense Record                              │
│  2. Insert Split Allocations                           │
│  3. Insert Outbox Event ("EXPENSE_CREATED")            │
└────────────────────────────────────────────────────────┘
                           │ (Transaction Committed)
                           ▼
┌────────────────────────────────────────────────────────┐
│                  OUTBOX WORKER                         │
│  - Reads pending outbox events                         │
│  - Dispatches Web Push / Transactional Email           │
│  - Retries on network failure with exponential backoff │
│  - Marks event as processed                            │
└────────────────────────────────────────────────────────┘
```

---

## 14. Testing Strategy

Financial calculations demand rigorous test coverage to prevent balance drift and rounding errors.

### Testing Pyramid

#### 1. Unit Tests (Pure Functions)
- Split math: Equal split allocation and remainder halala distribution.
- Custom split validator: Ensuring $\sum \text{shares} = \text{total}$.
- Balance computation: Verifying net creditor and debtor calculations.
- Money utilities: String formatting, minor-unit conversions, currency codes.
- Access policies: Pure authorization predicates.

#### 2. Integration Tests (Database & Service Layer)
- Atomic transaction tests: Confirming expense and splits write together or roll back.
- Constraint tests: Verifying foreign key cascades and unique constraints.
- Idempotency tests: Ensuring duplicate submissions return the original response without re-inserting records.
- Access isolation: Asserting non-members receive `403 Forbidden` when attempting to access group resources.

#### 3. End-to-End (E2E) Journeys (Playwright)
1. User A registers an account and creates an "Apartment 101" group.
2. User A invites User B via an invitation link.
3. User B registers and joins the group.
4. User A records a SAR 160 dinner expense split equally among both users.
5. User B receives an in-app notification and verifies their balance shows `- SAR 80`.
6. User B records a settlement of SAR 80 to User A.
7. User A confirms the settlement.
8. Both users' balances return to `SAR 0.00`.

---

## 15. Development Roadmap

Adopt a **vertical slice** engineering methodology: build each feature completely from database schema to UI and automated tests before moving to the next.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Phase 01: Foundation                                                     │
│ Next.js App Router, TypeScript, Tailwind, DB Setup, ORM, CI/CD Pipeline  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│ Phase 02: Identity & Groups                                              │
│ Auth, User Profiles, Groups, Membership, Invitations, Access Policies    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│ Phase 03: Expense Engine                                                 │
│ Integer Splitting, Rounding Math, Expense CRUD, Real-Time Balance Ledger │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│ Phase 04: Settlement & Notifications                                     │
│ Settlement Confirmation/Disputes, In-App Notifications, Outbox Worker    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│ Phase 05: PWA & Production Hardening                                     │
│ Web App Manifest, Service Worker, Offline Shell, Auditing, Backups       │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│ Phase 06: Closed Beta & Play Store                                       │
│ User Feedback, Balance Fixes, Android TWA Package, Play Console Launch   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Environment Variables

Create and maintain a `.env.example` file documenting all configuration variables without committing live secrets:

```env
# ==============================================================================
# Hisabo Environment Configuration
# ==============================================================================

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost:5432/hisabo?schema=public"

# Authentication (Auth.js / NextAuth)
AUTH_SECRET="generate_a_random_32_byte_secret_here"
AUTH_URL="http://localhost:3000"

# Transactional Email (Resend / SendGrid)
EMAIL_FROM="Hisabo <notifications@hisabo.com>"
EMAIL_API_KEY="re_123456789"

# Web Push (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYg..."
VAPID_PRIVATE_KEY="your_private_vapid_key"
VAPID_SUBJECT="mailto:support@hisabo.com"

# Receipt Object Storage (S3 / Cloudflare R2 - Optional)
STORAGE_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
STORAGE_BUCKET="hisabo-receipts"
STORAGE_ACCESS_KEY_ID="your_access_key"
STORAGE_SECRET_ACCESS_KEY="your_secret_key"

# Observability & Monitoring
ERROR_TRACKING_DSN="https://examplePublicKey@o0.ingest.sentry.io/0"
```

### Configuration Rules
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser client bundle. **Never put private keys, database URLs, or secrets in `NEXT_PUBLIC_` variables.**
- Never commit actual `.env` or `.env.local` files to version control.
- Use distinct credentials across development, staging, and production environments.

---

## 17. Engineering Rules for AGENTS.md

The following rulebook must be placed in `AGENTS.md` at the project root to keep AI assistants and contributors aligned:

### 1. Product Mission
- Hisabo is a shared-expense and balance-tracking application for friends, roommates, and small groups.
- **Tagline:** Split easy. Settle smart.
- The initial release is a Next.js Progressive Web App (PWA) backed by PostgreSQL. An Android Play Store release will use a Trusted Web Activity (TWA).
- Hisabo records shared expenses and manual settlements. **It does not transfer money or act as a banking provider.**

### 2. Mandatory Technology Decisions
- Framework: Next.js App Router with TypeScript (strict mode enabled).
- Database: PostgreSQL with a single chosen ORM (Prisma or Drizzle).
- Monolith: Unified Next.js codebase containing marketing pages, user app, and admin panel.
- Validation: Server-side validation using Zod for all incoming payloads.
- Architecture: Modular monolith. No separate Laravel backends, microservices, or Redis caches without an explicit architectural justification.

### 3. Architectural Boundaries
- React Client Components handle local UI interactions, forms, and dialogs.
- React Server Components handle server-side data fetching and initial rendering.
- Server Actions or Route Handlers handle mutations consistently.
- Business rules reside exclusively in `src/server/services/`.
- Never connect directly to PostgreSQL from client-side code.
- Never import `src/server/*` modules into client components.

### 4. Money and Financial Integrity
- **Zero Floating-Point Math:** Never use floats for monetary values.
- Store all amounts as **integer minor units** (e.g., halalas, cents) using `BIGINT`.
- Always store the currency code alongside each monetary record.
- Invariant: $\sum \text{participant shares} = \text{expense total}$.
- Distribute rounding remainders deterministically.
- Execute expense, split, and outbox writes in a single ACID transaction.
- Prevent duplicate submissions via idempotency keys.
- Net balances must be derived from valid expense and settlement records.

### 5. Authorization and Security
- Authenticate every protected request.
- Authorize every read and write operation on the server against the requesting user's identity.
- Verify active group membership before exposing any group details.
- Never rely on hiding UI buttons as a substitute for server-side security.
- Store session tokens strictly in `httpOnly`, secure, `sameSite` cookies. Never use `localStorage`.
- Never leak private keys, secrets, or database URLs to client bundles.

### 6. Data Modeling and PostgreSQL
- Enforce foreign keys, unique constraints, and indexes on lookup columns (`group_id`, `user_id`, `created_at`).
- Use explicit lifecycle enums (`pending`, `accepted`, `disputed`, `cancelled`) rather than ambiguous booleans.
- Prohibit hard deletion of financial ledger records. Use void/cancellation workflows with event audit logs.
- All schema alterations must be applied through version-controlled database migrations.

### 7. Workflows: Expenses and Settlements
- Each expense has one payer and one or more participant split records.
- Expense lifecycle status and split decision status are independent entities.
- Approval of an expense acknowledges the debt; it does not represent payment.
- Settlements require confirmation by the recipient before debt is marked as cleared.

### 8. Notifications and Background Operations
- Commit core business database transactions before triggering external push or email notifications.
- Use a transactional outbox table to decouple business logic from external API availability.
- Retry transient notification failures with exponential backoff.
- Mask sensitive financial numbers from lock-screen notification banners.

### 9. PWA Guidelines
- Serve strictly over HTTPS.
- Maintain a valid `manifest.webmanifest` and required PNG app icons.
- Never cache private user financial API responses in public service worker caches.
- Provide a clear, polished offline state. Do not show offline actions as saved until the server confirms.

### 10. Code Quality and Standards
- Enable TypeScript `strict: true`. Avoid `any`; use strict typing or `unknown`.
- Keep components small, modular, and focused.
- Centralize shared utilities (money calculations, date formatters, error handlers).
- Never silence errors or leave unhandled promise rejections. Return clear, user-friendly error messages.

### 11. Testing Mandate
- Unit test all money arithmetic, splitting algorithms, and remainder distributions.
- Integration test transactional workflows (creating expenses, confirming settlements, rejecting mismatched split totals).
- Verify access control policies with non-member test users.
- Run type checks, linter, and automated tests in CI before merging.

### 12. Privacy and Compliance
- Collect only the minimum personal data required for platform operation.
- Provide user profile data export and complete account deletion workflows.
- Store uploaded receipts in private storage, accessible only via authenticated pre-signed URLs.

### 13. Git and Delivery
- Commit changes in clean, descriptive feature branches.
- Never commit credentials, `.env` secrets, or production database dumps.
- Run migrations and test suites automatically in continuous integration (CI).

### 14. Definition of Done
A feature is complete only when:
1. Requirements and security policies are clearly defined.
2. Database migrations are generated and tested.
3. Server-side validation and authorization are enforced.
4. Loading, empty, success, and error UI states are implemented.
5. Automated unit and integration tests pass.
6. Responsive design and accessibility standards are satisfied.
7. Documentation and type definitions are updated.

---

## 18. SEO, Landing Page, and Launch Preparation

Even as a web application, Hisabo requires a high-converting public website to explain its value proposition and drive adoption.

### Recommended Public Routes
- `/` — High-converting landing page explaining the core problem and solution.
- `/features` — Deep dive into expense splitting, groups, and settlements.
- `/how-it-works` — Visual walkthrough with real-world examples.
- `/privacy` — Comprehensive privacy policy.
- `/terms` — Terms of service.
- `/support` — FAQ and contact support form.

### Landing Page Messaging

```text
Headline:
Shared expenses, without the awkward conversations.

Subheadline:
Track who paid, split bills fairly, and settle up with your friends—all in one simple place.
```

### SEO & Indexing Rules
- Implement Open Graph metadata, Twitter cards, structured schema markup, and dynamic favicons.
- Ensure private routes (`/dashboard`, `/groups/*`, `/expenses/*`, `/admin/*`) are strictly excluded from search indexation via `robots.txt` and `noindex` headers.

---

## 19. What Not to Build Yet

To launch fast and maintain high quality, resist scope creep. Avoid these distractions for the initial release:

1. **Cryptocurrency or Digital Wallets:** Unnecessary compliance and security overhead.
2. **Direct Bank Integrations / Open Banking:** Complex regulatory requirements not needed for manual expense tracking.
3. **Automated Real-Money Transfers:** Hisabo records settlements; it does not execute them.
4. **Complex Double-Entry Accounting Systems:** Keep the ledger intuitive for ordinary friends and roommates.
5. **AI Chatbots / Conversational Interfaces:** High token cost and questionable utility for core splitting tasks.
6. **Multiple Backend Microservices:** Adds DevOps friction without benefit for this scale.
7. **Complex Offline Multi-Master Sync:** Avoid distributed database conflict-resolution logic in version 1.
8. **Heavy Enterprise Analytics:** Focus on actionable personal balance summaries.
9. **Live Multi-Currency Conversion Engines:** Stick to single-currency groups for the MVP.
10. **Native Mobile Codebases (React Native / Flutter / Swift):** Validate product-market fit with the PWA first.

---

## 20. Your First Implementation Checklist & Final Recommendation

### Step-by-Step Implementation Roadmap

- [ ] **1. Initialize Next.js App:** Set up TypeScript (strict), Next.js App Router, Tailwind CSS, and ESLint/Prettier.
- [ ] **2. Provision PostgreSQL & ORM:** Configure PostgreSQL instance, initialize Prisma/Drizzle, and establish migration workflow.
- [ ] **3. Commit Rulebook & Environment:** Add `AGENTS.md` and `.env.example` to the repository root.
- [ ] **4. Build Authentication & Access Control:** Implement session management, login/register views, and server-side authorization guards.
- [ ] **5. Build Groups & Membership:** Create group CRUD, member invitation links, and group settings screens.
- [ ] **6. Build Integer Expense Engine:** Implement integer-based equal and custom splitting with deterministic remainder distribution.
- [ ] **7. Implement Balances & Settlements:** Build who-owes-whom balance ledger, settlement recording, and recipient confirmation workflow.
- [ ] **8. Notifications & Transactional Outbox:** Implement outbox event dispatcher, in-app notification center, and Web Push integration.
- [ ] **9. PWA Shell & Installation:** Configure `manifest.webmanifest`, service worker caching, and offline status indicators.
- [ ] **10. Beta Testing & Play Store Packaging:** Run closed beta with real users, verify all financial balances, and configure Trusted Web Activity (TWA) for Google Play.

---

### Final Architectural Recommendation

Start with **Next.js + TypeScript + PostgreSQL + one ORM + secure authentication + PWA support**.

Focus first on the core loop: **Groups $\rightarrow$ Expenses $\rightarrow$ Split Math $\rightarrow$ Balances $\rightarrow$ Settlements**.

Treat every expense and settlement record as **auditable financial data** from day one. If you establish this robust foundation, Hisabo will effortlessly scale from a lightweight PWA into a flagship mobile application on the Google Play Store.