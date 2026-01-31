import { agentsRouter } from "@/modules/agents/server/procedures";
import { meetingsRouter } from "@/modules/meetings/server/procedures";
import { financialRouter } from "@/modules/financial/server/procedures";

import { createTRPCRouter } from "../init";
export const appRouter = createTRPCRouter({
    agents: agentsRouter,
    meetings: meetingsRouter,
    financial: financialRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
