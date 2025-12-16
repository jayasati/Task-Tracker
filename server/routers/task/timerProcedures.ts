/**
 * Timer session mutation procedures
 */
import { protectedProcedure } from "../../trpc";
import { prisma } from "../../db";
import {
  startTimerSchema,
  stopTimerSchema,
  addMissedTimeSchema,
  getActiveTimerSchema,
} from "./schemas";

/**
 * Start a timer for a task
 */
export const startTimer = protectedProcedure
  .input(startTimerSchema)
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

    // Check if there's already an active timer
    const activeTimer = await prisma.timerSession.findFirst({
      where: {
        taskId: input.taskId,
        isActive: true,
      },
    });

    if (activeTimer) {
      throw new Error("Timer is already running for this task");
    }

    return prisma.timerSession.create({
      data: {
        taskId: input.taskId,
        startTime: new Date(),
        date: new Date(input.date),
        isActive: true,
      },
    });
  });

/**
 * Stop a running timer
 */
export const stopTimer = protectedProcedure
  .input(stopTimerSchema)
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

    const activeTimer = await prisma.timerSession.findFirst({
      where: {
        taskId: input.taskId,
        isActive: true,
      },
    });

    if (!activeTimer) {
      throw new Error("No active timer found for this task");
    }

    const endTime = new Date();
    const seconds = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);

    return prisma.timerSession.update({
      where: { id: activeTimer.id },
      data: {
        endTime,
        seconds,
        isActive: false,
      },
    });
  });

/**
 * Add missed time manually
 */
export const addMissedTime = protectedProcedure
  .input(addMissedTimeSchema)
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

    const now = new Date();
    return prisma.timerSession.create({
      data: {
        taskId: input.taskId,
        startTime: new Date(now.getTime() - input.seconds * 1000),
        endTime: now,
        date: new Date(input.date),
        seconds: input.seconds,
        isActive: false,
      },
    });
  });

/**
 * Get active timer for a task
 */
export const getActiveTimer = protectedProcedure
  .input(getActiveTimerSchema)
  .query(async ({ input, ctx }) => {
    if (!ctx.userId) {
      return null;
    }

    const task = await prisma.task.findFirst({
      where: { id: input.taskId, userId: ctx.userId },
    });

    if (!task) {
      return null;
    }

    return prisma.timerSession.findFirst({
      where: {
        taskId: input.taskId,
        isActive: true,
      },
    });
  });
