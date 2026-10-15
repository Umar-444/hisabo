"use client";

import { useState, useTransition } from "react";
import { updateExpenseAction } from "@/features/expenses/actions";
import { Pencil, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/ui";

const CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "groceries", label: "Groceries" },
  { value: "rent", label: "Rent & Housing" },
  { value: "utilities", label: "Utilities & Bills" },
  { value: "transport", label: "Transport & Rides" },
  { value: "entertainment", label: "Entertainment" },
  { value: "general", label: "General Expense" },
];

export function EditExpenseModalClient({
  expenseId,
  initialDescription,
  initialCategory,
}: {
  expenseId: string;
  initialDescription: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = description.trim();
    if (!trimmed) {
      setErrorMsg("Title cannot be empty.");
      return;
    }

    startTransition(async () => {
      const res = await updateExpenseAction(expenseId, {
        description: trimmed,
        category,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to update expense");
      } else {
        toast.success("Expense details updated!");
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDescription(initialDescription);
          setCategory(initialCategory);
          setErrorMsg(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
      >
        <Pencil className="h-3.5 w-3.5 text-slate-500" />
        <span>Edit Details</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#185CFF]" />
                <span>Edit Expense Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={ui.label}>Expense Title / Description</label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={ui.input}
                  placeholder="e.g. Al Baik dinner"
                />
                <span className="text-[10px] text-slate-400 mt-1 block text-right">
                  {description.length}/140 chars
                </span>
              </div>

              <div>
                <label className={ui.label}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={ui.select}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#185CFF] hover:bg-[#1249D6] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isPending ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
