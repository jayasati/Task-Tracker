/**
 * Query procedures for fetching tasks
 */
import { protectedProcedure } from "../../trpc";
import { prisma } from "../../db";
import { getTasksSchema } from "./schemas";

/**
 * Fetch all tasks for a given month with related data
 */
export const getTasks = protectedProcedure
  .input(getTasksSchema)
  .query(async ({ input, ctx }) => {
    if (!ctx.userId) {
      return [];
    }

    const now = new Date();
    const month = input?.month ?? now.getMonth();
    const year = input?.year ?? now.getFullYear();

    // Date boundaries
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Buffer for rollover logic (fetch last 7 days of prev month)
    const statusStartDate = new Date(startDate);
    statusStartDate.setDate(statusStartDate.getDate() - 7);

    const tasks = await prisma.task.findMany({
      where: {
        userId: ctx.userId,
        OR: [
          {
            logs: {
              some: {
                date: { gte: startDate, lte: endDate }
              }
            }
          },
          {
            statuses: {
              some: {
                date: { gte: statusStartDate, lte: endDate }
              }
            }
          },
          {
            isArchived: false,
            OR: [
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate }
              },
              { startDate: null, endDate: null },
              { startDate: { lte: endDate }, endDate: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        type: true,
        habitType: true,
        repeatMode: true,
        weekdays: true,
        startDate: true,
        endDate: true,
        priority: true,
        category: true,
        amount: true,
        estimate: true,
        requiredMinutes: true,
        requiredAmount: true,
        subtasks: true,
        notes: true,
        isCompleted: true,
        completedAt: true,
        isArchived: true,
        isSelected: true,
        progressLevel: true,
        createdAt: true,
        updatedAt: true,
        logs: {
          where: { date: { gte: startDate, lte: endDate } },
          select: { seconds: true, date: true },
        },
        statuses: {
          where: { date: { gte: statusStartDate, lte: endDate } },
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
        timerSessions: {
          where: { date: { gte: statusStartDate, lte: endDate } },
          select: {
            id: true,
            taskId: true,
            startTime: true,
            endTime: true,
            date: true,
            seconds: true,
            isActive: true,
          },
        },
      },
    });

    // Fetch total seconds for each task
    const taskIds = tasks.map(t => t.id);
    const totals = await prisma.timeLog.groupBy({
      by: ['taskId'],
      where: { taskId: { in: taskIds } },
      _sum: { seconds: true },
    });

    const totalsMap = new Map<string, number>();
    totals.forEach((t) => {
      totalsMap.set(t.taskId, t._sum.seconds || 0);
    });

    return tasks.map((task) => ({
      ...task,
      totalSeconds: totalsMap.get(task.id) || 0,
    }));
  });
