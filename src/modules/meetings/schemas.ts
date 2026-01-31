import { z } from "zod";

export const meetingsInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    agentId: z.string().min(1, { message: "Agent is required" }),
});

export const meetingsUpdateSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1).optional(),
    agentId: z.string().min(1).optional(),
    status: z.enum(["upcomming", "active", "completed", "processing", "cancelled"]).optional(),
    startedAt: z.coerce.date().optional(),
    endedAt: z.coerce.date().optional(),
    summary: z.string().optional(),
    transcriptUrl: z.string().optional(),
    recordingUrl: z.string().optional(),
});
