import { router, publicProcedure } from "../trpc";
import { prisma } from "../db";
import { z } from "zod";



export const taskRouter = router({
  //--------------------------------------------------------
  getTasks: publicProcedure
    .input(z.object({
      month: z.number().optional(),
      year: z.number().optional()
    }).optional())
    .query(async ({ input }) => {

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

      const tasks = await prisma.task.findMany({
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
      // today.setHours(0, 0, 0, 0); 

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

/**
 * FILE: server/routers/task.ts
 * 
 * PURPOSE:
 * TRPC router defining all task-related API endpoints (queries and mutations).
 * Handles all client-side database operations for tasks, time logs, and status tracking.
 * 
 * WHAT IT DOES:
 * - getTasks: Fetches tasks for a specific month with logs, statuses, and aggregated totals
 * - addTask: Creates new task with all properties (title, type, dates, priority, etc.)
 * - deleteTask: Removes task and cascades to related logs and statuses
 * - updateSeconds: Adds time log entry when timer is stopped
 * - updateStatus: Updates daily status with subtask completion tracking
 * - updateTask: Updates task properties (primarily for subtask planning)
 * 
 * DEPENDENCIES (imports from):
 * - ../trpc: router and publicProcedure builders
 * - ../db: Prisma client instance
 * - zod: Schema validation library for input validation
 * 
 * DEPENDENTS (files that import this):
 * - server/index.ts: Combines this router into main appRouter
 * - All client-side hooks via TRPC client:
 *   - hooks/useTaskActions.ts: Uses updateSeconds, deleteTask, updateStatus
 *   - hooks/useAddTaskForm.ts: Uses addTask
 *   - hooks/useSubtaskModal.ts: Uses updateStatus, updateTask
 * 
 * RELATED FILES:
 * - server/queries/tasks.ts: Similar query logic for server components (SSR)
 * - prisma/schema.prisma: Database schema defining Task, TimeLog, TaskStatus models
 * - utils/trpc.ts: Client-side TRPC setup
 * 
 * ENDPOINT DETAILS:
 * 
 * 1. getTasks(month?, year?)
 *    - Returns: Task[] with logs, statuses, and totalSeconds
 *    - Includes 7-day buffer before month start for rollover logic
 *    - Aggregates time logs into totalSeconds per task
 *    - Used rarely (prefer server/queries/tasks.ts for SSR)
 * 
 * 2. addTask({ title, type, repeatMode, weekdays, dates, priority, category, etc. })
 *    - Validates all fields with Zod schema
 *    - Creates task with empty logs and statuses arrays
 *    - Returns: Created task object
 * 
 * 3. deleteTask({ taskId })
 *    - Deletes task by ID
 *    - Prisma cascades deletion to logs and statuses
 *    - Returns: Deleted task object
 * 
 * 4. updateSeconds({ taskId, seconds, date })
 *    - Creates TimeLog entry with seconds and date
 *    - Used when timer is stopped
 *    - Returns: Created TimeLog object
 * 
 * 5. updateStatus({ taskId, date, status, completedSubtasks?, dailySubtasks? })
 *    - Updates or creates TaskStatus for specific date
 *    - Handles subtask completion tracking
 *    - Implements daily freeze (dailySubtasks) for historical records
 *    - Returns: Updated/created TaskStatus object
 * 
 * 6. updateTask({ id, subtasks? })
 *    - Updates task properties (currently only subtasks)
 *    - Used for planning next day's subtasks
 *    - Returns: Updated task object
 * 
 * NOTES:
 * - All procedures are public (no authentication middleware)
 * - Uses superjson transformer for Date serialization
 * - Input validation with Zod prevents invalid data
 * - getTasks includes 7-day buffer: statusStartDate = startDate - 7 days
 * - This buffer enables rollover logic (uncompleted subtasks from previous day)
 * - totalSeconds is aggregated from TimeLog entries using _sum
 * - updateStatus uses upsert pattern (update if exists, create if not)
 * - Prisma handles cascading deletes for related records
 * - All mutations trigger client-side refetch via onSuccess callbacks
 */
