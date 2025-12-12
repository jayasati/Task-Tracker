"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Optimize query defaults for better performance
                staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
                gcTime: 10 * 60 * 1000, // 10 minutes
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                // Enable optimistic updates
                retry: 1,
                retryDelay: 1000,
            },
            mutations: {
                // Faster retry for mutations
                retry: 1,
                retryDelay: 500,
            },
        },
    }));

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "/api/trpc",
                    transformer: superjson,
                    // Batch requests for better performance
                    maxURLLength: 2083,
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}

/**
 * FILE: app/providers.tsx
 * 
 * PURPOSE:
 * Client component that sets up TRPC and React Query providers for the entire application.
 * This enables client-side data fetching and mutations throughout the app.
 * 
 * WHAT IT DOES:
 * - Creates and configures React Query client with optimized defaults
 * - Creates TRPC client with HTTP batch link and superjson transformer
 * - Wraps children with both TRPC and React Query providers
 * - Uses useState to ensure clients are created only once per session
 * - Configures query caching and refetch behavior for optimal performance
 * 
 * DEPENDENCIES (imports from):
 * - @tanstack/react-query: QueryClient, QueryClientProvider for data fetching
 * - @/utils/trpc: TRPC client instance
 * - @trpc/client: httpBatchLink for batching requests
 * - superjson: Serialization for complex data types (Date, Map, Set, etc.)
 * - react: useState hook
 * 
 * DEPENDENTS (files that import this):
 * - app/layout.tsx: Uses this to wrap all pages
 * 
 * RELATED FILES:
 * - utils/trpc.ts: TRPC client definition
 * - server/index.ts: TRPC router definition
 * - app/api/trpc/[trpc]/route.ts: TRPC API route handler
 * 
 * NOTES:
 * - Must be a client component ("use client") to use React hooks
 * - Query defaults prevent unnecessary refetches for better performance
 * - httpBatchLink batches multiple requests into single HTTP call
 * - superjson allows passing Date objects and other complex types
 * - staleTime: 5min means data is considered fresh for 5 minutes (increased from 1min)
 * - gcTime: 10min means unused data is garbage collected after 10 minutes
 * - Optimized for instant UI updates with optimistic mutations
 */
