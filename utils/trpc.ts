"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server";

export const trpc = createTRPCReact<AppRouter>();

/**
 * FILE: utils/trpc.ts
 * 
 * PURPOSE:
 * Creates and exports the TRPC React client instance for the application.
 * Provides type-safe API calls from client components.
 * 
 * WHAT IT DOES:
 * - Creates TRPC React client with AppRouter type
 * - Enables type-safe queries and mutations
 * - Provides hooks like useQuery, useMutation, useUtils
 * - Infers types from server router automatically
 * 
 * DEPENDENCIES (imports from):
 * - @trpc/react-query: createTRPCReact factory function
 * - @/server: AppRouter type definition
 * 
 * DEPENDENTS (files that import this):
 * - app/providers.tsx: Creates client instance
 * - hooks/useTaskActions.ts: Uses mutations
 * - hooks/useAddTaskForm.ts: Uses mutations
 * - hooks/useTaskTimer.ts: Uses mutations
 * - hooks/useTaskSubtasks.ts: Uses mutations
 * - hooks/useSubtaskModal.ts: Uses mutations
 * - app/components/TasksListServer.tsx: Uses queries (legacy)
 * 
 * RELATED FILES:
 * - server/index.ts: Exports AppRouter type
 * - app/providers.tsx: Configures TRPC client
 * 
 * NOTES:
 * - Type parameter <AppRouter> provides full type safety
 * - All server procedures are available as typed hooks
 * - No runtime overhead, types are compile-time only
 * - Must be used within trpc.Provider context
 */
