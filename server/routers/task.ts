import { router, protectedProcedure } from "../trpc";
import { prisma } from "../db";
import { z } from "zod";
import { isProfessionalCategory } from "@/lib/utils/filters";



export const taskRouter = router({
  //--------------------------------------------------------
  getTasks: protectedProcedure
    .input(z.object({
      month: z.number().optional(),
      year: z.number().optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      // Only fetch tasks for the current user
      if (!ctx.userId) {
        return [];
      }

      const now = new Date();
      const month = input?.month ?? now.getMonth();
      const year = input?.year ?? now.getFullYear();

      // Start of month
      const startDate = new Date(year, month, 1);
      // End of month
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Buffer for rollover logic (fetch last 7 days of prev month)
      const statusStartDate = new Date(startDate);
      statusStartDate.setDate(statusStartDate.getDate() - 7);

      // Optimize: Only fetch tasks that are relevant to this month or have logs/statuses in this range
      // This filters at database level instead of fetching all tasks
      // IMPORTANT: Filter by userId to ensure users only see their own tasks
      const tasks = await prisma.task.findMany({
        where: {
          userId: ctx.userId, // Filter by current user
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
          progressLevel: true, // Include progress level
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
      }));
    }),
  //---------------------------------------------------------------------
  addTask: protectedProcedure
    .input(z.object({
      title: z.string(),
      type: z.enum(["task", "amount", "time", "habit"]).default("task"),
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
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User must be authenticated to create tasks");
      }
      // @ts-ignore prisma client types may be stale until generated
      const resolvedType = isProfessionalCategory(input.category) ? 'habit' : input.type;

      return prisma.task.create({
        data: {
          userId: ctx.userId, // Associate task with current user
          title: input.title,
          type: resolvedType,
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
  updateSeconds: protectedProcedure
    .input(z.object({ taskId: z.string(), seconds: z.number(), date: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User must be authenticated");
      }
      
      // Verify the task belongs to the current user
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId: ctx.userId },
      });
      
      if (!task) {
        throw new Error("Task not found or access denied");
      }

      const today = new Date(input.date);
      // today.setHours(0, 0, 0, 0); 

      return prisma.timeLog.upsert({
        where: { taskId_date: { taskId: input.taskId, date: today } },
        update: { seconds: { increment: input.seconds } },
        create: { taskId: input.taskId, date: today, seconds: input.seconds },
      });
    }),
  //------------------------------------------------
  updateStatus: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      date: z.string(),
      status: z.enum(["NONE", "FAIL", "HALF", "SUCCESS"]).optional(),
      completedSubtasks: z.array(z.string()).optional(),
      dailySubtasks: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User must be authenticated");
      }
      
      // Verify the task belongs to the current user
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId: ctx.userId },
      });
      
      if (!task) {
        throw new Error("Task not found or access denied");
      }

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
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User must be authenticated");
      }
      
      // Verify the task belongs to the current user before deleting
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId: ctx.userId },
      });
      
      if (!task) {
        throw new Error("Task not found or access denied");
      }

      // Some drivers (e.g. Neon HTTP) do not support interactive tx well; do sequential deletes.
      await prisma.timeLog.deleteMany({ where: { taskId: input.taskId } });
      await prisma.taskStatus.deleteMany({ where: { taskId: input.taskId } });
      const deleted = await prisma.task.delete({ where: { id: input.taskId } }).catch(() => null);
      return { success: !!deleted };
    }),
  //------------------------------------------------
  updateTask: protectedProcedure
    .input(z.object({
      id: z.string(),
      subtasks: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User must be authenticated");
      }
      
      // Verify the task belongs to the current user
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
    }),
  //------------------------------------------------
  updateProgress: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      date: z.string(),
      progressLevel: z.number().min(0).max(4)
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User must be authenticated");
      }
      
      // Verify the task belongs to the current user
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, userId: ctx.userId },
      });
      
      if (!task) {
        throw new Error("Task not found or access denied");
      }

      const d = new Date(input.date);

      // Store progress per-day in TaskStatus, not globally on Task
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
    }),



});

