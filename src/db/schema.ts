import { boolean, pgEnum, pgTable, text, timestamp, numeric, jsonb, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { nanoid } from "nanoid";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
        .$defaultFn(() => false)
        .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});


export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});



export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp("updated_at").$defaultFn(() => /* @__PURE__ */ new Date()),
});


export const agents = pgTable("agents", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    instructions: text("instructions").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const meetingStatus = pgEnum("meeting_status", [
    "upcomming",
    "active",
    "completed",
    "processing",
    "cancelled",
]);

export const meetings = pgTable("meetings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    agentId: text("agent_id")
        .notNull()
        .references(() => agents.id, { onDelete: "cascade" }),
    status: meetingStatus("status").notNull().default("upcomming"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    transcriptUrl: text("transcript_url"),
    recordingUrl: text("recording_url"),
    summary: text("summary"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const riskToleranceEnum = pgEnum("risk_tolerance", ["low", "medium", "high"]);

export const financialProfiles = pgTable("financial_profiles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => user.id, { onDelete: "cascade" }),
    riskTolerance: riskToleranceEnum("risk_tolerance").notNull().default("medium"),
    monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const goalStatusEnum = pgEnum("goal_status", ["pending", "in_progress", "completed"]);

export const financialGoals = pgTable("financial_goals", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
    currentAmount: numeric("current_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    deadline: timestamp("deadline"),
    status: goalStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const financialInsights = pgTable("financial_insights", {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    topics: jsonb("topics").notNull().$type<string[]>(), // Array of detected top-level topics
    hits: jsonb("hits").notNull().$type<Record<string, string[]>>(), // Detailed keyword matches
    source: text("source").notNull().default("keyword_extraction"),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    attestationUid: text("attestation_uid"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    confidenceCheck: check("confidence_range", sql`${table.confidence} >= 0 AND ${table.confidence} <= 1`),
}));

export const attestations = pgTable("attestations", {
    id: uuid("id").primaryKey().defaultRandom(),
    uid: text("uid").notNull().unique(), // EAS Attestation UID
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    financialInsightId: uuid("financial_insight_id")
        .notNull()
        .references(() => financialInsights.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("financial_insight"),
    network: text("network").notNull().default("sepolia"),
    recipient: text("recipient").notNull(),
    revocable: boolean("revocable").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
