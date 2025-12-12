import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaNeonHttp(connectionString, {});

const prismaClientSingleton = () =>
  new PrismaClient({
    adapter,
  });

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

/**
 * FILE: server/db.ts
 * 
 * PURPOSE:
 * Creates and exports Prisma client instance with Neon HTTP adapter.
 * Implements singleton pattern to prevent multiple instances.
 * 
 * WHAT IT DOES:
 * - Configures Prisma with Neon HTTP adapter for serverless
 * - Creates singleton Prisma client instance
 * - Prevents multiple instances in development (hot reload)
 * - Exports prisma client for database operations
 * 
 * DEPENDENCIES (imports from):
 * - @prisma/client: PrismaClient class
 * - @prisma/adapter-neon: HTTP adapter for Neon database
 * 
 * DEPENDENTS (files that import this):
 * - server/queries/tasks.ts: Uses prisma for queries
 * - server/routers/task.ts: Uses prisma for mutations
 * 
 * NOTES:
 * - Neon HTTP adapter enables serverless/edge deployment
 * - Singleton pattern: reuses instance across hot reloads in dev
 * - globalThis.prisma stores instance globally in development
 * - DATABASE_URL environment variable required
 * - In production, creates new instance on each cold start
 */
