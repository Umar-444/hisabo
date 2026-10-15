"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ui } from "@/lib/ui";
import { fromMinorUnits } from "@/lib/money";
import {
  PlusCircle,
  ArrowLeft,
  Search,
  Download,
  Filter,
  Sparkles,
  Users,
} from "lucide-react";

export interface SerializedExpenseRow {
  id: string;
  description: string;
  amountMinor: string; // serialized string or number
  currency: string;
  category: string;
  status: string;
  createdAt: string;
  paidBy: string;
  payerName: string | null;
  groupId: string;
  groupName: string;
}

import { CategoryTile } from "@/lib/categories";

interface Props {
  expenses: SerializedExpenseRow[];
  currentUserId: string;
  groupsList: { id: string; name: string }[];
}

export function ExpensesFeedClient({ expenses, currentUserId, groupsList }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPayer, setSelectedPayer] = useState<"all" | "me" | "others">("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "food", label: "Food & Dining" },
    { id: "groceries", label: "Groceries" },
    { id: "rent", label: "Rent & Housing" },
    { id: "utilities", label: "Utilities & Bills" },
    { id: "transport", label: "Transport" },
    { id: "entertainment", label: "Entertainment" },
    { id: "general", label: "General" },
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = e.description.toLowerCase().includes(term);
        const matchesGroup = e.groupName.toLowerCase().includes(term);
        const matchesPayer = (e.payerName || "").toLowerCase().includes(term);
        if (!matchesDesc && !matchesGroup && !matchesPayer) return false;
      }

      // 2. Category filter
      if (selectedCategory !== "all" && e.category !== selectedCategory) {
        return false;
      }

      // 3. Payer filter
      if (selectedPayer === "me" && e.paidBy !== currentUserId) {
        return false;
      }
      if (selectedPayer === "others" && e.paidBy === currentUserId) {
        return false;
      }

      // 4. Group filter
      if (selectedGroupId !== "all" && e.groupId !== selectedGroupId) {
        return false;
      }

      return true;
    });
  }, [expenses, searchTerm, selectedCategory, selectedPayer, selectedGroupId, currentUserId]);

  return (
    <div className="w-full space-y-5 pb-24">
      {/* 1. Header with Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">
              Expenses Feed
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Search, filter, and review all shared group expenses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button (TASK-24) */}
          <a
            href="/api/expenses/export"
            download="hisabo-expenses-export.csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            title="Download expenses report as CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span> CSV
          </a>

          <Link
            href="/expenses/new"
            className={ui.btn({ variant: "primary", size: "sm" })}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* 2. Search & Multi-Criteria Filter Bar (TASK-21) */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses by description, payer, or group..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#185CFF]/20 focus:border-[#185CFF] text-[#0F172A]"
            />
          </div>

          {/* Group Filter Dropdown */}
          {groupsList.length > 0 && (
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              aria-label="Filter expenses by group"
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#185CFF]/20"
            >
              <option value="all">All Groups ({groupsList.length})</option>
              {groupsList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}

          {/* Payer Filter Dropdown */}
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value as any)}
            aria-label="Filter expenses by payer"
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#185CFF]/20"
          >
            <option value="all">All Payers</option>
            <option value="me">Paid by Me</option>
            <option value="others">Paid by Flatmates</option>
          </select>
        </div>

        {/* Category Filter Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#185CFF] text-white shadow-2xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filtered Expenses List Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Transactions ({filteredExpenses.length})
          </span>
          {(searchTerm || selectedCategory !== "all" || selectedPayer !== "all" || selectedGroupId !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedPayer("all");
                setSelectedGroupId("all");
              }}
              className="text-xs font-semibold text-[#185CFF] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185CFF] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">
              {expenses.length === 0 ? "No expenses recorded yet" : "No matching expenses found"}
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {expenses.length === 0
                ? "Add your first shared expense to start keeping fair balance records."
                : "Try adjusting your search criteria or resetting filters."}
            </p>
            {expenses.length === 0 && (
              <Link
                href="/expenses/new"
                className={ui.btn({ variant: "primary", size: "sm" })}
              >
                Add First Expense
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredExpenses.map((exp) => {
              const isPayer = exp.paidBy === currentUserId;
              const majorAmount = fromMinorUnits(BigInt(exp.amountMinor));

              return (
                <Link
                  key={exp.id}
                  href={`/expenses/${exp.id}`}
                  className={ui.transactionRow}
                >
                  {/* Category Tile */}
                  <CategoryTile category={exp.category} size="md" />

                  {/* Description & Group Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A] truncate leading-tight">
                      {exp.description}
                    </div>
                    <div className="text-xs text-slate-500 font-normal leading-normal mt-0.5">
                      {exp.groupName} · Paid by {isPayer ? "you" : (exp.payerName || "Roommate")}
                    </div>
                  </div>

                  {/* Financial Amount */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold tabular-nums tracking-tight font-mono ${
                        isPayer ? "text-[#10B981]" : "text-[#0F172A]"
                      }`}
                    >
                      {exp.currency} {majorAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 capitalize">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
