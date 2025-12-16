/**
 * Task CRUD mutation procedures
 */
import { protectedProcedure } from "../../trpc";
import { prisma } from "../../db";
import { isProfessionalCategory } from "@/lib/utils/filters";
import {
  createTaskSchema,
  editTaskSchema,
  taskIdSchema,
  updateSubtasksSchema,
} from "./schemas";

/**
 * Create a new task
 */
export const addTask = protectedProcedure
  .input(createTaskSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated to create tasks");
    }

    const resolvedType = isProfessionalCategory(input.category) ? 'habit' : input.type;

    return prisma.task.create({
      data: {
        userId: ctx.userId,
        title: input.title,
        type: resolvedType,
        habitType: input.habitType,
        repeatMode: input.repeatMode,
        weekdays: input.weekdays,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        priority: input.priority,
        category: input.category,
        amount: input.amount,
        estimate: input.estimate,
        requiredMinutes: input.requiredMinutes,
        requiredAmount: input.requiredAmount,
        subtasks: input.subtasks,
        notes: input.notes,
      }
    });
  });

/**
 * Edit an existing task
 */
export const editTask = protectedProcedure
  .input(editTaskSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated");
    }

    const task = await prisma.task.findFirst({
      where: { id: input.id, userId: ctx.userId },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const { id, ...updateData } = input;
    const data: any = { ...updateData };

    if (updateData.startDate !== undefined) {
      data.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    }
    if (updateData.endDate !== undefined) {
      data.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    }

    return prisma.task.update({
      where: { id },
      data,
    });
  });

/**
 * Update task subtasks only
 */
export const updateTask = protectedProcedure
  .input(updateSubtasksSchema)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User must be authenticated");
    }

    const task = await prisma.task.findFirst({
      where: { id: input.id, userId: ctx.userId },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    return prisma.task.update({
      where: { id: input.id },
      data: {
        ...(input.subtasks ? { subtasks: input.subtasks } : {}),
      },
    });
  });

/**
 * Delete a single task and its related data
 */
export const deleteTask = protectedProcedure
  .input(taskIdSchema)
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

    await prisma.timeLog.deleteMany({ where: { taskId: input.taskId } });
    await prisma.taskStatus.deleteMany({ where: { taskId: input.taskId } });
    await prisma.timerSession.deleteMany({ where: { taskId: input.taskId } });
    const deleted = await prisma.task.delete({ where: { id: input.taskId } }).catch(() => null);

    return { success: !!deleted };
  });
