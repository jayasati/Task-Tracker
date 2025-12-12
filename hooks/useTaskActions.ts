import { trpc } from "@/utils/trpc";
import { Status } from "@prisma/client";

export function useTaskActions(refetch: () => void) {
    const utils = trpc.useUtils();

    const updateSeconds = trpc.task.updateSeconds.useMutation({
        onSuccess: refetch,
    });

    const deleteTask = trpc.task.deleteTask.useMutation({
        onSuccess: refetch,
    });

    const updateStatus = trpc.task.updateStatus.useMutation({
        // Optimistic update for instant feedback
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await utils.task.getTasks.cancel();

            // Snapshot previous value
            const previousTasks = utils.task.getTasks.getData();

            // Optimistically update cache
            if (previousTasks) {
                utils.task.getTasks.setData(undefined, (old) => {
                    if (!old) return old;
                    return old.map(task => {
                        if (task.id === variables.taskId) {
                            // Update or add status
                            const statusIndex = task.statuses.findIndex(
                                s => new Date(s.date).toISOString().split('T')[0] === variables.date
                            );

                            if (statusIndex >= 0) {
                                const newStatuses = [...task.statuses];
                                newStatuses[statusIndex] = {
                                    ...newStatuses[statusIndex],
                                    status: variables.status as Status,
                                    completedSubtasks: variables.completedSubtasks || [],
                                    dailySubtasks: variables.dailySubtasks || []
                                };
                                return { ...task, statuses: newStatuses };
                            } else {
                                return {
                                    ...task,
                                    statuses: [...task.statuses, {
                                        id: 'temp-' + Date.now(),
                                        taskId: variables.taskId,
                                        date: new Date(variables.date),
                                        status: variables.status as Status,
                                        completedSubtasks: variables.completedSubtasks || [],
                                        dailySubtasks: variables.dailySubtasks || []
                                    }]
                                };
                            }
                        }
                        return task;
                    });
                });
            }

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                utils.task.getTasks.setData(undefined, context.previousTasks);
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            refetch();
        },
    });

    return { updateSeconds, deleteTask, updateStatus };
}

/**
 * FILE: hooks/useTaskActions.ts
 * 
 * PURPOSE:
 * Custom hook that provides TRPC mutations for task-related actions.
 * Centralizes task mutation logic with optimistic updates for instant UI feedback.
 * 
 * WHAT IT DOES:
 * - Provides updateSeconds mutation for timer functionality
 * - Provides deleteTask mutation for removing tasks
 * - Provides updateStatus mutation with optimistic updates for instant feedback
 * - Automatically calls refetch() callback after successful mutations
 * - Returns mutation objects with isPending, mutate, etc.
 * - Implements optimistic updates for status changes (no waiting for server)
 * 
 * DEPENDENCIES (imports from):
 * - @/utils/trpc: TRPC client instance
 * - @prisma/client: Status enum type
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TaskCard.tsx: Uses all three mutations
 * 
 * RELATED FILES:
 * - server/routers/task.ts: Defines the mutation endpoints
 * - hooks/useTaskTimer.ts: Uses updateSeconds indirectly
 * 
 * NOTES:
 * - refetch parameter is typically router.refresh() for server component revalidation
 * - updateStatus uses optimistic updates for instant UI feedback (no 5-10s delay)
 * - On mutation, immediately updates local cache, then confirms with server
 * - If server returns error, rolls back to previous state
 * - onSettled ensures eventual consistency with server
 * - This eliminates the 5-10 second delay users were experiencing
 * - Type casting (as Status) ensures TypeScript compatibility
 * - Date conversion (new Date(variables.date)) fixes string to Date type mismatch
 */
