import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  defaultCurrency: z.string().length(3).default("SAR"),
  category: z.enum(["apartment", "flat", "trip", "household", "project", "other"]).default("apartment"),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const inviteMemberSchema = z.object({
  groupId: z.string().uuid(),
  identifier: z.string().min(3, "Enter an email or username to invite"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
