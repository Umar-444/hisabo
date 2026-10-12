"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroupAction } from "@/features/groups/actions";
import { ui } from "@/lib/ui";
import { ArrowLeft, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "apartment", label: "Apartment / Flat", emoji: "🏢" },
  { id: "trip", label: "Trip / Vacation", emoji: "✈️" },
  { id: "household", label: "Household", emoji: "🏠" },
  { id: "project", label: "Project / Event", emoji: "🎯" },
  { id: "other", label: "Other Pool", emoji: "👥" },
];

export interface LiveCurrencyItem {
  code: string;
  name: string;
  symbol: string;
  isDefault: boolean;
}

export function NewGroupFormClient({
  currencies = [],
}: {
  currencies?: LiveCurrencyItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fallbackCurrencies: LiveCurrencyItem[] = [
    { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", isDefault: true },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", isDefault: false },
    { code: "USD", name: "US Dollar", symbol: "$", isDefault: false },
    { code: "EUR", name: "Euro", symbol: "€", isDefault: false },
    { code: "GBP", name: "British Pound", symbol: "£", isDefault: false },
  ];

  const availableCurrencies =
    currencies && currencies.length > 0 ? currencies : fallbackCurrencies;
  const initialCurrency =
    availableCurrencies.find((c) => c.isDefault)?.code ||
    availableCurrencies[0]?.code ||
    "SAR";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState(initialCurrency);
  const [category, setCategory] = useState("apartment");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    if (description.trim()) formData.append("description", description.trim());
    formData.append("defaultCurrency", defaultCurrency);
    formData.append("category", category);

    startTransition(async () => {
      const res = await createGroupAction(formData);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to create group");
      } else {
        router.push(`/groups/${res.groupId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/groups"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Create Group</h1>
        <div className="w-10" />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Group Card Details */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div>
          <label className={ui.label}>Group Name</label>
          <input
            type="text"
            required
            placeholder="e.g., Al-Malqa Flat 4B, Dubai Weekend Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={ui.input}
          />
        </div>

        <div>
          <label className={ui.label}>Description (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Shared rent, water bills & weekly grocery run"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={ui.input}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className={ui.label}>Default Currency</label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className={ui.select}
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={ui.label}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={ui.select}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="w-full h-12 rounded-[16px] bg-[#185CFF] text-white hover:bg-[#1249D6] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#185CFF]/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Creating Group..." : "Create Group · Launch Ledger"}
      </button>
    </form>
  );
}
