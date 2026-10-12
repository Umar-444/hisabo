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
