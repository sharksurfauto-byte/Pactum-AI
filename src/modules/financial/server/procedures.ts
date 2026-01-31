import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { financialProfiles, financialGoals, financialInsights, attestations, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { extractFinancialInsights } from "@/lib/financial-keywords";
import { createAttestation } from "@/lib/attestation";
import { financialProfileSchema, financialGoalSchema, requestFinancialInsightSchema } from "../schemas";

export const financialRouter = createTRPCRouter({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        const [profile] = await db
            .select()
            .from(financialProfiles)
            .where(eq(financialProfiles.userId, ctx.auth.user.id));
        return profile ?? null;
    }),

    upsertProfile: protectedProcedure.input(financialProfileSchema).mutation(async ({ input, ctx }) => {
        const existing = await db
            .select()
            .from(financialProfiles)
            .where(eq(financialProfiles.userId, ctx.auth.user.id))
            .limit(1);

        if (existing.length > 0) {
            const [updated] = await db
                .update(financialProfiles)
                .set({
                    ...input,
                    updatedAt: new Date(),
                })
                .where(eq(financialProfiles.userId, ctx.auth.user.id))
                .returning();
            return updated;
        }

        const [created] = await db
            .insert(financialProfiles)
            .values({
                ...input,
                userId: ctx.auth.user.id,
            } as any)
            .returning();
        return created;
    }),

    getGoals: protectedProcedure.query(async ({ ctx }) => {
        return await db
            .select()
            .from(financialGoals)
            .where(eq(financialGoals.userId, ctx.auth.user.id));
    }),

    createGoal: protectedProcedure.input(financialGoalSchema).mutation(async ({ input, ctx }) => {
        const [goal] = await db
            .insert(financialGoals)
            .values({
                ...input,
                userId: ctx.auth.user.id,
            } as any)
            .returning();
        return goal;
    }),

    generateInsight: protectedProcedure.input(requestFinancialInsightSchema).mutation(async ({ input, ctx }) => {
        const [meeting] = await db
            .select()
            .from(meetings)
            .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)));

        if (!meeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }

        const transcript = input.transcript || meeting.summary;

        if (!transcript) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No transcript available for this meeting"
            });
        }

        const insights = extractFinancialInsights(transcript);

        // Calculate a simple checksum (hash) of the transcript
        const checksum = Buffer.from(transcript).toString("base64").slice(0, 32);

        const [createdInsight] = await db
            .insert(financialInsights)
            .values({
                meetingId: input.meetingId,
                topics: insights.topics,
                hits: insights.hits,
                source: insights.source,
                confidence: insights.confidence.toString(),
            } as any)
            .returning();

        // Trigger on-chain attestation
        try {
            const attestationUid = await createAttestation({
                meetingId: input.meetingId,
                topics: insights.topics,
                source: insights.source,
                confidence: insights.confidence,
                checksum,
            });

            if (attestationUid) {
                await db
                    .update(financialInsights)
                    .set({ attestationUid })
                    .where(eq(financialInsights.id, createdInsight.id));

                await db.insert(attestations).values({
                    uid: attestationUid,
                    meetingId: input.meetingId,
                    financialInsightId: createdInsight.id,
                    recipient: ctx.auth.user.id,
                } as any);
            }
        } catch (error) {
            console.error("Attestation failed:", error);
        }

        return createdInsight;
    }),

    getInsights: protectedProcedure.input(z.object({ meetingId: z.string() })).query(async ({ input, ctx }) => {
        const [insight] = await db
            .select()
            .from(financialInsights)
            .where(eq(financialInsights.meetingId, input.meetingId));
        return insight ?? null;
    }),
});
