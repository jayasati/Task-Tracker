import { router, publicProcedure } from "../trpc";
import { prisma } from "../db";
import { z } from "zod";

export const taskRouter = router({
  getTasks: publicProcedure.query(async () => {
    return prisma.task.findMany({
      include: { logs: true },
    });
  }),

  addTask: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return prisma.task.create({ data: { title: input } });
    }),

  updateSeconds: publicProcedure
    .input(z.object({ taskId: z.string(), seconds: z.number() }))
    .mutation(async ({ input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return prisma.timeLog.upsert({
        where: { taskId_date: { taskId: input.taskId, date: today } },
        update: { seconds: { increment: input.seconds } },
        create: { taskId: input.taskId, date: today, seconds: input.seconds },
      });
    }),
});
