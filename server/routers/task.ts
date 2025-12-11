import { router, publicProcedure } from "../trpc";
import { prisma } from "../db";
import { z } from "zod";

// Ensure the "type" column exists (for environments where migrations haven't been run)
let typeColumnReady: Promise<void> | null = null;
async function ensureTypeColumn() {
  if (!typeColumnReady) {
    typeColumnReady = prisma.$executeRawUnsafe(
      `ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'task';`
    ).then(() => undefined).catch(() => undefined);
  }
  return typeColumnReady;
}

export const taskRouter = router({
  //--------------------------------------------------------
  getTasks: publicProcedure.query(async () => {
    await ensureTypeColumn();
    return prisma.task.findMany({
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
        logs: {
          select: {
            seconds: true,
            date: true,
          },
        },
        statuses: {
          select: {
            id: true,
            taskId: true,
            date: true,
            status: true,
            completedSubtasks: true,
            dailySubtasks: true,
          },
        },
      },
    });
  }),
  //---------------------------------------------------------------------
  addTask: publicProcedure
    .input(z.object({
      title: z.string(),
      type: z.enum(["task", "amount", "time"]).default("task"),
      repeatMode: z.string().default("none"),
      weekdays: z.array(z.number()).default([]),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      priority: z.string().default("medium"),
      category: z.string().optional(),
      amount: z.string().optional(),
      estimate: z.number().optional(),
      subtasks: z.array(z.string()).default([]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await ensureTypeColumn();
      // @ts-ignore prisma client types may be stale until generated
      return prisma.task.create({
        data: {
          title: input.title,
          type: input.type,
          repeatMode: input.repeatMode,
          weekdays: input.weekdays,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          priority: input.priority,
          category: input.category,
          amount: input.amount,
          estimate: input.estimate,
          subtasks: input.subtasks,
          notes: input.notes,
        }
      });
    }),
  //----------------------------------------------------------------------
  updateSeconds: publicProcedure
    .input(z.object({ taskId: z.string(), seconds: z.number(), date: z.string() }))
    .mutation(async ({ input }) => {
      const today = new Date(input.date);
      // today.setHours(0, 0, 0, 0); // Removed to avoid timezone shift

      return prisma.timeLog.upsert({
        where: { taskId_date: { taskId: input.taskId, date: today } },
        update: { seconds: { increment: input.seconds } },
        create: { taskId: input.taskId, date: today, seconds: input.seconds },
      });
    }),
  //------------------------------------------------
  updateStatus: publicProcedure
    .input(z.object({
      taskId: z.string(),
      date: z.string(),
      status: z.enum(["NONE", "FAIL", "HALF", "SUCCESS"]).optional(),
      completedSubtasks: z.array(z.string()).optional(),
      dailySubtasks: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const d = new Date(input.date);
      // d.setHours(0, 0, 0, 0);
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
    }),
  //------------------------------------------------
  deleteTask: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      // Some drivers (e.g. Neon HTTP) do not support interactive tx well; do sequential deletes.
      await prisma.timeLog.deleteMany({ where: { taskId: input.taskId } });
      await prisma.taskStatus.deleteMany({ where: { taskId: input.taskId } });
      const deleted = await prisma.task.delete({ where: { id: input.taskId } }).catch(() => null);
      return { success: !!deleted };
    }),
  //------------------------------------------------
  updateTask: publicProcedure
    .input(z.object({
      id: z.string(),
      subtasks: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      return prisma.task.update({
        where: { id: input.id },
        data: {
          ...(input.subtasks ? { subtasks: input.subtasks } : {}),
        },
      });
    }),





});
