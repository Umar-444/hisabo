import { z } from "zod";

export const splitShareItemSchema = z.object({
  userId: z.string().uuid(),
  shareAmount: z.number().nonnegative().optional(), // in major units (SAR)
});

export const createExpenseSchema = z.object({
  groupId: z.string().uuid("Please select a group"),
  description: z.string().min(2, "Description must be at least 2 characters").max(200),
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().length(3).default("SAR"),
  category: z.enum([
    "food",
    "groceries",
    "rent",
    "utilities",
    "transport",
    "entertainment",
    "general",
  ]).default("general"),
  paidBy: z.string().uuid("Please select who paid"),
  splitType: z.enum(["equal", "custom"]).default("equal"),
  participants: z.array(z.string().uuid()).min(1, "At least one participant must be selected"),
  customSplits: z.array(splitShareItemSchema).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const disputeExpenseSchema = z.object({
  expenseId: z.string().uuid(),
  reason: z.string().min(3, "Please provide a reason for the dispute").max(500),
});

export type DisputeExpenseInput = z.infer<typeof disputeExpenseSchema>;
