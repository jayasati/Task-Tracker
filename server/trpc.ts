import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

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
