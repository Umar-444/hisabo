"use client";

import { useState, useTransition } from "react";
import {
  toggleCurrencyStatusAction,
  setDefaultCurrencyAction,
  createCurrencyAction,
} from "@/features/admin/actions";
import {
  Coins,
  CheckCircle2,
  XCircle,
  Plus,
  Star,
  Search,
  AlertCircle,
  X,
} from "lucide-react";

interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  isLive: boolean;
  isDefault: boolean;
}

export function CurrencyManagerClient({
  initialCurrencies,
}: {
  initialCurrencies: CurrencyItem[];
}) {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(initialCurrencies);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter
  const filtered = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const liveCount = currencies.filter((c) => c.isLive).length;
  const defaultCurrency = currencies.find((c) => c.isDefault)?.code || "SAR";

  const handleToggleLive = (code: string, currentLive: boolean) => {
    const nextLive = !currentLive;
    // Optimistic update
    setCurrencies((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isLive: nextLive } : c))
    );

    startTransition(async () => {
      const res = await toggleCurrencyStatusAction(code, nextLive);
      if (!res.success) {
        // Revert
        setCurrencies((prev) =>
          prev.map((c) => (c.code === code ? { ...c, isLive: currentLive } : c))
        );
        alert(res.error || "Failed to update currency status");
      }
    });
  };

  const handleMakeDefault = (code: string) => {
    // Optimistic update
    setCurrencies((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.code === code,
        isLive: c.code === code ? true : c.isLive,
      }))
    );

    startTransition(async () => {
      const res = await setDefaultCurrencyAction(code);
      if (!res.success) {
        setCurrencies(initialCurrencies);
        alert(res.error || "Failed to set default currency");
      }
    });
  };

  const handleCreateCurrency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCurrencyAction(formData);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to add currency");
      } else {
        const newCode = (formData.get("code") as string).toUpperCase();
        setCurrencies((prev) => [
          ...prev,
          {
            code: newCode,
            name: formData.get("name") as string,
            symbol: formData.get("symbol") as string,
            decimals: parseInt(formData.get("decimals") as string || "2", 10),
            isLive: formData.get("isLive") === "true",
            isDefault: false,
          },
        ]);
        setShowAddModal(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner (Notion Pastel Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#b8dcfa] bg-[#dcecfa]/40 p-4.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#005bab]">Total Currencies</span>
            <div className="text-2xl font-bold text-[#0a1530] mt-0.5">{currencies.length}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#005bab] border border-[#b8dcfa] flex items-center justify-center shadow-xs">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-[#b8e8c6] bg-[#d9f3e1]/40 p-4.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#0f5132]">Live for Users</span>
            <div className="text-2xl font-bold text-[#0f5132] mt-0.5">{liveCount} Active</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#0f5132] border border-[#b8e8c6] flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-[#fed0ab] bg-[#ffe8d4]/40 p-4.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#793400]">Default Currency</span>
            <div className="text-2xl font-bold text-[#793400] mt-0.5">{defaultCurrency}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#793400] border border-[#fed0ab] flex items-center justify-center shadow-xs">
            <Star className="h-5 w-5 fill-[#793400]" />
          </div>
        </div>
      </div>

      {/* Action Bar & Search (Notion Database Controls) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-[#e5e3df] shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a4a097]" />
          <input
            type="text"
            placeholder="Search by currency code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-0 bg-transparent pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[#37352f] placeholder:text-[#a4a097] focus:outline-none focus:ring-0"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#185CFF] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Currency</span>
        </button>
      </div>

      {/* Currencies Table (Notion Database Table) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#37352f]">
            <thead className="border-b border-[#e5e3df] bg-[#fafaf9] text-[11px] font-medium uppercase text-[#787671]">
              <tr>
                <th className="px-5 py-3">Code &amp; Name</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3">Decimals</th>
                <th className="px-5 py-3">Live Status</th>
                <th className="px-5 py-3">Default</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9e4]">
              {filtered.map((curr) => (
                <tr key={curr.code} className="hover:bg-[#f7f6f3]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0eeec] font-mono font-bold text-xs text-[#1a1a1a] border border-[#e5e3df]">
                        {curr.code}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1a1a1a] text-xs">{curr.name}</div>
                        <div className="text-[11px] text-[#787671] font-mono">{curr.code}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-[#1a1a1a]">
                    {curr.symbol}
                  </td>

                  <td className="px-5 py-3.5 text-xs font-mono text-[#787671]">
                    {curr.decimals} minor digits
                  </td>

                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggleLive(curr.code, curr.isLive)}
                      disabled={isPending || curr.isDefault}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${
                        curr.isLive
                          ? "bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6] hover:bg-[#b8e8c6]"
                          : "bg-[#f0eeec] text-[#787671] border border-[#e5e3df] hover:bg-[#e5e3df]"
                      }`}
                    >
                      {curr.isLive ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1aae39]" />
                          <span>Live</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a4a097]" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-5 py-3.5">
                    {curr.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#ffe8d4] px-2.5 py-0.5 text-[11px] font-medium text-[#793400] border border-[#fed0ab]">
                        <Star className="h-3 w-3 fill-[#793400]" />
                        Default
                      </span>
                    ) : (
                      <span className="text-xs text-[#a4a097]">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    {!curr.isDefault && (
                      <button
                        onClick={() => handleMakeDefault(curr.code)}
                        disabled={isPending}
                        className="text-xs font-medium text-[#185CFF] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Make Default
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Currency Modal (Notion Workspace Dialog) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white border border-[#e5e3df] p-6 shadow-xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setErrorMsg(null);
              }}
              className="absolute right-4 top-4 text-[#787671] hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-semibold text-[#1a1a1a] flex items-center gap-2 mb-4">
              <Coins className="h-5 w-5 text-[#185CFF]" />
              Add Supported Currency
            </h3>

            {errorMsg && (
              <div className="mb-4 rounded-lg bg-[#fde0ec] border border-[#f8b4d0] p-3 text-xs font-medium text-[#a02e6d] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCurrency} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    maxLength={3}
                    placeholder="e.g. CAD"
                    className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3 py-2 text-xs text-[#1a1a1a] font-mono uppercase focus:border-[#185CFF] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    required
                    maxLength={5}
                    placeholder="e.g. $"
                    className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3 py-2 text-xs text-[#1a1a1a] font-mono focus:border-[#185CFF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Canadian Dollar"
                  className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3 py-2 text-xs text-[#1a1a1a] focus:border-[#185CFF] focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                    Minor Decimals
                  </label>
                  <select
                    name="decimals"
                    defaultValue="2"
                    className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3 py-2 text-xs text-[#1a1a1a] focus:border-[#185CFF] focus:bg-white outline-none"
                  >
                    <option value="2">2 (Cents / Halalas)</option>
                    <option value="3">3 (Fils / Dinars)</option>
                    <option value="0">0 (Zero Decimal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                    Initial Status
                  </label>
                  <select
                    name="isLive"
                    defaultValue="true"
                    className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] px-3 py-2 text-xs text-[#1a1a1a] focus:border-[#185CFF] focus:bg-white outline-none"
                  >
                    <option value="true">Live (Active)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-10 rounded-lg bg-[#185CFF] text-white font-medium text-xs hover:bg-blue-600 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isPending ? "Adding..." : "Add to Platform"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
