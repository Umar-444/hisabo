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
    <div className="space-y-5">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Currencies</span>
            <div className="text-2xl font-black text-white mt-1">{currencies.length}</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Coins className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Live for Users</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{liveCount} Active</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Default Currency</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{defaultCurrency}</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Star className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by currency code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#185CFF] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Currency</span>
        </button>
      </div>

      {/* Currencies Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Code &amp; Name</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Decimals</th>
                <th className="px-6 py-4">Live Status</th>
                <th className="px-6 py-4">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((curr) => (
                <tr key={curr.code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-mono font-bold text-xs text-white border border-slate-700">
                        {curr.code}
                      </div>
                      <div>
                        <div className="font-bold text-white">{curr.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{curr.code}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-slate-200">
                    {curr.symbol}
                  </td>

                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {curr.decimals} minor digits
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleLive(curr.code, curr.isLive)}
                      disabled={isPending || curr.isDefault}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                        curr.isLive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {curr.isLive ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Live</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    {curr.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                        <Star className="h-3 w-3 fill-amber-400" />
                        Default
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    {!curr.isDefault && (
                      <button
                        onClick={() => handleMakeDefault(curr.code)}
                        disabled={isPending}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer disabled:opacity-50"
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

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setErrorMsg(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Coins className="h-5 w-5 text-blue-400" />
              Add Supported Currency
            </h3>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-bold text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCurrency} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    maxLength={3}
                    placeholder="e.g., CAD"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono uppercase focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    required
                    maxLength={5}
                    placeholder="e.g., $"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Canadian Dollar"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Minor Decimals
                  </label>
                  <select
                    name="decimals"
                    defaultValue="2"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  >
                    <option value="2">2 (Cents / Halalas)</option>
                    <option value="3">3 (Fils / Dinars)</option>
                    <option value="0">0 (Zero Decimal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Initial Status
                  </label>
                  <select
                    name="isLive"
                    defaultValue="true"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 outline-none"
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
                  className="w-full h-11 rounded-xl bg-[#185CFF] text-white font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50 cursor-pointer"
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
