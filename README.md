# Hisabo ⚡

> **Split easy. Settle smart.**

Hisabo is a modern, reliable shared-expense and balance-tracking platform built for roommates, travel groups, and shared households. It records expenses, calculates fair splits with zero floating-point loss, maintains real-time zero-sum balance ledgers, and manages two-party offline settlement verification.

---

## ✨ Key Features

- **Integer-Precision Financial Engine:** Computes all monetary values in integer minor units (`BIGINT` halalas / cents) with deterministic remainder distribution ($\sum \text{splits} = \text{total}$).
- **Multi-Currency Segregation:** Balances are partitioned cleanly per currency (`SAR`, `USD`, `AED`) with interactive currency switchers—never summing across currencies without exchange rates.
- **Two-Party Settlement Handshake:** Debtor logs an offline payment claim $\rightarrow$ Creditor verifies and confirms receipt before debt is deducted from the ledger.
- **Pending Actions Center:** Top-level notification badges and dashboard action cards surfacing pending claims and disputes requiring immediate decision.
- **Tokenized Group Invites:** Cryptographic invitation tokens with configurable expiration (24 hours, 7 days, 30 days) and single-use or revocation options.
- **Rate Limiting & Abuse Protection:** Sliding-window rate limiters protecting authentication, password resets, and invite join endpoints against brute-force attacks.
- **PWA & Mobile-First Interface:** Responsive design crafted with Tailwind CSS v4 and installable as a standalone Progressive Web App.
- **Admin Currency Controller:** Real-time administrative controls to activate, deactivate, or set default active system currencies.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack) & React 19
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4 (`@theme` tokens in `globals.css`)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM & `drizzle-kit`
- **Validation:** Zod v3
- **Icons & UI:** Lucide React & Sonner toasts

---

## 🚀 Getting Started

### 1. Prerequisites & Installation

Ensure you have Node.js 20+ installed.

```bash
git clone https://github.com/Umar-444/hisabo.git
cd hisabo
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgres://..."
DATABASE_URL_UNPOOLED="postgres://..."

# Auth Secret
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Migrations & Seeds

```bash
# Push schema or run migrations
npx drizzle-kit push

# (Optional) Seed initial demo data & currencies
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```text
src/
├── app/
│   ├── (marketing-site)/    # Public landing pages
│   ├── (auth-pages)/        # Authentication (/login, /register)
│   ├── (user-panel)/        # Dashboard, groups, balances, expenses, settlements
│   ├── (admin-panel)/       # Admin metrics, audit logs, and currency controls
│   └── (backend)/           # Drizzle schema, DB client, and server-side services
├── features/                # Domain modules: auth, groups, balances, settlements, admin
└── lib/                     # Money math, rate limiting, UI recipes, and utilities
```

---

## 📄 License

Private & proprietary — Hisabo.
