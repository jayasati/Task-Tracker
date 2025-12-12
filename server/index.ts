import { router } from "./trpc";
import { taskRouter } from "./routers/task";

export const appRouter = router({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;

/**
 * FILE: server/index.ts
 * 
 * PURPOSE:
 * Main TRPC router configuration that combines all sub-routers.
 * Exports the AppRouter type for client-side type safety.
 * 
 * WHAT IT DOES:
 * - Imports router factory from trpc.ts
 * - Imports taskRouter from routers/task.ts
 * - Creates appRouter by combining all routers
 * - Exports AppRouter type for TRPC client
 * 
 * DEPENDENCIES (imports from):
 * - ./trpc: router factory function
 * - ./routers/task: taskRouter with all task-related procedures
 * 
 * DEPENDENTS (files that import this):
 * - utils/trpc.ts: Imports AppRouter type for client
 * - app/api/trpc/[trpc]/route.ts: Uses appRouter for API handler
 * 
 * NOTES:
 * - AppRouter type enables full type safety on client
 * - Currently only has task router, but can add more routers here
 * - Type inference allows client to know all available procedures
 * - This is the single source of truth for API structure
 */
