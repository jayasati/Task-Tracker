/**
 * Status and Progress mutation procedures
 */
import { protectedProcedure } from "../../trpc";
import { prisma } from "../../db";
import {
  updateStatusSchema,
  updateProgressSchema,
  updateSecondsSchema,
} from "./schemas";

/**
 * Update task status for a specific day
 */
export const updateStatus = protectedProcedure
  .input(updateStatusSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated");
    }

    const task = await prisma.task.findFirst({
      where: { id: input.taskId, userId: ctx.userId },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const d = new Date(input.date);

    return prisma.taskStatus.upsert({
      where: {
        taskId_date: {
          taskId: input.taskId,
          date: d,
        }
      },
      update: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.completedSubtasks ? { completedSubtasks: input.completedSubtasks } : {}),
        ...(input.dailySubtasks ? { dailySubtasks: input.dailySubtasks } : {}),
      },
      create: {
        taskId: input.taskId,
        date: d,
        status: input.status ?? "NONE",
        completedSubtasks: input.completedSubtasks ?? [],
        dailySubtasks: input.dailySubtasks ?? [],
      },
    });
  });

/**
 * Update progress level for a task (0-4)
 */
export const updateProgress = protectedProcedure
  .input(updateProgressSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated");
    }

    const task = await prisma.task.findFirst({
      where: { id: input.taskId, userId: ctx.userId },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const d = new Date(input.date);

    const statusResult = await prisma.taskStatus.upsert({
      where: {
        taskId_date: {
          taskId: input.taskId,
          date: d,
        }
      },
      update: {
        progressLevel: input.progressLevel,
      },
      create: {
        taskId: input.taskId,
        date: d,
        status: "NONE",
        progressLevel: input.progressLevel,
        completedSubtasks: [],
        dailySubtasks: [],
      },
    });

    // If all 4 boxes are ticked, mark task as completed
    if (input.progressLevel === 4) {
      await prisma.task.update({
        where: { id: input.taskId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    } else {
      // If progress is reduced below 4, unmark as completed
      await prisma.task.update({
        where: { id: input.taskId },
        data: {
          isCompleted: false,
          completedAt: null,
        },
      });
    }

    return statusResult;
  });

/**
 * Update time log seconds for a task
 */
export const updateSeconds = protectedProcedure
  .input(updateSecondsSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated");
    }

    const task = await prisma.task.findFirst({
      where: { id: input.taskId, userId: ctx.userId },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const today = new Date(input.date);

    return prisma.timeLog.upsert({
      where: { taskId_date: { taskId: input.taskId, date: today } },
      update: { seconds: { increment: input.seconds } },
      create: { taskId: input.taskId, date: today, seconds: input.seconds },
    });
  });
