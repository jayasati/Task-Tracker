import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// Define the context type
interface Context {
  userId: string | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;

// Public procedure (no auth required)
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now TypeScript knows userId is not null
    },
  });
});

/**
 * FILE: server/trpc.ts
 * 
 * PURPOSE:
 * Initializes TRPC server instance with configuration.
 * Exports router factory and procedure builder for creating endpoints.
 * 
 * WHAT IT DOES:
 * - Initializes TRPC with superjson transformer
 * - Exports router factory for creating routers
 * - Exports publicProcedure for creating endpoints
 * - Configures data serialization
 * 
 * DEPENDENCIES (imports from):
 * - @trpc/server: initTRPC factory
 * - superjson: Transformer for complex types (Date, Map, Set, etc.)
 * 
 * DEPENDENTS (files that import this):
 * - server/index.ts: Uses router to create appRouter
 * - server/routers/task.ts: Uses router and publicProcedure
 * 
 * NOTES:
 * - superjson allows passing Date objects, Maps, Sets, etc.
 * - publicProcedure: No authentication (all procedures are public)
 * - Could add middleware here for auth, logging, etc.
 * - t.router creates a new router instance
 * - t.procedure creates a new procedure (endpoint)
 */
