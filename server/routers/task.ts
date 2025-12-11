import { router, publicProcedure } from "../trpc";
import { prisma } from "../db";
import { z } from "zod";

export const taskRouter = router({
//--------------------------------------------------------
  getTasks: publicProcedure.query(async () => {
    return prisma.task.findMany({
      select: {
        id: true,
        title: true,
        logs: {
          select: {
            seconds: true,
          },
        },
        statuses: {
          select: {
            id: true,
            taskId: true,
            date: true,
            status: true,
          },
        },
      },
    });
  }),
//---------------------------------------------------------------------
  addTask: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return prisma.task.create({ data: { title: input } });
    }),
//----------------------------------------------------------------------
  updateSeconds: publicProcedure
    .input(z.object({ taskId: z.string(), seconds: z.number(),date: z.string()}))
    .mutation(async ({ input }) => {
      const today = new Date(input.date);
      today.setHours(0, 0, 0, 0);

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
    status: z.enum(["NONE", "FAIL", "HALF", "SUCCESS"]),
  }))
  .mutation(async ({ input }) => {
    const d = new Date(input.date);
    d.setHours(0,0,0,0);
    return prisma.taskStatus.upsert({
      where: {
        taskId_date: {
          taskId: input.taskId,
          date: d,
        }
      },
      update: {
        status: input.status
      },
      create: {
        taskId: input.taskId,
        date: d,
        status: input.status,
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
    })

  


    
});
