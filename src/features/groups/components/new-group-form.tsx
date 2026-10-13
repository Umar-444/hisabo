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
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/groups"
          className="flex h-9 w-9 items-center justify-center rounded-md bg-white border border-[#c8c4be] text-[#37352f] hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-bold text-[#0a1530] tracking-tight">Create Group</h1>
        <div className="w-9" />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-lg bg-[#fde0ec] p-3 text-xs font-semibold text-[#e03131] border border-[#f5b8d0]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Group Card Details (Notion Sharp Canvas Card) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white p-5 space-y-3.5 shadow-2xs">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        className="w-full h-11 rounded-lg bg-[#185CFF] text-white hover:bg-[#1249D6] font-semibold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Creating Group..." : "Create Group · Launch Ledger"}
      </button>
    </form>
  );
}
