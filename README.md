<div align="center">

# Hisabo ⚡

**Split easy. Settle smart.**

A modern, high-precision shared-expense and balance-tracking platform built for roommates, travel groups, and shared households.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb?logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Database-Neon_Postgres-00e599?logo=postgresql)](https://neon.tech/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## 📖 Overview

Hisabo records shared expenses, calculates fair splits, maintains a real-time zero-sum balance ledger, and verifies offline settlements through a secure two-party handshake.

Most expense-splitting tools suffer from floating-point rounding errors and unilateral debt cancellation. Hisabo solves this by operating as an **auditable, zero-loss settlement ledger**:
1. **Who paid?**
2. **Who participated?**
3. **How much does each person owe?**
4. **Which expenses are disputed or unpaid?**
5. **Who has confirmed their settlement?**

> **Note:** Hisabo is an auditable record & settlement ledger — it records offline payments (cash, bank transfer, UPI) and verifies claims between peers. It does NOT hold custodial deposits or act as a banking wallet.

---

## ✨ Key Features

- 🎯 **Integer-Precision Financial Engine:** Every currency calculation uses integer minor units (`BIGINT` halalas or cents). Floating point numbers are strictly forbidden. Odd remainders are distributed deterministically ($\sum \text{shares} = \text{expense total}$).
- 🤝 **Two-Party Settlement Handshake:** A debtor logs an offline payment claim $\rightarrow$ The creditor inspects and confirms receipt $\rightarrow$ Balances update **only upon confirmation**.
- ⚡ **Quick Pay Flow & Downward-Only Cap:** Settle individual debts with one tap directly from Dashboard, Group, or Expense detail views. The claim amount is capped at outstanding liability.
- 🛑 **Structured Claim Rejections:** Creditors can reject payment claims with structured reasons (`NOT_RECEIVED`, `WRONG_AMOUNT`, `WRONG_METHOD`, etc.) and optional notes, immediately freeing the pending claim lock for correction.
- 🔔 **Web Push & Unread Badges:** Instant browser push alerts for payment requests and settlement updates, paired with numerical notification counters on top bars and sidebar nav.
- 🌍 **Multi-Currency Segregation:** Balances are partitioned cleanly per currency (`SAR`, `USD`, `AED`) with interactive currency pickers—never summing across currencies without verified rates.
- 🛡️ **Group Governance & Roles:** Apartments, trips, or flatmates with Owner, Admin, and Member roles, plus cryptographic, rate-limited invite links.
- 📱 **Progressive Web App (PWA):** Mobile-first design built with Tailwind CSS v4, installable as a standalone PWA on Android, iOS, and desktop.
- ⚙️ **Admin Portal:** Moderation dashboard, user management, audit logs, and dynamic system currency activation.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Server Components by default, Server Actions for mutations |
| **Runtime** | React 19 | Server-first model, `useActionState` |
| **Language** | TypeScript 5 | Strict mode, zero unchecked `any` |
| **Styling** | Tailwind CSS v4 | CSS-first `@theme` in `globals.css` |
| **Database** | PostgreSQL (Neon Serverless) | ACID transactions, `BIGINT` minor units |
| **ORM** | Drizzle ORM & `drizzle-kit` | Typed migrations and schema inference |
| **Auth** | Auth.js v5 (NextAuth) | JWT session strategy in secure `httpOnly` cookies |
| **Validation** | Zod | Single source of truth for schemas & forms |
| **Push** | Web Push (VAPID) | Background worker and push notifications |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- A **PostgreSQL** database (e.g., free tier on [Neon](https://neon.tech) or local Postgres)

### 2. Clone the Repository
```bash
git clone https://github.com/Umar-444/hisabo.git
cd hisabo
npm install
```

### 3. Set Up Environment Variables
Create your local environment file:
```bash
cp .env.example .env.local
```
Fill in the database and authentication secrets in `.env.local`:
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-host-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@ep-host.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth.js v5 Secret
AUTH_SECRET="your-generated-32-byte-secret"
AUTH_URL="http://localhost:3000"

# Optional Initial Admin Password
ADMIN_DEFAULT_PASSWORD="Admin@Hisabo2026!"
```

### 4. Apply Database Migrations & Seed
```bash
# Apply schema tables and constraints to your database
npm run db:apply

# (Optional) Seed demo users, default currencies, and sample groups
npm run db:seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Hisabo maintains strict unit tests for its financial engine and settlement state transitions:

```bash
# Run financial invariant & quick pay test suites
npm test

# Run strict TypeScript compiler verification
npx tsc --noEmit

# Run ESLint
npm run lint
```

---

## 📂 Architecture & Directory Structure

```text
src/
├── app/
│   ├── (marketing-site)/    # Public pages: Landing (/), Features, How it Works
│   ├── (auth-pages)/        # Authentication: /login, /register, /reset-password
│   ├── (user-panel)/        # Protected user application:
│   │   ├── dashboard/       # Net balances, peer debts widget, quick actions
│   │   ├── groups/          # Group detail, member roles, invite link generator
│   │   ├── expenses/        # Split engine, expense detail, dispute flow
│   │   ├── balances/        # Who owes whom, currency filter, quick pay sheet
│   │   ├── settlements/     # Offline payments claim & verification workflow
│   │   └── notifications/   # In-app notifications feed & push triggers
│   ├── (admin-panel)/       # Admin dashboard: users, groups, audit logs, currencies
│   └── (backend)/           # Server-only backend:
│       └── _lib/db/         # Drizzle schema, DB client, migration scripts
├── features/                # Modular domain modules (Fixed shape):
│   ├── auth/                # Authentication logic, credentials & session queries
│   ├── groups/              # Group CRUD, member governance & invites
│   ├── expenses/            # Integer split engine, categories & disputes
│   ├── balances/            # Real-time zero-sum position queries
│   ├── settlements/         # Quick pay, 24h request rate limits, claim rejection
│   ├── notifications/       # Internal notifications & web push dispatcher
│   └── admin/               # Privileged metric queries and audit logging
├── components/
│   ├── ui/                  # Accessible behavioral primitives (Modal, Drawer, Tabs)
│   └── layout/              # Shells: DesktopUserShell, UserSidebarNav, PwaPrompt
└── lib/
    ├── money.ts             # Integer minor-unit math, roundings, SAR/USD formatters
    ├── ui.ts                # Master Tailwind class recipes & design system tokens
    └── utils.ts             # Class merging helper (cn)
```

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels!  
Please read our [Contributing Guide](CONTRIBUTING.md) to understand:
- The development setup and branching strategy (`Devbranch`).
- Non-negotiable financial conservation invariants.
- How to submit a Pull Request using our [PR Template](.github/PULL_REQUEST_TEMPLATE.md).

All participants are expected to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🔒 Security

If you discover a security vulnerability in Hisabo, please disclose it responsibly by reviewing our [Security Policy](SECURITY.md) or contacting [security@hisabo.com](mailto:security@hisabo.com). Please **do not** file public issues for security vulnerabilities.

---

## 📄 License

Hisabo is open-source software licensed under the [MIT License](LICENSE).
