import { z } from "zod";

export const createSettlementSchema = z.object({
  groupId: z.string().uuid("Please select a group"),
  payeeId: z.string().uuid("Please select who you are paying"),
  amount: z.number().positive("Settlement amount must be greater than 0"),
  currency: z.string().length(3).default("SAR"),
  paymentMethod: z.enum(["cash", "bank_transfer", "other"]).default("bank_transfer"),
  note: z.string().max(250).optional(),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;

export const confirmSettlementSchema = z.object({
  settlementId: z.string().uuid(),
});

export const disputeSettlementSchema = z.object({
  settlementId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export const rejectSettlementSchema = z.object({
  settlementId: z.string().uuid(),
  reason: z.enum(["Not received", "Wrong amount", "Wrong method", "Other"]),
  note: z.string().max(500).optional(),
});
export type RejectSettlementInput = z.infer<typeof rejectSettlementSchema>;

export const requestPaymentSchema = z.object({
  groupId: z.string().uuid(),
  debtorId: z.string().uuid(),
  amount: z.number().positive("Requested amount must be greater than 0"),
  currency: z.string().length(3).default("SAR"),
  expenseId: z.string().uuid().optional(),
});
export type RequestPaymentInput = z.infer<typeof requestPaymentSchema>;

export const remindAllGroupDebtorsSchema = z.object({
  groupId: z.string().uuid(),
});
export type RemindAllGroupDebtorsInput = z.infer<typeof remindAllGroupDebtorsSchema>;

export const quickPaySettlementSchema = z.object({
  groupId: z.string().uuid(),
  payeeId: z.string().uuid(),
  amount: z.number().positive("Settlement amount must be greater than 0"),
  currency: z.string().length(3).default("SAR"),
  paymentMethod: z.enum(["cash", "bank_transfer", "other"]).default("bank_transfer"),
  note: z.string().max(250).optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
  requestedBy: z.string().uuid().optional(),
});
export type QuickPaySettlementInput = z.infer<typeof quickPaySettlementSchema>;

export const adminOverrideSettlementSchema = z.object({
  settlementId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().min(3).max(500),
});
export type AdminOverrideSettlementInput = z.infer<typeof adminOverrideSettlementSchema>;
