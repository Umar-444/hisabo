# Hisabo User Dashboard — Complete Master Design System & Implementation Guide

> **Tagline:** Split easy. Settle smart.  
> **Visual Origin:** Chime (iOS) Consumer Fintech Design Architecture adapted to Hisabo  
> **Primary Brand Color:** `#185CFF` (Hisabo Royal Blue)  
> **Typography:** DM Sans (Google Fonts) with Tabular Numerics (`font-variant-numeric: tabular-nums`)  
> **Status:** **BINDING MASTER SPECIFICATION** — Follow this file throughout the entire project for all User Dashboard and App Panel features, layouts, and components.

---

## Table of Contents
1. [Visual Theme & Brand Atmosphere](#1-visual-theme--brand-atmosphere)
2. [Color Palette & Financial Semantics](#2-color-palette--financial-semantics)
3. [Typography Hierarchy & Number Formatting](#3-typography-hierarchy--number-formatting)
4. [Signature Component Specifications & Code Templates](#4-signature-component-specifications--code-templates)
   - [4.1 The Hisabo Balance Hero Card](#41-the-hisabo-balance-hero-card)
   - [4.2 SettleSmart Banner (Trust & Integrity)](#42-settlesmart-banner-trust--integrity)
   - [4.3 Fintech Transaction / Expense Row](#43-fintech-transaction--expense-row)
   - [4.4 Status Chips & Pills](#44-status-chips--pills)
   - [4.5 Instant Transaction Alert Toast](#45-instant-transaction-alert-toast)
   - [4.6 Top App Header & Mobile Bottom Tab Bar](#46-top-app-header--mobile-bottom-tab-bar)
   - [4.7 Large Currency & Amount Input](#47-large-currency--amount-input)
   - [4.8 Group Card & Household Tile](#48-group-card--household-tile)
   - [4.9 Settle Up Modal / Slide-Over Sheet](#49-settle-up-modal--slide-over-sheet)
5. [Layout, Container & Spacing System](#5-layout-container--spacing-system)
6. [Depth, Elevation & Shadows](#6-depth-elevation--shadows)
7. [Motion, Micro-Interactions & Haptics](#7-motion-micro-interactions--haptics)
8. [Strict Do's and Don'ts](#8-strict-dos-and-donts)
9. [Responsive & PWA Standalone Rules](#9-responsive--pwa-standalone-rules)
10. [Agent & Developer Implementation Guide](#10-agent--developer-implementation-guide)

---

## 1. Visual Theme & Brand Atmosphere

Hisabo's User Dashboard is a **calm, confidence-building shared-money dashboard** built around one singular question: **"Where do I stand right now with my roommates, flatmates, and friends?"**

### The Emotional Job
Shared living and group expenses are historically fraught with awkwardness, friction, and anxiety. Traditional accounting apps feel like corporate spreadsheets, while peer-to-peer payment apps treat every expense like an aggressive debt collection.

Hisabo completely transforms this experience into a reassuring, friendly consumer fintech interface:
1. **Calm Canvas:** Uses a soft, tranquil light slate canvas (`#F1F5F9` / `#F8FAFC`) rather than harsh stark white or aggressive dark grays.
2. **The Hisabo Royal Blue Hero Card:** The crowning centerpiece of the dashboard. A rich, vibrant linear gradient panel (`#185CFF` $\rightarrow$ `#0C45D4`) wearing Hisabo's signature blue with a glowing ambient shadow. The user's net position is rendered enormous (44px, bold 700) with superscript halalas/cents, flanked by instant action pills ("Add Expense", "Settle Up").
3. **Everyday Spending is Neutral Ink (NEVER Alarming Red):** In Hisabo, splitting everyday flat rent, groceries, or dinner is normal life, not a punishment. Everyday expenses owe shares are displayed in **primary neutral ink (`#0F172A`)**, never red. Red is strictly reserved for *disputed expenses*, *failed transactions*, or *overdue balances*.
4. **Positive Money is Emerald Green:** Credits and money owed to you by others are celebrated in vibrant emerald green (`#10B981` / `+SAR 120.00`).
5. **SettleSmart Integrity Banner (SpotMe Equivalent):** A prominent reassurance card highlighting Hisabo's zero-sum mathematical invariant ($\sum \text{shares} = \text{total}$), confirming that balances are 100% verified, remainder-distributed, and free of accounting discrepancies.
6. **Instant Transaction Alerts:** Real-time toasts sliding into view the moment an expense is logged or a settlement is confirmed, reinforcing the zero-latency trust loop.
7. **Heavily Rounded, Friendly Geometry:** 24px hero card radius, 16px banners, 14px buttons/tiles, pill-shaped status chips. Everything feels soft, approachable, and premium.
8. **DM Sans Typography:** Clean geometric sans with rounded terminals; numbers are always tabular 700 weight for effortless scanning.

---

## 2. Color Palette & Financial Semantics

### 2.1 Brand Primary (Hisabo Blue)
- **Primary Royal Blue (`#185CFF`):** Main interactive brand color, hero card gradient anchor, primary CTA buttons, active state indicators.
- **Primary Bright (`#2B6BFF`):** High-energy hover states, active navigation tabs, link text.
- **Primary Pressed (`#1248D6`):** Active/pressed button feedback.
- **Primary Soft Fill (`#EBF2FF` light / `#0D1E42` dark): Tinted icon backgrounds, soft action buttons, category badge backgrounds.
- **Hero Ink (`#FFFFFF`):** High-contrast white typography on the blue hero gradient.
- **Hero Sub-Ink (`rgba(255, 255, 255, 0.75)`): Secondary labels and captions on the hero card.

### 2.2 Surfaces & Canvas

| Surface Token | Light Mode | Dark Mode | Application |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#F1F5F9` (Slate Off-White) | `#0A0F1D` (Deep Navy) | Screen background, page shell |
| **Surface 1** | `#FFFFFF` | `#111827` | Primary cards, lists, banners, sheets |
| **Surface 2** | `#F8FAFC` | `#1F2937` | Hover states, pressed rows, table headers |
| **Divider** | `#E2E8F0` | `#1E293B` | 1px hairline row separators |

### 2.3 Text Tokens

| Text Token | Light Mode | Dark Mode | Application |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `#0F172A` (Navy Ink) | `#F8FAFC` | Expense titles, headers, neutral spending |
| **Text Secondary** | `#64748B` (Slate) | `#94A3B8` | Meta lines, dates, subtitles, helper text |
| **Text Tertiary** | `#94A3B8` | `#64748B` | Form placeholders, disabled elements |
| **Balance Hero Ink** | `#FFFFFF` | `#FFFFFF` | Net balance text on blue hero |

### 2.4 Financial Semantics & Rules

| Role | Light Hex | Dark Hex | Rule & Application |
| :--- | :--- | :--- | :--- |
| **Positive (Money In / Owed to You)** | `#10B981` | `#34D399` | Net positive balance (`+SAR 120.00`), confirmed settlements |
| **Everyday Spending (Neutral)** | `#0F172A` | `#F8FAFC` | User's shared expense share (`-SAR 40.00`). **NEVER RED.** |
| **Pending / Under Review** | `#F59E0B` | `#FBBF24` | Awaiting payee confirmation, pending invitation |
| **Disputed / Negative Critical** | `#EF4444` | `#F87171` | Disputed expense, transaction rejected, payment failed |
| **SettleSmart / Balanced** | `#185CFF` | `#2B6BFF` | Integrity badges, zero-debt balance state |

```ts
// src/config/colors.ts
export const colors = {
  primary:         '#185CFF',
  primaryBright:   '#2B6BFF',
  primaryPressed:  '#1248D6',
  primarySoft:     '#EBF2FF',
  primarySoftDark: '#0D1E42',
  heroInk:         '#FFFFFF',
  heroSubInk:      'rgba(255, 255, 255, 0.75)',

  canvas:          '#F1F5F9',
  surface1:        '#FFFFFF',
  surface2:        '#F8FAFC',
  divider:         '#E2E8F0',

  darkCanvas:      '#0A0F1D',
  darkSurface1:    '#111827',
  darkSurface2:    '#1F2937',
  darkDivider:     '#1E293B',

  textPrimary:     '#0F172A',
  textSecondary:   '#64748B',
  textTertiary:    '#94A3B8',

  positive:        '#10B981',
  positiveSoft:    '#ECFDF5',
  neutralSpending: '#0F172A',
  warning:         '#F59E0B',
  warningSoft:     '#FFFBEB',
  negative:        '#EF4444',
  negativeSoft:    '#FEF2F2',
} as const;
```

---

## 3. Typography Hierarchy & Number Formatting

- **Font Family:** `DM Sans` (Google Fonts), geometric humanist sans with rounded terminals.  
  Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Numeric Rule:** **Every numerical monetary display must use `tabular-nums font-bold` (`font-variant-numeric: tabular-nums; font-weight: 700;`).** This aligns currency columns vertically and prevents jitter during balance roll animations.
- **Superscript Rule:** On display cards (Balance Hero), decimal cents/halalas are split into a smaller font (`.00` in 24px/26px) so the whole integer dominates visual hierarchy.

### Typography Scale Table

| Role | Font | Size | Weight | Line Height | Tracking | Application |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Balance Hero** | DM Sans | `44px` | `700` | `1.05` | `-0.03em` | Primary integer balance on Hero Card |
| **Balance Cents** | DM Sans | `24px` | `700` | `1.1` | `0` | Cents/halalas superscript (`.00`) |
| **Screen Title** | DM Sans | `30px` | `800` | `1.15` | `-0.02em` | Page header ("Dashboard", "Al-Malqa 4B") |
| **Section Header** | DM Sans | `20px` | `700` | `1.2` | `-0.01em` | "Recent Activity", "Active Groups" |
| **Card Title** | DM Sans | `17px` | `700` | `1.3` | `0` | SettleSmart banner, group card name |
| **Body Primary** | DM Sans | `15px` | `400` | `1.5` | `0` | General descriptive copy |
| **Row Title** | DM Sans | `15px` | `600` | `1.3` | `0` | Expense merchant/description |
| **Row Amount** | DM Sans | `15px` | `700` | `1.2` | `0` | Tabular row amount (`+SAR 120.00`) |
| **Meta Line** | DM Sans | `13px` | `400` | `1.4` | `0` | "Today · Paid by Umar · 4 splits" |
| **Caption / Badge** | DM Sans | `12px` | `600` | `1.4` | `+0.01em`| Status chip text, limit pill |
| **Action Button** | DM Sans | `15px` | `700` | `1.0` | `0` | Primary buttons, hero buttons |
| **Tab Label** | DM Sans | `10px` | `600` | `1.0` | `+0.02em`| Mobile bottom tab labels |
| **Chip Text** | DM Sans | `11px` | `700` | `1.0` | `+0.02em`| Pill status labels (uppercase) |

---

## 4. Signature Component Specifications & Code Templates

### 4.1 The Hisabo Balance Hero Card
The signature element of the user dashboard. Renders full-width in the container with a 24px corner radius, a Hisabo Blue gradient (`#185CFF` $\rightarrow$ `#0D40C9`), a glowing drop shadow, and two embedded action buttons.

```tsx
// src/components/dashboard/BalanceHero.tsx
import { Scale, PlusCircle, HandCoins } from "lucide-react";
import Link from "next/link";

interface BalanceHeroProps {
  currency?: string;
  integerPart: string;
  decimalPart: string;
  isPositive: boolean;
  activeGroupsCount: number;
}

export function BalanceHero({
  currency = "SAR",
  integerPart = "+120",
  decimalPart = "00",
  isPositive = true,
  activeGroupsCount = 1,
}: BalanceHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#185CFF] via-[#1552E6] to-[#0D40C9] p-6 text-white shadow-xl shadow-[#185CFF]/25">
      {/* Subtle background glow circle */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      {/* Header Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
          <Scale className="h-3.5 w-3.5 text-white/90" />
          <span>Total Net Balance</span>
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
          {isPositive ? "In Credit" : "Settle Required"}
        </span>
      </div>

      {/* Primary Display Number */}
      <div className="mt-3 flex items-baseline tracking-tight">
        <span className="font-mono text-xl font-bold text-white/80 mr-1.5">{currency}</span>
        <span className="text-[44px] font-black leading-none tabular-nums tracking-tight">
          {integerPart}
        </span>
        <span className="text-[24px] font-bold leading-none tabular-nums text-white/90 ml-0.5">
          .{decimalPart}
        </span>
      </div>

      {/* Confidence Subtitle */}
      <p className="mt-1.5 text-xs font-medium text-white/75">
        {isPositive
          ? `Net owed to you across ${activeGroupsCount} active ${activeGroupsCount === 1 ? 'group' : 'groups'}`
          : `You owe across ${activeGroupsCount} active ${activeGroupsCount === 1 ? 'group' : 'groups'}`}
      </p>

      {/* Embedded Action Pills */}
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/expenses/new"
          className="flex-1 h-10 rounded-xl bg-white text-[#185CFF] hover:bg-white/95 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4 text-[#185CFF]" />
          Add Expense
        </Link>
        <Link
          href="/balances"
          className="flex-1 h-10 rounded-xl bg-white/15 text-white hover:bg-white/20 font-bold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-[0.98]"
        >
          <HandCoins className="h-4 w-4 text-white" />
          Settle Up
        </Link>
      </div>
    </div>
  );
}
```

---

### 4.2 SettleSmart Banner (Trust & Integrity)
Inspired by Chime's SpotMe banner. Communicates that Hisabo's balance calculations are deterministic, zero-sum, and protected against calculation discrepancies.

```tsx
// src/components/dashboard/SettleSmartBanner.tsx
import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SettleSmartBannerProps {
  disputeCount?: number;
}

export function SettleSmartBanner({ disputeCount = 0 }: SettleSmartBannerProps) {
  return (
    <Link
      href="/balances"
      className="flex items-center gap-3.5 rounded-[16px] border border-slate-200/90 bg-white p-4 shadow-xs hover:border-[#185CFF]/30 hover:shadow-sm transition-all group"
    >
      {/* Shield Icon Chip (38px rounded-12px) */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-[#185CFF] border border-blue-100 group-hover:scale-105 transition-transform">
        <ShieldCheck className="h-5 w-5" />
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
          SettleSmart is active
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
        </div>
        <div className="text-xs text-slate-500 truncate">
          Zero-loss integer ledger · Automatic remainder distribution
        </div>
      </div>

      {/* Trailing Status */}
      <div className="text-right shrink-0 flex items-center gap-1">
        <div>
          <div className="text-xs font-bold text-[#185CFF]">Balanced</div>
          <div className="text-[10px] text-slate-400">
            {disputeCount === 0 ? "0 Disputes" : `${disputeCount} Disputes`}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#185CFF] transition-colors" />
      </div>
    </Link>
  );
}
```

---

### 4.3 Fintech Transaction / Expense Row
Lists expenses with a 42px rounded-14px category tile, clean metadata, and tabular figures.  
**Critical rule:** Everyday spending share is rendered in **neutral text ink (`#0F172A`)**, NOT red. Positive credit is rendered in **emerald green (`#10B981`)**.

```tsx
// src/components/dashboard/TransactionRow.tsx
import Link from "next/link";

interface TransactionRowProps {
  id: string;
  icon?: string;
  title: string;
  payerName: string;
  dateFormatted: string;
  participantCount: number;
  userShareFormatted: string;
  totalFormatted: string;
  isPositive: boolean;
}

export function TransactionRow({
  id,
  icon = "🍽️",
  title,
  payerName,
  dateFormatted,
  participantCount,
  userShareFormatted,
  totalFormatted,
  isPositive,
}: TransactionRowProps) {
  return (
    <Link
      href={`/expenses/${id}`}
      className="flex items-center gap-3.5 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 -mx-4 px-4 rounded-xl transition-colors"
    >
      {/* Category Tile (42px rounded-14px) */}
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#EBF2FF] text-[#185CFF] font-bold text-base border border-blue-100/60 shadow-xs">
        {icon}
      </div>

      {/* Description & Meta */}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-[#0F172A] truncate leading-snug">
          {title}
        </div>
        <div className="text-[13px] text-slate-500 font-normal leading-normal">
          {dateFormatted} · Paid by {payerName} · {participantCount} {participantCount === 1 ? 'person' : 'splits'}
        </div>
      </div>

      {/* Tabular Financials */}
      <div className="text-right shrink-0">
        <div
          className={`text-[15px] font-bold tabular-nums tracking-tight ${
            isPositive ? "text-[#10B981]" : "text-[#0F172A]"
          }`}
        >
          {userShareFormatted}
        </div>
        <div className="text-[11px] font-medium text-slate-400 tabular-nums">
          Total: {totalFormatted}
        </div>
      </div>
    </Link>
  );
}
```

---

### 4.4 Status Chips & Pills
Compact, rounded pill indicators for expense acceptance and settlement lifecycles.

```tsx
// src/components/ui/StatusChip.tsx
type StatusType = "accepted" | "pending" | "confirmed" | "disputed" | "cancelled";

const STATUS_STYLES: Record<StatusType, { bg: string; text: string; border: string; label: string }> = {
  accepted:  { bg: "bg-emerald-50", text: "text-[#10B981]", border: "border-emerald-200/70", label: "Accepted" },
  confirmed: { bg: "bg-blue-50",    text: "text-[#185CFF]", border: "border-blue-200/70",    label: "Confirmed" },
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200/70",  label: "Pending" },
  disputed:  { bg: "bg-red-50",     text: "text-[#EF4444]",  border: "border-red-200/70",    label: "Disputed" },
  cancelled: { bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200",     label: "Cancelled" },
};

export function StatusChip({ status }: { status: StatusType }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
}
```

---

### 4.5 Instant Transaction Alert Toast
Slides into view at the top of the dashboard whenever a transaction is recorded, debt settled, or friend invite accepted.

```tsx
// src/components/dashboard/InstantAlertToast.tsx
"use client";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface InstantAlertToastProps {
  title: string;
  subline: string;
  amount?: string;
  isPositive?: boolean;
  onDismiss?: () => void;
}

export function InstantAlertToast({
  title,
  subline,
  amount,
  isPositive = true,
  onDismiss,
}: InstantAlertToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3.5 rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
        {/* Solid Circle Check Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#185CFF] text-white shadow-xs">
          <Check className="h-5 w-5 stroke-[2.5]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#0F172A] truncate">{title}</div>
          <div className="text-xs text-slate-500 truncate">{subline}</div>
        </div>

        {/* Trailing Amount */}
        {amount && (
          <div
            className={`text-sm font-bold tabular-nums shrink-0 ${
              isPositive ? "text-[#10B981]" : "text-[#0F172A]"
            }`}
          >
            {amount}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 4.6 Top App Header & Mobile Bottom Tab Bar

#### Top App Header
- Displays friendly greeting ("Hi, Umar"), group selector dropdown, notification bell with unread badge, and user avatar.
- Fixed 56px height, subtle bottom divider (`#E2E8F0`), backdrop blur.

#### Mobile Bottom Tab Bar
- **5 Navigation Slots:**
  1. `Home` (Dashboard icon, `/dashboard`)
  2. `Groups` (Users/Folder icon, `/groups`)
  3. `Add` (Center elevated floating pill in `#185CFF`, `/expenses/new`)
  4. `Balances` (Scale icon, `/balances`)
  5. `Settings` (Cog/User icon, `/settings`)
- Active tab color: `#185CFF` with filled solid glyph.
- Inactive tab color: `#94A3B8`.
- Height: 60px + mobile safe-area-inset-bottom.

---

### 4.7 Large Currency & Amount Input
When adding an expense or recording a settlement, the amount entry is the focal point:

```tsx
<div className="flex flex-col items-center justify-center py-6">
  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
    Expense Total
  </label>
  <div className="flex items-baseline justify-center">
    <span className="text-2xl font-bold text-slate-400 mr-2 font-mono">SAR</span>
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      placeholder="0.00"
      className="text-5xl font-black text-[#0F172A] tabular-nums tracking-tight text-center bg-transparent outline-none w-56 placeholder:text-slate-300"
    />
  </div>
</div>
```

---

### 4.8 Group Card & Household Tile
For listing apartments, flats, and trips:

```tsx
<div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-xs hover:border-[#185CFF]/40 hover:shadow-sm transition-all cursor-pointer">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EBF2FF] text-[#185CFF] font-bold text-lg border border-blue-100">
        🏢
      </div>
      <div>
        <h3 className="text-base font-bold text-[#0F172A]">Al-Malqa Apartment 4B</h3>
        <p className="text-xs text-slate-500">4 flatmates · Active ledger</p>
      </div>
    </div>
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#10B981] border border-emerald-100">
      +SAR 120.00
    </span>
  </div>
</div>
```

---

## 5. Layout, Container & Spacing System

### 5.1 Spacing Scale (4px Base Unit)
- `4px` (`gap-1`, `p-1`) — Hairline spacing, inner pill gaps
- `8px` (`gap-2`, `p-2`) — Icon text spacing
- `12px` (`gap-3`, `p-3`) — Small action button padding, row gaps
- `16px` (`gap-4`, `p-4`) — Standard container padding, screen side insets on mobile
- `20px` (`gap-5`, `p-5`) — Card internal padding, button height spacing
- `24px` (`gap-6`, `p-6`) — Hero Card internal padding, section vertical margins
- `32px` (`gap-8`, `py-8`) — Major section dividers
- `48px` (`py-12`) — Page section rhythm

### 5.2 Container Widths
- **Mobile Viewport:** `100%` width with `16px` horizontal insets (`px-4`).
- **User Dashboard Max Width:** `max-w-2xl` (`672px`) or `max-w-3xl` (`768px`) centered (`mx-auto`). This preserves the focused, high-comfort mobile-first fintech feel even on wide desktop monitors.
- **Sidebars (Desktop Web):** Fixed 240px navigation sidebar with the centered `max-w-2xl` content column.

### 5.3 Corner Radius Scale
- **Pill (`rounded-full` / `9999px`):** Status chips, currency badge, floating add action
- **Hero Card (`rounded-[24px]`):** Signature Balance Hero
- **Cards & Banners (`rounded-[16px]` to `rounded-[18px]`):** SettleSmart banner, Group cards, Quick action cards
- **Buttons & Form Fields (`rounded-[14px]`):** Primary CTA, Inputs, Category tiles
- **Embedded Buttons (`rounded-[12px]`):** Hero internal buttons, icon chips

---

## 6. Depth, Elevation & Shadows

Hisabo avoids generic gray drop shadows. Elevation is soft and colored:

| Elevation Level | CSS Shadow Recipe | Usage |
| :--- | :--- | :--- |
| **Flat (Level 0)** | `none` | Transaction rows, dividers, embedded inputs |
| **Card (Level 1)** | `0 1px 3px 0 rgba(15, 23, 42, 0.05)` | SettleSmart banner, transaction container, group cards |
| **Hero Glow (Level 2)** | `0 16px 32px -12px rgba(24, 92, 255, 0.35)` | **Hisabo Balance Hero Card** (Signature ambient blue glow) |
| **Toast & Sheet (Level 3)**| `0 12px 28px -8px rgba(15, 23, 42, 0.14)` | Instant alert toast, quick settle sheet |
| **Modal Scrim** | `bg-slate-900/40 backdrop-blur-xs` | Dialog overlays |

---

## 7. Motion, Micro-Interactions & Haptics

1. **Balance Roll Animation:** When loading the dashboard or after logging an expense, the net balance counts smoothly from previous value to new value over `500ms` with ease-out.
2. **Instant Alert Entry:** Uses a spring curve (`SlideInUp` / `animate-in slide-in-from-top-4 duration-300`) with auto-dismiss after 4 seconds.
3. **Button Press Scale:** All interactive buttons scale to `scale-[0.98]` on `:active` with smooth `100ms` transition.
4. **Row Hover Accent:** Transaction rows highlight smoothly with `bg-slate-50/70` without jarring border shifts.
5. **No Harsh Jumps:** Tabular numbers prevent text jitter when values change.

---

## 8. Strict Do's and Don'ts

### DO:
1. **DO** keep `#185CFF` as the unwavering primary action and branding color.
2. **DO** render everyday spending shares in **neutral text ink (`#0F172A`)**.
3. **DO** celebrate money owed to the user in **emerald green (`#10B981`)**.
4. **DO** format every balance and monetary value in `tabular-nums font-bold`.
5. **DO** split the primary balance into an integer and superscript cents/halalas (`.00`).
6. **DO** maintain the 24px hero radius, 16px banner radius, and 14px button/tile radius.
7. **DO** feature the SettleSmart integrity banner to establish mathematical confidence.
8. **DO** show instant feedback alerts whenever financial mutations occur.
9. **DO** keep touch targets $\ge 44 \times 44\text{px}$ for mobile and PWA standalone mode.
10. **DO** use hairline dividers (`border-slate-100`) between rows rather than boxing each row in a card.

### DON'T:
1. **DON'T** mark everyday spending in red. Routine expenses are shared living, not debt delinquency.
2. **DON'T** use pure stark white (`#FFFFFF`) as the main page canvas; use the calm slate canvas (`#F1F5F9`).
3. **DON'T** use sharp, unrounded box corners. Softness and friendliness define Hisabo.
4. **DON'T** bury the balance hero card below the fold; it owns the top third of the user dashboard.
5. **DON'T** use floating-point numbers in calculations or display logic. Always rely on integer minor units (`BIGINT`).
6. **DON'T** use generic gray drop shadows under the hero card; always use the ambient blue glow (`shadow-[#185CFF]/25`).
7. **DON'T** use harsh animated jumps. Use spring curves and tabular numbers.
8. **DON'T** show complex accounting jargon (e.g. "Double-entry journal debit"). Use consumer-friendly terms ("You're owed", "Your share", "Settle Up").

---

## 9. Responsive & PWA Standalone Rules

- **Mobile First:** Optimized for viewport widths `375px` to `430px` (iPhone SE through iPhone 16 Pro Max).
- **Tablet / Desktop:** Content centered with `max-w-2xl` (`672px`), flanked by clean navigation sidebar.
- **Safe Area Insets:** All top headers respect `env(safe-area-inset-top)`; bottom tabs respect `env(safe-area-inset-bottom)`.
- **Standalone PWA Mode:** When launched as an installed PWA or Android TWA, the bottom tab bar locks seamlessly to the bottom edge with no browser chrome.

---

## 10. Agent & Developer Implementation Guide

When asked to generate or modify any User Dashboard page, component, or modal in this repository:
1. **Check this specification first.**
2. **Use the centralized styling recipes in [src/lib/ui.ts](file:///c:/orant/BROWSE60/DEMO/jdk/bin/PerfLogss/doc/cla/corporate/debian/Setup/important/hisabo/src/lib/ui.ts)**:
   - `ui.heroCard`
   - `ui.settleSmartBanner`
   - `ui.transactionRow`
   - `ui.categoryTile`
   - `ui.btn({ variant: "primary" })`
3. **Preserve the Integer Math Invariant:** Convert to halalas via `toMinorUnits(amount)` and format via `formatMoney(minorUnits)` from [src/lib/money.ts](file:///c:/orant/BROWSE60/DEMO/jdk/bin/PerfLogss/doc/cla/corporate/debian/Setup/important/hisabo/src/lib/money.ts).
4. **Test with `npm run build`:** Verify zero type or lint errors before concluding.
