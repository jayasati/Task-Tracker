/**
 * Multi-select and batch delete procedures
 */
import { protectedProcedure } from "../../trpc";
import { prisma } from "../../db";
import {
  toggleSelectionSchema,
  deleteMultipleSchema,
} from "./schemas";

/**
 * Toggle task selection for multi-select
 */
export const toggleTaskSelection = protectedProcedure
  .input(toggleSelectionSchema)
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

    return prisma.task.update({
      where: { id: input.taskId },
      data: { isSelected: input.isSelected },
    });
  });

/**
 * Delete multiple tasks at once
 */
export const deleteMultipleTasks = protectedProcedure
  .input(deleteMultipleSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated");
    }

    // Verify all tasks belong to the current user
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: input.taskIds },
        userId: ctx.userId,
      },
    });

    if (tasks.length !== input.taskIds.length) {
      throw new Error("Some tasks not found or access denied");
    }

    // Delete related data and tasks
    await prisma.timeLog.deleteMany({ where: { taskId: { in: input.taskIds } } });
    await prisma.taskStatus.deleteMany({ where: { taskId: { in: input.taskIds } } });
    await prisma.timerSession.deleteMany({ where: { taskId: { in: input.taskIds } } });
    await prisma.task.deleteMany({ where: { id: { in: input.taskIds } } });

    return { success: true, deletedCount: input.taskIds.length };
  });
