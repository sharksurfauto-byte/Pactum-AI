import { z } from "zod";

export const riskToleranceEnum = z.enum(["low", "medium", "high"]);
export const goalStatusEnum = z.enum(["pending", "in_progress", "completed"]);

export const financialProfileSchema = z.object({
    id: z.string().optional(),
    riskTolerance: riskToleranceEnum,
    monthlyBudget: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid budget format"),
});

export const financialGoalSchema = z.object({
    id: z.string().optional(),
    meetingId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
    currentAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").optional(),
    deadline: z.coerce.date().optional(),
    status: goalStatusEnum.optional(),
});

export const requestFinancialInsightSchema = z.object({
    meetingId: z.string().min(1),
    transcript: z.string().optional(),
});
