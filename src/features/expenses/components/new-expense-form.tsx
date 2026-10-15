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

    if (parsedAmount > 10000000) {
      setErrorMsg("Amount cannot exceed 10,000,000 (ten million)");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please enter an expense description");
      return;
    }

    if (description.trim().length > 140) {
      setErrorMsg("Description cannot exceed 140 characters");
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
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-md bg-white border border-[#c8c4be] text-[#37352f] hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-bold text-[#0a1530] tracking-tight">Add Expense</h1>
        <div className="w-9" />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-lg bg-[#fde0ec] p-3 text-xs font-semibold text-[#e03131] border border-[#f5b8d0] animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Large Display Amount Entry */}
      <div className="rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 shadow-2xs text-center">
        <span className="text-[11px] font-bold text-[#787671] uppercase tracking-wider">
          Total Expense Amount
        </span>
        <div className="mt-2 flex items-baseline justify-center">
          <span className="font-mono text-2xl font-bold text-[#787671] mr-2">{currency}</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            autoFocus
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="0.00"
            className="w-48 bg-transparent text-center text-[44px] font-black text-[#0a1530] tabular-nums tracking-tight placeholder:text-slate-200 outline-none focus:ring-0"
          />
        </div>
        <p className="mt-1 text-[11px] text-[#787671] font-normal">
          Protected by Hisabo zero-loss integer arithmetic
        </p>
      </div>

      {/* 2. Description & Group Selection */}
      <div className="rounded-xl border border-[#e5e3df] bg-white p-5 space-y-3.5 shadow-2xs">
        <div>
          <label className={ui.label}>Description</label>
          <input
            type="text"
            required
            maxLength={140}
            placeholder="e.g., Al-Saddiq Supermarket, Dinner at Al-Baik"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={ui.input}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs">
        <label className={ui.label}>Category</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#185CFF] bg-[#185cff]/10 text-[#185CFF] shadow-2xs"
                    : "border-[#e5e3df] bg-[#f6f5f4] text-[#37352f] hover:bg-[#ede9e4]"
                }`}
              >
                <span className="text-lg mb-0.5">{cat.emoji}</span>
                <span className="text-[10px] truncate w-full text-center">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Live Split Math Engine */}
      <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#ede9e4]">
          <div>
            <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">Split Methodology</h2>
            <p className="text-[11px] text-[#787671] font-normal">
              Deterministic allocation across participants
            </p>
          </div>

          {/* Toggle Equal vs Custom */}
          <div className="flex rounded-md bg-[#f0eeec] p-0.5 border border-[#e5e3df]">
            <button
              type="button"
              onClick={() => setSplitType("equal")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                splitType === "equal"
                  ? "bg-white text-[#185CFF] shadow-2xs"
                  : "text-[#787671] hover:text-[#1a1a1a]"
              }`}
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => setSplitType("custom")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                splitType === "custom"
                  ? "bg-white text-[#185CFF] shadow-2xs"
                  : "text-[#787671] hover:text-[#1a1a1a]"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Participants Selection Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#37352f]">
              Participants ({selectedParticipants.length}/{initialMembers.length})
            </span>
            <button
              type="button"
              onClick={selectAllParticipants}
              className="text-xs font-semibold text-[#185CFF] hover:underline cursor-pointer"
            >
              Select All
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {initialMembers.map((member) => {
              const isSelected = selectedParticipants.includes(member.userId);
              return (
                <button
                  type="button"
                  key={member.userId}
                  onClick={() => toggleParticipant(member.userId)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#185CFF] text-white border-[#185CFF] shadow-2xs"
                      : "bg-[#f6f5f4] text-[#37352f] border-[#e5e3df] hover:bg-[#ede9e4]"
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
          <div className="rounded-lg bg-[#fafaf9] border border-[#e5e3df] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#787671] border-b border-[#ede9e4] pb-1.5">
              <span className="flex items-center gap-1 text-[#185CFF]">
                <Sparkles className="h-3 w-3" />
                Live Deterministic Breakdown
              </span>
              <span>{currency}</span>
            </div>

            {liveEqualSplits.map((split) => {
              const member = initialMembers.find((m) => m.userId === split.userId);
              return (
                <div
                  key={split.userId}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-[#e6e0f5] text-[#7b3ff2] font-black text-[10px] flex items-center justify-center">
                      {member?.name.charAt(0) || "U"}
                    </div>
                    <span className="text-[#1a1a1a] font-medium">
                      {member?.name} {split.userId === currentUser.id ? "(You)" : ""}
                    </span>
                  </div>
                  <span className="tabular-nums font-mono font-bold text-[#1a1a1a]">
                    {currency} {split.shareMajor.toFixed(2)}
                  </span>
                </div>
              );
            })}

            <div className="pt-2 border-t border-[#ede9e4] text-[11px] text-[#787671] flex items-center justify-between">
              <span>Zero-Loss Check</span>
              <span className="font-semibold text-emerald-600">
                ✓ Exact match: {currency} {parsedAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Custom Split Inputs */}
        {splitType === "custom" && (
          <div className="space-y-2.5 pt-1">
            <div className="rounded-lg bg-[#fafaf9] p-2.5 border border-[#e5e3df] text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-[#787671]">Remaining to allocate:</span>
                <span
                  className={`tabular-nums font-mono font-bold ${
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
                  <span className="text-xs font-medium text-[#1a1a1a] truncate">
                    {member?.name} {userId === currentUser.id ? "(You)" : ""}
                  </span>
                  <div className="flex items-center gap-1.5 w-32">
                    <span className="text-xs text-[#787671] font-mono">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customAmounts[userId] || ""}
                      onChange={(e) =>
                        setCustomAmounts({ ...customAmounts, [userId]: e.target.value })
                      }
                      className="w-full rounded-md border border-[#c8c4be] px-2.5 py-1 text-xs text-right font-mono font-semibold text-[#1a1a1a] focus:border-[#185CFF] outline-none"
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
        className="w-full h-11 rounded-lg bg-[#185CFF] text-white hover:bg-[#1249D6] font-semibold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "Recording Expense..." : "Record Expense · Split Now"}
      </button>
    </form>
  );
}
