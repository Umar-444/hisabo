# Contributing to Hisabo ⚡

Thank you for your interest in contributing to **Hisabo**!  
Hisabo is an open-source, production-grade shared-expense and balance-tracking platform built for roommates, travel groups, and shared households.

> **Our Philosophy:** Split easy. Settle smart.  
> Financial precision, zero-loss math, and delightful user experience are our core values.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** React 19 (Server-first architecture)
- **Language:** TypeScript 5 (`strict: true`)
- **Styling:** Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`)
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM & `drizzle-kit`
- **Validation:** Zod
- **Auth:** Auth.js v5 (NextAuth) with JWT session cookies
- **Push / PWA:** Web Push (VAPID) + Service Worker

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- **Git**
- A free **PostgreSQL** database (e.g. [Neon](https://neon.tech), Supabase, or local Postgres)

### 2. Fork & Clone
```bash
# 1. Fork the repo on GitHub, then clone your fork:
git clone https://github.com/<your-username>/hisabo.git
cd hisabo

# 2. Add the upstream remote:
git remote add upstream https://github.com/Umar-444/hisabo.git

# 3. Install dependencies:
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Fill in the essential variables in `.env.local`:
- `DATABASE_URL`: PostgreSQL connection string (pooled)
- `DATABASE_URL_UNPOOLED`: Direct PostgreSQL connection string for migrations
- `AUTH_SECRET`: Random 32-character string (`npx auth secret` or `openssl rand -hex 32`)
- `AUTH_URL`: `http://localhost:3000`

### 4. Database Setup
Apply schema migrations and seed initial data:
```bash
# Apply schema updates to your database
npm run db:apply

# (Optional) Seed demo users, categories, currencies, and test groups
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view Hisabo in action.

---

## 🔒 Financial & Architectural Invariants (Non-Negotiable)

Financial integrity takes absolute precedence over all other considerations in Hisabo. Every pull request must respect these invariants:

1. **Integer Minor Units Only:**  
   Never use floating-point numbers (`FLOAT`, `DOUBLE`, or `Number` division) for currency values. All monetary values are stored and computed in integer minor units (`BIGINT` halalas or cents):
   - SAR 10.00 $\rightarrow$ `1000` halalas
   - SAR 25.50 $\rightarrow$ `2550` halalas

2. **Conservation Equation (Zero-Loss Splitting):**  
   Every expense must satisfy:
   $$\sum \text{participant shares} = \text{expense total}$$
   Odd remainders must be distributed deterministically (e.g., extra halalas assigned to the payer or first participant).

3. **Two-Party Settlement Handshake:**  
   Recording an offline payment creates a `pending` settlement.  
   **Balances do NOT update** until the creditor inspects and explicitly confirms receipt.

4. **Server vs. Client Boundaries:**  
   - Every page and component is a React Server Component (RSC) by default.
   - Interactive UI widgets (`"use client"`) must reside at the leaf.
   - **Never** import `server-only`, Drizzle ORM, or database credentials into Client Components. Import client-side components from direct subpaths (`@/features/<feature>/components/...`) rather than barrel files that re-export `queries.ts`.

---

## 🧪 Testing & Verification

Before opening a pull request, verify that all automated checks pass cleanly:

```bash
# 1. Run financial and quick-pay invariant unit tests
npm test

# 2. Strict TypeScript type check (must pass with 0 errors)
npx tsc --noEmit

# 3. Code formatting & lint check
npm run lint
```

---

## 🌿 Contribution Workflow

1. **Create a Branch:**
   Branch off from `Devbranch`:
   ```bash
   git checkout Devbranch
   git pull upstream Devbranch
   git checkout -b feat/your-feature-name
   ```

2. **Follow Conventional Commits:**
   Use descriptive commit messages prefixed with the appropriate type:
   - `feat:` A new user-facing feature
   - `fix:` A bug fix
   - `docs:` Documentation changes
   - `test:` Adding or updating tests
   - `refactor:` Code improvements without functional changes

3. **Submit a Pull Request:**
   - Push your branch to your fork:
     ```bash
     git push origin feat/your-feature-name
     ```
   - Open a PR against the `Devbranch` (or `main`) branch of `Umar-444/hisabo`.
   - Complete the PR template checklist describing your changes, motivation, and test verification.

## 👨‍💻 Project Maintainer

Hisabo was created and is actively maintained by **[Umar Farooq](https://itsumarfarooq.com)** (Senior Software and AI Engineer).
- **Portfolio & Blog:** [itsumarfarooq.com](https://itsumarfarooq.com)
- **LinkedIn:** [linkedin.com/in/umar444](https://www.linkedin.com/in/umar444)
- **GitHub:** [@umar-444](https://github.com/umar-444)
- **Email:** [Umar@itsumarfarooq.com](mailto:Umar@itsumarfarooq.com)

Feel free to connect, ask questions, or discuss architectural improvements directly!

---

Thank you for helping make Hisabo the best shared-expense platform in the world! 🚀
