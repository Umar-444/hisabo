<div align="center">

# ⚡ Hisabo

### *Split easy. Settle smart.*

**The auditable, zero-loss shared expense and settlement ledger for modern roommates, trips, and apartments.**

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/umar-444/hisabo?style=for-the-badge&logo=github&color=185CFF&logoColor=white)](https://github.com/umar-444/hisabo/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/umar-444/hisabo?style=for-the-badge&logo=github&color=10B981&logoColor=white)](https://github.com/umar-444/hisabo/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1?style=for-the-badge)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-Turbopack-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React%2019-Server--First-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript%205-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa&logoColor=white)](public/manifest.webmanifest)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

<br/>

```
      ___           ___           ___           ___           ___           ___     
     /\__\         /\  \         /\  \         /\  \         /\  \         /\  \    
    /:/  /        /::\  \       /::\  \       /::\  \       /::\  \       /::\  \   
   /:/__/        /:/\:\  \     /:/\ \  \     /:/\:\  \     /:/\:\__\     /:/\:\  \  
  /::\  \ ___   _\:\~\:\  \   _\:\~\ \  \   /::\~\:\  \   /:/ /:/  /    /:/  \:\  \ 
 /:/\:\  /\__\ /\ \:\ \:\__\ /\ \:\ \ \__\ /:/\:\ \:\__\ /:/_/:/__/___ /:/__/ \:\__\
 \/__\:\/:/  / \:\ \:\ \/__/ \:\ \:\ \/__/ \/__\:\/:/  / \:\/:::::/  / \:\  \ /:/  /
      \::/  /   \:\ \:\__\    \:\ \:\__\        \::/  /   \::/~~/~~~~   \:\  /:/  / 
      /:/  /     \:\/:/  /     \:\/:/  /        /:/  /     \:\~~\        \:\/:/  /  
     /:/  /       \::/  /       \::/  /        /:/  /       \:\__\        \::/  /   
     \/__/         \/__/         \/__/         \/__/         \/__/         \/__/    
```

<br/>

> Crafted by **[Umar Farooq](https://itsumarfarooq.com)** — Senior Software & AI Engineer  
> 🌐 [Website](https://itsumarfarooq.com) • 💼 [LinkedIn](https://www.linkedin.com/in/umar444) • 🐙 [GitHub](https://github.com/umar-444) • ✉️ [Contact](mailto:Umar@itsumarfarooq.com)

</div>

---

## 📸 Visual Showcase

<div align="center">

### 🖥️ Desktop Experience — Complete Command Center
*Real-time zero-sum position hero, peer debts breakdown, SettleSmart integrity strip, and recent ledger feed.*

<img src="public/screenshots/dashboard-wide.png" alt="Hisabo Desktop Dashboard" width="95%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.12);" />

<br/><br/>

### 📱 Mobile PWA & Flow Views
*Fully responsive, touch-optimized Progressive Web App with instant Quick Pay and currency isolation.*

| 📊 Mobile Dashboard | 💳 Currency Balances | 📝 Itemized Expenses |
| :---: | :---: | :---: |
| <img src="public/screenshots/dashboard-narrow.png" width="280" alt="Dashboard Mobile" /> | <img src="public/screenshots/balances-narrow.png" width="280" alt="Balances Screen" /> | <img src="public/screenshots/expenses-narrow.png" width="280" alt="Expenses Stream" /> |

</div>

---

## 🎯 What is Hisabo?

Most shared-expense apps suffer from **silent floating-point rounding errors**, chaotic currency mingling, and **unilateral debt cancellation** where anyone can claim they paid you without verification.

**Hisabo** fixes shared finances by operating as an **auditable, zero-loss settlement ledger**:
- 💎 **Integer Minor Units Only:** Stored as `BIGINT` halalas or cents. Float math is strictly banished.
- 🤝 **Two-Party Settlement Handshake:** A debtor logs an offline payment claim $\rightarrow$ The creditor inspects and confirms receipt $\rightarrow$ **Balances only update upon creditor confirmation.**
- ⚡ **Quick Pay with Downward-Only Debt Cap:** One-tap settlements pre-filled directly from the Dashboard, bounded strictly to what is owed.
- 🛑 **Structured Claim Rejections:** Creditors can reject false or mismatched claims with explicit reasons (`NOT_RECEIVED`, `WRONG_AMOUNT`, `WRONG_METHOD`, etc.), freeing the pending lock for correction.
- 🔔 **Web Push Alerts & Exact Badges:** Real-time push notifications and exact unread badges on the top bar and sidebar navigation.

---

## ⚖️ The SettleSmart Invariant Engine

Hisabo is founded upon non-negotiable financial conservation invariants:

### 1. Conservation Equation (Zero-Loss Splitting)
Every split satisfies:

$$\sum_{i=1}^{n} \text{Participant Share}_i = \text{Expense Total}$$

```text
Example: SAR 100.00 (10,000 halalas) split equally among 3 friends:
- Quotient: 10,000 / 3 = 3,333 halalas each
- Remainder: 10,000 - (3,333 * 3) = 1 halala
- Allocation: Participant 1 = 3,334 halalas | Participant 2 = 3,333 | Participant 3 = 3,333
- Invariant check: 3,334 + 3,333 + 3,333 == 10,000 halalas (100% exact, zero float loss)
```

### 2. Zero-Sum Balance Ledger
For every recorded expense:
- **Payer is credited:** $\text{Credit} = \text{Total Paid} - \text{Payer's Own Share}$
- **Participants are debited:** $\text{Debit} = -(\text{Assigned Share})$
- **Invariant:** $\sum \text{All Net Positions} = 0$

### 3. Two-Party Handshake Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Debtor as 👤 Debtor (Owes Money)
    participant Ledger as ⚡ Hisabo SettleSmart
    actor Creditor as 👥 Creditor (Owed Money)

    Debtor->>Ledger: Initiates Quick Pay (Cash / Bank Transfer)
    Note over Ledger: Settlement created in PENDING state.<br/>Balances remain unchanged.<br/>Single pending claim lock active.
    Ledger-->>Creditor: 🔔 Web Push Alert + Action Card Badge
    alt Creditor Verifies & Confirms
        Creditor->>Ledger: Confirms Receipt
        Note over Ledger: Settlement marked CONFIRMED.<br/>Zero-sum ledger updates atomically!
        Ledger-->>Debtor: 🔔 Debt Settled Notification
    else Creditor Identifies Discrepancy
        Creditor->>Ledger: Rejects with Structured Reason (e.g. WRONG_AMOUNT)
        Note over Ledger: Settlement marked REJECTED.<br/>Balances untouched.<br/>Claim lock freed for debtor retry.
        Ledger-->>Debtor: ⚠️ Rejection alert with explanation note
    end
```

---

## ✨ Full Feature Matrix

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Integer Minor-Unit Engine** | `BIGINT` integer halalas/cents. Zero floating point rounding drift. | ✅ Production |
| **Two-Party Handshake** | Offline payment claim $\rightarrow$ Creditor confirmation $\rightarrow$ Ledger update. | ✅ Production |
| **Quick Pay Sheet** | Instant settlement sheet accessible from Dashboard, Groups, and Expenses. | ✅ Production |
| **24h Request Cooldown** | Creditors can request settlement with a 24-hour rate limit per debtor. | ✅ Production |
| **Admin 'Remind All'** | Group Admins can nudge all debtors with outstanding balances in one tap. | ✅ Production |
| **Multi-Currency Segregation** | Independent ledgers per currency (`SAR`, `USD`, `AED`) with live switcher. | ✅ Production |
| **Web Push (VAPID)** | Transactional push notifications delivered straight to mobile and desktop browsers. | ✅ Production |
| **Exact Unread Badges** | Visual numeric counter on header bell and left sidebar navigation. | ✅ Production |
| **Group Roles & Invites** | Owner, Admin, Member permissions with expiring, tokenized invite links. | ✅ Production |
| **Progressive Web App** | Service Worker offline shell, standalone manifest, and mobile splash screen. | ✅ Production |
| **Admin Control Center** | Live platform metrics, user account status, audit logs, and currency controls. | ✅ Production |

---

## 🛠️ Technology Stack

| Layer | Choice | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server Components default, Server Actions for writes, Turbopack |
| **Runtime** | React 19 | Server-first model, `useActionState` |
| **Language** | TypeScript 5 | Strict mode (`strict: true`), 100% type-safe schemas |
| **Styling** | Tailwind CSS v4 | CSS-first `@theme` design tokens in `globals.css` |
| **Database** | PostgreSQL (Neon Serverless) | ACID transactions, pooled runtime, unpooled migrations |
| **ORM** | Drizzle ORM | Type-safe migrations, zero-overhead relational queries |
| **Validation** | Zod | Single source of truth for all schemas and forms |
| **Auth** | Auth.js v5 (NextAuth) | JWT session strategy stored strictly in `httpOnly` secure cookies |
| **Push** | Web Push (VAPID) | Background worker and push notifications |
| **Testing** | Tsx & Custom Test Runner | Automated tests for financial invariants and settlement flows |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher
- A **PostgreSQL** database (e.g. free tier on [Neon](https://neon.tech) or local Postgres)

### 2. Clone & Install
```bash
git clone https://github.com/umar-444/hisabo.git
cd hisabo
npm install
```

### 3. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env.local
```
Configure your database credentials in `.env.local`:
```env
# PostgreSQL Database (Neon Serverless)
DATABASE_URL="postgresql://user:password@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@ep-direct.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth.js v5 Secret
AUTH_SECRET="generate-a-random-32-byte-secret"
AUTH_URL="http://localhost:3000"

# Initial Admin Credentials (Optional)
ADMIN_DEFAULT_PASSWORD="Admin@Hisabo2026!"
```

### 4. Database Migration & Seed
```bash
# Apply schema tables and relational constraints to PostgreSQL
npm run db:apply

# (Optional) Seed demo users, default currencies, and sample groups
npm run db:seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view Hisabo in action.

---

## 🧪 Testing & Verification

Hisabo maintains automated test suites to ensure 100% mathematical accuracy and strict settlement state transitions:

```bash
# Run financial invariant & quick-pay test suites
npm test

# Run strict TypeScript compiler verification (0 errors required)
npx tsc --noEmit

# Run ESLint
npm run lint
```

---

## 📂 Architecture & Directory Structure

```text
src/
├── app/
│   ├── (marketing-site)/    # Public landing pages (/), features, how-it-works
│   ├── (auth-pages)/        # Authentication (/login, /register, /reset-password)
│   ├── (user-panel)/        # Core user application:
│   │   ├── dashboard/       # Net balances, peer debts widget, quick actions
│   │   ├── groups/          # Group ledgers, member roles, invite link generator
│   │   ├── expenses/        # Split engine, itemized expense details, disputes
│   │   ├── balances/        # Who owes whom, currency filter, quick pay sheet
│   │   ├── settlements/     # Offline payments claim & verification workflow
│   │   └── notifications/   # In-app notifications feed & push triggers
│   ├── (admin-panel)/       # Admin portal: metrics, user status, currencies, audit logs
│   └── (backend)/           # Server-only backend:
│       └── _lib/db/         # Drizzle schema, DB client, migration scripts
├── features/                # Modular domain modules (Fixed shape):
│   ├── auth/                # Auth credentials, password hashing, session guards
│   ├── groups/              # Group CRUD, role permissions, cryptographic invites
│   ├── expenses/            # Integer split engine, categories, soft-disputes
│   ├── balances/            # Real-time zero-sum position calculations
│   ├── settlements/         # Quick pay, 24h request rate limits, claim rejection
│   ├── notifications/       # Internal notifications & web push dispatcher
│   └── admin/               # Privileged metric queries and audit logging
├── components/
│   ├── ui/                  # Accessible primitives (Modal, Drawer, Tabs)
│   └── layout/              # Shells: DesktopUserShell, UserSidebarNav, PwaPrompt
└── lib/
    ├── money.ts             # Integer minor-unit math, roundings, currency formatters
    ├── ui.ts                # Master Tailwind class recipes & design system tokens
    └── utils.ts             # Class merging helper (cn)
```

---

## 👨‍💻 Meet the Author

<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://itsumarfarooq.com">
        <img src="https://github.com/umar-444.png" width="130px;" alt="Umar Farooq" style="border-radius: 50%; border: 3px solid #185CFF;"/>
      </a>
      <br />
      <b><font size="+2">Umar Farooq</font></b>
      <br />
      <sub>Senior Software & AI Engineer</sub>
      <br />
      <br />
      <a href="https://itsumarfarooq.com">
        <img src="https://img.shields.io/badge/Portfolio-itsumarfarooq.com-185CFF?style=for-the-badge&logo=google-chrome&logoColor=white" />
      </a>
      <a href="https://www.linkedin.com/in/umar444">
        <img src="https://img.shields.io/badge/LinkedIn-umar444-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
      </a>
      <a href="https://github.com/umar-444">
        <img src="https://img.shields.io/badge/GitHub-umar--444-181717?style=for-the-badge&logo=github&logoColor=white" />
      </a>
      <a href="mailto:Umar@itsumarfarooq.com">
        <img src="https://img.shields.io/badge/Email-Umar%40itsumarfarooq-EA4335?style=for-the-badge&logo=gmail&logoColor=white" />
      </a>
    </td>
  </tr>
</table>

<br/>

**Passionate about distributed systems, resilient financial engines, and state-of-the-art AI applications.**  
Building high-impact software products with modern web technologies, strict mathematical guarantees, and delightful user experiences.

*Explore more projects and insights at [itsumarfarooq.com](https://itsumarfarooq.com).*

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [issues page](https://github.com/umar-444/hisabo/issues).

1. Review our [Contributing Guide](CONTRIBUTING.md).
2. Adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
3. Open a Pull Request using our [PR Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## 🔒 Security

For security vulnerabilities, please refer to our [Security Policy](SECURITY.md) or contact [Umar@itsumarfarooq.com](mailto:Umar@itsumarfarooq.com).

---

## 📄 License

Hisabo is open-source software licensed under the **[MIT License](LICENSE)**.

<div align="center">

**⭐ Star Hisabo on GitHub if you find it helpful! ⭐**

Made with ❤️ by [Umar Farooq](https://itsumarfarooq.com)

</div>
