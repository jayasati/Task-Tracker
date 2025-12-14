"server-only";
import { prisma } from "../db";
import { Task } from "@/types/task";

/**
 * Server-side query to fetch tasks with optimized data loading
 * Fetches fresh data on every request to ensure UI stays in sync
 * @param month - Month number (0-11)
 * @param year - Year number
 * @param userId - Clerk user ID to filter tasks by user
 */
export async function getTasksForMonth(month: number, year: number, userId: string): Promise<Task[]> {
    if (!userId) {
        return []; // Return empty array if no user ID provided
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Buffer for rollover logic (fetch last 7 days of prev month)
    const statusStartDate = new Date(startDate);
    statusStartDate.setDate(statusStartDate.getDate() - 7);

    // Optimize: Only fetch tasks that are relevant to this month or have logs/statuses in this range
    // This filters at database level instead of fetching all tasks
    // IMPORTANT: Filter by userId to ensure users only see their own tasks
    const tasks = await prisma.task.findMany({
        where: {
            userId: userId, // Filter by current user
            OR: [
                // Tasks that have logs in this month
                {
                    logs: {
                        some: {
                            date: {
                                gte: startDate,
                                lte: endDate,
                            }
                        }
                    }
                },
                // Tasks that have statuses in the range (including buffer)
                {
                    statuses: {
                        some: {
                            date: {
                                gte: statusStartDate,
                                lte: endDate,
                            }
                        }
                    }
                },
                // Tasks that are active and might be relevant (not archived, within date range or no end date)
                {
                    isArchived: false,
                    OR: [
                        {
                            startDate: {
                                lte: endDate,
                            },
                            endDate: {
                                gte: startDate,
                            }
                        },
                        {
                            startDate: null,
                            endDate: null,
                        },
                        {
                            startDate: {
                                lte: endDate,
                            },
                            endDate: null,
                        }
                    ]
                }
            ]
        },
        select: {
            id: true,
            title: true,
            type: true,
            repeatMode: true,
            weekdays: true,
            startDate: true,
            endDate: true,
            priority: true,
            category: true,
            amount: true,
            estimate: true,
            subtasks: true,
            notes: true,
            isCompleted: true,
            completedAt: true,
            isArchived: true,
            createdAt: true,
            updatedAt: true,
            logs: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    }
                },
                select: {
                    seconds: true,
                    date: true,
                },
            },
            statuses: {
                where: {
                    date: {
                        gte: statusStartDate,
                        lte: endDate,
                    }
                },
                select: {
                    id: true,
                    taskId: true,
                    date: true,
                    status: true,
                    completedSubtasks: true,
                    dailySubtasks: true,
                    progressLevel: true,
                },
            },
        },
    });

    const taskIds = tasks.map(t => t.id);

    // Fetch global total seconds for each task
    const totals = await prisma.timeLog.groupBy({
        by: ['taskId'],
        where: {
            taskId: { in: taskIds }
        },
        _sum: {
            seconds: true,
        },
    });

    const totalsMap = new Map<string, number>();
    totals.forEach((t) => {
        totalsMap.set(t.taskId, t._sum.seconds || 0);
    });

    return tasks.map((task) => ({
        ...task,
        totalSeconds: totalsMap.get(task.id) || 0,
    })) as Task[];
}

/**
 * Get current month's tasks (convenience function)
 * @param userId - Clerk user ID to filter tasks by user
 */
export async function getCurrentMonthTasks(userId: string) {
    const now = new Date();
    return getTasksForMonth(now.getMonth(), now.getFullYear(), userId);
}

/**
 * FILE: server/queries/tasks.ts
 * 
 * PURPOSE:
 * Server-only module that provides optimized database queries for fetching tasks.
 * Used by server components for data fetching with proper date filtering.
 * 
 * WHAT IT DOES:
 * - getTasksForMonth: Fetches tasks for a specific month with all related data
 * - getCurrentMonthTasks: Convenience wrapper for current month
 * - Fetches tasks with logs, statuses, and calculated totals
 * - Includes 7-day buffer for rollover logic (previous month's last week)
 * - Aggregates total seconds across all time logs per task
 * - Returns fresh data on every call (no caching)
 * 
 * DEPENDENCIES (imports from):
 * - server-only: Ensures this code never runs on client
 * - ../db: Prisma client instance
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TasksListServerRSC.tsx: Fetches tasks for rendering
 * 
 * RELATED FILES:
 * - server/db.ts: Provides Prisma client
 * - prisma/schema.prisma: Defines database schema
 * - server/routers/task.ts: TRPC router with similar queries
 * 
 * NOTES:
 * - "server-only" import prevents accidental client-side usage
 * - Removed unstable_cache for immediate UI updates
 * - Buffer period (7 days) allows subtask rollover from previous days
 * - Uses Prisma select for optimized query (only needed fields)
 * - groupBy aggregation calculates total seconds efficiently
 * - Returns type matches Task type from types/task.ts
 */
