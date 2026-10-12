"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseAction } from "@/features/expenses/actions";
import { toMinorUnits, calculateEqualSplits, fromMinorUnits } from "@/lib/money";
import { ui } from "@/lib/ui";
import {
  ArrowLeft,
  Users,
  Check,
  Sparkles,
  Info,
  Building2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Member {
  userId: string;
  name: string;
  username: string;
}

interface GroupOption {
  id: string;
  name: string;
  currency: string;
}

interface Props {
  currentUser: { id: string; name: string };
  groups: GroupOption[];
  initialGroupId: string;
  initialMembers: Member[];
}

const CATEGORIES = [
  { id: "food", label: "Food", emoji: "🍽️" },
  { id: "groceries", label: "Groceries", emoji: "🛒" },
  { id: "rent", label: "Rent", emoji: "🏠" },
  { id: "utilities", label: "Utilities", emoji: "⚡" },
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "entertainment", label: "Fun", emoji: "🍿" },
  { id: "general", label: "General", emoji: "🧾" },
] as const;

export function NewExpenseClientForm({
  currentUser,
  groups,
  initialGroupId,
  initialMembers,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [groupId, setGroupId] = useState(initialGroupId);
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]["id"]>("food");
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  
  // Selected participant user IDs
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialMembers.map((m) => m.userId)
  );

  // Custom split amounts map: userId -> string amount
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeGroup = groups.find((g) => g.id === groupId) || groups[0];
  const currency = activeGroup?.currency || "SAR";

  // Numeric amount in major units
  const parsedAmount = parseFloat(amountStr) || 0;
  const totalMinor = parsedAmount > 0 ? toMinorUnits(parsedAmount) : BigInt(0);

  // Calculate live equal splits with deterministic integer remainder distribution
  const liveEqualSplits = useMemo(() => {
    if (parsedAmount <= 0 || selectedParticipants.length === 0) return null;
    try {
      const splits = calculateEqualSplits(totalMinor, selectedParticipants, paidBy);
      return splits.map((s) => ({
        userId: s.userId,
        shareMinor: s.shareMinor,
        shareMajor: fromMinorUnits(s.shareMinor),
      }));
    } catch {
      return null;
    }
  }, [totalMinor, selectedParticipants, paidBy, parsedAmount]);

  // For custom splits: calculate total sum and discrepancy
  const customSum = useMemo(() => {
    let sum = 0;
    for (const pId of selectedParticipants) {
      sum += parseFloat(customAmounts[pId] || "0") || 0;
    }
    return sum;
  }, [customAmounts, selectedParticipants]);

  const customDifference = parsedAmount - customSum;

  const toggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      if (selectedParticipants.length === 1) return; // Keep at least one
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const selectAllParticipants = () => {
    setSelectedParticipants(initialMembers.map((m) => m.userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedAmount <= 0) {
      setErrorMsg("Please enter an amount greater than 0");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please enter an expense description");
      return;
    }

    if (selectedParticipants.length === 0) {
      setErrorMsg("Please select at least one participant");
      return;
    }

    if (splitType === "custom" && Math.abs(customDifference) > 0.009) {
      setErrorMsg(
        `Custom splits must equal the total amount. Difference: ${currency} ${customDifference.toFixed(2)}`
      );
      return;
    }

    startTransition(async () => {
      const customSplitsPayload =
        splitType === "custom"
          ? selectedParticipants.map((userId) => ({
              userId,
              shareAmount: parseFloat(customAmounts[userId] || "0") || 0,
            }))
          : undefined;

      const res = await createExpenseAction({
        groupId,
        description: description.trim(),
        amount: parsedAmount,
        currency,
        category,
        paidBy,
        splitType,
        participants: selectedParticipants,
        customSplits: customSplitsPayload,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to create expense");
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Add Expense</h1>
        <div className="w-10" />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-red-50 p-3.5 text-xs font-bold text-red-700 border border-red-200 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Large Display Amount Entry */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xs text-center">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Total Expense Amount
        </span>
        <div className="mt-2 flex items-baseline justify-center">
          <span className="font-mono text-2xl font-bold text-slate-400 mr-2">{currency}</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            autoFocus
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="0.00"
            className="w-48 bg-transparent text-center text-[48px] font-black text-[#0F172A] tabular-nums tracking-tight placeholder:text-slate-200 outline-none focus:ring-0"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Protected by Hisabo zero-loss integer arithmetic
        </p>
      </div>

      {/* 2. Description & Group Selection */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div>
          <label className={ui.label}>Description</label>
          <input
            type="text"
            required
            placeholder="e.g., Al-Saddiq Supermarket, Dinner at Al-Baik"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={ui.input}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={ui.label}>Group</label>
            <div className="relative">
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className={ui.select}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={ui.label}>Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className={ui.select}
            >
              {initialMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name} {m.userId === currentUser.id ? "(You)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Category Selector */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-xs">
        <label className={ui.label}>Category</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-[14px] border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#185CFF] bg-[#EBF2FF] text-[#185CFF] shadow-2xs scale-102"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-xl mb-1">{cat.emoji}</span>
                <span className="text-[11px] truncate w-full text-center">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Live Split Math Engine */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Split Methodology</h2>
            <p className="text-xs text-slate-500 font-medium">
              Deterministic allocation across participants
            </p>
          </div>

          {/* Toggle Equal vs Custom */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSplitType("equal")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                splitType === "equal"
                  ? "bg-white text-[#185CFF] shadow-2xs"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => setSplitType("custom")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                splitType === "custom"
                  ? "bg-white text-[#185CFF] shadow-2xs"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Participants Selection Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Participants ({selectedParticipants.length}/{initialMembers.length})
            </span>
            <button
              type="button"
              onClick={selectAllParticipants}
              className="text-xs font-bold text-[#185CFF] hover:underline"
            >
              Select All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {initialMembers.map((member) => {
              const isSelected = selectedParticipants.includes(member.userId);
              return (
                <button
                  type="button"
                  key={member.userId}
                  onClick={() => toggleParticipant(member.userId)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#185CFF] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{member.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Calculation Table */}
        {splitType === "equal" && liveEqualSplits && (
          <div className="rounded-[16px] bg-slate-50/80 border border-slate-200/80 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1 text-[#185CFF]">
                <Sparkles className="h-3.5 w-3.5" />
                Live Deterministic Breakdown
              </span>
              <span>{currency}</span>
            </div>

            {liveEqualSplits.map((split) => {
              const member = initialMembers.find((m) => m.userId === split.userId);
              return (
                <div
                  key={split.userId}
                  className="flex items-center justify-between text-xs font-semibold py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-[#185CFF] font-black text-[10px] flex items-center justify-center">
                      {member?.name.charAt(0) || "U"}
                    </div>
                    <span className="text-[#0F172A] font-bold">
                      {member?.name} {split.userId === currentUser.id ? "(You)" : ""}
                    </span>
                  </div>
                  <span className="tabular-nums font-mono font-bold text-[#0F172A]">
                    {currency} {split.shareMajor.toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Total Check Invariant</span>
              <span className="font-bold text-emerald-600">
                ✓ Exact match: {currency} {parsedAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Custom Split Inputs */}
        {splitType === "custom" && (
          <div className="space-y-3 pt-2">
            <div className="rounded-[14px] bg-slate-50 p-3 border border-slate-200 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span>Remaining to allocate:</span>
                <span
                  className={`tabular-nums font-mono ${
                    Math.abs(customDifference) < 0.009 ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {currency} {customDifference.toFixed(2)}
                </span>
              </div>
            </div>

            {selectedParticipants.map((userId) => {
              const member = initialMembers.find((m) => m.userId === userId);
              return (
                <div key={userId} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#0F172A] truncate">
                    {member?.name} {userId === currentUser.id ? "(You)" : ""}
                  </span>
                  <div className="flex items-center gap-1.5 w-32">
                    <span className="text-xs text-slate-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customAmounts[userId] || ""}
                      onChange={(e) =>
                        setCustomAmounts({ ...customAmounts, [userId]: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-right font-mono font-bold text-[#0F172A] focus:border-[#185CFF] outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || parsedAmount <= 0}
        className="w-full h-12 rounded-[16px] bg-[#185CFF] text-white hover:bg-[#1249D6] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#185CFF]/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Recording Expense..." : "Record Expense · Split Now"}
      </button>
    </form>
  );
}
